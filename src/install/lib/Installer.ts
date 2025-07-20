import * as _fs_ from "fs";
import * as _path_ from "path";
import * as _ps_ from "child_process";
import * as _os_ from "os";
import {Subject} from "rxjs";

import {Requirement, RequirementCollection, VersionCheckerConfig} from "./Requirement.js";
import {createHash} from "crypto";

import {CommandCode, CommandResponse, CommandResponseCode} from "./CommandResponse.js";

import {InstallerException} from "./error/InstallerException.js";

import Util from "../../Utils.js";
import * as Log from "../../Logger.js";
import {TermsManager} from "./TermsManager.js";
import DexcaliburWorkspace from "../../DexcaliburWorkspace.js";

if(_os_.platform()=="darwin"){
  //Utils.updateEnvPATH();
}

export enum STDIO {
  IN,
  OUT,
  ERR
}

export const TEMP_FOLDER = "temp";


export enum InstallMode {
  OFFLINE,
  ONLINE
}

export interface CheckInstallOptions {
  bundles:string|string[],
  installMode:InstallMode
}

export interface CommandRequest {
  code: CommandCode,
  args: any
}

interface CommandEvent {
  extra?: any,
  req: CommandRequest,
  res: CommandResponse
}

export type OsName = string;

interface Installers {
  offline?: Record<OsName, any>;
  online?: Record<OsName, any>;
}

export interface RequirementInfo {
  name:string,
  required?:boolean,
  version?: VersionCheckerConfig,
  require?: string[],
  silent?: boolean,
  install?: Installers
}

export interface InstallerOptions {
  productName: string,
  icon:string,
  version: string,
  buildNumber: string,
  requirements: Record<string, RequirementInfo>,
  bundled: Record<string, RequirementInfo>
  home?:string;
  thirdparts?:string;
  configFile?:string;
}

/**
 * Represent the main window manager
 *
 * @class
 * @since 1.0.0
 */
export class Installer {

  /**
   * Dev mode flag
   *
   * If TRUE developer tools are displayed
   *
   * @field
   * @static
   */
  static dev:boolean = false;

  eventsPipe:Subject<CommandEvent> = new Subject<CommandEvent>();

  defaultConfig:any = {};

  homePath:string;

  iconPath = "";
  
  thirdpartsPath = "";

  tmpFile:string;
  tmpFolder:string = "";
  config:any = null;
  authConfig:any = {};
  dxcConfigPath:string;
  dxcConfig:any = {
    bin: {},
    server: {}
  };

  ws: DexcaliburWorkspace = null;

  bundled: RequirementCollection = {};
  requires:RequirementCollection = {};

  meta:any;

  termMgr : TermsManager;

  logger:Log.Logger;

  __log: any = ()=>{};

  constructor(pInstallerCfg:InstallerOptions, pDxcConfig:any, pTermMgr:TermsManager,  pLogger:Function=null) {


    this.termMgr = pTermMgr;

    this.initHomePath(pInstallerCfg.home);
    this.initThirdpartPath(pInstallerCfg.thirdparts);

    if(pInstallerCfg.configFile!=null){
      this.dxcConfigPath = pInstallerCfg.configFile;
      this.defaultConfig = JSON.parse(this.dxcConfigPath);
    }else{
      this.dxcConfigPath = _path_.join(this.homePath,'dxc.json');
      this.defaultConfig = pDxcConfig;
    }

    this.createTemporaryFolder();

    //this.config = pConfig;

    this.logger =  Log.newLogger() as Log.Logger; // Logger.newInstance(this.homePath,pDxcConfig);

    if(pLogger!=null){
      this.__log = pLogger;
    }else{
      this.__log = this.logger.info;
    }

    //this.__log(this.dxcConfigPath);
    //this.__log(this.tmpFile);
    //this.__log(JSON.stringify(this.config));

    this.initRequirements(pInstallerCfg.requirements);
    this.initBundledPkg(pInstallerCfg.bundled);
    this.iconPath = pInstallerCfg.icon;
    this.meta = {
      name: pInstallerCfg.productName,
      version: pInstallerCfg.version,
      build: pInstallerCfg.buildNumber,
    };
  }

