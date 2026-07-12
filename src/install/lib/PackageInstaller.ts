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

/**
 * Represents an online installer for requirement
 *
 */
import {CommandType, Requirement} from "./Requirement.js";
import {Installer} from "./Installer.js";

import * as _os_ from "os";
import * as _path_ from "path";

import * as AdmZip from "adm-zip";
import * as _fs_ from "fs";

import {Executor, ExecutorIO} from "./Executor.js";
import Util from "../../Utils.js";
import Downloader from "../../Downloader.js";


export class PackageLocation {
  uri: string = null;
  location: string = null;
  compression: string = null;
}

export interface OsPackageLocation {
  [osName:string] :PackageLocation
}


export class PackageInstaller {

  parent:Requirement = null;

  // config
  sudo:boolean = false;
  requires: string[] = [];
  pkgName: string = null;
  relPath:string =null;
  dest:any = null;

  // ppts
  online:boolean = true;
  local:boolean = false;
  type:string = null;
  url:string = null;
  path:string = null;
  unpack:Function = null;
  success:boolean = false;
  log_err:string = null;
  log_out:string = null;

  // compression name
  _c:string = "";
  /**
   * Temporary folder
   */
  private _tmp:string;
  _exec:Executor;


  private _t:string = null;
  private _i:Installer = null;

  constructor(pConfig:any=null, pInstaller:Installer=null) {
    this._i = pInstaller;
  }

  addRequires(pRequires:string[]):void {
    this.requires = pRequires;
  }


  /**
   * To create and configure executor
   *
   * @param pConfig
   */
  initExecutor(pConfig:any=null):Executor {
    this._exec = new Executor(this.parent.name, pConfig);
    this._exec.setExternalLogger(this._i.__log);
    this._exec.setTempFolder(this._i.getTempFolder());
    return this._exec;
  }


  /**
   * To check if requirement of the package installer is satisfied
   *
   * As example, common requirement for Python package can be 'python' or 'pip3'
   *
   * @return {boolean}
   * @method
   */
  isRequirementsSatisfied():boolean {

    this._i.__log(`[INSTALLER::${this.parent.name}] Start to check online install requirements`);
    if(this.requires.length==0){

      this._i.__log(`[INSTALLER::${this.parent.name}] This installer has not requirements`);
      return true;
    }else{
      let f:boolean = true;
      this.requires.map( vReq => {
        this._i.__log(`[INSTALLER::${this.parent.name}] Start to check online install requirements = ${vReq}`);
        if(this._i.requires[vReq].getData('path')!=null)
          f = f && true;
        else
          f = f && this._i.requires[vReq].checkVersion().success
      });
      return f;
    }
  }

  /**
   * To download a remote ressource and optionnally decompress file
   *
   * @param {string} pUrl
   * @param {string}  pDest
   * @param {any} pOptions Compress,Method,Proxy
   * @param {Function} pCallback Optional. A method callback executed after download
   * @method
   * @async
   */
  async download( pUrl:string, pDest:string, pOptions:any, pCallback:any=null){
    try{
      this._i.__log("Downloading '"+pUrl+"' to '"+pDest+"'");
      const dest = await Downloader.download( pUrl, pDest, { mode:0o666, encoding: 'binary'} );
      pCallback.apply(null, dest);
    }catch(err){
      throw new Error("Download failed : "+err.message);
    }
  }

  /**
   *
   * @param pFile
   */
  async doDebOnlineInstall( pFile:string){
    if(_fs_.existsSync(pFile)){

      this._i.__log(`[INSTALLER::${this.parent.name}] The file [${this.url}] has been successfully downloaded into [${pFile}]`);

      if(this.unpack != null){
        this.unpack( pFile, pFile+'-ext' );

        if(this.relPath!=null){
          await this._exec.execAsync('installer -pkg '+_path_.join(pFile+'-ext',this.relPath)+' -target CurrentUserHomeDirectory');//+_path_.join(this._i.getWorkspace().getBinaryFolderLocation(),this.parent.name));
          this._i.__log(`[INSTALLER::${this.parent.name}] Files from [${pFile}] have been copied`);
          return true;
        }else{
          // CurrentUserHomeDirectory : mac only ?
          await this._exec.execAsync('installer -pkg '+pFile+'-ext -target CurrentUserHomeDirectory'); //+_path_.join(this._i.getWorkspace().getBinaryFolderLocation(),this.parent.name));
          this._i.__log(`[INSTALLER::${this.parent.name}] Files from [${pFile}] have been copied`);
          return true;
        }
      }else{
        await this._exec.execAsync('installer -pkg '+pFile+' -target /'); //+_path_.join(this._i.getWorkspace().getBinaryFolderLocation(),this.parent.name));
        this._i.__log(`[INSTALLER::${this.parent.name}] File [${pFile}] have been installed using system installer`);
        return  false;
      }
    }else{
      this._i.__log(`[INSTALLER::${this.parent.name}] The file [${this.url}] cannot be downloaded into [${pFile}]`);
      return false;
    }
  }

