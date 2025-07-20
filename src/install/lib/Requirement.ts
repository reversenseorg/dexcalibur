import {EOL} from "os";
import * as _fs_ from "fs";
import * as _ps_ from "child_process";
import * as _path_ from "path";
import * as _semver_ from "semver";

import {Installer, InstallMode} from "./Installer.js";
import {PackageInstaller, PackageInstallerFactory} from "./PackageInstaller.js";
import Util from "../../Utils.js";

const STDIO =  {
  IN: 0,
  OUT: 1,
  ERR: 2
};

enum STDIO_d {
  IN,
  OUT,
  ERR
}

export interface RequirementCollection {
  [name:string] :Requirement
}

export enum CommandType {
  SIMPLE,
  ADAPTIVE
}

export interface Command {
  type?: CommandType,
  cmd: string,
  args: string[]
}

export interface VersionChecker {
  cmd: Command,
  line: number,
  stdio: number[], // file descriptor
  pattern: RegExp,
  rel: string,
  dir: string
}

interface Location {
  type:string;
  relPath:string[]
}
export interface VersionCheckerConfig {
  cmd: string|string[]|any,
  line: number,
  stdio?: number[], // file descriptor
  pattern: RegExp,
  rel?: string,
  dir?: string,
  min?:string
  io?:any,
  location?:Location
}



export interface Installers {
  online?: PackageInstaller,
  offline?: PackageInstaller
}


export class Requirement {
  name:string;
  success:boolean = false;
  causes:string[] = null;
  installedVersion:string = null;
  requiredVersion:string = null;
  silent:boolean = true;
  required:boolean = false;
  vchecker: VersionChecker = null;
  installers: Installers = {};
  data:any = {};
  forced:boolean = false;

  // if this requirement depend of another requireement
  // for example : 'pip3' depends of 'python' with version >= 3
  requires:string[] = [];

  installSuccess: boolean = false;

  _i:Installer = null;
  __log: Function = null;

  /*
   * Name of the binary associated to the current requirement
   * @type {string}
   * @field
   */
  //value: string = null;

  private _tmp:string = null;

  constructor(pName:string, pSuccess:boolean=false, pCauses:string[] = null, pRequired:string = null) {
    this.name = pName;
    this.success = pSuccess;
    this.causes = pCauses;
    this.requiredVersion = pRequired;
  }

  static from( pName:string , pConfig:any, pInstaller:Installer):Requirement {
    let r:Requirement = new Requirement(pName);

    r._i = pInstaller;
    r.setLogger(pInstaller.getLogger());

    for(let i in pConfig){
      switch(i){
        case 'required':
          r.required = pConfig.required;
          break;
        case 'require':
          r.requires = pConfig.require;
          break;
        case 'name':
          r.name = pConfig.name;
          break;
        case 'silent':
          r.silent = pConfig.silent;
          break;
        case 'version':
          if(pConfig.version != null)
            r._initVersionChecking(pConfig.version);
          break;
        case 'install':
          if(pConfig.install != null)
            r._initInstallConfig(pConfig.install, pInstaller);
          break;
      }
    }

    return r;
  }


  /**
   *
   * @param pConfig
   */
  private _initVersionChecking(pConfig: any):any {

    let vc:VersionChecker = {cmd: undefined, line: 0, pattern: undefined, stdio:[STDIO.OUT], rel:null, dir:null };

    this._tmp = _path_.join(this._i.getTempFolder(),'out-'+this.name+'.log');

    for(let i in pConfig){
      switch(i){
        case 'min':
          this.requiredVersion = pConfig.min;
          break;
        case 'location':
          if(pConfig.location.type){
            vc.dir = pConfig.location.type;
          }
          if(pConfig.location.relPath!==null){
            vc.rel = pConfig.location.relPath; //_path_.join.apply(null, [vc.pwd].concat(pConfig.location.relPath));
          }
          this.__log("Working directory for checking version of '"+this.name+"' is : <"+vc.dir+">/"+_path_.join.apply(null,vc.rel));
          break;
        case 'cmd':
          if(Array.isArray(pConfig.cmd)){

            vc.cmd = {
              type: (Array.isArray(pConfig.cmd[0])? CommandType.ADAPTIVE : CommandType.SIMPLE),
              cmd: pConfig.cmd[0],
              args: []
            };

            //if(pConfig.hasOwnProperty('args')){
              if(Array.isArray(pConfig.args))
                vc.cmd.args = pConfig.args;
              else
                vc.cmd.args = [pConfig.args];
            //}


            if(pConfig.cmd.length>1){
              if(Array.isArray(pConfig.cmd[1])){
                vc.cmd.args = pConfig.cmd[1].concat(vc.cmd.args);
              }else{
                vc.cmd.args = [pConfig.cmd[1]].concat(vc.cmd.args);
              }
            }
          }else{
            vc.cmd = {
              type: CommandType.SIMPLE,
              cmd: pConfig.cmd,
              args: []
            };
          }
          break;
        case 'io':
          if(Array.isArray(pConfig.io)){
            vc.stdio = [];
            pConfig.io.map( vIO => vc.stdio.push(STDIO[vIO.toUpperCase()]));
          }else{
            vc.stdio = [STDIO[pConfig.io.toUpperCase()]];
          }
          break;
        case 'line':
          vc.line = pConfig.line;
          break;
        case 'pattern':
          vc.pattern = new RegExp(pConfig.pattern);
          break;
      }
    }

    this.vchecker = vc;
  }

