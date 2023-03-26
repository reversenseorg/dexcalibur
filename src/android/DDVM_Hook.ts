/**
 * Class describing a hook into the VM, it allows to provide custom implementation
 * of method.
 *
 * @class
 * @classdesc Class describing a hook into the VM
 */
import DDVM_ClassInstance from "./DDVM_ClassInstance.js";

/**
 * @class
 */
export default class DDVM_Hook
{
    /**
     * @field
     */
    method:string = null;

    /**
     * @field
     */
    hook:Function = null;

    /**
     * @field
     */
    enable:boolean = false;

    /**
     *
     * @constructor
     * @param {String} pMethodName The signature of the method to hook
     * @param {Function} pHook
     * @param {Boolean} pEnable
     */
    constructor( pMethodSignature:string, pHook:Function, pEnable:boolean=true){
        this.method = pMethodSignature;
        this.hook = pHook;
        this.enable = pEnable;
    }

    /**
     * To execute the hook code with the given context
     *
     * @method
     * @param {VM} pVM The context of the VM
     * @param {VM_ClassInstance} pThis If the method is not static, the instance invoking the method. Else, if the method is static, it is NULL
     * @param {Symbol} pArgs The registers containing value of arguments
     * @return {*} Value returned by hook function
     */
    exec( pVM:any, pMethod:any, pThis:DDVM_ClassInstance, pArgs:any):any{
        return this.hook(pVM, pThis, pArgs);
    }
}