  async doUnpack(pSrcPath:string, pTempPath:string=null){
    let spath:string;

    if(this.unpack != null){

      this._tmp = (pTempPath!=null ? pTempPath : _path_.join( this._i.getTempFolder(), this.getTempName()+'-ext'))

      this.unpack( pSrcPath, this._tmp );
      this._i.__log(`[INSTALLER::${this.parent.name}] Data extracted from [${pSrcPath}] to [${this._tmp}]`);
      spath =  _path_.join.apply( null, [this._tmp].concat(this.relPath ? this.relPath : []));
    }else{
      spath = pSrcPath;
    }

    return spath;
  }

  /**
   * To install .deb package using system installer on Linux (debian-based ?)
   *
   * @param {string} pFile Path of package
   * @return {boolean} Return TRUE is installl is done (successfully or not)
   * @since 1.0.0
   */
  async doDebInstall( pFile:string){
    if(_fs_.existsSync(pFile)){
      await this._exec.execAsync('dpkg -i '+pFile);
      this._i.__log(`[INSTALLER::${this.parent.name}] Files from [${pFile}] have been processed by 'dpkg'`);
      return true;
    }else{
      this._i.__log(`[INSTALLER::${this.parent.name}] The file [${pFile}] cannot be installed by 'dpkg' : file not found`);
      return false;
    }
  }

  /**
   * To install .pkg package using system installer on Mac OS
   *
   * @param {string} pFile Path of package
   * @return {boolean} Return TRUE is installl is done (successfully or not)
   * @since 1.0.0
   */
  async doPkgInstall( pFile:string){
    if(_fs_.existsSync(pFile)){
      await this._exec.setFailTest((pErr:string)=>{
        return (pErr !== undefined && !Util.isEmpty(pErr, Util.FLAG_WS | Util.FLAG_CR));
      }).execAsync('installer -pkg '+pFile+' -target /');
      this._i.__log(`[INSTALLER::${this.parent.name}] File [${pFile}] have been installed using system installer "installer" `);
      return true;
    }else{
      this._i.__log(`[INSTALLER::${this.parent.name}] The file [${pFile}] cannot be installed by 'installer' : file not found`);
      return false;
    }
  }

  /**
   * To install python package using PIP installer
   *
   * @param {string} pFile Path of package
   * @return {boolean} Return TRUE is installl is done (successfully or not)
   * @since 1.0.0
   */
  async doPipInstall( pOffline:boolean, pFile:string=null ){

    if(!this.isRequirementsSatisfied())
      throw new Error(`[INSTALLER::${this.parent.name}][ERROR] Requirements are not satisfied : 'pip' not found`);

    this._exec.setFailTest((pErr:string)=>{
      return (pErr !== undefined
        && (typeof pErr === 'string')
        && (pErr.length > 0)
        && (pErr.indexOf('ERROR: ')>-1));
    });

    if(pOffline){
      if(_fs_.existsSync(pFile)){
        await this._exec.execAsync( this._i.requires.pip.getData('path')
          +' install '+this.pkgName
          +' --no-index --find-links '+pFile);

        this._i.__log(`[INSTALLER::${this.parent.name}] File [${pFile}] have been installed using Pip `);
        return true;
      }else{
        this._i.__log(`[INSTALLER::${this.parent.name}] The file [${pFile}] cannot be installed by 'pip' : file not found`);
        return false;
      }
    }else{
      await this._exec.execAsync( this._i.requires.pip.getData('path')+' install '+this.pkgName);
      return true;
    }

  }

