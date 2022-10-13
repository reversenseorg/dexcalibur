import {IHook} from "./IHook";
import ModelMethod from "../ModelMethod";
import {ModelFunction} from "../ModelFunction";
import KeyPoint from "./KeyPoint";
import HookTemplate from "./HookTemplate";
import {AbstractHook} from "./AbstractHook";
import {NodeInternalType} from "../NodeInternalType";
import {NodeType} from "../persist/orm/NodeType";
import {DataSourceHelper} from "../DataSourceHelper";
import {HookScriptBuilderException} from "../errors/HookScriptBuilderException";
import ModelFile from "../ModelFile";
import DexcaliburProject from "../DexcaliburProject";
import ModelSyscall from "../ModelSyscall";

export enum HookTargetType {

}

export default class SystemCallHook extends AbstractHook {

    static TYPE:NodeType = (new NodeType( "hook_syscall", NodeInternalType.HOOK_SYSCALL, []));

    __:NodeInternalType = NodeInternalType.HOOK_SYSCALL;

    protected _t:NodeInternalType = NodeInternalType.SYSCALL;

    /**
     * Targeted method
     * @field
     * @
     */
    private _target:any  = null;

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

        return o;
    }

    build():any{

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