import {Profile} from "./Profile.js";

/**
 *
 * @class
 * @author Georges-B MICHEL
 */
export class GenericPermissionProfile extends Profile
{

    uid = "Generic_Permission";
    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson:any):GenericPermissionProfile{
        return super.fromJsonObject(pJson);
    }
}