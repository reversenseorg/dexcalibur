/**
 * Represents the object which search pattern into application and generate
 * corresponding insttrumentation.
 *
 * By default, such HookStrategy are executed when the application has been analyzed,
 * however if it is attached to particular a particular event, it can be trigged earlier or later.
 *
 * @class
 */
import {NodeType} from "../persist/orm/NodeType";
import {NodeInternalType} from "../NodeInternalType";

export default class HookStrategySelector {

    /**
     * Search Engine request
     * @private
     */
    type:NodeType = null;

    uid?:string = null;

    req?:string = null;


    /**
     * Group of hook
     *
     * @param {*} config
     */
    constructor(pConfig:any=null){

        // this.requiresNode = [];
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    static from(pData:any):HookStrategySelector {
        return new HookStrategySelector(pData);
    }

    isSearchRequest():boolean {
        return (this.req != null);
    }

    isUidSelector():boolean {
        return (this.uid != null);
    }

    setRequest(pReq:string){
        this.req = pReq;
    }

    getRequest():string{
        return this.req;
    }

    isMethod(){
        return (this.type.getType() === NodeInternalType.METHOD);
    }

    isNativeFunc(){
        return (this.type.getType() === NodeInternalType.FUNC);
    }

    isSystemCall(){
        return (this.type.getType() === NodeInternalType.SYSCALL);
    }

    isRaw(){
        return (this.type.getType() === null);
    }

}