export enum ErrorCode {
    GENERIC= 1000,
    DEVICE_MANAGER= 10000,
    BRIDGE= 11000,
    ANALYZER= 60000,
    ANALYZER_NATIV= 62000,
    AUTH=30000,
    PARSER = 40000,
    PROJECT = 50000,
    SMALI_PARSER = 41000,
    SECURITY = 90000,
    SECURITY_RUNTIME = 91000,
    SETTINGS = 95000,
    REMOTE = 20000,
    REMOTE_DEXCALIBUR= 21000
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
    toObject(pIncludeExtra:boolean=false):any {
        return {
            cmp: this.cmp,
            code: this.code,
            msg: this.message,
            extra: pIncludeExtra ? this.extra : null
        }
    }
}