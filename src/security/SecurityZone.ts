import {RuntimeSecurityException} from "../errors/RuntimeSecurityException.js";

/**
 * Security Zone helps to prevent sensitive data to be leak
 * to web client or into log files by serialize functions
 */
export enum SecurityZone {
    PUBLIC= 'pub',
    PRIVATE='priv',
    LOG='log'
}


export interface IZoned{
    zone:SecurityZone;
}

export class SecurityCheck {

    static allowedInPublicZone( pZonedObj:IZoned){
        if(pZonedObj.zone!==SecurityZone.PUBLIC){
            throw RuntimeSecurityException.OBJ_FORBIDDEN_IN_PUBLIC_ZONE();
        }
    }
}