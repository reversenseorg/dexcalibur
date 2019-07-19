const fs = require('fs');
var Path = require("path");

class ApkPackage {
    constructor(config=null){
        this.config = config;
       
        this.packageIdentifier = null;
        this.packagePath =  null;
        this.patched = false;
        this.workspaceExists = false; //
        this.currentWd = false;
        if(config !== null)
            for(let i in config)
            {
                this[i] = config[i];
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
