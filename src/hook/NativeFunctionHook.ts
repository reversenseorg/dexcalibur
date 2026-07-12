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

import {ModelFunction} from "../ModelFunction.js";
import {AbstractHook} from "./AbstractHook.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {NodeType, NodeUtils} from "@dexcalibur/dexcalibur-orm";
import {HookScriptBuilderException} from "../errors/HookScriptBuilderException.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {TargetLanguage} from "./common.js";
import {HookOptions} from "./HookManager.js";
import {INodeRef} from "../INode.js";
import {MemoryAddress} from "../memory/MemoryAddress.js";

;

export enum HookTargetType {
    STATIC_OFFSET,
    DYNAMIC_OFFSET,
    EXPORTED_SYMBOL,
    IMPORTED_SYMBOL,
    LOCAL_SYMBOL,
    POINTER,
    RAW
}

export default class NativeFunctionHook extends AbstractHook {


    static TYPE:NodeType = (new NodeType( "hook_native", NodeInternalType.HOOK_NATIVE, []));

    __:NodeInternalType = NodeInternalType.HOOK_NATIVE;

    protected _t:NodeInternalType = NodeInternalType.FUNC;

    /**
     * Targeted method
     * @field
     * @
     */
    private _target:ModelFunction|INodeRef|number|MemoryAddress  = null;

    private _targetType: HookTargetType = HookTargetType.STATIC_OFFSET;

    private _tpl:any = null;

    private _weight = 0;


    constructor( pData:any = null) {
        super();

        if(pData != null)
            for(const i in pData){
                this[i] = pData[i];
            }
    }

    isTargetExportedSymbol(){
        return (this._targetType==HookTargetType.EXPORTED_SYMBOL);
    }

    isTargetImportedSymbol(){
        return (this._targetType==HookTargetType.IMPORTED_SYMBOL);
    }

    isTargetStaticOffset(){
        return (this._targetType==HookTargetType.STATIC_OFFSET);
    }

    isTargetDynOffset(){
        return (this._targetType==HookTargetType.DYNAMIC_OFFSET);
    }

    isTargetLocalSymbol(){
        return (this._targetType==HookTargetType.LOCAL_SYMBOL);
    }

    isTargetByPointer(){
        return (this._targetType==HookTargetType.POINTER);
    }

    isRawTarget(){
        return (this._targetType==HookTargetType.RAW);
    }

    /**
     * To check if the hook target the specified method
     *
     * @param {ModelMethod} pNode The target to verify
     * @return {boolean} Return TRUE if target specified node is targeted, else FALSE
     * @method
     * @since 1.0.0
     */
    isTarget(pNode: ModelFunction): boolean {
        if(this._t===NodeInternalType.FUNC){
            if(NodeUtils.isNodeRef(this._target)){
                return ( (this._target as INodeRef)._uid === pNode.getUID());
            }else{
                return ((this._target as ModelFunction).getUID() === pNode.getUID());
            }
        }else{
            return false;
        }
    }

    setTarget( pNode:ModelFunction) {
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
        let o = super.toJsonObject();

        o.func = this.getTarget().getUID();
        o.file = (this.getTarget() as ModelFunction).getDeclaringFile();


        CoreDebug.checkJsonSerialize(o,"NativeFunctionHook");
        return o;
    }

    build(pLang:Nullable<TargetLanguage> = null, pOpts:Nullable<HookOptions> = null):any{
        if(this._target == null){
            throw HookScriptBuilderException.UNTARGETABLE_NATIVE_HOOK();
        }

        this.setGeneratedCode( this._mgr.hk_builder.native.build(this,pOpts));
        this.enable();

        return true;
    }

    destroy(): any {

    }
}