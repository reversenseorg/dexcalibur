const Process = require('child_process');
const FS = require("fs");
const Chalk = require('chalk');
const Path = require("path");


function ApkHelper(ctx){
    this.context = ctx;
}

ApkHelper.prototype.extract = function(fileSrc, folderDest=null, resource=false){
    if(FS.existsSync(fileSrc)==false){
        console.log(Chalk.bold.red("[*] APK not found "));
        return false;
    }
    if(folderDest == null)
//        folderDest = this.context.workspace.getWD()+"dex";
        folderDest = Path.join(this.context.workspace.getWD(),"dex");

    let cmd = this.context.config.apktPath+" d ";
    if(!resource)  cmd += "-r";

    ret = Process.execSync(cmd+"-f -m -o "+folderDest+" "+file).toString("ascii");
    
    //if()
    console.log(Chalk.bold.green("[*] APK decompiled in "+folderDest));

    return true;
}


module.exports = ApkHelper;