  /**
   * To install python package using Python as installer (setup.py)
   *
   * @param {string} pFile Path of package
   * @return {boolean} Return TRUE is installl is done (successfully or not)
   * @since 1.0.0
   */
  async doPythonInstall( pFile:string){

    if(!this.isRequirementsSatisfied())
      throw new Error(`[INSTALLER::${this.parent.name}][ERROR] Requirements are not satisfied : 'python' not found`);

    if(_fs_.existsSync(pFile)){
      this._exec.addOption('cwd', _path_.dirname(pFile));
      await this._exec.setFailTest((pErr:string)=>{
        return (pErr !== undefined
          && (typeof pErr === 'string')
          && (pErr.length > 0)
          && (pErr.indexOf('ERROR: ')>-1));
      }).execAsync( this._i.requires.python.getData('path')+' '+pFile+' install');

      this._i.__log(`[INSTALLER::${this.parent.name}] File [${pFile}] have been installed using Python `);
      return true;
    }else{
      this._i.__log(`[INSTALLER::${this.parent.name}] The file [${pFile}] cannot be installed by 'python' : file not found`);
      return false;
    }
  }


  /**
   * To get temporary - timestamped - name
   *
   * @param {boolean} pForce
   */
  getTempName(pForce:boolean = false):string {
    if(this._t!=null && !pForce){
      return this._t;
    }

    return this._t = this.parent.name+'-'+Util.time();
  }

  getDestination():string {
    let p:string =  (this.dest.ws ? _path_.join( this._i.getWorkspace().getBinaryFolderLocation(), this.dest.path ) : this.dest.path);

    if(this.parent.hasVersionChecker()){
      if(this.parent.vchecker.cmd.type == CommandType.SIMPLE){
        const i = this.parent.vchecker.cmd.cmd.split(' ');
        if(_path_.basename(p)!=i[0]){
          p = _path_.join(p,i[0]);
        }
      }
    }
    return p;
  }

  /**
   *
   * @param pSrc
   */
  async unpackMove( pSrcPath:string, pTempPath:string = null ):Promise<boolean>{


    if(pSrcPath == null)
      throw new Error(`[INSTALLER::${this.parent.name}] Install aborted : no local path found`);

    if(!_fs_.existsSync(pSrcPath))
      throw new Error(`[INSTALLER::${this.parent.name}] Install aborted : file not found [${pSrcPath}]`);

    const dpath = (this.dest.ws ? _path_.join( this._i.getWorkspace().getBinaryFolderLocation(), this.dest.path ) : this.dest.path);
    const tpath = (pTempPath!=null ? pTempPath : _path_.join( this._i.getTempFolder(), this.getTempName()+'-ext'))
    let spath:string = null, s:boolean = false;

    if(this.unpack != null){
      this.unpack( pSrcPath, tpath );
      this._i.__log(`[INSTALLER::${this.parent.name}] Data extracted from [${pSrcPath}] to [${tpath}]`);
      spath =  _path_.join.apply( null, [tpath].concat(this.relPath ? this.relPath : []));
    }else{
      spath = pSrcPath;
    }

    if(this.dest!=null){
      if(this.dest.url==null){


        this._i.__log(`[INSTALLER::${this.parent.name}] Copying [${spath}] to [${dpath}] (#1)`);

        Util.recursiveCpDirSync(spath, dpath, (vDestFile)=>{
          _fs_.chmodSync(vDestFile, this.dest.attr);
        });
      }else{
        /// useless ?
        this._i.__log(`[INSTALLER::${this.parent.name}] Copying [${spath}] to [${this.dest.url}] (#2)`);
        Util.recursiveCpDirSync(tpath, dpath, (vDestFile)=>{
          _fs_.chmodSync(vDestFile, this.dest.attr);
        });
      }

      this._i.__log(`[INSTALLER::${this.parent.name}] Files from [${spath}] have been copied`);

      s = true;
    }

    return s;

  }

