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

import DexcaliburProject from "./DexcaliburProject.js";
import {CryptoUtils} from "./CryptoUtils.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {InspectorState} from "./hook/common.js";
import {InspectorManagerException} from "./errors/InspectorManagerException.js";

/**
 * @class
 */
export default class HookPrologue
{
    // parent HookSet
    parentID:string = null;

    script:string = null;

    builtScript:string = null;

    context:DexcaliburProject = null;

    deprecated = false;

    removed = false;


    /**
     * To configure and manage a static part of the hook code
     * shared by all hooks and where class are searched.
     * Each hook set can define one custom prologue and several dependencies.
     *
     *
     * @param {*} config
     */
    constructor(pConfig:any = null){
        if(pConfig != null){
            for(let i in pConfig)
                this[i]=pConfig[i];
        }
    }

    /**
     * To check if the prologue is enable or not.
     * It is disabled when the parent is disabled
     *
     * @return {Boolean} Returns TRUE if enabled, else FALSE
     * @function
     */
    async isEnable():Promise<boolean>{
        for(let i in this.context.hook.hooksets)
            console.log(i,this.parentID);

        return (await this.context.hook.getHookSet(this.parentID)).isEnable();
    }

    /**
     * To build the prologue Frida script
     *
     * In order to differentiate several prologues and avoid
     * conflicts, the @@__CTX__@@ token will be replaced by the hash
     * of the parent HookSet.
     *
     * @function
     */
    buildScript():string{
        let script:string=this.script;
        let tags:any = {
            "@@__CTX__@@": "ctx_"+CryptoUtils.md5(this.parentID)
        };

        for(let i in tags){
            do{
                script = script.replace(i,tags[i]);
            }while(script.indexOf(i)>-1);
        }

        //console.log("Build script of prologue > ",this);
        return this.builtScript = script;
    }

    /**
     * To inject dependencies into HookPrologue
     *
     * @param {DexcaliburProject} ctx The context of the project
     * @function
     */
    injectContext(ctx:DexcaliburProject){
        this.context = ctx;
        this.buildScript();
        return this;
    }

    /**
     *
     */
    markAsDeprecated() {
        this.markAs(InspectorState.DEPRECATED);
    }

    /**
     *
     */
    markAsRemoved() {
        this.markAs(InspectorState.REMOVED);
    }

    /**
     *
     */
    markAs(pFlag:InspectorState) {

        if([InspectorState.DEPRECATED,InspectorState.REMOVED].indexOf(pFlag)>-1){
            throw InspectorManagerException.MARKER_NOT_SUPPORTED(pFlag);
        }

        this[pFlag] = true;
    }

    /**
     * @method
     */
    toJsonObject():any{
        let o:any = new Object();
        o.parentID = this.parentID;
        o.script = this.script;
        o.builtScript = this.builtScript;
        o.removed = this.removed;
        o.deprecated = this.deprecated;
        CoreDebug.checkJsonSerialize(o, "HookPrologue");
        return o;
    }


}
