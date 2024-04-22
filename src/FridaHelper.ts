import * as _ps_ from "child_process";
import * as _fs_ from "fs";
import * as _path_ from "path";
import * as _stream_ from 'stream';
import * as _co_ from 'co';
import * as Got from "got";
const got = Got.default;
import * as _xz_ from "xz";
import {promisify} from 'util';
import * as Frida from 'frida';
import DexcaliburWorkspace from "./DexcaliburWorkspace.js";


import * as Log from './Logger.js';
import {Device, FridaServerOptions, FridaServerTransport} from "./Device.js";
import Util from "./Utils.js";
import {IBridge} from "./Bridge.js";
import {External} from "./external/External.js";
import {Process} from "frida/dist";
import * as _os_ from "os";
import {FridaHelperException} from "./errors/FridaHelperException.js";
import {Architecture} from "./Architecture.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const pipeline = promisify(_stream_.pipeline);


const HOST_FRIDA_BIN_NAME = 'frida';
const REMOTE_FRIDA_RELEASE_BY_TAGS = 'https://api.github.com/repos/frida/frida/repo/releases/tags/';
const REMOTE_FRIDA_LATEST_RELEASE = 'https://api.github.com/repos/frida/frida/repo/releases/latest';
const REMOTE_FRIDA_PATH = '/data/local/tmp/frida-server';
const REMOT_FRIDA_DEFAULT_NAME = 'frida_server';


const SPAWN = 0x1;
const ATTACH_BY_NAME = 0x2;
const ATTACH_BY_PID = 0x3;


interface FridaInstance {
    device: Device;
    opts?:FridaServerOptions;
    path?: string;
    privileged?:boolean;
}

interface FridaInstanceMap {
    [deviceID:string] :FridaInstance;
}

/**
 * @class
 * @author Georges-B MICHEL
 */
export default class FridaHelper extends External.ExternalHelper
{
    /**
     * @field
     * @static
     */
    static SPAWN = 0x1;

    /**
     * @field
     * @static
     */
    static ATTACH_BY_NAME = 0x2;

    /**
     * @field
     * @static
     */
    static ATTACH_BY_PID = 0x3;

    static instances:FridaInstanceMap = {};

    constructor() {
        super()
    }


    static async exec( pDevice, pScript, pType, pApp, pExtra:string[]=[]){

        let hookRoutine:any = _co_.wrap(function *() {
            let session:Frida.Session = null, pid:number=null, applications:Frida.Application[]=null;
            let output:any = [];

            const device:Frida.Device = yield Frida.getDevice(pDevice.getUID());

            switch(pType){
                case FridaHelper.SPAWN:
                    pid = yield device.spawn([].concat(pExtra));
                    
                    session = yield device.attach(pid);

                    Logger.info(`[FRIDA HELPER] exec [SPAWN][cmd= ${pExtra.join(',')} ] : ${pid}`);
                    break;
                case FridaHelper.ATTACH_BY_PID:
                    applications = yield device.enumerateApplications();
                    for(let i=0; i<applications.length; i++){
                        if(applications[i].identifier == pExtra[0])
                            pid = applications[i].pid;
                    }

                    if(pid > -1) {
                        session = yield device.attach(pid);

                        //Logger.info('attached to '+pExtra+" (pid="+pid+")");
                        Logger.info(`[FRIDA HELPER] exec [ATTACH_BY_PID][pid=${pid}]`);
                    }else{
                        Logger.error('[FRIDA HELPER] exec : Failed to attach to app by pid.');
                        throw new Error('Failed to attach to application ('+pExtra+' not running).');
                    }
                    
                    break;
                case FridaHelper.ATTACH_BY_NAME:
                    applications = yield device.enumerateApplications();
                    if(applications.length == 1 && applications[0].name == "Gadget") {

                        session = yield device.attach(applications[0].pid);

                        Logger.info(`[FRIDA HELPER] exec [ATTACH_BY_NAME][name=${applications[0].name}] : ${pid}`);
                    }else
                        Logger.error('[FRIDA HELPER] exec : Failed to attach to app by name.');

                    break;
                /* case FridaHelper.ATTACH_BY_PID:
                    session = yield device.attach(pid);
                    Logger.info('[FRIDA HELPER] exec [attach_by_pid] :', pid+'');
                    Logger.info(`[FRIDA HELPER] exec [ATTACH_BY_PID][pid=${pid}]`);
                    break; */
                default:
                    Logger.error(`[FRIDA HELPER] exec : Failed to attach/spawn, action not supported : ${pType}`);
                    return;
                    break;
            }

            const script = yield session.createScript(pScript);

             // For frida-node > 11.0.2
             script.message.connect(message => {
                output.push(message);//{ msg:message, d:data });
                //console.log('[*] Message:', message);
            });    
            
        
            yield script.load();


            //PROBE_SESSION.fridaScript = script;

            //console.log('script loaded', script);
            yield device.resume(pid);


        });

        hookRoutine()
            .catch(error => {
            console.log(error);
            console.log('error:', error.message);
            });

    }