  private _initInstallConfig(pConfig:any, pInstaller:Installer) {

    const factory = new PackageInstallerFactory(pInstaller);


    // configure offline installer
    if(pConfig.offline != null){
      this.installers.offline = factory.newInstaller(this, pConfig.offline, false);
    }

    // configure online installer
    if(pConfig.online != null){
      this.installers.online = factory.newInstaller(this, pConfig.online, true);
    }
  }

  hasVersionChecker():boolean {
    return (this.vchecker != null);
  }

  getInstaller(pOnline:boolean):PackageInstaller {
    return (pOnline ? this.installers.online : this.installers.offline);
  }

  isCrossRequirementsSatisfied( pCapturedVersion:any):boolean {
    if(this.requires.length==0){
      return true;
    }else{
      let s:boolean = true;
      this.requires.map( vName => {
        this.__log(vName+' ===> '+pCapturedVersion[vName]+' >= '+this._i.requires[vName].requiredVersion);
        try{
          if(pCapturedVersion[vName]!=null && !Util.isEmpty(pCapturedVersion,Util.FLAG_WS | Util.FLAG_CR)){


            this.__log("[SUBREQUIRES] Checking if version ["+Util.normalizeVersion(pCapturedVersion[vName])+"] of ["+this.name+"] is greater than "+Util.normalizeVersion(this._i.requires[vName].requiredVersion));

            s = s && _semver_.gte(
              Util.normalizeVersion(pCapturedVersion[vName]),
              Util.normalizeVersion(this._i.requires[vName].requiredVersion)
            );


            this.__log("[SUBREQUIRES] "+vName+" version is valid ");

          }else{
            this.__log("[SUBREQUIRES]["+vName+"] Before : if version of ["+this.name+"] is compatible ");

              s = s && this._i.requires[vName].isValid();

            this.__log("[SUBREQUIRES]["+vName+"] After : if version of ["+this.name+"] is compatible : "+s);
          }
        }catch(err){
          this.__log('[SUBREQUIRES] [ERROR]> '+err.message);
          s = false;
        }

      });
      return s;
    }
  }

  /**
   * To eceute a local command and to write resulst into a temp file
   *
   * @param pCommand
   * @param pIO
   * @private
   */
  private _execWithFileBuffer(pCommand:string, pIO:STDIO_d ):Buffer {

    let opts = {stdio: [null,null,null] };

    this.__log(_ps_.execSync("echo $PATH").toString());
    this.__log(process.env.PATH+'   ===>  '+pCommand);

    this.__log("[EXEC]: "+pCommand+" io:"+pIO);
    opts.stdio[pIO] = _fs_.openSync(this._tmp, 'w+');
    _ps_.execSync(pCommand, opts);
    _fs_.closeSync(opts.stdio[pIO]);

    return _fs_.readFileSync(this._tmp);
  }

  /**
   * To set log function
   *
   * @param {Function} pLogFn Log function
   * @method
   */
  setLogger( pLogFn:Function):void {
    this.__log = function( pText:string):void {
      pLogFn("[REQUIREMENT::"+this.name+"] "+pText);
    };
  }


  /**
   * To detect if an online installer is configured
   *
   * @return {boolean} TRUE is an installer exists, else FALSE
   * @method
   */
  hasOnlineInstaller():boolean {
    return (this.installers!=null) && (this.installers.online != null) && (this.installers.online.online);
  }

  /**
   * To detect if an offline installer is configured
   *
   * @return {boolean} TRUE is an installer exists, else FALSE
   * @method
   */
  hasOfflineInstaller():boolean {
    return (this.installers!=null) && (this.installers.offline != null) && (!this.installers.offline.online);
  }


