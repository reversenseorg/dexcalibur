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

import DexcaliburProject from "../DexcaliburProject.js";
import {Nullable, OperatingSystem} from "@dexcalibur/dxc-core-api";
import {INodeRef} from "../INode.js";
import AndroidActivity from "../android/AndroidActivity.js";
import {NodeUtils} from "@dexcalibur/dexcalibur-orm";
import AndroidService from "../android/AndroidService.js";
import AndroidReceiver from "../android/AndroidReceiver.js";
import AndroidProvider from "../android/AndroidProvider.js";
import ModelPackage from "../ModelPackage.js";
import ModelFile from "../ModelFile.js";


export interface BomCandidateChunk {
    ref: INodeRef,
    key?: string,
    value: any
}

export interface CompositionAnalyzerOpts {
    ctx?:DexcaliburProject;
}

export class CompositionAnalyzer {

    ctx:Nullable<DexcaliburProject> = null;

    constructor(pOptions:CompositionAnalyzerOpts) {
        for(let i in pOptions) this[pOptions[i]] = pOptions[i];
    }

    setContext(pContext:DexcaliburProject) {
        this.ctx = pContext;
    }

    /**
     * Check entropy/shortness of a symbol
     * @param pNode
     * @private
     */
    private async _isRenamedOrStripped(pStr:string):Promise<{ all:number, parts:any[] }> {
        // split around punct or not printavle symbols symbols
        let i=0, c:number;
        // substring, number count, upper case letters count, lower case letters, charset
        let s:any[]=[], es:number[]=[], e:number=0, b:any = ["",0,0,0,""];
        while(i<pStr.length){
            c = pStr[i].charCodeAt(0);
            if(c>=48 && c<=57){
                b[1]++;
                b+=pStr[i];
            }
            else if(c>=65 && c<=90){
                b[2]++;
                b+=pStr[i];
            }
            else if(c>=97 && c<=122){
                b[3]++;
                b+=pStr[i];
            }else{
                s.push(b);
                b=["",0,0,0,""];
                i++;
                continue;
            }

            if(b[4].indexOf(pStr[i])<0){
                b[4]+=pStr[i];
            }

            i++;
        }

        i=0;
        while(i<s.length){
            if(s.length<4){
                // entropy of string over the charset of the strings (no repeated char =max basic entropy)
                // high ratio of upper case vs lower case = probably renamed
                // short strings (<=3) = basic renaming
                // pStr.length/s.length = avg size of parts, if len
                es[i] = (s[i][4]/s.length) * (s[i][3]/s[i][2]);
                s[i].push(es[i]);
            }
        }

        i=0;
        e = 0;
        while(i<es.length) e += es[i];

        return {
            all: e * ((pStr.length/s.length > 3)? 0.5 : 1),
            parts: s
        };
    }

    private async _isPartOfAppNamespace(pStr:string, pExpectedOffset= -1):Promise<boolean> {
        let isPart = false;
        let ns:string;
        switch (this.ctx.os) {
            case OperatingSystem.IOS:
            case OperatingSystem.ANDROID:
                ns = this.ctx.getAppAnalyzer().getPackageName();
                isPart = (ns.indexOf(pStr)>pExpectedOffset)
                break;
        }

        return isPart
    }

    private async _extractAndroidComponentUids():Promise<BomCandidateChunk[]> {

        const chunks:BomCandidateChunk[] = [];

        [
            await this.ctx.merlin.activity("name:/./").executePDB(this.ctx),
            await this.ctx.merlin.provider("name:/./").executePDB(this.ctx),
            await this.ctx.merlin.receiver("name:/./").executePDB(this.ctx),
            await this.ctx.merlin.service("name:/./").executePDB(this.ctx),
        ].map((vData)=>{
            if(vData.count()>0){
                vData.list().forEach((v:AndroidActivity|AndroidService|AndroidReceiver|AndroidProvider) => {
                    if(!this._isPartOfAppNamespace(v.getUID())){
                        chunks.push({
                            ref: NodeUtils.asNodeRef(v),
                            key: "name",
                            value: v.getName(),
                        });
                    }
                });
            }
        });

        return chunks;
    }

    private async _extractIosComponentUids<T>():Promise<BomCandidateChunk[]> {

        const chunks:BomCandidateChunk[] = [];

        [
            await this.ctx.merlin.package("@swift.bundle").executePDB(this.ctx),
            await this.ctx.merlin.package("@objc.bundle").executePDB(this.ctx),
        ].map((vData)=>{
            if(vData.count()>0){
                vData.list().forEach((v:ModelPackage) => {
                    if(!this._isPartOfAppNamespace(v.getUID())){
                        chunks.push({
                            ref: NodeUtils.asNodeRef(v),
                            key: "name",
                            value: v.getUID(),
                        });
                    }
                });
            }
        });

        return chunks;
    }

    async extractChunks():Promise<void> {
        if(this.ctx==null){
            throw new Error("Cannot perform binary composition analysis: context is middimg.");
        }

        switch (this.ctx.os){
            case OperatingSystem.ANDROID:
                await this._extractAndroidComponentUids();
                await this._extractLibraryParts();
                await this._extractAndroidPackages();
                break;
            case OperatingSystem.IOS:
                await this._extractIosComponentUids();
                await this._extractLibraryParts();
                break;
            case OperatingSystem.LINUX:
                break;
        }
    }

    private async _extractLibraryParts() {
        const chunks:BomCandidateChunk[] = [];

        [
            await this.ctx.merlin.file("@data.type.executable").executePDB(this.ctx)
        ].map((vData)=>{
            if(vData.count()>0){
                vData.list().forEach((v:ModelFile) => {
                    chunks.push({
                        ref: NodeUtils.asNodeRef(v),
                        key: "name",
                        value: v.getUID(),
                    });
                });
            }
        });

        return chunks;
    }

    private async _extractAndroidPackages() {
        const chunks:BomCandidateChunk[] = [];

        [
            await this.ctx.merlin.package("name:/^[^.]+\.[^.]+$/").executePDB(this.ctx),
            await this.ctx.merlin.package("name:/^[^.]+\.[^.]+\.[^.]+$/").executePDB(this.ctx)
        ].map((vData)=>{
            if(vData.count()>0){
                vData.list().forEach((v:ModelPackage) => {
                    if(!this._isPartOfAppNamespace(v.getUID())){
                        chunks.push({
                            ref: NodeUtils.asNodeRef(v),
                            key: "name",
                            value: v.getUID(),
                        });
                    }

                });
            }
        });

        return chunks;
    }
}