  async onlineInstall(pOptions:any):Promise<boolean> {

    let target:string;
    let s:boolean = false;


    this._i.__log(`[INSTALLER::${this.parent.name}] Start online install : type=[${this.type}]`);

    try{
      switch(this.type){
        case "pkg":
          target = _path_.join( this._i.getWorkspace().getTempFolderLocation(), this.parent.name+'-'+Util.time()+'.pkg'+this._c);
          await this.download(  this.url, target, pOptions, null);
          s = await this.doPkgInstall( await this.doUnpack( target));
          break;
        case "deb":
          target = _path_.join( this._i.getWorkspace().getTempFolderLocation(), this.parent.name+'-'+Util.time()+'.deb'+this._c);
          await this.download(  this.url, target, pOptions, null);
          s = await this.doDebInstall( await this.doUnpack( target));
          break;
        case "exe":
          // TODO
          break;
        case "pip":
          s = await this.doPipInstall(false );
          break;
        case "python":
          target = _path_.join( this._i.getWorkspace().getTempFolderLocation(), this.parent.name+'-'+Util.time()+this._c);
          await this.download(  this.url, target, pOptions, null);
          s = await this.doPythonInstall( await this.doUnpack( this.path));
          break;
        case "move":
          // "move" is the simpliest type of installer : it copy files from package to another location
          // such as Dexcalibur's workspace
          s = await this.unpackMove( this.path);

          if(s){
            //let p:string[]=[];
            /*if(this.parent.vchecker.dir==="ws") p.push(this._i.getWorkspace().getLocation());
            if(this.parent.vchecker.rel!==null)
              p = p.concat(this.parent.vchecker.rel);
            else
              p = p.concat(this.getDestination());*/


            this._i.__log(`[INSTALLER::${this.parent.name}] Online install : type=[${this.type}] path : ${this.getDestination()}`);

            this.parent.setData('path', this.getDestination()); //_path_.join.apply(null, p));
          }

          break;
        case "dl":
          // "dl" is the online version of offline "move" installer.
          // It downloads, optionally unzip,  and copy files
          target = _path_.join( this._i.getWorkspace().getTempFolderLocation(), this.parent.name+'-'+Util.time()+this._c);
          await this.download(  this.url, target, pOptions);
          s = await this.unpackMove( target);


          if(s){
            /*let p:string[]=[];
            if(this.parent.vchecker.dir==="ws") p.push(this._i.getWorkspace().getLocation());
            if(this.parent.vchecker.rel!==null)
              p = p.concat(this.parent.vchecker.rel);
            else
              p = p.concat(this.getDestination());

            this.parent.setData('path', _path_.join.apply(null, p));*/


            this._i.__log(`[INSTALLER::${this.parent.name}] Online install : type=[${this.type}] path : ${this.getDestination()}`);

            this.parent.setData('path', this.getDestination()); //_path_.join.apply(null, p));
          }
          break;
        default:
          throw new Error(`[INSTALLER::${this.parent.name}][FAIL] There is not installer configured`);
          break;
      }
    }catch(err){
      this._i.__log(`[INSTALLER::${this.parent.name}][EXCEPTION] ${err.message}`);
      s = false;
    }

    if(!s){
      this._i.__log(`[INSTALLER::${this.parent.name}][FAIL] Package installation failed`);
      s = false
    }else if(this.parent.silent==false ){
        if(this.parent.checkVersion().success){
          this._i.__log(`[INSTALLER::${this.parent.name}][SUCCESS] Package has been successfully installed`);
        }else {
          this._i.__log(`[INSTALLER::${this.parent.name}][FAIL] Post-install check failed`);
          s = false;
        }
    }else {
      this._i.__log(`[INSTALLER::${this.parent.name}][SUCCESS] Package has been successfully installed`);
    }

    return s;
  }

  /**
   *
   * Options can be proxy settings
   *
   * @param pOptions
   */
  async install( pOptions:any = {}):Promise<boolean> {

    if(this.online){
      return await this.onlineInstall(pOptions);
    }

    let s:boolean = false;

    // offline install
    try{
      switch(this.type){
        case "pkg":
          s = await this.doPkgInstall( await this.doUnpack( this.path));
          break;
        case "deb":
          s = await this.doDebInstall( await this.doUnpack( this.path));
          break;
        case "exe":
          // TODO
          break;
        case "pip":
          s = await this.doPipInstall( true, await this.doUnpack( this.path));
          break;
        case "python":
          s = await this.doPythonInstall( await this.doUnpack( this.path));
          break;
        case "move":
          // "move" is the simpliest type of installer : it copy files from package to Dexcalibur's workspace
          s = await this.unpackMove( this.path);

          if(s){
            /*let p:string[]=[];

            if(this.dest.location==="ws")
              p.push(this._i.getWorkspace().getLocation());

            if(this.dest.rel!==null)
              p = p.concat(this.parent.vchecker.rel);
            else
              p = p.concat(this.getDestination());*/


            this._i.__log(`[INSTALLER::${this.parent.name}] Offline install : type=[${this.type}] path : ${this.getDestination()}`);

            this.parent.setData('path', this.getDestination()); //_path_.join.apply(null, p));

            //this.parent.setData('path', _path_.join.apply(null, p));
          }
          break;
        default:
          throw new Error(`[INSTALLER::${this.parent.name}][FAIL] There is not installer configured`);
          break;
      }
    }catch(err){
      this._i.__log(`[INSTALLER::${this.parent.name}][EXCEPTION] ${err.message}`);
      s = false;
    }

    if(s){
      if(this.parent.hasVersionChecker()){
        if(this.parent.checkVersion().success){
          this._i.__log(`[INSTALLER::${this.parent.name}][SUCCESS] Package has been successfully installed`);
          s = true;
        }else{
          this._i.__log(`[INSTALLER::${this.parent.name}][FAIL] Package has been successfully installed but version is still invalid.`);
          s = false
        }
      }else{
        this._i.__log(`[INSTALLER::${this.parent.name}][SUCCESS] Package has been successfully installed`);
        s = true;
      }
    }else{
      this._i.__log(`[INSTALLER::${this.parent.name}][FAIL] Package installation failed`);
      s = false
    }

    return s;
  }
}


