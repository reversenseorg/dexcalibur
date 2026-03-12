/**
 * Represents the object which search pattern into application and generate
 * corresponding insttrumentation.
 *
 * By default, such HookStrategy are executed when the application has been analyzed,
 * however if it is attached to particular a particular event, it can be trigged earlier or later.
 *
 * @class
 */
import {NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {CoreDebug} from "../core/CoreDebug.js";
import {Nullable} from "../core/IStringIndex.js";
import {Operation} from "../search/MerlinSearchRequest.js";


export interface HookStrategySelectorOptions {
    type: string;
    uid?:Nullable<any>;
    req?:Nullable<string|Operation[]>;
    opts?:any;
}

export default class HookStrategySelector {

    /**
     * Search Engine request
     * @private
     */
    type:string = "";

    uid?:any = null;

    req?:string|Operation[] = null;


    /**
     * Group of hook
     *
     * @param {HookStrategySelectorOptions} config
     */
    constructor(pConfig:Nullable<HookStrategySelectorOptions>=null){

        // this.requiresNode = [];
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];


    }

    static from(pData:HookStrategySelectorOptions):HookStrategySelector {
        return new HookStrategySelector(pData);
    }

    getUids():string[] {
        if(this.isUidList()){
            return this.uid;
        }else{
            return [this.uid];
        }
    }

    isUidList():boolean {
        return (this.uid != null && Array.isArray(this.uid));
    }

    isUidSelector():boolean {
        return (this.uid != null);
    }

    setRequest(pReq:string|Operation[]){
        this.req = pReq;
    }

    getRequest():string|Operation[]{
        return this.req;
    }

    hasMerlinRequest():boolean {
        return (this.req != null) && (Array.isArray(this.req));
    }

    isMethod(){
        return (NodeType.ALL[this.type].getType() === NodeInternalType.METHOD);
    }

    isNativeFunc(){
        return (NodeType.ALL[this.type].getType() === NodeInternalType.FUNC);
    }

    isSystemCall(){
        return (NodeType.ALL[this.type].getType() === NodeInternalType.SYSCALL);
    }

    isRaw(){
        return (NodeType.ALL[this.type].getType() === null);
    }

    static fromJsonObject(pObj:any):HookStrategySelector {
        const o = new HookStrategySelector();
        if(pObj.req != null) o.req = pObj.req;
        if(pObj.uid != null) o.uid = pObj.uid;
        if(pObj.type != null) o.type = pObj.type;
        return o;
    }

    toJsonObject():any {
        const o:any = {};
        if(this.req != null) o.req = this.req;
        if(this.uid != null) o.uid = this.uid;

        o.type = this.type;

        CoreDebug.checkJsonSerialize(o, "HookStrategySelector");
        return o;
    }
}