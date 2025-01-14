import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {InternalStateUUID} from "../core/InternalState.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";

export class EngineDatabaseException extends MonitoredError {

    code:number;
    extra:any;

    static CODE = {
        UNKNOWN_COLLECTION: ErrorCode.GENERIC + 20,
        SAVE_OPE_NOT_SUPPORTED: ErrorCode.GENERIC + 21,
        UPDATE_FAILED_FOR: ErrorCode.GENERIC + 22,
        UNKNOWN_PROJECT: ErrorCode.GENERIC + 24,
        BULK_OP_NOT_SUPPORTED: ErrorCode.GENERIC + 24
    }

    static UNKNOWN_COLLECTION = (pName:string)=>{
        return new EngineDatabaseException("Following collection is missing in Engine DB :"+pName,
            ErrorCode.GENERIC + 20) };


    static UNKNOWN_PROJECT = (pName:string,pSource:string)=>{
        return new EngineDatabaseException(`Following project is missing in Engine DB [from=${pSource}][uid=${pName}]`,
            ErrorCode.GENERIC + 24) };

    static SAVE_OPE_NOT_SUPPORTED = (pName:string)=>{
        return new EngineDatabaseException("The 'save' operation is not supported for object '"+pName+"'",
            ErrorCode.GENERIC + 21) };

    static UPDATE_FAILED_FOR = (pName:string,pUID:string)=>{
        return new EngineDatabaseException(`The 'update' operation failed for object [type=${pName}][uid=${pUID}]`,
            ErrorCode.GENERIC + 22) };

    static BULK_OP_NOT_SUPPORTED = (pOpe:string,pCause:string)=>{
        return new EngineDatabaseException(`Bulk operation [${pOpe}] not supported : ${pCause} `,
            ErrorCode.GENERIC + 25) };

    static CANNOT_CONNECT_TO_DB = (pCause:string)=>{
        return new EngineDatabaseException(`Connection to db is not possible: ${pCause} `,
            ErrorCode.GENERIC + 26) };

    static CANNOT_CHECK_UUID = ()=>{
        return new EngineDatabaseException("Cannot check if an UUID exists : invalid object type",
            ErrorCode.GENERIC + 27) };

    static CANNOT_SAVE_INTERNAL_STATE = (pStateUUID:InternalStateUUID)=>{
        return new EngineDatabaseException("Cannot save internal state because engine database is not ready [uuid="+pStateUUID+"]",
            ErrorCode.GENERIC + 28) };

    static ORDER_TYPE_NOT_SUPPORTED = (pType:NodeInternalType,pOpe:string)=>{
        return new EngineDatabaseException(`Cannot ${pOpe} order : Order type not supported [type=${pType}]`,
            ErrorCode.GENERIC + 29) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ENGINE DB', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}