'use strict';

const Path = require("path");
const Process = require("child_process");
const Fs = require("fs");

class DexHelper
{
    constructor(ctx){
        this.context = ctx;
        this.baskmaliCmd = ctx.config.getJavaBin()+" -jar ";
        this.baskmali = Path.join(ctx.config.getLocalBinPath(),"baksmali.jar");
    }

    disassembleFile(dexfilePath, callback, override=false){
        //let destPath = Path.join(this.context.workspace.getTmpDir(),Path.basename(dexfilePath));
        let destPath = Path.join(Path.dirname(dexfilePath),"smali");
        
        let i=0;

        if(Fs.existsSync(destPath)){
            if(!override) return;
        }

        let cmd = this.baskmaliCmd+this.baskmali+" disassemble "+dexfilePath+" -o "+destPath;
//        console.log("Exec : ",cmd);
        Process.execFile(
            this.context.config.getJavaBin(),
            ["-jar",this.baskmali,"disassemble",dexfilePath,"-o",destPath],
            function(err,stdout,stderr){
                callback(destPath, err, stdout, stderr);
            });
    }
}

module.exports = DexHelper;