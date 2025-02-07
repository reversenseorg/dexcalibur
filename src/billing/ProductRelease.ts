import {Resource} from "../common/Resource.js";
import {CoreDebug} from "../core/CoreDebug.js";

export interface ProductReleaseOptions extends Record<string,any>
{
    version?:string;
    description?:string;
    changelog?:string;
    resource?:Resource;
    release?:any;
}

/**
 * Represents a product release.
 *
 * @class
 */
export class ProductRelease
{
    /**
     * Version of the realeasein semver format
     * @type {string}
     */
    version:string;

    description:string;
    changelog?:string;
    resource?:Resource;
    release?:any;

    constructor(pOptions?:ProductReleaseOptions) {
        if(pOptions!=null){
            for(let i in pOptions){
                this[i] = pOptions[i];
            }
        }
    }

    toJsonObject():any{
        const o = {
            version:this.version,
            description:this.description,
            changelog:this.changelog,
            resource:null,
            release:null
        };

        if(this.release!= null){
            if(this.release.hasOwnProperty("toJsonObject")){
                o.release = this.release.toJsonObject();
            }else{
                o.release  = this.release;
            }
        }

        if(this.resource!= null){
            if(this.resource.hasOwnProperty("toJsonObject")){
                o.resource = this.resource.toJsonObject();
            }else{
                o.resource  = this.resource;
            }
        }

        CoreDebug.checkJsonSerialize(o, "ProductRelease");
        return o;
    }


    static fromJsonObject(pObj:any):ProductRelease {
        const p = new ProductRelease(pObj);
        if(pObj.resource!=null){
           p.resource = new Resource(pObj.resource);
        }
        return p;
    }

}