  initHomePath(pHomePath:string):void {
    this.homePath =  pHomePath;
    if(!_fs_.existsSync(this.homePath)){
      _fs_.mkdirSync(this.homePath, 0o666);
    }
  }

  /**
   * To set the path of the folder containing thirdpart binaries
   * especially in case of offline install
   *
   * @param {string} pPath Path of the folder containing thirdpart binaries
   * @method
   */
  initThirdpartPath(pPath:string):void {
    this.thirdpartsPath =  pPath;
  }


  createTemporaryFolder():void{
    const tmp = _path_.join(this.homePath,TEMP_FOLDER);

    if(!_fs_.existsSync(tmp)){
      try{
        _fs_.mkdirSync(tmp);
      }catch(err){
        try{
          _fs_.chmodSync(this.homePath, 0o666)
          _fs_.mkdirSync(tmp);
        }catch (e){
          throw InstallerException.FATAL_TEMP_FOLDER_CANNOT_BE_CREATE(tmp);
        }
      }



    }

    this.tmpFolder = tmp;
    this.tmpFile = _path_.join(tmp, 'out.log');
  }

  initRequirements( pRequirements:any): void {
    for(let id in pRequirements){
      this.requires[id] = Requirement.from(id, pRequirements[id], this);
    }
  }

  initBundledPkg( pRequirements:any): void {
    for(let id in pRequirements){
      this.bundled[id] = Requirement.from(id, pRequirements[id], this);
    }
  }




  setLogger( pLogFn:any ):void {
    this.__log = pLogFn;
  }

  /**
   * To get log function
   *
   * @method
   */
  getLogger():Function {
    return this.__log;
  }

  /**
   * To get temporary folder location
   */
  getTempFolder():string {
    return this.tmpFolder; // app.getPath('temp');
  }

  /**
   * To return application working dir
   */
  getAppPath():string {
    return this.homePath; // app home replaced by $HOME/.dxc
    // return app.getAppPath();
  }

  static newCommentEvent(pCommand:CommandCode, pArgs:any, pExtra:any, pRes:CommandResponse):CommandEvent {
    return {
      extra: pExtra,
      req: {
        code: pCommand,
        args: pArgs
      },
      res: pRes
    }
  }


  /**
   *
   * @param pCommand
   * @param pArgs
   */
  processCommand( pCommand:CommandCode, pArgs:any, pExtra:any = {}):boolean {
    let success = false;
    switch (pCommand){
      case CommandCode.CHECK_REQS:
        this.eventsPipe.next(Installer.newCommentEvent(pCommand,pArgs,pExtra,this.isToolInstalled(pArgs)));
        success = true;
        break;
      case CommandCode.CHECK_BUNDLES:
        this.eventsPipe.next(Installer.newCommentEvent(pCommand,pArgs,pExtra,this.isBundleInstalled(pArgs)));
        success = true;
        break;
      case CommandCode.TOOL_INSTALL:
        this.installTool(pArgs,pExtra);
        success = true;
        break;
      case CommandCode.TOOL_FORCE:
        this.eventsPipe.next(Installer.newCommentEvent(pCommand,pArgs,pExtra,this.forceTool(pArgs)));
        success = true;
        break;
      case CommandCode.TOOL_SELECT:
        this.eventsPipe.next(Installer.newCommentEvent(pCommand,pArgs,pExtra,this.selectToolBinary(pArgs)));
        success = true;
        break;
      case CommandCode.BUNDLE_INSTALL:
        this.installBundle(pArgs,pExtra);
        success = true;
        break;
      case CommandCode.SETTINGS_GLOBALS:
        this.eventsPipe.next(Installer.newCommentEvent(pCommand,pArgs,pExtra,this.saveGlobalSettings(pArgs)));
        success = true;
        break;
      case CommandCode.SETTINGS_GET:
        this.eventsPipe.next(Installer.newCommentEvent(pCommand,pArgs,pExtra,this.getGlobalSettings(pArgs)));
        success = true;
        break;
      case CommandCode.SELECT_DIR:
        this.eventsPipe.next(Installer.newCommentEvent(pCommand,pArgs,pExtra,this.selectDirectory(pArgs)));
        success = true;
        break;
      case CommandCode.LICENSE:
        this.eventsPipe.next(Installer.newCommentEvent(pCommand,pArgs,pExtra,this.doLicenseAction(pArgs)));
        success = true;
        break;
      case CommandCode.FINISH:
        this.finish(pArgs);
        success = true;
        break;
      case CommandCode.QUIT:
      case CommandCode.ABORT:
        this.quit(pArgs);
        success = true;
        break;
    }

    if(!success){
      this.eventsPipe.next(Installer.newCommentEvent(pCommand,pArgs,pExtra,CommandResponse.failure("Command not supported")));
    }

    return success;
  }




