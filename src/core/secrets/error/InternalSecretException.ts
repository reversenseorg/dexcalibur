import {ErrorCode, MonitoredError} from "../../../errors/MonitoredError.js";
import {SecurityZone} from "../../../security/SecurityZone.js";


export class InternalSecretException extends MonitoredError {

    static SECRET_NOT_FOUND = (pSecretName:string)=>{
        return (new InternalSecretException(`Secret [name=${pSecretName}] not found.`, ErrorCode.SECRET_MGT + 1)).zone(SecurityZone.PRIVATE)
    };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('SECRET_MGT', pMsg, pCode, pExtra);
    }
}