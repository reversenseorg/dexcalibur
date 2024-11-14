import {RuntimeSecurityException} from "../errors/RuntimeSecurityException.js";
import {IZoned, SecurityZone} from "./SecurityZone.js";

export class SecurityCheck {

    static allowedInPublicZone( pZonedObj:IZoned){
        if(pZonedObj.zone!==SecurityZone.PUBLIC){
            throw RuntimeSecurityException.OBJ_FORBIDDEN_IN_PUBLIC_ZONE();
        }
    }
}