  /**
   * To eceute a local command and to write resulst into a temp file
   *
   * @param pCommand
   * @param pIO
   * @private
   */
  /*
  _execWithFileBuffer(pCommand:string, pIO:STDIO ):Buffer {

    let opts = {stdio: [null,null,null] };

    opts.stdio[pIO] = _fs_.openSync(this.tmpFile, 'w+');
    _ps_.execSync(pCommand, opts);
    _fs_.closeSync(opts.stdio[pIO]);

    return _fs_.readFileSync(this.tmpFile);
  }*/

  /**
   * To force to use the program with default path from installer
   *
   * @param pEvent
   * @param pArgs
   */
  forceTool(pEvent:any, pArgs:any = null):CommandResponse{
    const tool = pArgs;


    this.dxcConfig.bin[tool] = this.requires[tool].getData('lastTry');

    return new CommandResponse({
      cmd: CommandResponseCode.TOOL_FORCED,
      args:  [JSON.stringify({ name:tool, success:true })]
    });
  }

  /**
   * To dispatch 'tool-install' commands
   *
   * @param pEvent
   * @param pArgs
   */
  installTool(pArgs:any = null, pExtra:any = {}):void{


    if(pArgs.indexOf(':')<=0 && pArgs.indexOf(':')>=pArgs.length-2) return;

    const args = pArgs.split(':');

    if(Object.keys(this.requires).indexOf(args[0])==-1) {
      this.eventsPipe.next(Installer.newCommentEvent(
          CommandCode.TOOL_INSTALL,
          pArgs,
          pExtra,
          CommandResponse.failure("Invalid tool name "+args[0], CommandResponseCode.TOOL_INSTALLED)
      ));
    }

    const req:Requirement = this.requires[args[0]];

    let s:boolean = false;
    try{
      switch(args[1]){
        case "online":
            if(req.hasOnlineInstaller()){
              req.doOnlineInstall().then(()=>{

                this.eventsPipe.next(Installer.newCommentEvent(
                    CommandCode.TOOL_INSTALL,
                    pArgs,
                    pExtra,
                    new CommandResponse({
                      cmd: CommandResponseCode.TOOL_INSTALLED,
                      msg: "Tool installed",
                      args: {
                        name: req.name,
                        online:true,
                        cause:(!s ? req.getCauses() : null),
                        success:s
                      }
                    })
                ));

              });
            }else{

              this.eventsPipe.next(Installer.newCommentEvent(
                  CommandCode.TOOL_INSTALL,
                  pArgs,
                  pExtra,
                  new CommandResponse({
                    cmd: CommandResponseCode.TOOL_INSTALLED,
                    msg: "Tool installed",
                    args: {
                      name: req.name,
                      online:true,
                      cause:"This tool has not online installer",
                      success:false
                    }
                  })
              ));
            }

          break;
        case "offline":
          if(req.hasOfflineInstaller()){
            req.doOfflineInstall().then(()=>{

              this.eventsPipe.next(Installer.newCommentEvent(
                  CommandCode.TOOL_INSTALL,
                  pArgs,
                  pExtra,
                  new CommandResponse({
                    cmd: CommandResponseCode.TOOL_INSTALLED,
                    msg: "Tool installed",
                    args: {
                      name: req.name,
                      online:false,
                      cause:(!s ? req.getCauses() : null),
                      success:s
                    }
                  })
              ));
            });
          }else{

            this.eventsPipe.next(Installer.newCommentEvent(
                CommandCode.TOOL_INSTALL,
                pArgs,
                pExtra,
                new CommandResponse({
                  cmd: CommandResponseCode.TOOL_INSTALLED,
                  msg: "Tool installed",
                  args: {
                    name: req.name,
                    online:true,
                    cause:"This tool has not offline installer",
                    success:false
                  }
                })
            ));

          }

          break;
      }
    }catch(err){
      //pEvent.reply('tool-installed', [JSON.stringify({name: args[0], online:(args[1]==="online"), cause:[err.message], success: false})]);
      //this.eventsPipe.next( CommandResponse.failure(err.message, CommandResponseCode.TOOL_INSTALLED));

      this.eventsPipe.next(Installer.newCommentEvent(
          CommandCode.TOOL_INSTALL,
          pArgs,
          pExtra,
          CommandResponse.failure(err.message, CommandResponseCode.TOOL_INSTALLED))
      );
    }

    return;
  }



