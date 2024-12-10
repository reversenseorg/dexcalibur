import {ErrorCode, MonitoredError} from "../../../errors/MonitoredError.js";
import {SecurityZone} from "../../../security/SecurityZone.js";


export class ConnectionProtocolException extends MonitoredError {

    static PROTOCOL_NOT_SUPPORTED = (pType:string)=>{
        return (new ConnectionProtocolException(`Connection protocol [type=${pType}] not supported.`, ErrorCode.CONNECTION_PROTO + 1)).zone(SecurityZone.PRIVATE)
    };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('CONN_PROTO', pMsg, pCode, pExtra);

        this.zone(SecurityZone.PRIVATE);
    }
}