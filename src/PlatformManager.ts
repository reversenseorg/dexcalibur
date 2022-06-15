import * as _path_ from "path";
import * as _fs_ from "fs";
import got from "got";
import * as stream from "stream";
import {promisify} from "util";


import Utils from "./Utils";
import Platform from "./Platform";
import DexcaliburRegistry from "./DexcaliburRegistry";
import {ValidationCapable, ValidationRule} from "./Validator";
import DexcaliburEngine from "./DexcaliburEngine";
import DexHelper from "./DexHelper";


import * as Log from './Logger';
import {PlatformManagerException} from "./errors/PlatformManagerException";
import {Device} from "./Device";
import AndroidApplication from "./android/AndroidApplication";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

let pipeline:any = promisify(stream.pipeline);
let gInstance:PlatformManager = null;


interface IPlatformMap {
    [key: string]: Platform;
}

export enum PLATFORM_STUBS {
    DEVICE = "dev",
    APP_MIN = "min",
    APP_TARGET = "app",
}

/**
 * Class managing platform available into Dexcalibur
 * 
 * A platform contains files/binary helping analyzer to identify 
 * call from the application to platform specific function
 * 
 * @class
 */
export default class PlatformManager extends ValidationCapable
{

    engine:DexcaliburEngine;
    remote:any;
    local: IPlatformMap;

    constructor( pEngine:any){
        super({
            'uid': [
                ValidationRule.newRegexpAssert(new RegExp('^.*$')) // mock
            ],
            'uid.target': [
                ValidationRule.newRegexpAssert(new RegExp('^.*$')) // mock
            ]
        });

        this.engine = pEngine;
        this.remote = {};
        this.local = {};
    }


    /**
     * To get the platform manager
     *
     * @param pEngine
     */
    static getInstance( pEngine:any = null):PlatformManager{
        if(gInstance == null){
            gInstance = new PlatformManager(pEngine);
        }

        return gInstance;
    }





    /**
     * 
     * @param {*} pRegistry 
     * @param {*} pName 
     */
    async install(pPlatform:Platform, pCallback:any=null):Promise<boolean>{

        let path:string = _path_.join( this.engine.workspace.getTempFolderLocation(), pPlatform.getUID()+".dex");
        let success;
        await pipeline(
            got.stream(pPlatform.getRemotePath()),
            _fs_.createWriteStream(path)
        );

        if(_fs_.existsSync(path) == true){
            success = await DexHelper.disassemble(path, pPlatform.getLocalPath());
            //Utils.execSync(`java -jar ${_path_.join(__dirname,'..','bin','baksmali.jar')} d ${path} -o ${pPlatform.getLocalPath()}`, "ascii");
            //_fs_.unlinkSync(path);
            if(success){
                pPlatform.checkInstall();

                if(pCallback != null){
                    pCallback();
                }
            }else{
                throw PlatformManagerException.PLATFORM_NOT_ANALYZED();
            }


            return true;
        }else{
            throw PlatformManagerException.PLATFORM_NOT_INSTALLED();
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
        if(Object.keys(this.remote).length==0){
            this.enumerate();
        }
        return this.remote;
    }


    enumerate(){
        Logger.raw("do enumerateLocal");
        this.local = this.enumerateLocal();
        Logger.raw("OK");
        Logger.raw(JSON.stringify(this.local));
        const registry:DexcaliburRegistry = this.engine.getSettings().getServerSettings().getRegistry();

        Logger.raw(JSON.stringify(this.engine.getSettings().getServerSettings().getRegistry()) );
        Logger.raw("PASS_OK");
        (async ()=>{
            Logger.raw("do enumerateRemote");
            this.remote = await this.enumerateRemote(registry);

            for(const i in this.local){
                if(this.remote[i] instanceof Platform){
                    this.local[i] = this.remote[i];
                }
            }
        })();
    }

    /**
     * To check if the UID point to a stub platform
     *
     * @param pUID {string} Platform internal UID
     * @return {boolean} Return TRUE if the platform is a stub platform , else FALSE
     * @method
     */
    isStub( pUID:string):boolean{
        return (this.local[pUID] != null && this.local[pUID].isStub());
    }

    enumerateLocal():any{
        const res:IPlatformMap = {};
        let p:Platform = null;

        // push stub platforms
        res[PLATFORM_STUBS.DEVICE] = new Platform({ uid:PLATFORM_STUBS.DEVICE, stub:true });
        res[PLATFORM_STUBS.APP_MIN] = new Platform({ uid:PLATFORM_STUBS.APP_MIN, stub:true });
        res[PLATFORM_STUBS.APP_TARGET] = new Platform({ uid:PLATFORM_STUBS.APP_TARGET, stub:true });

        // retrieve path of folder where target platform files are saved
        const ws:string = this.engine.workspace.getPlatformFolderLocation();
        const files:string[] = _fs_.readdirSync(ws);

        Logger.raw(`platform folder = ${ws}`);
        Logger.raw(`platform folder content = ${files.join("\n\t")}`);

        for(let i=0; i<files.length; i++){

            Logger.raw(`platform name = ${files[i]}`);
            p = Platform.fromLocalName(files[i]);
            Logger.raw(`platform obj = ${p}`);
            if(p == null) continue;

            p.setLocalPath( _path_.join(ws, files[i]) );

            res[p.getUID()] = p;
        }

        Logger.raw(JSON.stringify(Object.keys(res)));

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
        const res:IPlatformMap={};

        if(pRegistry == null){
            pRegistry = this.engine.getSettings().getServerSettings().getRegistry();
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

            Logger.info("Platforms : "+JSON.stringify(p.toJsonObject()));

            res[p.getUID()] = p;
        }
        
        return res;
    }

    /**
     * To get a stub instance of Platform depending of device/app
     *
     * @param pDevice {Device} Target device where the application will be executed
     * @param pApp {AndroidApplication} Targeted application
     * @param pUID {string} Platform name
     * @return {Platform} A concrete platform instance corresponding to a stubed platform
     * @method
     */
    getStubPlatform(pDevice:Device, pApp:AndroidApplication, pUID:string):Platform {

        if(pDevice.isAndroid()){
            switch (pUID) {
                case PLATFORM_STUBS.DEVICE:
                    return pDevice.getPlatform();
                    break;
                case PLATFORM_STUBS.APP_MIN:
                    return this.getFromAndroidApiVersion(pApp.getMinApiVersion());
                    break;
                case PLATFORM_STUBS.APP_TARGET:
                    return this.getFromAndroidApiVersion(pApp.getTargetApiVersion());
                    break;
                default:
                    throw PlatformManagerException.STUB_PLATFORM_NOT_SUPPORTED();
            }
        }else{
            throw PlatformManagerException.STUB_PLATFORMS_NOT_AVAILABLE();
        }
    }

    getPlatform(pName:string):Platform{

        Logger.raw(pName);
        Logger.raw(JSON.stringify(Object.keys(this.local)));
        Logger.raw(JSON.stringify(this.local[pName]));

        //if(this.local[pName] instanceof Platform){
        if(this.local[pName] != null){
            return this.local[pName];
        }else if( this.remote[pName] instanceof Platform){
            return this.remote[pName];
        }

        // throw exception
        return null;
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