  /**
   * All bundled package will be installed silently
   *
   * @param {any} pEvent IPC event
   * @param {any} pArgs Options
   * @async
   * @method
   * @since 1.0.0
   */
  installBundle(pArgs:any = null,pExtra:any = {}){

    let progress:number = 1;
    const step:number = Math.round(100/(Object.keys(this.bundled).length));
    let success:boolean = true ;


    this.__log("[INSTALLER][BUNDLE] Install all bundled programs : "+JSON.stringify(Object.keys(this.bundled)));

    let b:Requirement = null;
    for(let id in this.bundled){
      b = this.bundled[id];


      this.__log("[INSTALLER][BUNDLE] Installing : "+b.name);

      // if bundled pkg requires version checking
      if(b.vchecker!=null){
        if(b.checkVersion().success){
          // skip install

          progress += step;
          this.dxcConfig.bin[b.name] = b.getData('path');
          this.__log("[BUNDLE INSTALL] Current version is valid. Saving path : "+b.getData('path'));
          this.save();

          this.eventsPipe.next( Installer.newCommentEvent(
              CommandCode.BUNDLE_INSTALL,
              pArgs,
              pExtra,
              new CommandResponse({
                cmd: CommandResponseCode.BUNDLE_INSTALLED,
                args: {
                  name: b.name,
                  progress: progress,
                  cause:'already installed',
                  success:true
                }
              })
          ));


          success = success && true;
          continue;
        }
      }
      else if(!Util.isEmpty(b.getData('path'), Util.NO_FLAG)){
          // already installed
          progress += step;
          this.dxcConfig.bin[b.name] = b.getData('path');
          this.__log("[BUNDLE INSTALL] Path is already detected. Saving path : "+b.getData('path'));
          this.save();

          this.eventsPipe.next( Installer.newCommentEvent(
              CommandCode.BUNDLE_INSTALL,
              pArgs,
              pExtra,
              new CommandResponse({
                cmd: CommandResponseCode.BUNDLE_INSTALLED,
                args: {
                  name: b.name,
                  progress: progress,
                  cause:'already installed (path:'+b.getData('path')+')',
                  success:true
                }
              })
          ));

          success = success && true;
          continue;
      }

      // install step is reached, if current version is out-of-date or if it is not installed
      try{
        // bundled pkg are always installed using offline installer
        /*success = success && (async function(vReq, vEvent, vProgress){
          let s:boolean = false;
          s = await vReq.doOfflineInstall();
          vProgress += step;
          vEvent.reply('bundle-installed', [JSON.stringify({name: vReq.name, progress: vProgress, cause:(!s ? vReq.getCauses() : null), success:s})]);
        })(b, pEvent, progress);*/

        let s:boolean = false;
        b.doOfflineInstall().then(()=>{
          progress += step;

          this.eventsPipe.next( Installer.newCommentEvent(
              CommandCode.BUNDLE_INSTALL,
              pArgs,
              pExtra,
              new CommandResponse({
                cmd: CommandResponseCode.BUNDLE_INSTALLED,
                args: {
                  name: b.name,
                  progress: progress,
                  cause:null,
                  success:true
                }
              })
          ));

          success = success && true;

          this.dxcConfig.bin[b.name] = b.getData('path');
          this.save();

          this.eventsPipe.next( Installer.newCommentEvent(
              CommandCode.BUNDLE_INSTALL,
              pArgs,
              pExtra,
              new CommandResponse({
                cmd: CommandResponseCode.BUNDLE_INSTALL_DONE,
                args: {
                  name: 'all',
                  success:true
                }
              })
          ));

        },()=>{

          this.eventsPipe.next( Installer.newCommentEvent(
              CommandCode.BUNDLE_INSTALL,
              pArgs,
              pExtra,
              new CommandResponse({
                cmd: CommandResponseCode.BUNDLE_INSTALLED,
                args: {
                  name: b.name,
                  progress: progress,
                  cause:b.getCauses(),
                  success:false
                }
              })
          ));
          success = false;

          this.__log("[INSTALLER][BUNDLE] All bundles have been installed");
          this.save();

          this.eventsPipe.next( Installer.newCommentEvent(
              CommandCode.BUNDLE_INSTALL,
              pArgs,
              pExtra,
              new CommandResponse({
                cmd: CommandResponseCode.BUNDLE_INSTALL_DONE,
                args: {
                  name: 'all',
                  success:false
                }
              })
          ));

        });


      }catch(err){
        this.__log("[INSTALLER][BUNDLE] Install of bundle ["+b.name+"] failed : "+err.message);
        success = false;

        this.eventsPipe.next( Installer.newCommentEvent(
            CommandCode.BUNDLE_INSTALL,
            pArgs,
            pExtra,
            new CommandResponse({
              cmd: CommandResponseCode.BUNDLE_INSTALL_DONE,
              args: {
                name: 'all',
                success:false
              }
            })
        ));

        this.__log("[INSTALLER][BUNDLE] Somme bundles cannot be installed");
      }
    }



    return;
  }