    /**
     * 
     * Return an object formatted like that :
     * {
     *  version: "v12.2.21",
     *  major: 12,
     *  minor: 2,
     *  patch: 21
     * }
     * @param {*} pFridaPath 
     */
    static getLocalFridaVersion(pFridaPath:string):any{
        const out:string = _ps_.execSync(FridaHelper.getExtPath()+' --version').toString(); //pFridaPath + ' --version').toString();
        const ver:string = out.slice(0 , out.lastIndexOf( _os_.EOL )).toString();
        const v:string[] = ver.split('.');
        return {
            version: ver,
            major: v[0],
            minor: v[1],
            patch: v[2]
        };
    }

    /**
     * To download a remote file into temporary folder
     * 
     * TODO : move to utils
     * 
     * @param {*} pRemotepPath 
     * @param {*} pLocalName 
     */
    static async download( pRemotepPath:string, pLocalName:string):Promise<string>{

        let tmp:string = _path_.join(
            DexcaliburWorkspace.getInstance().getTempFolderLocation(),
            pLocalName
        );

        Logger.info(`[FRIDA HELPER] Downloading ${pRemotepPath} ...`);

        if(_fs_.existsSync(tmp) == true){
            _fs_.unlinkSync(tmp);
        }

        
        // download file
        await pipeline(
            got.stream(pRemotepPath),
            _fs_.createWriteStream( tmp, {
                flags: 'w+',
                mode: 0o777,
                encoding: 'binary' 
            } )
        );

        Logger.info(`[FRIDA HELPER] ${pRemotepPath}  downloaded. `);

        if(_fs_.existsSync(tmp) == true){
            return tmp;
        }else{
            return null;
        }
    }



