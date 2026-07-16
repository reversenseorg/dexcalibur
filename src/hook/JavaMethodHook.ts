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

import ModelMethod from "../ModelMethod.js";
import {AbstractHook} from "./AbstractHook.js";
import {HookScriptBuilderException} from "../errors/HookScriptBuilderException.js";
import {NodeInternalType, Nullable}
    from "@reversense/dxc-core-api";;
import {NodeType} from "@reversense/dexcalibur-orm";
import {CoreDebug} from "../core/CoreDebug.js";
import {TargetLanguage} from "./common.js";


export default class JavaMethodHook extends AbstractHook {


    static TYPE:NodeType = new NodeType( "hook_java", NodeInternalType.HOOK_JAVA, []);

    __:NodeInternalType = NodeInternalType.HOOK_JAVA;

    protected _t:NodeInternalType = NodeInternalType.METHOD;
    /**
     * Targeted method
     * @field
     * @
     */
    public _target:ModelMethod = null;

    public method:ModelMethod;


    constructor( pData:any = null) {
        super();

        if(pData !== null)
            for(const i in pData){
                this[i] = pData[i];
            }
    }

    /**
     * To check if the hook target the specified method
     *
     * @param {ModelMethod} pNode The target to verify
     * @return {boolean} Return TRUE if target specified node is targeted, else FALSE
     * @method
     * @since 1.0.0
     */
    isTarget(pNode: ModelMethod): boolean {
        return ( this._target.getUID() === pNode.getUID());
    }

    /**
     * @return {ModelMethod} Targeted method
     * @method
     * @since 1.0.0
     */
    getTarget():ModelMethod {
        return this._target;
    }

    /**
     * @return {ModelMethod} Targeted method
     * @method
     * @since 1.0.0
     */
    setTarget(pTarget:ModelMethod) {
        this._target = pTarget;
        this.method = pTarget;
        this.name = pTarget.name;
    }

    /**
     * To generate hook source code
     *
     * @param {DexcaliburProject} pContext Project
     * @method
     * @since 1.0.0
     */
    build(pLang:Nullable<TargetLanguage> = null):boolean{

        if(this._target == null){
            throw HookScriptBuilderException.UNTARGETABLE_JAVA_HOOK();
        }

        const lang = pLang ?? this.lang;

        switch (lang) {
            case TargetLanguage.TS:
                this.setGeneratedCode( this._mgr.hk_builder.java.buildTS(this));
                break;
            case TargetLanguage.JS:
                this.setGeneratedCode( this._mgr.hk_builder.java.build(this));
                break;
        }

        this.enable();

        return true;
    }

    toJsonObject(){
        let o = super.toJsonObject();

        o.method = this.getTarget().getUID();
        CoreDebug.checkJsonSerialize(o, "JavaMethodHook");
        return o;
    }

    updateWith(object: any, method: any): this {
        let o = super.updateWith(object, method);

        o.method = method;
        return o;
    }

    destroy(): any {
        // remove from db
    }
}