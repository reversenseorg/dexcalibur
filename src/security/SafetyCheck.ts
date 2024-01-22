import {Nullable} from "../core/IStringIndex.js";
import {MonitoredError} from "../errors/MonitoredError.js";
import {RuntimeSecurityException} from "../errors/RuntimeSecurityException.js";
import type = Mocha.utils.type;


/**
 * Helper class to perform assert on the fly
 *
 * @class
 */
export class SafetyCheck {

    static assertNotNull(pObj:any, pErr:Nullable<(...pArgs:any[])=>MonitoredError> = null){
        if(pObj==null){
            throw (pErr!=null ? pErr.apply(null) : RuntimeSecurityException.SAFETY_CHECK_FAILED("assertNotNull"));
        }
    }

    static assertIsString(pObj:any, pErr:Nullable<(...pArgs:any[])=>MonitoredError> = null){
        if((typeof pObj)!=='string'){
            throw (pErr!=null ? pErr.apply(null) : RuntimeSecurityException.SAFETY_CHECK_FAILED("assertIsString"));
        }
    }
}