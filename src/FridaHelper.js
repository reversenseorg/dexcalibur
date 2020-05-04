const _ps_ = require("child_process");
const _fs_ = require("fs");
const _path_ = require("path");
const _stream_      = require('stream');
const _got_         = require("got");
const _xz_         = require("xz");
const {promisify}   = require('util');

const pipeline = promisify(_stream_.pipeline);
const spawn = promisify(_ps_.spawn);


const DexcaliburWorkspace = require("./DexcaliburWorkspace");

const HOST_FRIDA_BIN_NAME = 'frida';
const REMOTE_FRIDA_RELEASE_BY_TAGS = 'https://api.github.com/repos/frida/frida/repo/releases/tags/';
const REMOTE_FRIDA_LATEST_RELEASE = 'https://api.github.com/repos/frida/frida/repo/releases/latest';
const REMOTE_FRIDA_PATH = '/data/local/tmp/';
const REMOT_FRIDA_DEFAULT_NAME = 'frida_server';

var _frida_ = null;
/**
 * @class
 * @author Georges-B MICHEL
 */
class FridaHelper
{
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

        console.log(pRemotepPath);

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

        console.log(pOptions);

        if(pOptions.path != null && pOptions.path != '')
            frida = pOptions.path;

        if(pOptions.privileged)
            res = await pDevice.privilegedExecSync(frida, {detached:true});
        else
            res = pDevice.execSync(frida);

        return res;
    }

    static async getServerStatus( pDevice, pOptions = { nofrida:false }){
        if(_frida_ == null){
            _frida_ = require('frida');
        }

        let flag = false;
        let dev = await _frida_.getDevice(pDevice.getUID());
        
        try{
            dev = await dev.enumerateProcesses();
            flag = true;
        }catch(err){
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
        path = xzpath.substr(0,xzpath.length-3);

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

        return true;
    }

}

module.exports = FridaHelper;