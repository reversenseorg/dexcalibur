const _ps_ = require('child_process');
const _fs_ = require("fs");
const _chalk_ = require('chalk');
const _path_ = require("path");
const _util_ = require('util');

const _exec_ = _util_.promisify(_ps_.exec);
const _execFile_ = _util_.promisify(_ps_.execFile);

const Utils = require('./Utils');
const Logger = require("./Logger")();
const DexcaliburWorkspace = require("./DexcaliburWorkspace");



/**
 * This class provide several methods related to APK file analysis
 * and extracting
 * 
 * @class
 * @author Georges-B. MICHEL
 */
class ApkHelper
{
    /**
     * To get begin of the command to start Apktool
     * 
     * @returns {String} 
     * @static
     */
    static getApktoolCommand(){
        let cmd = _path_.join(
            DexcaliburWorkspace.getInstance().getBinaryFolderLocation(),
            'apktool.jar'
        )

        if(process.env.DEXCALIBUR_JAVA != null){
            return {file:process.env.DEXCALIBUR_JAVA, args:[' -jar ',cmd]};
        }else{
            return {file:'java', args:['-jar',cmd]};
        }
    }

    /**
     * 
     * @param {*} pOption 
     * @param {*} pValue 
     * @returns {String} args value
     * @method
     * @static
     */
    static getApktoolArg(pOption, pValue){
        
        switch(pOption){
            case 'no_res':
                return (pValue==true ? '-r' : '');
            case 'match':
                return (pValue==true ? '-m' : '');
            case 'force':
                return (pValue==true ? '-f' : '');
            case 'no_src':
                return (pValue==true ? '-s' : '');
            case 'frame_path':
                return (pValue!=null ? '-p '+pValue : '');
            case 'frame_tag':
                return (pValue!=null ? '-t '+pValue : '');
            default:
                return '';
        }
    }

    /**
     * To extract APK file content using APKtool
     * 
     * Parameter `pOptions` accepts several APKtoopl options:
     *  - raw_command :  set with raw apktool arguments   
     *  - no_res : not extract ressource (-r) 
     *  - match : match original (-m)
     * 
     * @param {*} pApkPath 
     * @param {*} pDestination 
     * @param {*} pOption 
     * @static
     * @async
     */
    static async extract(pApkPath, pDestination, pOption={}){
        if(_fs_.existsSync(pApkPath)==false){
            throw new Error("[APK HELPER] APK not found ");
        }
        
        let cmd = ApkHelper.getApktoolCommand();
        let options = [];

        options.push('decode');

        for(let i in pOption){
            options.push(ApkHelper.getApktoolArg(i, pOption[i]));
        }
        
        options.push(pApkPath);
        options.push('-o '+pDestination);

        cmd.args = cmd.args.concat(options);


        /*let { stdout, stderr } = await _execFile_(
            cmd.file,
            cmd.args // concat(['-o '+pDestination, pApkPath])
        );*/

        let { stdout, stderr } = await _exec_(
            cmd.file+' '+cmd.args.join(' ')
        );


        if(stderr){
            console.log("err:",stderr);
            return false;
        }else{
            Logger.info("[APK HELPER] APK extracted into : "+pDestination);
            return true;
        }
    }
}

module.exports = ApkHelper;

