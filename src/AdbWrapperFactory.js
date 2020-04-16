const _fs_ = require("fs");
const AdbWrapper = require("./AdbWrapper");

var gInstance = null;

class AdbWrapperFactory
{
    constructor( pAdbPath){
        this.path = pAdbPath;
    }

    static getInstance( pAdbPath){
        if(gInstance == null){
            if(_fs_.existsSync(pAdbPath)){
                gInstance = new AdbWrapperFactory( pAdbPath);
            }else{
                throw new Error("[ADB WRAPPER] ADB binary '"+pAdbPath+"' is not found.");
            }
        }

        return gInstance;
    }

    static newGenericWrapper(){
        return new AdbWrapper( gInstance.path);
    }

    static newSpecificWrapper( pDevice){
        return new AdbWrapper( gInstance.path, pDevice.getDeviceUID() );
    }

}

module.exports = AdbWrapperFactory;