/**
 * @class
 */
export class PackageInstallerFactory {


  private _i:Installer = null;

  private decompressor:any = {};

  constructor(pInstaller:Installer=null) {
    this._i = pInstaller;
    this.decompressor = {
      zip: function(pInput:string, pOutdir:string):void {
        let zip:any = (AdmZip.default)(pInput);
        zip.extractAllTo(pOutdir, /*overwrite*/true);
      }
    }
  }

  newInstaller(pRequirement:Requirement, pConfig:any, pOnline:boolean):PackageInstaller {

    if(pConfig[_os_.platform()] == null){

      this._i.__log(`[INSTALLER FACTORY][ERROR] There is not installer configuration for current platform [${_os_.platform()}]`);
      return null;
    }
    const cfg = pConfig[_os_.platform()];
    let inst:PackageInstaller = new PackageInstaller(cfg, this._i)

    inst.parent = pRequirement;
    inst.online = pOnline;
    inst.addRequires(pConfig.hasOwnProperty("require") ? pConfig.require : []);

    for(let opt in cfg){
      switch(opt){
        case "installer":
          inst.type = cfg.installer;
          break;
        case "sudo":
          inst.sudo = (cfg.sudo===true);
          break;
        case "src":
          break;
        case "uri":
          if(/^https?:\/\//.test(cfg.uri)){
            inst.url = cfg.uri;
          }
          else if(cfg.location!=null){
            inst.local = true;
            switch(cfg.location){
              case "contents":
                inst.path = _path_.join(_path_.dirname(this._i.getAppPath()), cfg.uri);
                this._i.__log(inst.path);
                break;
              case "thirdparty":
                //inst.path = _path_.join(_path_.dirname(this._i.getAppPath()), "thirdparty", cfg.uri);
                inst.path = _path_.join(this._i.thirdpartsPath, cfg.uri);
                this._i.__log(inst.path);
                break;
            }
          }
          else if(/^file:\/\//.test(cfg.uri)){
            inst.local = true;
            inst.url = cfg.uri;
          }
          break;
        case "dest":
          inst.dest = {};

          if(Array.isArray(cfg.dest.uri)){
              inst.dest.path = _path_.join.apply(null,cfg.dest.uri);
          }else{
            if(/^file:\/\//.test(cfg.dest.uri)){
              // dest.uri
              inst.dest.uri = cfg.dest.uri;
            }else{
              inst.dest.path = cfg.dest.uri;
            }

            //inst.dest.path = cfg.dest.uri;
          }

          if(cfg.dest.attr)
            inst.dest.attr = parseInt( cfg.dest.attr, 8);
          else
            inst.dest.attr = 0o666;

          if(cfg.dest.location!=null){
            switch(cfg.dest.location){
              case "ws":
                inst.dest.ws = true;
                break;
            }
          }

          if(cfg.dest.overwrite!=undefined) inst.dest.overwrite = cfg.dest.overwrite;
          break;
        case "compression":
          inst._c = "."+cfg.compression;
          switch(cfg.compression){
            case "zip":
              inst.unpack = this.decompressor.zip;
              break;
          }
          break;
        case "pkgName":
        case "relPath":
          inst[opt] = cfg[opt];
          break;
      }
    }


    inst.initExecutor({
      _sudo: inst.sudo,
      icon: this._i.getIconPath()
    }).log(ExecutorIO.OUT|ExecutorIO.ERR);

    this._i.__log(`[INSTALLER FACTORY][NEW] A new ${inst.online?'ONLINE':'OFFLINE'} installer has been created for [${inst.parent.name}]`);

    if(inst.type==null && inst.online==false){
      if(inst.dest != null){
        inst.type = "move";
      }else{
       this._i.__log("[INSTALLER FACTORY] Invalid installer type detected")
      }
    }

    return inst;
  }
}
