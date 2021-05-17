

import * as _ps_ from 'child_process';
import * as _fs_ from 'fs';
import * as _path_ from 'path';
import * as _util_ from 'util';
import DexcaliburWorkspace from "./DexcaliburWorkspace";
import {EOL} from 'os';
import * as Log from './Logger';
import APK from "./APK";
import {ApkPackage} from "./android/ApkPackage";
import {Core} from "./Core";
import JavaHelper from "./JavaHelper";
import {External} from "./external/External";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const _exec_ = _util_.promisify(_ps_.exec);
const _execFile_ = _util_.promisify(_ps_.execFile);


interface IExternalCommand {
    file:string,
    args:string[]
}

/**
 * This class provide several methods related to APK file analysis
 * and extracting
 *
 * @class
 * @author Georges-B. MICHEL
 */
export default class ApkHelper extends External.ExternalHelper
{

    /**
     * To get begin of the command to start Apktool
     *
     * @returns {String}
     * @static
     */
    static getApktoolCommand():IExternalCommand{
        return {file:JavaHelper.getJRE(), args:['-jar',ApkHelper.getExtPath()]};
    }

    /**
     *
     * @param {*} pOption
     * @param {*} pValue
     * @returns {String} args value
     * @method
     * @static
     */
    static getApktoolArg(pOption:string, pValue:boolean|string):string{

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
     * TODO : replace APK tool by Dexcalibur extraction tool
     * TODO : return ApkPackage instance representing app
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
    static async extract(pApkPath:string, pDestination:string, pOption:any={}){
        if(_fs_.existsSync(pApkPath)==false){
            throw new Error("[APK HELPER] APK not found ");
        }

        let cmd:IExternalCommand = ApkHelper.getApktoolCommand();
        let options:string[] = [];

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
            let no_err:boolean = true;
            stderr.split(EOL).map(x =>{
                console.log(x);
                if(x.startsWith('E:')) no_err = false;
            });

            // throw exception
            return no_err;
        }else{
            Logger.info("[APK HELPER] APK extracted into : "+pDestination);
            return true;
        }
    }
}


