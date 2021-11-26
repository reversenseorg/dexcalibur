import {IHook} from "./IHook";
import ModelMethod from "../ModelMethod";
import KeyPoint from "./KeyPoint";
import {AbstractHook} from "./AbstractHook";
import HookTemplateFragment from "./HookTemplateFragment";
import DexcaliburProject from "../DexcaliburProject";
import Util from "../Utils";
import {HookScriptBuilderException} from "../errors/HookScriptBuilderException";
import {ModelFunction} from "../ModelFunction";


export default class JavaMethodHook extends AbstractHook {


    /**
     * Targeted method
     * @field
     * @
     */
    private _target:ModelMethod = null;

    public method:ModelMethod;



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

    build(pContext:DexcaliburProject):boolean{

        if(this._target == null){
            throw HookScriptBuilderException.UNTARGETABLE_JAVA_HOOK();
        }

        this.setGeneratedCode( this._mgr.hk_builder.java.build(this));
        this.enable();

        return true;
    }

    toJsonObject(){
        let o = super.toJsonObject();

        o.method = this.getTarget().getUID();
        return o;
    }

    updateWith(object: any, method: any): this {
        let o = super.updateWith(object, method);

        o.method = method;
        return o;
    }
}