import {SecurityZone} from "../security/SecurityZone.js";

export enum ErrorCode {
    GENERIC= 1000,
    ORGANIZATION=1100,
    EMAIL=1200,
    SECRET_MGT=1300,
    PROJ_SCHED=1400,
    SCAN_SCHED=1500,
    PROJ_MGT=1600,
    DEVICE_MANAGER= 10000,
    DEVICE_VDEV=10200,
    BRIDGE= 11000,
    AUDIT_MANAGER = 12000,
    PLATFORM_MANAGER= 15000,
    MARKETPLACE= 16000,
    LICENSE_MGT= 17000,
    REMOTE = 20000,
    REMOTE_DEXCALIBUR= 21000,
    AUTH=30000,
    USER_SERVICE=31000,
    PARSER = 40000,
    PROJECT = 50000,
    SMALI_PARSER = 41000,
    ANALYZER= 60000,
    ANALYZER_NATIV= 62000,
    ANALYZER_SEARCH = 63000,
    ANALYZER_APP=64000,
    ANALYZER_PKG=65000,
    ANALYZER_GUI=66000,
    HOOK = 70000,
    HOOK_MANAGER = 71000,
    KP_MANAGER = 72000,
    HOOK_BUILDER = 73000,
    EXTENSION = 80000,
    INSPECTOR = 81000,
    INSPECTOR_FACT = 82000,
    SECURITY = 90000,
    SECURITY_RUNTIME = 91000,
    SECURITY_ACL = 92000,
    SETTINGS = 95000,
    CONNECTION=96100,
    CONNECTION_PROTO=96200,
    DEV_MODE = 99000
}


export class MonitoredError extends Error {

    /**
     * Component name
     *
     * @field
     * @type string
     */
    cmp:string;
    code:number;
    extra:any;
    _zone = SecurityZone.PUBLIC;

    constructor( pCmp:string, pMsg:string, pCode:number = null, pExtra:any = null) {
        super(pMsg);
        this.cmp = pCmp;
        this.code = pCode;
        this.extra = pExtra;
    }

    zone(pZone:SecurityZone):MonitoredError {
        this._zone = pZone;
        return this;
    }

    getCode():number {
        return this.code;
    }


    getExtra():any {
        return this.extra;
    }

    toString():string {
        return `[${this.cmp}] [#${this.code!=null ? this.code : "<null>"}] ${this.message}`;
    }

    /**
     *
     * @param pIncludeExtra
     */
    toObject(pIncludeExtra=false):any {
        return {
            cmp: this.cmp,
            code: this.code,
            msg: this.message,
            extra: pIncludeExtra ? this.extra : null
        }
    }
}