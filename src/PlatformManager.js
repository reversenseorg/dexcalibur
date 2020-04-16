const _path_ = require("path");
const _fs_ = require("fs");

var gInstance = null;


/**
 * Class managing platform available into Dexcalibur
 * 
 * A platform contains files/binary helping analyzer to identify 
 * call from the application to platform specific function
 * 
 * @class
 */
class PlatformManager
{
    constructor( pEngine){
        this.engine = pEngine;
    }

    getInstance( pEngine){
        if(gInstance == null){
            gInstance = new PlatformManager(pEngine);
        }

        return gInstance;
    }


    remoteInstall( pURI){

    }

    localInstall( pPath){

    }

    enumerateLocal(){
        let ws = this.engine.workspace.getPlatformFolderLocation();

        
        
    }

    enumerateRemote(){

    }

    getPlatform( pName){

    }
}

module.exports = PlatformManager;