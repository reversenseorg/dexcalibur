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

import {CoreDebug} from "./core/CoreDebug.js";
import AiHelper from "./core/ai/AiHelper.js";
import {IJSONSchema} from "@reversense/dexcalibur-orm";


export interface IJsonSchemaReady {

}


export interface IJsonSchemaR {
    new (...args: any[]): IJsonSchemaReady;
    getJsonSchema():IJSONSchema
}
/**
 * This class is an abstraction of application package
 *
 * 
 * @class
 */
export default class AppPackage implements IJsonSchemaReady {

    static MCP_Info = AiHelper.getInstance().registerExtraComponent({
        name: "application package",
        fqcn: "AppPackage",
        descr: "Represents an application installed over a device",
        properties:[
            { name:"packageIdentifier", schema:{ type:"string"}, descr:"Package identifier"},
            { name:"packagePath", schema:{ type:"string"}, descr:"Package path on device"},
            { name:"patched", schema:{ type:"boolean"}, descr:"Flag. TRUE if patched, else FALSE"},
            { name:"workspaceExists", schema:{ type:"boolean"}, descr:"Flag. TRUE if workspace exists, else FALSE"},
            { name:"currentWd", schema:{ type:"boolean"}, descr:"Currently in workspace"},
            { name:"removed", schema:{ type:"boolean"}, descr:"Removed"},
        ]
    })

    static getJsonSchema():IJSONSchema{
        return { type:"string"};
    }

    packageIdentifier:string = null;
    packagePath:string =  null;
    patched:boolean = false;
    workspaceExists:boolean = false;
    currentWd:boolean = false;
    removed:boolean = false;


    /**
     * 
     * @param {*} pConfig 
     * @constructor
     */
    constructor(pConfig:any=null){

        this.patched = false;
        this.workspaceExists = false;
        this.currentWd = false;

        if(pConfig !== null)
            for(let i in pConfig)
            {
                this[i] = pConfig[i];
            }
    }


    /**
     * To serialize the Device to JSON string
     * @returns {String} JSON-serialized object
     * @method 
     */
    toJsonObject():any{
        let json:any = {};
        for(let i in this){
            json[i] = this[i];
        }
        CoreDebug.checkJsonSerialize(json, "AppPackage");
        return json;
    }

}