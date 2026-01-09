import {CoreDebug} from "./core/CoreDebug.js";
import AiHelper from "./core/ai/AiHelper.js";
import {IJSONSchema} from "@dexcalibur/dexcalibur-orm";


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