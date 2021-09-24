const _ps_ = require("child_process");
const _fs_ = require("fs");
const _path_ = require("path");
const _stream_      = require('stream');
const _got_         = require("got");
const _xz_         = require("lzma-native");
const {promisify}   = require('util');

const pipeline = promisify(_stream_.pipeline);
const spawn = promisify(_ps_.spawn);

const Logger = require('./Logger')();
const DexcaliburWorkspace = require("./DexcaliburWorkspace");

const HOST_FRIDA_BIN_NAME = 'frida';
const REMOTE_FRIDA_RELEASE_BY_TAGS = 'https://api.github.com/repos/frida/frida/repo/releases/tags/';
const REMOTE_FRIDA_LATEST_RELEASE = 'https://api.github.com/repos/frida/frida/repo/releases/latest';
const REMOTE_FRIDA_PATH = '/data/local/tmp/';
const REMOT_FRIDA_DEFAULT_NAME = 'frida_server';


const SPAWN = 0x1;
const ATTACH_BY_NAME = 0x2;
const ATTACH_BY_PID = 0x3;

var _frida_ = null;
/**
 * @class
 * @author Georges-B MICHEL
 */
class FridaHelper
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
/*

    static async exec( pDevice, pScript, pType, pApp){
        let FRIDA = require('frida');

        var hookRoutine = co.wrap(function *() {
            let session = null, pid=null, applications=null;
            
            const device = yield FRIDA.getDevice(pDevice.getUID());

            switch(pType){
                case FridaHelper.SPAWN:
                    pid = yield device.spawn([pExtra]);
                    
                    session = yield device.attach(pid);

                    Logger.info('spawned:', pid);
                    break;
                case FridaHelper.ATTACH_BY_PID:
                    applications = yield device.enumerateApplications();
                    for(let i=0; i<applications.length; i++){
                        if(applications[i].identifier == pExtra)
                            pid = applications[i].pid;
                    }

                    if(pid > -1) {
                        session = yield device.attach(pid);

                        Logger.info('attached to '+pExtra+" (pid="+pid+")");
                    }else{
                        throw new Error('Failed to attach to application ('+pExtra+' not running).');
                    }
                    
                    break;
                case FridaHelper.ATTACH_BY_NAME:
                    applications = yield device.enumerateApplications();
                    if(applications.length == 1 && applications[0].name == "Gadget") {

                        session = yield device.attach(applications[0].pid);

                        Logger.info('attached to Gadget:', pid);
                    }else
                        Logger.error('Failed to attach to Gadget.');

                    break;
                case FridaHelper.ATTACH_BY_PID:
                    session = yield device.attach(pid);
                    Logger.info('spawned:', pid);
                    break;
                default:
                    Logger.error('Failed to attach/spawn');
                    return;
                    break;
            }

            const script = yield session.createScript(pScript);

             // For frida-node > 11.0.2
             script.message.connect(message => {
                PROBE_SESSION.push(message);//{ msg:message, d:data });
                //console.log('[*] Message:', message);
            });    
            
        
            yield script.load();


            PROBE_SESSION.fridaScript = script;

            console.log('script loaded', script);
            yield device.resume(pid);


        });

        hookRoutine()
            .catch(error => {
            console.log(error);
            console.log('error:', error.message);
            });

    }*/
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
    static getLocalFridaVersion(pFridaPath){
        let v = _ps_.execSync(pFridaPath + ' --version');
        let ver = v.slice(0 , v.lastIndexOf( require('os').EOL )).toString();
        v = ver.split('.');
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
    static async download( pRemotepPath, pLocalName){

        let tmp = _path_.join(
            DexcaliburWorkspace.getInstance().getTempFolderLocation(),
            pLocalName
        );

        Logger.info(`[FRIDA HELPER] Downloading ${pRemotepPath} ...`);

        if(_fs_.existsSync(tmp) == true){
            _fs_.unlinkSync(tmp);
        }

        
        // download file
        await pipeline(
            _got_.stream(pRemotepPath),
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


    static async startServer( pDevice, pOptions = { path:null, privileged:true }){
        if(pDevice == null) 
            throw new Error("[FRIDA HELPER] Unknow device. Device not connected not enrolled ?");
        if( (pDevice.getFridaServerPath() == null) && (pOptions.path == null))  
            throw new Error("[FRIDA HELPER] Path of Frida server is unknow");

        let frida = pDevice.getFridaServerPath();
        let res = null;

        //console.log(pOptions);

        if(pOptions.path != null && pOptions.path != '')
            frida = pOptions.path;

        if(pDevice.getDefaultBridge().isNetworkTransport()){
            frida += " -l 0.0.0.0"
        }
        
        //if(pOptions.listen != null)

        if(pOptions.privileged)
            res = await pDevice.privilegedExecSync(frida, {detached:true});
        else
            res = pDevice.execSync(frida);

        return res;
    }

    /**
     * 
     * @param {*} pDevice 
     * @method
     */
    static async getDevice(pDevice){
        if(_frida_ == null){
            _frida_ = require('frida');
        }

        let dev=null, bridge = pDevice.getDefaultBridge();

        if(bridge==null) return null;

        dev = await _frida_.getDevice(bridge.deviceID).catch(async function(err){
            if(bridge.isNetworkTransport()){
                return await _frida_.getDeviceManager().addRemoteDevice(bridge.deviceID);
            }else{
                return null;
            }
        });
        

        if(dev==null && bridge.isNetworkTransport()){
            dev = await _frida_.getDeviceManager().addRemoteDevice(bridge.deviceID);
        }


        return dev;
    }

    static async getServerStatus( pDevice, pOptions = { nofrida:false }){
        if(_frida_ == null){
            _frida_ = require('frida');
        }

        let flag = false, dev=null;
        
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
    static async installServer( pDevice, pOptions = {}){
        let ver, xzpath, path, arch, tmp;


        // retrieve frida version
        ver = FridaHelper.getLocalFridaVersion( pOptions.path != null? pOptions.path : HOST_FRIDA_BIN_NAME);
        
        // get device a architecture
        arch = pDevice.getProfile().getSystemProfile().getArchitecture();

        if(pOptions.remoteURL != null){
            tmp =  pOptions.remoteURL;
        }else{
            tmp = `https://github.com/frida/frida/releases/download/${ver.version}/frida-server-${ver.version}-android-${arch}.xz`   
        }

        // download sever
        xzpath = await FridaHelper.download( tmp, 'frida_server', pOptions);
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
            tmp = Util.randomString(8);
        }else{
            tmp = REMOT_FRIDA_DEFAULT_NAME;
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

module.exports = FridaHelper;