  /**
   * To check is the requirement is installed and if version is compatible
   *
   * @param {number} Optional. Command offset into command list. Default 0
   * @return {Requirement} Current requirement instance
   */
  checkVersion( pCmdOffset:number=0):Requirement {

    if(this.vchecker==null || this.vchecker.cmd==null)
      throw new Error("There is not version checking strategy configured for ["+this.name+"]");

    // skipped if value have been forced
    if(this.forced) return this;

    // if a binary has been manually selected before,
    // the default binary is replaced by the path of selected binary file.
    let fp = false;
    let out:string, lines:string[], matches:any, path:string, t:string[];

    try{
      const vcmd = this.vchecker.cmd;
      if(vcmd.type == CommandType.SIMPLE){

        t = (vcmd.cmd as string).split(/(?<!\\) /);
        path = t[0];
        if(this.getData('path')!==undefined){
          path = this.getData('path');
          fp=true;
        }

        // When CommandType is SIMPLE, 'vcmd.cmd' is a string containing program path and arguments

        //path = vcmd.cmd.split(/(?<!\\) /)[0];
        if(fp){
          t.shift();

          out = this._execWithFileBuffer(
            path+' '+t.join(' '),
            this.vchecker.stdio[pCmdOffset]).toString();
        }else{
          let p:string[] = [];
          if(this.vchecker.dir==="ws") p.push(this._i.getWorkspace().getLocation());
          if(this.vchecker.rel!==null) p = p.concat(this.vchecker.rel);


          path = _path_.join(_path_.join.apply(null, p),  vcmd.cmd.split(/(?<!\\) /)[0]);

          p.push(vcmd.cmd);


          // TODO: args are misssing ?
          out = this._execWithFileBuffer(
            _path_.join.apply(null, p)
            ,
            this.vchecker.stdio[pCmdOffset]).toString();
        }

      }else{
        // When CommandType is ADAPTIVE, 'vcmd.cmd' is a array of string containing, where each entry is and potential
        // program path

        path = vcmd.cmd[pCmdOffset];
        if(this.getData('path')!==undefined){
          path = this.getData('path');
          fp=true;
        }

        // if the program location has been already validated, use fixed path
        if(fp){
//          path = vcmd.cmd;
          out = this._execWithFileBuffer(path+' '+vcmd.args.join(' '),
            this.vchecker.stdio[pCmdOffset]).toString();
        }
        // else build the adapted program path (absolute or relative)
        else{

          let p:string[] = [];
          if(this.vchecker.dir==="ws") p.push(this._i.getWorkspace().getLocation());
          if(this.vchecker.rel!==null) p = p.concat(this.vchecker.rel);


          path = _path_.join(_path_.join.apply(null, p),  vcmd.cmd[pCmdOffset]);

          p.push(vcmd.cmd[pCmdOffset]);

          out = this._execWithFileBuffer(
            _path_.join.apply(null, p)+' '+vcmd.args.join(' '),
            this.vchecker.stdio[pCmdOffset]).toString();
        }
      }

      // save program path tried, it will be used as path if the user force the installer
      // to use it
      this.setData('lastTry', path);

      this.__log(this.name+" returns => "+out);

      lines = out.split(EOL);
      matches = this.vchecker.pattern.exec(lines[this.vchecker.line]);

      this.__log(JSON.stringify(matches));

      if(matches!=null && matches.groups.version!=null){

        this.installedVersion = matches.groups.version;

        // normalize version numbers like 3 or 3.9 to 3.0.0 or 3.9.0

        this.__log("Checking if version ["+this.installedVersion+"] of ["+this.name+"] is greater than "+this.requiredVersion)
        try{
          if(_semver_.gte(
            Util.normalizeVersion(this.installedVersion),
            Util.normalizeVersion(this.requiredVersion))){


            if(this.requires.length>0){
              this.__log('Is adaptative : '+(vcmd.type===CommandType.ADAPTIVE?'true':'false')+' and '+(pCmdOffset<(vcmd.cmd.length-1)? 'true':'false'));

              // check is requirement has additional validation rules such as cross requirements (as pip/python2 or pip3/python3)
              if(this.isCrossRequirementsSatisfied(matches.groups)){
                if(!fp)
                  this.setData('path',(vcmd.type == CommandType.SIMPLE ? vcmd.cmd.split(' ')[0] : vcmd.cmd[pCmdOffset]));

                this.success = true;
              }

              // if cross requirements are not satisfied but program has alternative path ...
              else if(vcmd.type===CommandType.ADAPTIVE && pCmdOffset<(vcmd.cmd.length-1)){0
                return this.checkVersion(++pCmdOffset);
              }else{
                // semver comparison failed
                this.success = false;
                this.causes = ["Requirements are not satisfied."];
                return this;
              }
            }else {
              //this.installedVersion = matches.groups.version;
              this._i.__log("[CONFIGURATION] Path of '"+this.name+"' is now : "+path);
              if(!fp || (this.getData('path')==null))
                this.setData('path', path);
              else
                this._i.__log("[CONFIGURATION][FIXED PATH] For '"+this.name+"' is : "+this.getData('path'));
              this.success = true;
            }

          }else{
            if(vcmd.type===CommandType.ADAPTIVE && pCmdOffset<(vcmd.cmd.length-1)){
              this.checkVersion(++pCmdOffset);
            }else{
              this.success = false;
              this.causes = ["Minimal '"+this.name+"' version supported is '"+this.requiredVersion+"'. (Detected : "+matches[1]+")"];
            }
          }
        }catch(ver_err){
          // this block is executed when installed version is lesser than required version
          if(vcmd.type===CommandType.ADAPTIVE && pCmdOffset<(vcmd.cmd.length-1)){
            this.checkVersion(++pCmdOffset);
          }else{
            // semver comparison failed
            this.success = false;
            this.causes = ["Minimal '"+this.name+"' version supported is '"+this.requiredVersion+"'. (Detected : "+matches[1]+")#2"];

            this.__log("[FATAL ERROR] "+ver_err.message,ver_err.stack,this.causes[0]);
          }
        }
      }else{
        if(vcmd.type===CommandType.ADAPTIVE && pCmdOffset<(vcmd.cmd.length-1)){
          this.checkVersion(++pCmdOffset);
        }else{
          this.success = false;
          this.causes = [this.name+" cannot be executed or version cannot be retrieved "];
        }

      }
    }catch(err){
      this.success = false;
      this.causes = [err.message];
      this.__log("[FATAL ERROR] "+err.message,err.stack);
    }

    return this;
  }

