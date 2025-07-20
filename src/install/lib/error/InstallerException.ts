import {ErrorCode, MonitoredError} from "../../../errors/MonitoredError.js";
import {SecurityZone} from "../../../security/SecurityZone.js";

/**
 *
 */
export class InstallerException extends MonitoredError {

    static FATAL_TEMP_FOLDER_CANNOT_BE_CREATE = (pPath: string)=>{
        return (new InstallerException(
            `[FATAL] The temporary folder [path=${pPath}]  cannot be created `,
            ErrorCode.INSTALLER + 10, { path:pPath })).zone(SecurityZone.PRIVATE) ;
    };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('INSTALLER', pMsg, pCode, pExtra);
    }
}