const _path_ = require("path");
const _fs_ = require("fs");
const _url_ = require("url");
const _got_ = require("got");
const _stream_ = require("stream");
const {promisify} = require("util");

const pipeline = promisify(_stream_.pipeline);

const Utils = require("./Utils");
const Platform = require("./Platform");



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
        this.remote = {};
        this.local = {};
    }


    static getInstance( pEngine){
        if(gInstance == null){
            gInstance = new PlatformManager(pEngine);
        }

        return gInstance;
    }

    /**
     * 
     * @param {*} pApiVersion
     * @method
     *  
     */
    getFromAndroidApiVersion( pApiVersion){
        return this.getPlatform('sdk_androidapi_'+pApiVersion+'_google');
    }

    /**
     * 
     * @param {*} pRegistry 
     * @param {*} pName 
     */
    async install(pPlatform, pCallback=null){
        
        let reg = null, data = null;
        let path = _path_.join( this.engine.workspace.getTempFolderLocation(), pPlatform.getUID()+".dex");

        await pipeline(
            _got_.stream(pPlatform.getRemotePath()),
            _fs_.createWriteStream(path)
        );

        if(_fs_.existsSync(path) == true){
            Utils.execSync(`java -jar ${_path_.join(__dirname,'..','bin','baksmali.jar')} d ${path} -o ${pPlatform.getLocalPath()}`);
            _fs_.unlinkSync(path);
            pPlatform.checkInstall();

            if(pCallback != null){
                pCallback();
            }

            return true;
        }else{
            return false;
        }
    }

    isInstalled( pName){
        return (this.local[pName] instanceof Platform)
    }

    getLocal(){
        return this.local;
    }

    getRemote(){
        return this.remote;
    }


    enumerate(){

        this.local = this.enumerateLocal();
        
        (async ()=>{
            this.remote = await this.enumerateRemote();

            for(let i in this.local){
                if(this.remote[i] instanceof Platform){
                    this.local[i] = this.remote[i];
                }
            }
        })();
    }

    enumerateLocal(){
        let res = [], p=null;
        let ws = this.engine.workspace.getPlatformFolderLocation();
        let files = _fs_.readdirSync(ws);

        for(let i=0; i<files.length; i++){
            p = Platform.fromLocalName(files[i]);
            if(p == null) continue;

            p.setLocalPath( _path_.join(ws, files[i]) );

            res[p.getUID()] = p;
        }

        return res;
    }
    
    /**
     * To enumerate platforms of a remote registry
     *  
     * @param {require('./DexcaliburRegistry')} pRegistry The remote registry
     * @returns {Platform[]} An array a platform 
     * @method
     */
    async enumerateRemote( pRegistry){

        let platforms  = null, p=null, res={};

        if(pRegistry == null){
            pRegistry = this.engine.getRegistry();
        }

        // retrieve remote platform
        platforms = await pRegistry.enumeratePlatforms();

        for(let i=0; i<platforms.length; i++){
            p = Platform.fromRemoteName(platforms[i].name);
            if(p == null) continue;

            p.setRemotePath(platforms[i].download_url);
            p.setLocalPath( _path_.join(this.engine.workspace.getPlatformFolderLocation(), p.getUID()));
            p.setSize(platforms[i].size);
            p.setHash(platforms[i].sha);

            res[p.getUID()] = p;
        }
        
        return res;
    }

    getPlatform(pName){
        if(this.local[pName] instanceof Platform){
            return this.local[pName];
        }else if( this.remote[pName] instanceof Platform){
            return this.remote[pName];
        }

        // throw exception
        return null;
    }
    getRemotePlatform( pName){
        return this.remote[pName];
    }

    getLocalPlatform( pName){
        if(this.local[pName] instanceof Platform){
            return this.local[pName];
        }

        // throw exception
        return null;
    }
}

module.exports = PlatformManager;