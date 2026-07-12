/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import * as _path_ from "path";
import * as _fs_ from "fs";
import * as stream from "stream";
import {promisify} from "util";


import * as Got from "got";
import Platform from "./Platform.js";
import DexcaliburRegistry from "../DexcaliburRegistry.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import DexHelper from "../DexHelper.js";


import * as Log from '../Logger.js';
import {PlatformManagerException} from "../errors/PlatformManagerException.js";
import {Device} from "../Device.js";
import AndroidApplication from "../android/AndroidApplication.js";
import {Nullable, OperatingSystem} from "@dexcalibur/dxc-core-api";
import {Architecture} from "../Architecture.js";
import {ValidationCapable, ValidationRule} from "@dexcalibur/dexcalibur-orm";

const got = Got.default;


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

let pipeline:any = promisify(stream.pipeline);
let gInstance:PlatformManager = null;



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
    local: Record<string, Platform>;

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

        if(pPlatform==null){
            throw PlatformManagerException.INVALID_PLATFORM();
        }

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

    getRemote():{ installed:Record<string, Platform>, remote:Record<string, Platform> }{
        if(Object.keys(this.remote).length==0){
            this.enumerate();
        }
        return {
            installed: this.local,
            remote: this.remote
        };
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
            try{
                this.remote = await this.enumerateRemote(registry);

                for(const i in this.local){
                    if(this.remote[i]!=null && this.remote[i] instanceof Platform){
                        this.local[i] = this.remote[i];
                    }
                }
            }catch (e){

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
    enumerateLocal():Record<string, Platform>{
        const res:Record<string, Platform> = {};
        let p:Platform = null;

        // push stub platforms
        res[PLATFORM_STUBS.DEVICE] = new Platform({ uid:PLATFORM_STUBS.DEVICE, stub:true });
        res[PLATFORM_STUBS.APP_MIN] = new Platform({ uid:PLATFORM_STUBS.APP_MIN, stub:true });
        res[PLATFORM_STUBS.APP_TARGET] = new Platform({ uid:PLATFORM_STUBS.APP_TARGET, stub:true });

        // push preset platforms
        (this._enumerateIosPresets()).map( vP => {
            res[vP.getUID()] = vP;
        });


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
    async enumerateRemote( pRegistry:DexcaliburRegistry):Promise<Record<string, Platform>>{

        let platforms:Platform[] = [];
        let p:Platform = null;
        const res:Record<string, Platform>={};

        if(pRegistry == null){
            pRegistry = this.engine.getSettings().getServerSettings().getRegistry();
        }
        if(pRegistry == null){
            return res;
        }

        // retrieve remote platform
        platforms = await pRegistry.enumeratePlatforms().catch(e => {
            Logger.error("Platforms from remote registry cannot be pulled");
            console.log(e);
            platforms = [];
        });

        // if not connected
        if(platforms!=null && platforms.length>0){

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
        }else{
            Logger.info("[PLATFORM MANAGER][REGISTRY] Disconnected");
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
     * To get platform instance by API version number
     *
     * @param {string} pApiVersion Android API number as string
     * @return {Platform}  Platform instance
     * @method
     */
    getFromIosVersion( pApiVersion:string):Platform{
        return null; //this.getPlatform('ios_'+pApiVersion);
    }

    findByOsVersion( pOs:OperatingSystem, pVersion:string):Nullable<Platform>{

        switch(pOs){
            case OperatingSystem.ANDROID:
                return this.getPlatform('sdk_androidapi_'+pVersion+'_google');
            case OperatingSystem.IOS:
                return Object.values(this.local).find(x => (x.os===pOs) && (x.version===pVersion+"") );
            default:
                return null;
        }
    }


    /**
     * To get remotely available (not installed) platform  from its name
     *
     * @param {string} pApiVersion Platform name
     * @return {Platform}  Platform instance
     * @method
     */
    getRemotePlatform( pName:string):Platform{
        if(this.remote[pName]==null){
            throw PlatformManagerException.PLATFORM_NOT_FOUND(pName);
        }
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



    private _enumerateIosPresets():Platform[] {
        return [
            new Platform({
                source: "man" ,name: "iosapi", version: "12",
                vendor: "apple", format: null, os: OperatingSystem.IOS,
                arch: Architecture.AARCH64, installed: true, stub: false
            }),
            new Platform({
                source: "man" ,name: "iosapi", version: "13",
                vendor: "apple", format: null, os: OperatingSystem.IOS,
                arch: Architecture.AARCH64, installed: true, stub: false
            }),
            new Platform({
                source: "man" ,name: "iosapi", version: "14",
                vendor: "apple", format: null, os: OperatingSystem.IOS,
                arch: Architecture.AARCH64, installed: true, stub: false
            }),
            new Platform({
                source: "man" ,name: "iosapi", version: "15",
                vendor: "apple", format: null, os: OperatingSystem.IOS,
                arch: Architecture.AARCH64, installed: true, stub: false
            }),
            new Platform({
                source: "man" ,name: "iosapi", version: "16",
                vendor: "apple", format: null, os: OperatingSystem.IOS,
                arch: Architecture.AARCH64, installed: true, stub: false
            }),
        ];

    }
}