  /**
   * To get check result
   */
  isValid():any {
    return this.success;
  }

  /**
   * To get causes of a failing check
   */
  getCauses():string[] {
    return this.causes;
  }

  /**
   * To set arbitrary data associated to this requirement
   *
   * @param pKey
   * @param pValue
   */
  setData( pKey:string, pValue:any):void {
    this.data[pKey] = pValue;
  }


  /**
   * To get arbitrary data associated to this requirement
   *
   * @param pKey
   */
  getData( pKey:string):any {
    return this.data[pKey];
  }

  uncompress(pCompressedFile:string, pOutput:string, pType:string):boolean {
    let success:boolean = false;
    switch(pType){
      case "zip":
        break;
      case "xz":
        break;
      case "tar.gz":
        break;
    }

    return success;
  }

  /**
   * Online install
   *
   * @param {any} pOptions Additonnal options such as proxy settings
   * @return  {Promise<boolean>} TRUE if install successful, else FALSE
   * @method
   */
  async doOnlineInstall(pOptions:any={}):Promise<boolean> {
    return this.doInstall(true,pOptions);
  }

  /**
   * Offline install requires that dependency is bundled
   * with the app
   *
   * @param {any} pOptions Additonnal options
   * @return  {Promise<boolean>} TRUE if install successful, else FALSE
   * @method
   */
  async doOfflineInstall(pOptions:any={}):Promise<boolean> {
    return this.doInstall(false,pOptions);
  }

  /**
   * To perform offline or online install
   *
   * @param {boolean} pOnline TRUE if online install, else FALSE
   * @param {any} pOptions Additonnal options such as proxy settings
   * @return  {Promise<boolean>} TRUE if install successful, else FALSE
   * @private
   * @async
   * @method
   */
  async doInstall( pOnline:boolean, pOptions:any):Promise<boolean> {

    const type = (pOnline?"online":"offline");

    this.__log("Start "+type+" install");
    let success:boolean;
    try{
      if(this.installers.hasOwnProperty(type)==false){
        throw new Error("This requirements has not "+type+" installer");
      }
      success = await this.installers[type].install(pOptions);
    }catch(err){
      this.__log("[FATAL ERROR] doInstall : "+err.message);
      success = false;
    }finally {
      // flush previous error causes if install is successful
      if(success){
        this.causes = [];
      }
      return success;
    }
  }

  checkInstall(pMode:InstallMode):boolean {
    let res= true;
    let installer:PackageInstaller;
    if(pMode===InstallMode.ONLINE){
      installer = this.installers.online;
    }
    else{
      installer = this.installers.offline;
    }

    if(installer==null) return true;

    switch (installer.type){
      case "move":
        if(installer.dest!=null){
          switch (installer.dest.location){
            case "ws":
              installer.dest.uri.map((x:string) => {
                res = res || _fs_.existsSync(_path_.join(this._i.getWorkspace().getLocation(),x));
              });
              break;
          }
        }
        break;
      case "python":
        // todo
        res = true;
        break;
    }

    return res;
  }

  /**
   * To make poor object ready to be serialized
   *
   * @return {any} Poor JS object
   */
  toJsonObject():any {
    return {
      success:this.success,
      causes:this.causes,
      name:this.name,
      installedVersion: this.installedVersion,
      requiredVersion: this.requiredVersion,
      required: this.required,
      data: this.data,
      forced: this.forced
    };
  }
}
