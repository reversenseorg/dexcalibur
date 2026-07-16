/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {DataType} from "./DataType.js";
import * as Log from "../Logger.js";
import {ModelFileUID} from "../ModelFile.js";
import {ClassRefType, NativeBackend} from "./common.js";
import {INodeRef} from "../INode.js";
import {Nullable} from "@reversense/dxc-core-api";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface DataTypeMap {
    [name:string] :DataType
}

export enum DATATYPE_CATEGORY {
    NATIVE='n',
    JAVA='j'
}

export interface ExternalTypeRef {
    /** Target file of the backend in context */
    sourceId  : ModelFileUID;
    /** Original backend — "r2", "ghidra", "dex"... */
    origin    : NativeBackend;
    /** Type ID in backend */
    nativeId  : string;
}

export interface TypeMapping {
    /** Canonical type (ex: native:u32) */
    canonical    : DataType;
    /**
     * List of external types mapped to this canonincal type
     * Several types from different backend/lib can refer to the same DataType.
     *
     * ex: r2  libssl.so  → native:u32
     *     ghidra libc.so → native:u32
     */
    externalRefs : ExternalTypeRef[];
    /**
     * True if modified in dexcalibur but not propagated to backend
     */
    isDirty      : boolean;
}

export class TypeManager {

    // types, lookup by canonical id => type
    private readonly _types:Map<string, TypeMapping> = new Map();

    // reverse lookup (external id => canonical id)
    private readonly externalIndex : Map<string, string> = new Map();

    private _native:DataTypeMap = {}
    private _java:DataTypeMap = {};

    private _initf:any = {
        [DATATYPE_CATEGORY.NATIVE]: false,
        [DATATYPE_CATEGORY.JAVA]: false,
    };



    /**
     *
     * @param pCategory
     * @param pTypes
     */
    async initTypes( pCategory:DATATYPE_CATEGORY, pTypes:DataType[] ):Promise<boolean>{
        let success = true;
        switch (pCategory){
            case DATATYPE_CATEGORY.JAVA:
                pTypes.map( (vType:DataType)=>{
                    this.addJavaType(vType);
                });
                this._initf[pCategory] = true;
                break;
            case DATATYPE_CATEGORY.NATIVE:
                pTypes.map( (vType:DataType)=>{
                    this.addNativeType(vType);
                });
                this._initf[pCategory] = true;
                break;
            default:
                success = false;
                break;
        }

        return success;
    }

    isInitialized( pCategory:DATATYPE_CATEGORY):boolean {
        return this._initf[pCategory];
    }

    addNativeType( pType:DataType):any{
        this._native[pType.getName()] = pType;
    }

    addJavaType( pType:DataType):any{
        this._java[pType.getName()] = pType;
    }

    getNativeType( pName):DataType{
        return this._native[pName];
    }
    
    getJavaType( pName):DataType{
        return this._java[pName];
    }

    register(pType: DataType): Nullable<DataType> {
        if (!this._types.has(pType.id)) {
            this._types.set(pType.id, {
                canonical    : pType,
                externalRefs : [],
                isDirty      : false,
            });
        }
        return this._types.get(pType.id)?.canonical;
    }

    lookup(pID: string): Nullable<DataType> {
        return this._types.get(pID)?.canonical ?? null;
    }

    lookupByExternalRef(pRef: ExternalTypeRef): DataType | null {
        const key = TypeManager.#externalKey(pRef);
        const id  = this.externalIndex.get(key);
        return id ? (this._types.get(id)?.canonical ?? null) : null;
    }

    resolveClassRef(
        pDescriptor  : string,
        pOrigin      : NativeBackend,
        nodeManager : {
            findByDescriptor : (d: string) => INodeRef | null;
            createStub       : (d: string) => INodeRef;
        }
    ): ClassRefType {
        const id      = `${pOrigin}:ref<${pDescriptor}>`;
        const existing = this.lookup(id);

        // Type déjà connu et résolu
        if (existing instanceof ClassRefType && existing.isResolved) {
            return existing;
        }

        const resolved = new ClassRefType(
            pDescriptor,
            pOrigin,
            32,
            nodeManager.findByDescriptor(pDescriptor) ?? nodeManager.createStub(pDescriptor)
        );
        return this.register(resolved) as ClassRefType;
    }

    importFromBackend(
        pExternalType : DataType,
        pRef          : ExternalTypeRef,
    ): DataType {
        const existing = this.lookupByExternalRef(pRef);
        if (existing) return existing;

        const compatible = this.#findCompatible(pExternalType);

        const canonical = compatible
            ? compatible
            : this.register(pExternalType);

        this.#addMapping(canonical.id, pRef);

        return canonical;
    }

    /**
     * Marque un type canonique comme modifié.
     * Les backends qui ont un mapping vers ce type
     * pourront être notifiés via getPendingSync().
     */
    markDirty(canonicalId: string): void {
        const entry = this._types.get(canonicalId);
        if (entry) entry.isDirty = true;
    }

    /**
     * Retourne tous les mappings en attente de synchronisation
     * vers un backend donné (origin + sourceId).
     */
    getPendingSync(pOrigin: NativeBackend, sourceId: string): Array<{
        canonical : DataType;
        nativeId  : string;
    }> {
        const result = [];
        for (const mapping of this._types.values()) {
            if (!mapping.isDirty) continue;
            for (const ref of mapping.externalRefs) {
                if (ref.origin === pOrigin && ref.sourceId === sourceId) {
                    result.push({
                        canonical : mapping.canonical,
                        nativeId  : ref.nativeId,
                    });
                }
            }
        }
        return result;
    }

    /**
     * Appelé après qu'un backend a reçu et appliqué les modifications.
     */
    clearDirty(canonicalId: string): void {
        const entry = this._types.get(canonicalId);
        if (entry) entry.isDirty = false;
    }

    /**
     * Retourne tous les types mappés à une ModelFile donnée.
     */
    allFromSource(origin: string, sourceId: string): Array<{
        canonical : DataType;
        nativeId  : string;
    }> {
        const result = [];
        for (const mapping of this._types.values()) {
            for (const ref of mapping.externalRefs) {
                if (ref.origin === origin && ref.sourceId === sourceId) {
                    result.push({
                        canonical : mapping.canonical,
                        nativeId  : ref.nativeId,
                    });
                }
            }
        }
        return result;
    }

    static #externalKey(pRef: ExternalTypeRef): string {
        return `${pRef.origin}:${pRef.sourceId}:${pRef.nativeId}`;
    }

    #addMapping(pCanonicalId: string, pRef: ExternalTypeRef): void {
        const entry:Nullable<TypeMapping> = this._types.get(pCanonicalId)!;
        const key   = TypeManager.#externalKey(pRef);

        const alreadyMapped = entry.externalRefs
            .some(r => TypeManager.#externalKey(r) === key);

        if (!alreadyMapped) {
            entry.externalRefs.push(pRef);
        }

        this.externalIndex.set(key, pCanonicalId);
    }

    #findCompatible(type: DataType): DataType | null {
        for (const mapping of this._types.values()) {
            if (mapping.canonical.isCompatibleWith(type)) {
                return mapping.canonical;
            }
        }
        return null;
    }
}