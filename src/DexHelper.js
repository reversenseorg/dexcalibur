'use strict';

const Path = require("path");
const Process = require("child_process");
const Fs = require("fs");


const _util_ = require('util');
const _execFile_ = _util_.promisify(Process.execFile);

const Logger = require('./Logger')();
const DexcaliburWorkspace = require('./DexcaliburWorkspace');

/**
 * @class
 * @author Georges-B. MICHEL
 */
class DexHelper
{
    
    constructor(ctx){
        this.context = ctx;
        this.baskmaliCmd = ctx.config.getJavaBin()+" -jar ";
        this.baskmali = Path.join(__dirname, '..', 'bin', "baksmali.jar");
    }

    /**
     * To get begin of the command to start Apktool
     * 
     * @returns {String} 
     * @static
     */
    static getBaksmaliCommand() {
        let cmd = Path.join(__dirname, '..', 'bin', "baksmali.jar");

        if(process.env.DEXCALIBUR_JAVA != null){
            return {file:process.env.DEXCALIBUR_JAVA, args:['-jar',cmd]};
        }else{
            return {file:'java', args:['-jar',cmd]};
        }
    }

    /**
     * 
     * @param {*} dexfilePath 
     * @param {*} callback 
     * @param {*} override 
     * @method
     * @static
     */
    static async disassemble( pDexfilePath, pDestPath=null, override=false){
        let baksmali = DexHelper.getBaksmaliCommand();
    
        if(Fs.existsSync(pDestPath)){
            if(!override) return;
        }

        let { stdout, stderr } =  await _execFile_(
            baksmali.file,
            baksmali.args.concat(["disassemble",pDexfilePath,"-o",pDestPath]));

        if(stderr){
            console.log(stderr);
            return false;
        }else{
            Logger.info("[DEX HELPER] DEX disassembled into : "+pDestPath);
            return true;
        }
    }

    /**
     * 
     * @param {*} dexfilePath 
     * @param {*} callback 
     * @param {*} override 
     * @method
     * @static
     * @deprecated
     *     
     */
    disassembleFile(dexfilePath, callback, override=false){
        //let destPath = Path.join(this.context.workspace.getTmpDir(),Path.basename(dexfilePath));
        let destPath = Path.join(Path.dirname(dexfilePath),"smali");
        let baksmali = DexHelper.getBaksmaliCommand();

        
        let i=0;

        if(Fs.existsSync(destPath)){
            if(!override) return;
        }

//        console.log("Exec : ",cmd);
        Process.execFile(
            baksmali.file,
            baksmali.args.concat(["disassemble",dexfilePath,"-o",destPath]),
            function(err,stdout,stderr){
                callback(destPath, err, stdout, stderr);
            });
    }
}

module.exports = DexHelper;