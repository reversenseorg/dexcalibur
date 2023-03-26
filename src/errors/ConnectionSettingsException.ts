import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class ConnectionSettingsException extends MonitoredError {

    code:number;
    extra:any;

    static ALL = {};

    static NAME_ALREADY_USED = ()=>{ return new ConnectionSettingsException("This name is already used", ErrorCode.REMOTE_DEXCALIBUR + 101) };
    static NO_CONNECTION_FOR_NAME = ()=>{ return new ConnectionSettingsException("There is not connection with this name", ErrorCode.REMOTE_DEXCALIBUR + 102) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('REMOTE CONNECTION SETTINGS', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}