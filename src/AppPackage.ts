

/**
 * This class is an abstraction of application package
 *
 * 
 * @class
 */
export default class AppPackage {

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
        return json;
    }

}