/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {Resource} from "../common/Resource.js";
import {CoreDebug} from "../core/CoreDebug.js";
import AiHelper from "../core/ai/AiHelper.js";
import {SectionType} from "../ModelExecutableSection.js";

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
    static MCP_Info = AiHelper.getInstance().registerExtraComponent({
        name: "release of a Reversense product",
        fqcn: "ProductRelease",
        descr: "Represents a specific release of a Reversense product",
        properties:[
            { name:"version", schema:{ type:"string" }, descr:"Version of the release in semver format. Example: 1.0.0-alpha.1"},
            { name:"description", schema:{ type:"string"}, descr:"description of the product release"},
            { name:"changelog", schema:{ type:"string"}, descr:"Changes"},
            { name:"resource", schema:AiHelper.getInstance().getJsonSchemaOf("Resource"), descr:"Linekd resources"},
            { name:"release", schema:{ type:"object"}, descr:"Anay data about the release"},
        ]
    })
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