
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

import {AbstractHook} from "./AbstractHook.js";
import {NodeInternalType, Nullable}
    from "@dexcalibur/dxc-core-api";
import {NodeType} from "@dexcalibur/dexcalibur-orm";
import {HookScriptBuilderException} from "../errors/HookScriptBuilderException.js";
import ModelSyscall from "../ModelSyscall.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {TargetLanguage} from "./common.js";

export enum HookTargetType {

}

export default class SystemCallHook extends AbstractHook {

    static TYPE:NodeType = (new NodeType( "hookSyscall", NodeInternalType.HOOK_SYSCALL, []));

    __:NodeInternalType = NodeInternalType.HOOK_SYSCALL;

    protected _t:NodeInternalType = NodeInternalType.SYSCALL;

    /**
     * Targeted method
     * @field
     * @
     */
    private _target:ModelSyscall  = null;

    private _targetType: HookTargetType[] = []; //HookTargetType.STATIC_OFFSET;

    private _tpl:any = null;

    private _weight = 0;


    constructor( pData:any = null) {
        super();

        if(pData != null)
            for(const i in pData){
                this[i] = pData[i];
            }
    }



    //isReadFD(){
    //    return (this._targetType.indexOf(HookTargetType.EXPORTED_SYMBOL)>-1);
    //}


    /**
     * To check if the hook target the specified method
     *
     * @param {ModelMethod} pNode The target to verify
     * @return {boolean} Return TRUE if target specified node is targeted, else FALSE
     * @method
     * @since 1.0.0
     */
    isTarget(pNode: ModelSyscall): boolean {
        return ( this._target.getUID() === pNode.getUID());
    }

    setTarget( pNode:ModelSyscall) {
        this._target = pNode;
    }
    /**
     * @return {ModelMethod} Targeted method
     * @method
     * @since 1.0.0
     */
    getTarget():any {
        return this._target;
    }

    toJsonObject(): any {
        const o = super.toJsonObject();
        CoreDebug.checkJsonSerialize(o,"SystemCallHook");
        return o;
    }

    build(pLang:Nullable<TargetLanguage> = null):any{

        if(this._target == null){
            throw HookScriptBuilderException.UNTARGETABLE_SYSCALL_HOOK();
        }

        /*
        this.setGeneratedCode( this._mgr.hk_builder.native.build(this));
        this.enable();*/

        return true;
    }

    destroy(): any {
        // nothing to do yet
    }
}