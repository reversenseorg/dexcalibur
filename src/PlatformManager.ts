import * as _path_ from "path";
import * as _fs_ from "fs";
import * as stream from "stream";
import {promisify} from "util";


import * as Got from "got";
const got = Got.default;


import Utils from "./Utils.js";
import Platform from "./Platform.js";
import DexcaliburRegistry from "./DexcaliburRegistry.js";
import {ValidationCapable, ValidationRule} from "./Validator.js";
import DexcaliburEngine from "./DexcaliburEngine.js";
import DexHelper from "./DexHelper.js";


import * as Log from './Logger.js';
import {PlatformManagerException} from "./errors/PlatformManagerException.js";
import {Device} from "./Device.js";
import AndroidApplication from "./android/AndroidApplication.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

let pipeline:any = promisify(stream.pipeline);
let gInstance:PlatformManager = null;


export interface IPlatformMap {
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

    /**
     * Engine instance
     * @type {DexcaliburEngine}
     * @field
     */
    engine:DexcaliburEngine;

    /**
     * List of platforms available remotely
     * @type {any}
     * @field
     */
    remote:any;

    /**
     List of platforms available locally (installed)
     @type {IPlatformMap}
     @field
     *
     */
    local: IPlatformMap;

    /**
     *
     * @param {DexcaliburEngine} pEngine
     * @constructor
     */
    constructor( pEngine:DexcaliburEngine){
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
     * To install a remote platform into local workspace
     *
     * @param {Platform} pPlatform Platform to install
     * @param {()=>void} pOnSuccess Optional. Default NULL. A callback function called on install success
     * @return {boolean} TRUE if success, else FALSE
     * @method
     */
    async install(pPlatform:Platform, pOnSuccess:(()=>void)=null):Promise<boolean>{

        let path:string = _path_.join( this.engine.workspace.getTempFolderLocation(), pPlatform.getUID()+".dex");
        let success;

        Logger.info("[Platform Manager] Downloading platform : "+pPlatform.getRemotePath());
        const res = await pipeline(
            got.stream(pPlatform.getRemotePath()),
            _fs_.createWriteStream(path)
        );


        if(_fs_.existsSync(path) == true){

            Logger.info("[Platform Manager] Platform downloaded ! ");
            success = await DexHelper.disassemble(path, pPlatform.getLocalPath());
            //Utils.execSync(`java -jar ${_path_.join(Util.__dirname(import.meta.url),'..','bin','baksmali.jar')} d ${path} -o ${pPlatform.getLocalPath()}`, "ascii");
            //_fs_.unlinkSync(path);
            Logger.info("[Platform Manager] Platform analyzed  ! ");
            if(success){
                pPlatform.checkInstall();

                Logger.info("[Platform Manager] Platform installed succesfully ! ");
                if(pOnSuccess != null){
                    (pOnSuccess)();
                }
            }else{
                Logger.info("[Platform Manager] Platform not analyzed ! ");
                throw PlatformManagerException.PLATFORM_NOT_ANALYZED();
            }


            return true;
        }else{
            Logger.info("[Platform Manager] Platform cannot be installed ! ");
            throw PlatformManagerException.PLATFORM_NOT_INSTALLED();
            return false;
        }
    }

    /**
     * To check if the application is installed
     *
     * @param {string} pName Platform UID
     * @method
     */
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


    /**
     * To enumerate local and remote platforms, and flag installed platforms
     *
     * @method
     */
    enumerate():void{
        this.local = this.enumerateLocal();
        const registry:DexcaliburRegistry = this.engine.getSettings().getServerSettings().getRegistry();

        (async ()=>{
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

    /**
     * To enumerate local platforms, and preference
     *
     * Additionnally to local platforms, enumeration contains preferred platforms :
     *  - Platform for Target device
     *  - Platform for min API version supported
     *  - Platform for target API version
     *
     * @return {IPlatformMap} Platform enumeration
     * @method
     */
    enumerateLocal():IPlatformMap{
        const res:IPlatformMap = {};
        let p:Platform = null;

        // push stub platforms
        res[PLATFORM_STUBS.DEVICE] = new Platform({ uid:PLATFORM_STUBS.DEVICE, stub:true });
        res[PLATFORM_STUBS.APP_MIN] = new Platform({ uid:PLATFORM_STUBS.APP_MIN, stub:true });
        res[PLATFORM_STUBS.APP_TARGET] = new Platform({ uid:PLATFORM_STUBS.APP_TARGET, stub:true });

        // retrieve path of folder where target platform files are saved
        const ws:string = this.engine.workspace.getPlatformFolderLocation();
        const files:string[] = _fs_.readdirSync(ws);


        for(let i=0; i<files.length; i++){

            p = Platform.fromLocalName(files[i]);
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
     * @param {DexcaliburRegistry} pRegistry The remote registry
     * @returns {Platform[]} An array a platform 
     * @method
     */
    async enumerateRemote( pRegistry:DexcaliburRegistry):Promise<IPlatformMap>{

        let platforms:any = {};
        let p:Platform = null;
        const res:IPlatformMap={};

        if(pRegistry == null){
            pRegistry = this.engine.getSettings().getServerSettings().getRegistry();
        }
        if(pRegistry == null){
            return res;
        }

        // retrieve remote platform
        platforms = await pRegistry.enumeratePlatforms();

        // if not connected
        if(platforms == null){
            return res;
        }

        Logger.info("Platforms in remote registry");
        for(let i=0; i<platforms.length; i++){
            p = Platform.fromRemoteName(platforms[i].name);
            if(p == null) continue;

            p.setRemotePath(platforms[i].download_url);
            p.setLocalPath( _path_.join(this.engine.workspace.getPlatformFolderLocation(), p.getUID()));
            p.setSize(platforms[i].size);
            p.setHash(platforms[i].sha);

            //Logger.info("Platforms : "+JSON.stringify(p.toJsonObject()));
            Logger.raw(" - "+p.getUID()+" ("+p.size+") "+p.hash);

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

    /**
     * To get a platform instance by its name
     *
     * @param {string} pName Platform name (UID)
     * @return {Platform} The platform instance
     * @method
     */
    getPlatform(pName:string):Platform{

        if(this.local[pName] != null){
            return this.local[pName];
        }else if( this.remote[pName] instanceof Platform){
            return this.remote[pName];
        }

        // throw exception
        return null;
    }
    
     /**
     * To get platform instance by API version number
      *
     * @param {string} pApiVersion Android API number as string
     * @return {Platform}  Platform instance
     * @method
     */
    getFromAndroidApiVersion( pApiVersion:string):Platform{
        return this.getPlatform('sdk_androidapi_'+pApiVersion+'_google');
    }

    /**
     * To get remotely available (not installed) platform  from its name
     *
     * @param {string} pApiVersion Platform name
     * @return {Platform}  Platform instance
     * @method
     */
    getRemotePlatform( pName:string):Platform{
        return this.remote[pName];
    }

    /**
     * To get local available (installed) platform  from its name
     *
     * @param {string} pApiVersion Platform name
     * @return {Platform}  Platform instance
     * @method
     */
    getLocalPlatform( pName:string):Platform{
        if(this.local[pName] instanceof Platform){
            return this.local[pName];
        }

        // throw exception
        return null;
    }
}
