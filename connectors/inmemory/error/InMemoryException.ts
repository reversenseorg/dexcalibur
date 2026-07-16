import {MonitoredError} from "@reversense/dexcalibur-orm";

export class InMemoryException extends MonitoredError {


    static ALL = {};

    static NULL_DB_INSTANCE = ()=>{ return new InMemoryException("DB instance is null", 1001) };
    static KEY_CANNOT_BE_NULL = (vOpe:string,vName:string)=>{ return new InMemoryException(`Operation [${vOpe}] not permitted, key cannot be null [collection=${vName}]`, 1002) };
    static KEY_CANNOT_BE_UNDEFINED = (vOpe:string,vName:string)=>{ return new InMemoryException(`Operation [${vOpe}] not permitted, key cannot be undefined [collection=${vName}]`, 1003) };
    static ASYNC_NOT_SUPPORTED = (vOpe:string,vName:string)=>{ return new InMemoryException(`Operation [${vOpe}] not permitted, async call are not supported for inmemory DB [collection=${vName}]`, 1004) };
    static NO_PROXY_AVAILABLE = (vOpe:string,vName:string)=>{ return new InMemoryException(`Operation [${vOpe}] not permitted, proxy are not supported by inmemory DB [collection=${vName}]`, 1005) };
    //static GRAPH_SVC_NOT_READY = (vName:string)=>{ return new InMemoryException("Graph service is not initialized : "+vName, 1002) };

    constructor( pMsg:string, pCode = -1, pExtra:any = null) {
        super('INTERNAL+DB', pMsg);
        this.code = pCode;
        this.extra = pExtra;
        super._triggerNewHook();
    }
}