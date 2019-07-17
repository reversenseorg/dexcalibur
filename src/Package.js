class Package {
    constructor(config=null){
        this.packageIdentifier = null;
        this.packagePath =  null;
        this.patched = false;
        if(config !== null)
            for(let i in config) this[i] = config[i]; 
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
