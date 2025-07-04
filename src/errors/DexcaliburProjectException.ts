import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {DeviceUUID} from "../Device.js";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {UserAccountUUID} from "../user/UserAccount.js";

export class DexcaliburProjectException extends MonitoredError {


    static ALL = {
        NEED_PROJECT_UPGRADE: ErrorCode.PROJECT + 112,
        NEED_ENGINE_UPGRADE: ErrorCode.PROJECT + 113
    };

    static TARGET_DEVICE_NOT_FOUND = ()=>{ return new DexcaliburProjectException("Target device is not found", ErrorCode.PROJECT + 101) };
    static TARGET_DEVICE_NOT_ENROLLED = ()=>{ return new DexcaliburProjectException("Target device is not enrolled or ready", ErrorCode.PROJECT + 102) };
    static INVALID_NAME = ()=>{ return new DexcaliburProjectException("Project name is invalid", ErrorCode.PROJECT + 103) };
    static APP_FILE_OT_FOUND = ()=>{ return new DexcaliburProjectException("App file is not found", ErrorCode.PROJECT + 104) };
    static STEP2_FAILURE = (pMsg='')=>{ return new DexcaliburProjectException("[STEP 2] Creating new project failed : "+pMsg, ErrorCode.PROJECT + 105) };
    static NEW_PROJECT_FAIL = ()=>{ return new DexcaliburProjectException("Project cannot be created. See logs for more details. ", ErrorCode.PROJECT + 106) };
    static OPEN_PROJECT_FAILURE = (pUID)=>{ return new DexcaliburProjectException("The project ["+pUID+"] cannot be opened", ErrorCode.PROJECT + 107) };
    static DELETE_PROJ_FAILURE_NOTFOUND = ()=>{ return new DexcaliburProjectException("Delete failure : project is not found.", ErrorCode.PROJECT + 108) };
    static INVALID_OR_NOT_ACTIVE = ()=>{ return new DexcaliburProjectException("Specified project is invalid or not active", ErrorCode.PROJECT + 109) };
    static CLOSE_PROJECT_FAILURE = ()=>{ return new DexcaliburProjectException("The project cannot be closed", ErrorCode.PROJECT + 110) };
    static NO_PROJECT_SPECIFIED = ()=>{ return new DexcaliburProjectException("There is not valid project specified.", ErrorCode.PROJECT + 111) };
    static NEED_PROJECT_UPGRADE = (pProjVer:string,pEngVer:string)=>{ return new DexcaliburProjectException("The project workspace has been built with an oldest version ("+pProjVer+") of Dexcalibur ("+pEngVer+") , the project will be updated.", ErrorCode.PROJECT + 112) };
    static NEED_ENGINE_UPGRADE = (pProjVer:string,pEngVer:string)=>{ return new DexcaliburProjectException("The project workspace has been built with a newest version ("+pProjVer+") of Dexcalibur ("+pEngVer+") , please upgrade the engine.", ErrorCode.PROJECT + 113) };
    static MISSING_CONFIG_FILE = (pProj:string)=>{ return new DexcaliburProjectException("The project [uid="+pProj+"] has not configuration file.", ErrorCode.PROJECT + 114) };
    static PROJECT_NOT_READY = (pProj:string)=>{ return new DexcaliburProjectException("The project [uid="+pProj+"] is not ready. Open it first.", ErrorCode.PROJECT + 115) };
    static PROJECT_DB_NOT_READY = (pProj:string)=>{ return new DexcaliburProjectException("The database from project [uid="+pProj+"] is not ready.", ErrorCode.PROJECT + 116) };
    static INSPECTOR_NOT_FOUND = (pProj:string, pInsp:string)=>{ return new DexcaliburProjectException("Inspector [uid="+pInsp+"] not found in project [uid="+pProj+"] is not ready.", ErrorCode.PROJECT + 117) };
    static INVALID_UUID_FMT = (pPUID:DexcaliburProjectUUID)=>{
        return new DexcaliburProjectException(`Invalid Project UUID format [uuid=${pPUID}]`,
            ErrorCode.PROJECT + 118) };
    static NOT_AUTHORIZED = (pPUID:DexcaliburProjectUUID, pUser:UserAccountUUID)=>{
        return new DexcaliburProjectException(`User [user=${pUser}] is not authorized to access to project [puid=${pPUID}]`,
            ErrorCode.PROJECT + 119) };
    static CANNOT_INIT_NO_WF = (pPUID:DexcaliburProjectUUID)=>{
        return new DexcaliburProjectException(`Cannot init project, no workflow defined [puid=${pPUID}]`,
            ErrorCode.PROJECT + 120) };
    static CANNOT_REATTACH_INPUT = (pPUID:DexcaliburProjectUUID,pInput:string)=>{
        return new DexcaliburProjectException(`Cannot reattach input to project workspace [puid=${pPUID}][input=${pInput}]`,
            ErrorCode.PROJECT + 121,{ puid:pPUID, path:pInput}) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('PROJECT', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}