'use strict';

import * as  Path from "path";
import * as  Process from "child_process";
import * as  Fs from "fs";
import * as  _util_ from 'util';

const _execFile_ = _util_.promisify(Process.execFile);


import * as Log from './Logger';
import DexcaliburProject from "./DexcaliburProject";
import JavaHelper from "./JavaHelper";
import {External} from "./external/External";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * @class
 * @author Georges-B. MICHEL
 */
export default class DexHelper extends  External.ExternalHelper
{
    context = null;
    baskmaliCmd:string = null;
    baskmali:string = null;

    constructor(ctx:DexcaliburProject){
        super();

        this.context = ctx;
        this.baskmaliCmd = JavaHelper.getJRE()+" -jar ";
        this.baskmali = DexHelper.getExtPath(); //Path.join(__dirname, '..', 'bin', "baksmali.jar");
    }

    /**
     * To get begin of the command to start Apktool
     * 
     * @returns {String} 
     * @static
     */
    static getBaksmaliCommand():any {
        let cmd = DexHelper.getExtPath(); //Path.join(__dirname, '..', 'bin', "baksmali.jar");
        try{
            Logger.info("[i] getBaksmaliCommand : "+DexHelper.getExtPath());
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
        let destPath:string = Path.join(Path.dirname(dexfilePath),"smali");
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