  /**
   * To open a file explorer dialog which allows the user to select the binary file
   * for an arbitrary tool.
   *
   * When the action is done (dialog box closed), it replies through IPC.
   *
   * @param {any} pEvent IPC event
   * @param {string} pArgs Tool name
   * @method
   * @since 1.0.0
   */
  selectToolBinary( pArgs:any = null):CommandResponse {
    //if(/^[\s\t\r\n]*$/.test(pArgs)) return;

    const selPath:string[] = pArgs;

    if(selPath !== undefined){
      // only a single file can be selected, so it is the first entry
      this.requires[pArgs].setData('path',selPath[0]);
    }

    // by saving the path of selected binary into 'path', version checker will use this path instead of
    // path built by the installer
    const p =this.requires[pArgs].getData('path');

    return new CommandResponse({
      cmd: CommandResponseCode.TOOL_SELECTED,
      success: (p!=null&& p.length>0),
      arg: {
        path: p
      }
    });


  }

  /**
   * To show a dialog window allowing user to select one or several
   * directories, including empty directory.
   *
   * Options :
   * ```
   * {
   *   multiple: [true|false],
   *   params: [any]
   * }
   * ```
   *
   *
   * @param {any} pEvent IPC event
   * @param {string} pArgs Tool name
   * @method
   * @since 1.0.0
   */
  selectDirectory(pArgs:string = null):CommandResponse {

    return new CommandResponse({
      cmd:CommandResponseCode.FOLDER_SELECTED,
      msg: "Directory selected",
      args: {
        path: pArgs
      }
    });
  }

  /**
   * Get the server workspace instance
   * @method
   * @since 1.0.0
   */
  getWorkspace():DexcaliburWorkspace {
    return this.ws;
  }

  /**
   * To complete configuration with missing fields required to init auth
   *
   * @method
   */
  initAuthSettings( pCreateUserDB:boolean = false):void {
    if(this.dxcConfig.server.hasOwnProperty('auth')==false){
      this.dxcConfig.server.auth = {
        db: {
          dbms: 'sqlite',
          user: null,
          pwd: null,
          port: 0,
          uri: _path_.join( _path_.dirname(this.dxcConfigPath), 'users.db')
        },
        policy: {
          enforced: false
        },
        supported: ['pwd']
      }
    }

    if(this.authConfig.hasOwnProperty('auth_enforced')){
      this.dxcConfig.server.auth.policy.enforced = this.authConfig.enforced;
    }
  }