    static async startServer( pDevice:Device, pOptions:any = { /*timeout:250, path:null, privileged:true*/  }):Promise<boolean>{
        if(pDevice == null)
            throw FridaHelperException.INVALID_DEVICE();

        if( (pDevice.getFridaServerPath() == null) && (pOptions.path == null))
            throw FridaHelperException.INVALID_FRIDA_SERVER_PATH();

        // get server options from device settings
        const options:FridaServerOptions = pDevice.getFridaServerOptions();
        const meta:FridaInstance = {
            device: pDevice,
            path: null
        };

        // update options with override config
        for(const name in pOptions){
            if(pOptions[name] != null){
                switch(pOptions){
                    case 'port':
                    case 'timeout':
                        if(pOptions[name] > -1){
                            options[name] = pOptions[name];
                        }
                        break;
                    case 'before':
                    case 'transport':
                    case 'server':
                        if(!Util.isEmpty(pOptions[name], Util.FLAG_WS|Util.FLAG_CR|Util.FLAG_TB)){
                            options[name] = pOptions[name];
                        }
                        break;
                    case 'privileged':
                        options[name] = pOptions[name];
                        break;
                }
            }
        }

        // get configured path of frida-server for the target device
        //let frida:string = options.server;
        let command = options.server;
        //let res:any = null;

        // if the device is connected over the network through ADB
        if(pDevice.getDefaultBridge().isNetworkTransport() || (options.transport === FridaServerTransport.NETWORK)){
            command += " -l 0.0.0.0"
            if(options.port > -1){
                command += ":"+options.port+" ";
            }
        }

        Logger.info(`[FRIDA HELPER] Start server (${JSON.stringify(options)}>: ${command} `);

        // stored meta data about frida server instance
        FridaHelper.instances[pDevice.getUID()] = {
            device:pDevice,
            opts:options
        };

        const spawnOpts = {
            unref:false,
            detached:false,
            err: null,
            out: null
        };

        if(pOptions.privileged){
            spawnOpts.detached = true;
            spawnOpts.unref = true;

            if((options.before != null)
                && (!Util.isEmpty(options.before, Util.FLAG_WS|Util.FLAG_CR|Util.FLAG_TB))){
                //command = options.before+" && "+command;
                await pDevice.privilegedExecSync(options.before, { detached:false, unref:false });
            }
            await pDevice.privilegedExecSync(command, spawnOpts);
        }else{
            if((options.before != null)
                && (!Util.isEmpty(options.before, Util.FLAG_WS|Util.FLAG_CR|Util.FLAG_TB))){
                await pDevice.execDetached(options.before, spawnOpts);
                //command = options.before+" && "+command;
            }
            pDevice.execDetached(command, spawnOpts);
            // res = pDevice.execDetached(command, spawnOpts);
        }

        await Util.asyncTimeout(pOptions.timeout);

        return (async function(){
            if(pOptions.privileged){
                // detached shell, out/err must be pulled manually
                //Logger.info( `[FRIDA HELPER] frida spawned (privileged:true) : \n err=${ _fs_.readFileSync(spawnOpts.err).toString() } `);
                // Logger.info( `[FRIDA HELPER] frida spawned (privileged:true) : \n out=${ _fs_.readFileSync(spawnOpts.out).toString() } `);
                Logger.info( `[FRIDA HELPER] post frida spawned (privileged:true) : \n spawnOpts=${ JSON.stringify(spawnOpts) } `);
                if(spawnOpts.err!=null){

                    // "err" ppt exists only for privileged shell on real device
                    Logger.info( `[FRIDA HELPER] post frida spawned (privileged:true) : \n err=${ spawnOpts.err } `);
                    const error = _fs_.readFileSync(spawnOpts.err).toString();
                    if(error.indexOf("unknown command")>-1){
                        throw FridaHelperException.SPAWN_FAILED(error);
                    }else{
                        Logger.info( `[FRIDA HELPER] frida spawned (privileged:true) : \n out=${ _fs_.readFileSync(spawnOpts.out).toString() } `);
                    }
                }

            }else{
                // out/err are returned as a Buffer
                Logger.info( `[FRIDA HELPER] frida spawned (privileged:false) `);
            }

            return true;
        })();
    }

    static async stopServer( pDevice:Device, pOptions:any = { path:null, privileged:true }):Promise<boolean>{

        if(pDevice == null)
            throw new Error("[FRIDA HELPER] Unknow device. Device not connected not enrolled ?");


        if(FridaHelper.instances[pDevice.getUID()]==null){
            throw new Error("[FRIDA HELPER] Frida server instance not found.");
        }

        const meta:FridaInstance = FridaHelper.instances[pDevice.getUID()];

        let fdev:Frida.Device = await Frida.getDevice( pDevice.id);

        let pss:Process[] = await fdev.enumerateProcesses();
        for(let i=0;i< pss.length; i++){
            Logger.info("[FRIDA HELPER] ps: "+pss[i].name);
            if(pss[i].name.indexOf("frida-server")>-1){
                fdev.kill(pss[i].pid);
                return true;
                break;
            }
        }

        return false;
    }

