'use strict';

import * as  _path_ from "path";
import * as  Process from "child_process";
import * as  Fs from "fs";
import * as  _util_ from 'util';

const _execFile_ = _util_.promisify(Process.execFile);


import * as Log from './Logger.js';
import DexcaliburProject from "./DexcaliburProject.js";
import JavaHelper from "./JavaHelper.js";
import {External} from "./external/External.js";
import DexcaliburEngine from "./DexcaliburEngine.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * @class
 * @author Georges-B. MICHEL
 */
export default class DexHelper extends  External.ExternalHelper
{
    static BIN_NAME = "baksmali.jar";
    context = null;
    baskmaliCmd:string = null;
    baskmali:string = null;

    constructor(ctx:DexcaliburProject){
        super();

        this.context = ctx;
        this.baskmaliCmd = JavaHelper.getJRE()+" -jar ";
        this.baskmali = DexHelper.getPath();
    }

    static getPath():string {

        let path:string = null;
        try{
            path = DexHelper.getExtPath("DexHelper"); //Path.join(__dirname, '..', 'bin', "baksmali.jar");
        }catch(err){
            path = _path_.join(DexcaliburEngine.getInstance().getWorkspace().getBinaryFolderLocation(),DexHelper.BIN_NAME);
        }

        return path;
    }

    /**
     * To get begin of the command to start Apktool
     * 
     * @returns {String} 
     * @static
     */
    static getBaksmaliCommand():any {
        let cmd:string; //Path.join(__dirname, '..', 'bin', "baksmali.jar");
        try{
            cmd = DexHelper.getPath(); //getExtPath("DexHelper");
            Logger.info("[i] getBaksmaliCommand : "+cmd);
        }catch(err){
            Logger.info("[i] getBaksmaliCommand (e) : "+err.message)
        }

        return {file:JavaHelper.getJRE(), args:['-jar',cmd]};
    }

    /**
     * 
     * @param {*} dexfilePath 
     * @param {*} callback 
     * @param {*} override 
     * @method
     * @static
     */
    static async disassemble( pDexfilePath:string, pDestPath:string=null, override:boolean=false):Promise<boolean>{
        let baksmali:any = DexHelper.getBaksmaliCommand();

        Logger.info("[DEX HELPER] Disass "+pDexfilePath+", out: "+pDestPath+', override: '+override);

        if(Fs.existsSync(pDestPath)){
            if(!override) return false;
        }

        Logger.info("[DEX HELPER] exec :  "+baksmali.args[1]+" disassemble "+pDexfilePath+" -o "+pDestPath);

        let { stderr } =  await _execFile_(
            baksmali.file,
            baksmali.args.concat(["disassemble",pDexfilePath,"-o",pDestPath]));

        if(stderr){
            Logger.error(stderr);
            return false;
        }else{
            Logger.info("[DEX HELPER] DEX disassembled into : "+pDestPath);
            return true;
        }
    }

    /**
     * Add on error callback
     *
     * @param {*} dexfilePath 
     * @param {*} callback 
     * @param {*} override 
     * @method
     * @static
     * @deprecated
     *     
     */
    disassembleFile(dexfilePath:string, callback:any, override:boolean=false){
        let destPath:string = _path_.join(_path_.dirname(dexfilePath),"smali");
        let baksmali:any = DexHelper.getBaksmaliCommand();

        if(Fs.existsSync(destPath)){
            if(!override) return;
        }

        Process.execFile(
            baksmali.file,
            baksmali.args.concat(["disassemble",dexfilePath,"-o",destPath]),
            function(err:any, stdout:string, stderr:string){
                callback(destPath, err, stdout, stderr);
            });
    }
}