  initUserDatabase():void {
    if(this.authConfig.hasOwnProperty('auth_user')
      && this.authConfig.hasOwnProperty('auth_pwd')){

      let pwd = this.authConfig.auth_pwd;
      let t = ""+Util.time();
      let p = "";
      let s = Util.randString(16, Util.ALPHANUM);

      // add padding
      if(this.authConfig.auth_pwd.length < 16){
          p = Util.randString(16 - this.authConfig.auth_pwd.length, Util.ALPHANUM);
          pwd = pwd+p;
      }

      // scramble with random salt
      let j =0 ;
      for(let i=0; i<4; i++){
        pwd = pwd.split('').map( c =>  String.fromCharCode(c.charCodeAt(0) ^ s[(j++<<i)%s.length].charCodeAt(0)) ).join('');
        j++;
      }

      // hash
      let hash = createHash('sha256');
      hash.update(pwd);

      _fs_.writeFileSync(
        _path_.join( _path_.dirname(this.dxcConfigPath), 'userdb.json.temp'),
        JSON.stringify({
          login:  this.authConfig.auth_user,
          pwd:  hash.digest('hex'),
          s: s,
          p: p,
          time: t
        })
      )
    }
  }

  /**
   *
   * @param {any} pEvent IPC event
   * @param {string} pArgs Tool name
   * @method
   * @since 1.0.0
   */
  saveGlobalSettings(pArgs:string = null):CommandResponse {

    if(/^[\s\t\r\n]*$/.test(pArgs)) return;

    let resp:CommandResponse;
    const args = JSON.parse(pArgs);
    let i:number = 0;

    this.__log('Save global settings : '+pArgs);
    try {
      for (let ppt in args) {
        i++;
        switch (ppt) {
          case "workspace":
            if(_fs_.existsSync(args.workspace)){
              this.dxcConfig.server.workspace = args.workspace;

              // populate workspace
              this.ws = DexcaliburWorkspace.getInstance(this.dxcConfig.server.workspace, true);
              this.ws.init();

            }else{
              this.__log("[INSTALLER][ERROR] Workspace path ["+args.workspace+"] is invalid or not exists");
              throw new Error("Workspace path ["+args.workspace+"] is invalid or not exists");
            }
            break;
          case "registry":
          case "registryAPI":
            this.dxcConfig.server[ppt] = args[ppt];
            break;
          case "auth_user":
          case "auth_pwd":
          case "auth_enforced":
            this.authConfig[ppt] = args[ppt];
            break;
          case "http":
          case "ws":
            const p1 = parseInt(args[ppt],10);
            if(p1>=1 && p1<=0xFFFF){
              if((ppt=="ws" && this.dxcConfig.server.http==p1)
                || (ppt=="http" && this.dxcConfig.server.ws==p1)){

                throw new Error("HTTP and Websocket port number cannot be identic.");
              }else{
                this.dxcConfig.server[ppt] = p1;
              }
            }else{
              throw new Error("Port number is out of bound (max 65535)");
            }
            break;
        }
      }

      this.initAuthSettings();

      this.save();
      resp = new CommandResponse({
        cmd: (i>1? CommandResponseCode.ALL_SETTINGS_SAVED : CommandResponseCode.SETTINGS_SAVED),
        msg: "Configuration saved successfully",
        args: {
          success:true,
          keys: Object.keys(args)
        }
      });
    } catch (err) {

      resp = new CommandResponse({
        cmd: (i>1? CommandResponseCode.ALL_SETTINGS_SAVED : CommandResponseCode.SETTINGS_SAVED),
        msg: "An error occurred during configuration save",
        args: {
          success:false,
          keys: Object.keys(args),
          causes:err.message
        }
      });
    }

    return resp;
  }

  /**
   *
   * @param pEvent
   * @param pArgs
   */
  getGlobalSettings(pEvent:any, pArgs:string = null):CommandResponse {
    this.__log("Return global settings ... "+JSON.stringify( this.dxcConfig));

    return new CommandResponse({
      cmd: CommandResponseCode.SETTINGS_DATA,
      msg: "Retrieve global settings",
      args: this.dxcConfig
    })
  }

