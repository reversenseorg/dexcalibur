import {IHook} from "./IHook";
import ModelMethod from "../ModelMethod";
import {ModelFunction} from "../ModelFunction";
import KeyPoint from "./KeyPoint";
import HookTemplate from "./HookTemplate";
import {AbstractHook} from "./AbstractHook";
import {NodeInternalType} from "../NodeInternalType";
import {NodeType} from "../persist/orm/NodeType";

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


    static TYPE:NodeType = new NodeType( "hook_native", NodeInternalType.HOOK_NATIVE, []);

    __:NodeInternalType = NodeInternalType.HOOK_NATIVE;

    protected _t:NodeInternalType = NodeInternalType.FUNC;

    /**
     * Targeted method
     * @field
     * @
     */
    private _target:any  = null;

    private _targetType: HookTargetType = HookTargetType.STATIC_OFFSET;

    private _tpl:any = null;

    private _weight = 0;



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
        return ( this._target.getUID() === pNode.getUID());
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

        const f = (this.getTarget() as ModelFunction).getDeclaringFile();
        if(typeof f==='string')
            o.file = f;
        else if(f!==null)
            o.file = f.getName();

        return o;
    }

    build():string{
        return null;
    }

    destroy(pContext: any): any {

    }
}