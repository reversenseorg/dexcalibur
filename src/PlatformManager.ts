import _path_ = require("path");
import _fs_ = require("fs");
import got from "got";
import * as stream from "stream";
import {promisify} from "util";


import Utils from "./Utils";
import Platform from "./Platform";
import DexcaliburRegistry from "./DexcaliburRegistry";



let pipeline:any = promisify(stream.pipeline);
let gInstance:PlatformManager = null;


interface IPlatformMap {
    [key: string]: Platform;
}

/**
 * Class managing platform available into Dexcalibur
 * 
 * A platform contains files/binary helping analyzer to identify 
 * call from the application to platform specific function
 * 
 * @class
 */
export default class PlatformManager
{
    engine:any;
    remote:any;
    local:any;

    constructor( pEngine:any){
        this.engine = pEngine;
        this.remote = {};
        this.local = {};
    }


    static getInstance( pEngine:any = null):PlatformManager{
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
    getFromAndroidApiVersion( pApiVersion:string):Platform{
        return this.getPlatform('sdk_androidapi_'+pApiVersion+'_google');
    }

    /**
     * 
     * @param {*} pRegistry 
     * @param {*} pName 
     */
    async install(pPlatform:Platform, pCallback:any=null):Promise<boolean>{

        let path:string = _path_.join( this.engine.workspace.getTempFolderLocation(), pPlatform.getUID()+".dex");

        await pipeline(
            got.stream(pPlatform.getRemotePath()),
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

    isInstalled( pName:string){
        return (this.local[pName] instanceof Platform)
    }

    getLocal():any{
        return this.local;
    }

    getRemote():any{
        return this.remote;
    }


    enumerate(){

        this.local = this.enumerateLocal();

        let registry:DexcaliburRegistry = this.engine.getRegistry();

        (async ()=>{
            this.remote = await this.enumerateRemote(registry);

            for(let i in this.local){
                if(this.remote[i] instanceof Platform){
                    this.local[i] = this.remote[i];
                }
            }
        })();
    }

    enumerateLocal():any{
        let res:IPlatformMap = {};
        let p:Platform = null;
        let ws:string = this.engine.workspace.getPlatformFolderLocation();
        let files:string[] = _fs_.readdirSync(ws);

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
    async enumerateRemote( pRegistry:DexcaliburRegistry):Promise<any>{

        let platforms:any = {};
        let p:Platform = null;
        let res:any={};

        if(pRegistry == null){
            pRegistry = this.engine.getRegistry();
        }

        // retrieve remote platform
        platforms = await pRegistry.enumeratePlatforms();

        // if not connected
        if(platforms == null){
            return res;
        }

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

    getPlatform(pName:string):Platform{
        if(this.local[pName] instanceof Platform){
            return this.local[pName];
        }else if( this.remote[pName] instanceof Platform){
            return this.remote[pName];
        }

        // throw exception
        return null;
    }

    getRemotePlatform( pName:string):Platform{
        return this.remote[pName];
    }

    getLocalPlatform( pName:string):Platform{
        if(this.local[pName] instanceof Platform){
            return this.local[pName];
        }

        // throw exception
        return null;
    }
}
