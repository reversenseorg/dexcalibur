import {ErrorCode, MonitoredError} from "./MonitoredError";

export class DexcaliburProjectException extends MonitoredError {

    code:number;
    extra:any;

    static ALL = {};

    static TARGET_DEVICE_NOT_FOUND = ()=>{ return new DexcaliburProjectException("Target device is not found", ErrorCode.PROJECT + 101) };
    static TARGET_DEVICE_NOT_ENROLLED = ()=>{ return new DexcaliburProjectException("Target device is not enrolled or ready", ErrorCode.PROJECT + 102) };
    static INVALID_NAME = ()=>{ return new DexcaliburProjectException("Project name is invalid", ErrorCode.PROJECT + 103) };
    static APP_FILE_OT_FOUND = ()=>{ return new DexcaliburProjectException("App file is not found", ErrorCode.PROJECT + 104) };
    static STEP2_FAILURE = (pMsg:string='')=>{ return new DexcaliburProjectException("[STEP 2] Creating new project failed : "+pMsg, ErrorCode.PROJECT + 105) };
    static NEW_PROJECT_FAIL = ()=>{ return new DexcaliburProjectException("Project cannot be created. See logs for more details. ", ErrorCode.PROJECT + 106) };
    static OPEN_PROJECT_FAILURE = ()=>{ return new DexcaliburProjectException("The project cannot be opened", ErrorCode.PROJECT + 107) };
    static DELETE_PROJ_FAILURE_NOTFOUND = ()=>{ return new DexcaliburProjectException("Delete failure : project is not found.", ErrorCode.PROJECT + 108) };
    static INVALID_OR_NOT_ACTIVE = ()=>{ return new DexcaliburProjectException("Specified project is invalid or not active", ErrorCode.PROJECT + 109) };
    static CLOSE_PROJECT_FAILURE = ()=>{ return new DexcaliburProjectException("The project cannot be closed", ErrorCode.PROJECT + 110) };
    static NO_PROJECT_SPECIFIED = ()=>{ return new DexcaliburProjectException("There is not valid project specified.", ErrorCode.PROJECT + 111) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('PROJECT', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}