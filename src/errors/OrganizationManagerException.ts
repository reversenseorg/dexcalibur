import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";



export class OrganizationManagerException extends MonitoredError {

    static CANNOT_CHECK_UUID = ()=>{
        return new OrganizationManagerException("Cannot check if an UUID exists : invalid object type",
            ErrorCode.ORGANIZATION + 1) };

    static CANNOT_CHECK_PPT_UNIQ = (pType:NodeInternalType, pPpt:string)=>{
        return new OrganizationManagerException(`Cannot check the uniqueness of property [name=${pPpt}] on collection of [node_type=${pType}] : property forbidden`,
            ErrorCode.ORGANIZATION + 2) };

    static DUPLICATED_ORG_NAME = ()=>{
        return new OrganizationManagerException(`There is always an organization with this name.`,
            ErrorCode.ORGANIZATION + 3) };

    static DUPLICATED_APP_NAME = ()=>{
        return new OrganizationManagerException(`There is always an application unit with this name.`,
            ErrorCode.ORGANIZATION + 4) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ORGANIZATION', pMsg, pCode, pExtra);
    }
}