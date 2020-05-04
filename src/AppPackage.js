const fs = require('fs');
var Path = require("path");

/**
 * This class represents an application package 
 */
class ApkPackage {

    /**
     * 
     * @param {*} pConfig 
     */
    constructor(pConfig=null){
       
        this.packageIdentifier = null;
        this.packagePath =  null;
        this.patched = false;
        this.workspaceExists = false; //
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
     * @function 
     */
    toJsonObject(){
        let json = new Object();
        for(let i in this){
            json[i] = this[i];
        }
        return json;
    }
}

module.exports = ApkPackage;
