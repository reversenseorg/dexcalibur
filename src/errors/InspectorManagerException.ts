import {ErrorCode, MonitoredError} from "./MonitoredError.js";


export enum InspectorManagerError {
    INSPECTOR = 100
}

export class InspectorManagerException extends MonitoredError {

    static ERR = {
        INSPECTOR_UPGRADE_TO_MINOR_NOT_SUPPORTED: ErrorCode.INSPECTOR + InspectorManagerError.INSPECTOR+ 1,
        INSPECTOR_UPGRADE_TO_MAJOR_NOT_SUPPORTED: ErrorCode.INSPECTOR + InspectorManagerError.INSPECTOR+ 2,
        PRESERVATIVE_UPGRADE_NOT_SUPPORTED: ErrorCode.INSPECTOR + InspectorManagerError.INSPECTOR+ 3,
        MARKER_NOT_SUPPORTED: ErrorCode.INSPECTOR + InspectorManagerError.INSPECTOR+ 4
    };

    static INSPECTOR_UPGRADE_TO_MINOR_NOT_SUPPORTED = (vUid,vOldVersion,vNewVersion)=>{
        return new InspectorManagerException(
        " Upgrade of saved Inspector [uid="+vUid+"][version="+vOldVersion+"] to next minor version ["+vNewVersion+"] is not supported : ",
            InspectorManagerException.ERR.INSPECTOR_UPGRADE_TO_MINOR_NOT_SUPPORTED)
    };

    static INSPECTOR_UPGRADE_TO_MAJOR_NOT_SUPPORTED = (vUid,vOldVersion,vNewVersion)=>{
        return new InspectorManagerException(
            " Upgrade of saved Inspector [uid="+vUid+"][version="+vOldVersion+"] to next major version ["+vNewVersion+"] is not supported : ",
            InspectorManagerException.ERR.INSPECTOR_UPGRADE_TO_MAJOR_NOT_SUPPORTED)
    };



    static PRESERVATIVE_UPGRADE_NOT_SUPPORTED = (vLocation:string)=>{
        return new InspectorManagerException(
            " Preservative upgrade not supported for [type="+vLocation+"]",
            InspectorManagerException.ERR.PRESERVATIVE_UPGRADE_NOT_SUPPORTED)
    };

    static MARKER_NOT_SUPPORTED = (pFlag:string)=>{
        return new InspectorManagerException(
            " Marker not supported [name="+pFlag+"]",
            InspectorManagerException.ERR.MARKER_NOT_SUPPORTED)
    };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('INSPECTOR MANAGER', pMsg, pCode, pExtra);
    }

}