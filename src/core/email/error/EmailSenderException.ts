import {ErrorCode, MonitoredError} from "../../../errors/MonitoredError.js";
import {SecurityZone} from "../../../security/SecurityZone.js";


export class EmailSenderException extends MonitoredError {

    _zone = SecurityZone.PRIVATE;

    static MISSING_API_KEY = ()=>{
        return (new EmailSenderException("The API key is missing", ErrorCode.EMAIL + 1)).zone(SecurityZone.PRIVATE)
    };

    static SENDING_FAILURE = (pEmail:string, pTitle:string)=>{
        return (new EmailSenderException(
            `Email [title=${pTitle}] cannot be sent to [mail=${pEmail}]`,
            ErrorCode.EMAIL + 2)).zone(SecurityZone.PUBLIC)
    };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('EMAILER', pMsg, pCode, pExtra);
    }
}