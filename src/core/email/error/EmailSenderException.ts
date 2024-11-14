import {ErrorCode, MonitoredError} from "../../../errors/MonitoredError.js";
import {SecurityZone} from "../../../security/SecurityZone.js";


export class EmailSenderException extends MonitoredError {

    static MISSING_API_KEY = ()=>{
        return (new EmailSenderException("The API key is missing", ErrorCode.EMAIL + 1)).zone(SecurityZone.PRIVATE)
    };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('EMAILER', pMsg, pCode, pExtra);
    }
}