  /**
   * To check if the specified tool is already installed
   *
   * @param pEvent
   * @param pArgs
   * @return {CommandResponse}
   * @method
   */
  isToolInstalled(pArgs:any = null):CommandResponse{

    let req:Requirement = null;
    let resp:CommandResponse;


    if(Object.keys(this.requires).indexOf(pArgs)>-1){
        req = this.requires[pArgs].checkVersion();
    }

    if(req!=null){
      if(req.isValid()){
        try{
          this.dxcConfig.bin[pArgs] = req.getData('path');
          this.save();

          // search required and silent dependendies requiring current tool
          let d:Requirement;
          for(let r in this.requires){
            d =  this.requires[r];

            if(d.required && d.requires.indexOf(req.name)>-1 && d.silent){
              // TODO: multiple requires are not supported
              this.__log("[INSTALLER] Silent checking of  : "+d.name);
              d.checkVersion();
            }
          }
        }catch(err){
          this.__log("[INSTALLER] Tool validation fail : "+err.message);
        }

      }
      resp = new CommandResponse({
        cmd: CommandResponseCode.TOOL_CHECKED,
        args: JSON.stringify(req.toJsonObject())
      });


    }else{
      resp = CommandResponse.failure(
          'invalid requirement : '+pArgs,
          CommandResponseCode.TOOL_CHECKED
      );
    }

    return resp;
  }


  /**
   * To check if the specified tool is already installed
   *
   * @param pEvent
   * @param pArgs
   * @return {CommandResponse}
   * @method
   */
  isBundleInstalled(pOpts:CheckInstallOptions):CommandResponse{

    let req:Requirement[] = [];
    let resp:CommandResponse;
    let result = true;

    if(pOpts.bundles==="*"){
      req = Object.values(this.bundled);
    }else if(Array.isArray(pOpts.bundles)){
      pOpts.bundles.map(x => req.push(this.bundled[x]));
    }else if(typeof pOpts.bundles==="string"){
      req = [this.bundled[pOpts.bundles]];
    }
    // hasVersionChecker

    req.map((vReq)=>{
      if(vReq.hasVersionChecker()){
        vReq.checkVersion();
      }

      result = result && vReq.checkInstall(pOpts.installMode);
    });

    if(result){
      resp = new CommandResponse({
        cmd: CommandResponseCode.BUNDLE_CHECKED,
        args: {bundles:pOpts.bundles}
      });
    }else{
      resp = CommandResponse.failure(
          'invalid bundle : '+pOpts.bundles,
          CommandResponseCode.BUNDLE_CHECKED
      );
    }

    return resp;
  }

  /**
   * To check is the configuration is complete or not
   *
   *
   * @method
   * @since 1.0.0
   */
  isConfigurationComplete():boolean {
    let complete = true;
    const required = {
      bin: ['java','python','frida','adb','radare2'], //,'apktool','baksmali','binwalk'],
      server: ['http','ws','workspace','registry','registryAPI']
    };

    for(let t in required){
      required[t].map( pRequired => {
        complete = complete
                    && (this.dxcConfig[t].hasOwnProperty(pRequired) && this.dxcConfig[t][pRequired]!=null);
      });
    }

    return complete;
  }

  /**
   * To detect if install is required
   *
   * Additionnaly, It checks if a configuration is complete
   *
   * @return {boolean} Return TRUE if installing is required, else FALSE
   * @method
   * @since 1.0.0
   */
   isInstallRequired( ):boolean {
    let required:boolean;


    this.__log('[INSTALLER] Trying to load configuration from default location : '+this.dxcConfigPath);

    // detect if config folder contents config file
    try{
      if(!_fs_.existsSync(this.dxcConfigPath)){
        this.dxcConfig.server = this.defaultConfig;
        this.__log('[INSTALLER] Configuration not found');
        required = true;
      }else{
        this.dxcConfig = JSON.parse(_fs_.readFileSync(this.dxcConfigPath).toString());

        // configure requirements with already set path
        for(let bin in this.dxcConfig.bin){
          this.__log(bin+' => '+this.dxcConfig.bin[bin]);
          if(this.requires[bin]!=null)
            this.requires[bin].setData('path', this.dxcConfig.bin[bin]);
          else if(this.bundled[bin]!=null)
            this.bundled[bin].setData('path', this.dxcConfig.bin[bin]);
        }

        required = !this.isConfigurationComplete();
        if(required) {
          this.completeConfiguration('server');
          this.__log('[INSTALLER] Configuration found but incomplete');
        }else
          this.__log('[INSTALLER] Configuration found. Skipping install.');
      }
    }catch(err){
      this.dxcConfig.server = this.defaultConfig;
      this.__log('[INSTALLER] Loading failed : '+err.message+"\n"+err.stack);
      required = true;
    }

    return required;
  }

