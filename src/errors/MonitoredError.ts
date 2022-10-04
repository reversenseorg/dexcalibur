export enum ErrorCode {
    GENERIC= 1000,
    DEVICE_MANAGER= 10000,
    BRIDGE= 11000,
    PLATFORM_MANAGER= 15000,
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
    HOOK = 70000,
    HOOK_MANAGER = 71000,
    KP_MANAGER = 72000,
    HOOK_BUILDER = 73000,
    EXTENSION = 80000,
    INSPECTOR = 81000,
    INSPECTOR_FACT = 82000,
    SECURITY = 90000,
    SECURITY_RUNTIME = 91000,
    SETTINGS = 95000,
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

    constructor( pCmp:string, pMsg:string, pCode:number = null, pExtra:any = null) {
        super(pMsg);
        this.cmp = pCmp;
        this.code = pCode;
        this.extra = pExtra;
    }

    getCode():number {
        return this.code;
    }


    getExtra():any {
        return this.extra;
    }

    toString():string {
        return `[${this.cmp}] [#${this.code!=null ? this.code : "<null>"} ${this.message}`;
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