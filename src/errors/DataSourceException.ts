import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class DataSourceException extends MonitoredError {



    static ALL = {};

    static NO_HANDLER_DEFINED = (pName:string)=>{ return new DataSourceException("There is no handle inside data source for this node type :"+pName, ErrorCode.GENERIC + 10) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('DATA SOURCE', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}