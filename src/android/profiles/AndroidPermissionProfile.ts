/**
 *
 * @class
 * @author Georges-B MICHEL
 */
import {GenericPermissionProfile} from "../../device/profile/GenericPermissionProfile.js";


export class AndroidPermissionProfile extends GenericPermissionProfile
{
    uid = "Android_Permission";

    requireRoot = true;

    constructor(){
        super();
    }

    is(pData:any){
        const patterns = [];

        for(let i=0; i<patterns.length; i++){
            if(patterns[i].test(pData)){
                return true;
            }
        }

        return false;
    }


    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson:any):AndroidPermissionProfile{
        return super.fromJsonObject(pJson);
    }

}