import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {DexcaliburProjectUUID} from "../../DexcaliburProject.js";
import {SecurityZone} from "../../security/SecurityZone.js";

/**
 *
 */
export class SimplifierException extends MonitoredError {


    _zone = SecurityZone.PRIVATE;

    static ALL = {};



    static DDVM_CRASH = (pMethod:string, pProject:DexcaliburProjectUUID, pContext:any)=>{
        return new SimplifierException(
            "DDVM crashed",
            ErrorCode.AUDIT_SCANNER + 1,{
                methode: pMethod,
                project: pProject,
                ctx: pContext
            });
    };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('SIMPLIFIER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}