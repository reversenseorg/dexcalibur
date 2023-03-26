import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class GlobalSettingsException extends MonitoredError {

    code:number;
    extra:any;

    static ALL = {};

    static CATEGORY_UNKNOW = ()=>{ return new GlobalSettingsException("Category not exists or you are not authorized", ErrorCode.SETTINGS + 1) };
    static SETTING_UNKNOW = ()=>{ return new GlobalSettingsException("Setting name not exists or you are not authorized", ErrorCode.SETTINGS + 2) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('GLOBAL SETTINGS', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}