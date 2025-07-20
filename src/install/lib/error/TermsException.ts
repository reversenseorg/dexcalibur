import {ErrorCode, MonitoredError} from "../../../errors/MonitoredError.js";
import {SecurityZone} from "../../../security/SecurityZone.js";

/**
 *
 */
export class TermsException extends MonitoredError {
    static CANNOT_READ_LICENSE_PDF = (pPath: string)=>{
        return (new TermsException(`The license file (pdf) at [${pPath}] cannot be read  `,
            ErrorCode.INSTALLER + 20, { path:pPath })).zone(SecurityZone.PRIVATE);
    };

    static CANNOT_READ_LICENSE_TEXT = (pPath: string, message: any)=>{
        return (new TermsException(`The license file (raw text) at [${pPath}] cannot be read : ${message} `,
            ErrorCode.INSTALLER + 21, { path:pPath, msg:message })).zone(SecurityZone.PRIVATE);
    };

    static INVALID_FOLDER = (pLang:string, pPath:string )=>{
        return (new TermsException("The license folder ["+pPath+"] for [lang="+pLang+"] not found.",
            ErrorCode.INSTALLER + 22, { lang:pLang, path:pPath })).zone(SecurityZone.PRIVATE) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('TERMS MGT', pMsg, pCode, pExtra);
    }
}