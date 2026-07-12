

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

import * as _ps_ from 'child_process';
import * as _fs_ from 'fs';
import * as _util_ from 'util';
import {EOL} from 'os';
import * as Log from './Logger.js';
import JavaHelper from "./JavaHelper.js";
import {External} from "./external/External.js";
import * as _path_ from "path";
import DexcaliburEngine from "./DexcaliburEngine.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const _exec_ = _util_.promisify(_ps_.exec);
const _execFile_ = _util_.promisify(_ps_.execFile);

export interface ApkExtractJavaOptions {
    disableZip64ExtraFieldValidation?:boolean
}



interface ApkExtractGlobalOptions {
    extractOpts: any,
    javaOpts: ApkExtractJavaOptions
}

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
    static BIN_NAME = "apktool.jar";

    static getPath():string {

        let path:string = null;
        try{
            path = ApkHelper.getExtPath("ApkExtract"); //Path.join(__dirname, '..', 'bin', "baksmali.jar");
        }catch(err){
            path = _path_.join(DexcaliburEngine.getInstance().getWorkspace().getBinaryFolderLocation(),ApkHelper.BIN_NAME);
        }

        return path;
    }

    /**
     * To check if ApkTool is installed and can be used
     *
     * @return {Promise<boolean>}  TRUE if ready, else FALSE
     * @async
     * @static
     * @method
     */
    static async check(pOptions:ApkExtractJavaOptions={}):Promise<boolean> {
        const cmd = ApkHelper.getApktoolCommand(pOptions);
        const out = await _exec_(
            cmd.file+' '+cmd.args.join(' ')+' h'
        );

        return (out.stdout!=null)
            && (/Apktool v/.test(out.stdout))
            && (/usage: apktool/.test(out.stdout)) ;
    }

    static getResFolder():string {
        return "res";
    }

    /**
     * To get begin of the command to start Apktool
     *
     * @returns {String}
     * @static
     */
    static getApktoolCommand(pOptions:ApkExtractJavaOptions):IExternalCommand{
        let args:string[] = [];

        if(pOptions!=null && pOptions.disableZip64ExtraFieldValidation===true){
            args.push('-Djdk.util.zip.disableZip64ExtraFieldValidation=true');
        }

        return {file:JavaHelper.getJRE(), args:args.concat(['-jar',ApkHelper.getPath()]) };
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
    static async extract(pApkPath:string, pDestination:string, pOptions:ApkExtractGlobalOptions={extractOpts:{},javaOpts:{}}){
        if(_fs_.existsSync(pApkPath)==false){
            throw new Error("[APK HELPER] APK not found : "+pApkPath);
        }

        let cmd:IExternalCommand = ApkHelper.getApktoolCommand(
            pOptions.javaOpts!=null? pOptions.javaOpts : {}
        );

        let options:string[] = [];

        options.push('decode');

        for(let i in pOptions.extractOpts){
            options.push(ApkHelper.getApktoolArg(i, pOptions.extractOpts[i]));
        }

        options.push(pApkPath);
        options.push('-o '+pDestination);

        cmd.args = cmd.args.concat(options);


        /*let { stdout, stderr } = await _execFile_(
            cmd.file,
            cmd.args // concat(['-o '+pDestination, pApkPath])
        );*/

        Logger.info("[APK HELPER] APK extractor exec : "+(cmd.file+' '+cmd.args.join(' ')))
        let { stdout, stderr } = await _exec_(
            cmd.file+' '+cmd.args.join(' ')
        );


        if(stderr){
            let no_err:boolean = true;
            stderr.split(EOL).map(x =>{
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


