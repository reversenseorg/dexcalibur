
import * as _fs_ from 'fs';
import * as _path_ from 'path';

import ApkHelper from "./ApkHelper.js";
import AppPackage from "./AppPackage.js";
import AdbWrapperFactory from "./AdbWrapperFactory.js";
import * as Log from "./Logger.js";
import {IBridge} from "./Bridge.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class ApkPackagePatcher
{
    currentPackageName:string = null;
    config:any = null;
    packages:any = [];
    bridge:IBridge = null;
    count:number = 0;

    constructor(pkgName:string, config:any=null) {
        this.currentPackageName = pkgName;
        this.config = config;
        this.packages = [];
        this.bridge = null;
    }

    /*
     * Pull a Package from the Device and Patch its MainActivity to load frida-gadget,
     * as well as copying the library into the apk
     * 
     * @param {*} package_name The package name
     * 
     */
    /*patchPackage(packageIdentifier) {
        
    }*/

    pullPackage(packageIdentifier:string):void{
        let dstPath = _path_.join(this.config.workspacePath, packageIdentifier, 'dex');
        let tmpPath = _path_.join(this.config.workspacePath,packageIdentifier, packageIdentifier +  '.apk');
        let projectDir = _path_.join(this.config.workspacePath, packageIdentifier);
        
        _fs_.mkdirSync(projectDir, {recursive: true});
        _fs_.mkdirSync(dstPath, {recursive: true});

        this.bridge.pull(this.bridge.getPackagePath(packageIdentifier), tmpPath);
        ApkHelper.extract(tmpPath, dstPath);
    }

    async scan(){
       let pkgs:AppPackage[] = null;
       this.count = 0;
       if(this.bridge.isReady()){
           pkgs = await this.bridge.listPackages();
           this.count += pkgs.length;

           for(let i in pkgs){
               this.packages[pkgs[i].packageIdentifier] = pkgs[i];
               this.packages[pkgs[i].packageIdentifier].workspaceExists = _fs_.existsSync(
                   _path_.join(this.config.workspacePath, pkgs[i].packageIdentifier)
               );
               this.packages[pkgs[i].packageIdentifier].currentWd = pkgs[i].packageIdentifier === this.currentPackageName;
           }

           Logger.info("Android packages: ", Object.keys(this.packages).join(', '));
       }
        
   }

   toJsonObject():any{
        let json:any = [];
        for(let i in this.packages){
            json.push(this.packages[i].toJsonObject())
        }
        return json;
    }
}