  /**
   * To save configuration into config file
   * @param {string} pFile Configuration file path
   * @method
   * @since 1.0.0
   */
  save(pFile:string = null):void {
     const path = (pFile!=null ? pFile : this.dxcConfigPath);

     _fs_.writeFileSync(
       path,
       JSON.stringify(this.dxcConfig),
       {
         mode: 0o666,
         flag: 'w+',
         encoding: 'utf8'
       });
  }

  /**
   *
   * @param pEvent
   * @param pArgs
   */
  finish(pArgs:any):any {

    this.completeConfiguration('server');

    this.initUserDatabase();

    // save configuration
    this.save();

    // restart
    // app.relaunch();

    console.log("[INSTALLER BACKEND] Installing process has finished successfully");
    this.__log("Installing process has finished successfully");
    process.exit(0);
  }

  /**
   * To abort the process
   *
   * @param pEvent
   * @param pArgs
   * @method
   */
  quit(pArgs:any = {}):any {
    console.log("[INSTALLER BACKEND] Abort installing process.");
    this.__log("Abort installing process.");
    process.exit(0);
  }

  /**
   * To perform some backend action related to licence mgt
   *
   * @param pEvent
   * @param pArgs
   */
  doLicenseAction(pArgs:any):CommandResponse {

//    if(Utils.isEmpty(pArgs)) return;

    this.__log("Processsing license action "+pArgs);
    const data:string[] = pArgs.split(':');


    const license = this.termMgr.getTerms( data[1]!=undefined ? data[1] : null);
    let resp:CommandResponse = CommandResponse.failure("License action not supported");

    if(license!=null){
      switch(data[0]){
        case "save":
          // 'Save As ...' of license
          const outPath = _path_.join(_os_.homedir(),"Dexcalibur_"+license.lang+"_license.pdf");

          _fs_.copyFileSync( license.getPdfPath(), outPath);
          resp = new CommandResponse({
            cmd: CommandResponseCode.LICENSE,
            msg: "Saved in "+outPath,
            args: [outPath]
          });

          break;
        case "print":
          // to print, open PDF into a new window
          // shell.openExternal('file://'+license.getPdfPath());
          //pEvent.reply('license',[JSON.stringify({ action:'print', success:false })]);

          resp = new CommandResponse({
            cmd: CommandResponseCode.LICENSE,
            msg: "License printed",
          });
          break;
        case "read":
          this.__log("Loading license text");
          resp = new CommandResponse({
            cmd: CommandResponseCode.LICENSE,
            msg: "Read",
            args: [{
              lang:license.lang,
              text:license.text
            }]
          });
          /*
          pEvent.reply('license',[JSON.stringify({
            action:'read',
            success:true,
            lang:license.lang,
            text:license.text,
            meta: this.meta
          })]);*/
          break;
        case "accept":
          // to print, open PDF into a new window
          //pEvent.reply('license',[JSON.stringify({ action:'read', success:true, lang:license.lang, text:license.text })]);
          resp = new CommandResponse({
            cmd: CommandResponseCode.LICENSE,
            msg: "accepted",
            args: [{
              lang:license.lang,
              text:license.text
            }]
          });
          break;
      }
    }

    return resp;
  }

  /**
   * To complete configuration file with missing properties from
   * default configuration file
   *
   * @param {string} pCategory Element : bin or server
   * @param {any} pConfig Object containing default properties/values
   * @method
   * @since 1.0.0
   */
  private completeConfiguration(pCategory: string):void {
    let cat = this.config[pCategory];
    for(let ppt in this.defaultConfig){
      if(cat[ppt]==null){
        cat[ppt] = this.defaultConfig[ppt];
      }
    }

    this.initAuthSettings();
  }


  getIconPath():string {
    return this.iconPath;
  }
}
