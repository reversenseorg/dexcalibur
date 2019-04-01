const Process = require('child_process');
const FS = require("fs");
const Chalk = require('chalk');


function ApkHelper(ctx){
    this.context = ctx;
}

ApkHelper.prototype.extract = function(file){
    if(FS.existsSync(file)==false){
        console.log(Chalk.bold.red("[*] APK not found "));
        return false;
    }
    ret = Process.execSync(this.context.config.apktPath+" d -f -m -r -o "+this.context.workspace.getWD()+"dex "+file).toString("ascii");
    
    //if()
    console.log(Chalk.bold.green("[*] APK decompiled in "+this.context.workspace.getWD()+"dex"));

    return true;
}


module.exports = ApkHelper;

