import {ErrorCode, MonitoredError} from "./MonitoredError.js";



export class OrganizationManagerException extends MonitoredError {

    static CANNOT_CHECK_UUID = ()=>{
        return new OrganizationManagerException("Cannot check if an UUID exists : invalid object type",
            ErrorCode.ORGANIZATION + 1) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ORGANIZATION', pMsg, pCode, pExtra);
    }
}