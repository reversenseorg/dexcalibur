import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class DexcaliburConnectionException extends MonitoredError {

    code:number;
    extra:any;

    static ALL = {};

    static IP_NOT_DEFINED = ()=>{ return new DexcaliburConnectionException("IP address is not defined", ErrorCode.REMOTE_DEXCALIBUR + 401) };
    static PORT_NOT_DEFINED = ()=>{ return new DexcaliburConnectionException("Port number is not defined", ErrorCode.REMOTE_DEXCALIBUR + 402) };
    static HOSTNAME_NOT_DEFINED = ()=>{ return new DexcaliburConnectionException("Host name is not defined", ErrorCode.REMOTE_DEXCALIBUR + 403) };
    static REMOTE_OPERATION_NOT_SUPPORTED = ()=>{ return new DexcaliburConnectionException("This operation is not yet supported for remote instance.", ErrorCode.REMOTE_DEXCALIBUR + 404) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('REMOTE CONNECTION', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}