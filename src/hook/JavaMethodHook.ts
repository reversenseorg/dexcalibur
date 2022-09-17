import ModelMethod from "../ModelMethod";
import {AbstractHook} from "./AbstractHook";
import DexcaliburProject from "../DexcaliburProject";
import {HookScriptBuilderException} from "../errors/HookScriptBuilderException";
import {NodeInternalType} from "../NodeInternalType";
import {NodeType} from "../persist/orm/NodeType";


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
    build():boolean{

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

    destroy(): any {
        // remove from db
    }
}