    /**
     * 
     * @param {*} pDevice 
     * @method
     */
    static async getDevice(pDevice:Device):Promise<Frida.Device>{
        /*if(_frida_ == null){
            _frida_ = require('frida');
        }*/

        let dev:Frida.Device=null, bridge:IBridge = pDevice.getDefaultBridge();

        if(bridge==null) return null;

        dev = await Frida.getDevice(bridge.getDeviceID()).catch(async function(err){
            if(bridge.isNetworkTransport()){
                return await Frida.getDeviceManager().addRemoteDevice(bridge.getDeviceID());
            }else{
                return null;
            }
        });
        

        if(dev==null && bridge.isNetworkTransport()){
            dev = await Frida.getDeviceManager().addRemoteDevice(bridge.getDeviceID());
        }


        return dev;
    }

    static async getServerStatus( pDevice, pOptions:any = { nofrida:false }):Promise<boolean>{

        let flag:boolean = false, dev:any=null;
        
        try{
            dev = await FridaHelper.getDevice(pDevice);
            
            if(dev==null) 
                return false;

            dev = await dev.enumerateProcesses();
            flag = true;
        }catch(err){
            Logger.debug(err.message);
            flag = false;
        }

        return flag;
    }

    /**
     * To download and push Frida server binary into the device
     * 
     * Options supported:
     * - frida
     * - version
     * - url
     * - remote_path
     * - local_path
     * 
     * @param {Device} pDevice target device 
     * @param {Object} pOptions install options
     * @method
     * @static
     */
    static async installServer( pDevice:Device, pOptions:any = {}):Promise<boolean>{
        let ver:any, xzpath:string, path:string, arch:string, tmp:any;


        // retrieve frida version
        // TODO : replace by version from external tool settings
        ver = FridaHelper.getLocalFridaVersion( pOptions.hostPath != null? pOptions.hostPath : HOST_FRIDA_BIN_NAME);
        
        // get device a architecture
        arch = pDevice.getProfile().getSystemProfile().getArchitecture();

        if(pOptions.downloadURL != null){
            tmp =  pOptions.downloadURL;
        }else{
            let a:string = arch;
            switch (arch){
                case Architecture.AARCH32:
                    a = "arm";
                    break;
                case Architecture.AARCH64:
                    a = "arm64";
                    break;
                case Architecture.X86:
                    a = "x86";
                    break;
                case Architecture.X86_64:
                    a = "x86_64";
                    break;
            }
            tmp = `https://github.com/frida/frida/releases/download/${ver.version}/frida-server-${ver.version}-android-${a}.xz`
        }

        // download sever
        xzpath = await FridaHelper.download( tmp, 'frida_server.xz');
        Logger.info('[FRIDA HELPER] Server download. Path: ',xzpath);
        path = xzpath.substr(0,xzpath.length-3);

        Logger.info('[FRIDA HELPER] Extracting server from archive ...');

        // un-xz
        await pipeline(
            _fs_.createReadStream( xzpath),
            new _xz_.Decompressor(),
            _fs_.createWriteStream( path, {
                flags: 'w+',
                mode: 0o777,
                encoding: 'binary' 
            } )
        );


        if(pOptions.randomName == true){
            tmp = Util.randString(8, Util.ALPHANUM);
        }else{
            tmp = ""; //REMOT_FRIDA_DEFAULT_NAME;
        }

        // push binary
        if(pOptions.devicePath != null ){
            pDevice.pushBinary( path, pOptions.devicePath+tmp);
            pDevice.setFridaServer( pOptions.devicePath+tmp);
        }else{
            pDevice.pushBinary( path, REMOTE_FRIDA_PATH+tmp);
            pDevice.setFridaServer( REMOTE_FRIDA_PATH+tmp);
        }

        // remove downloaded files
        _fs_.unlinkSync(xzpath);
        _fs_.unlinkSync(path);


        return true;
    }
}
