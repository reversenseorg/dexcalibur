
import * as _path_ from 'path';
import * as _fs_ from 'fs';


import APK from "./APK.js";

import * as Log from './Logger.js';
import {Stub, STUB_TYPE} from "./ModelSavable.js";
import {RuntimeSecurityException} from "./errors/RuntimeSecurityException.js";
import HookWorkspace from "./hook/HookWorkspace.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;


const DIR_NAME = {
    SAVE: "save",
    IN: "inputs",
    AUDIT: "audit",
    RUNTIME: "runtime",
    RUNTIME_FILES: _path_.join("runtime","files"),
    RUNTIME_BC: _path_.join("runtime","bytecode"),
    LOGS: "logs",
    APPDATA: "appdata",
    TMP: "tmp",
    DEXES: "dexes",
    DEX: "apk", //"dex"
    HKWS: "hooks"
};

/**
 * Represents a project workspace. 
 * 
 * Dexcalibur glabal workspace contains one sub-workspace per project
 * 
 * It is used when the tool 
 * wants access/read/write files or folder. 
 *  
 * @param {string} pkg The application package name
 * @param {Object} config The  
 * @class 
 */
export default class ProjectWorkspace
{
    path:string = null;
    mainAPK:APK = null;
    hookWS:HookWorkspace = null;

    /**
     * 
     * @param {*} pPath 
     * @constructor
     */
    constructor ( pPath:string){

        /**
         * Working directory
         * @field
         */
        this.path = pPath;

        /**
         * @type {APK}
         * @field
         */
        this.mainAPK = new APK(
            _path_.join(this.path, 'app.apk')
        );
    }
    
    /**
     * To export a Workspace instance to a Stub.
     * It is used when Dexcalibur prepare the data to be save in a flat file.
     * @returns {Stub} The Stub containing the Workspace instance data.
     * @deprecated
     * @method
     */
    _export():any{
        // REMOVED
    }

    /**
     * To import the given Stub instance into the current Workspace.
     * It is used when Dexcalibur want create a context from a save file.
     * @param {Stub} stub The Stub instance to import
     * @deprecated
     * @method
     */
    _import(stub:any){
        for(const i in stub){
            if(this[i] !== undefined) this[i] = stub[i];
        }
    }

    /**
     * To create a directory into the application working directory.
     * @param {string} dirName The name of the directory to create
     * @method
     */
    mkWDir(pDirName:string){
        _fs_.mkdirSync(_path_.join(this.path, pDirName), {recursive: true});
    }

    /**
     * To remove the directory with the given name from the application working directory.
     * @param {string} dirName The name of the directory to remove 
     * @method
     */
    rmWDir(dirName:string, pAbsolutePath=false){
        if(pAbsolutePath == false){
            dirName = _path_.join( this.path, dirName);
        }

        if(_fs_.existsSync(dirName)){
            _fs_.readdirSync(dirName).forEach((file,i)=>{
                const p:string = _path_.join(dirName,file);
                if(_fs_.lstatSync(p).isDirectory()){
                    this.rmWDir(p, true);
                }else{
                    _fs_.unlinkSync(p);
                }
            });
            _fs_.rmdirSync(dirName);
        }
    }


    /**
     * To verifry if the given path is writable. 
     * Its use absolute path.
     * @param {string} path Absolute file path to check
     * @returns {boolean} Returns TRUE if the file is writable, else FALSE
     * @method
     */
    isWritable(pPath:string){
        return _fs_.accessSync(pPath, _fs_.constants.F_OK | _fs_.constants.W_OK);
    }

    /**
     * To get the Application working directory
     * @returns {string} The Application worksing directory path
     * @method
     * @deprecated
     */
    getWD():string{
        return this.path;
    }

    /**
     * To get the Application working directory
     * @returns {string} The Application worksing directory path
     * @method
     */
    getPath():string{
        return this.path;
    }

    /**
     * To get Project 's DB opath
     *
     * @method
     */
    getDbPath():string {
        return _path_.join(this.getPath(), "project.db");
    }

    /*
     * To remove the current Application working directory
     * @returns {void} 
     * @function
     */
    /*
    clean(){
        this.rmWDir(this.getWD(), true);
        Logger.success("[*] Working directory removed : "+this.getWD());
    }*/

    /**
     * To initialize a new Application working directory. 
     * It creates a main folder and nested folders. 
     * If a folder already exists it will not be overwritten.
     * @method 
     */
    init(){
        if(!_fs_.existsSync(this.path)){
            _fs_.mkdirSync(this.path, {recursive: true});
        }    
        if(!_fs_.existsSync(_path_.join(this.path, DIR_NAME.SAVE))){
            this.mkWDir(DIR_NAME.SAVE);
        }    
        if(!_fs_.existsSync(_path_.join(this.path, DIR_NAME.IN))){
            this.mkWDir(DIR_NAME.IN);
        }    
        if(!_fs_.existsSync(_path_.join(this.path, DIR_NAME.RUNTIME))){
            this.mkWDir(DIR_NAME.RUNTIME);
        }
        if(!_fs_.existsSync(_path_.join(this.path, DIR_NAME.RUNTIME_BC))){
            this.mkWDir(DIR_NAME.RUNTIME_BC);
        }
        if(!_fs_.existsSync(_path_.join(this.path, DIR_NAME.RUNTIME_FILES))){
            this.mkWDir(DIR_NAME.RUNTIME_FILES);
        }
        if(!_fs_.existsSync(_path_.join(this.path, DIR_NAME.APPDATA))){
            this.mkWDir(DIR_NAME.APPDATA);
        }
        if(!_fs_.existsSync(_path_.join(this.path, DIR_NAME.TMP))){
            this.mkWDir(DIR_NAME.TMP);
        }
        if(!_fs_.existsSync(_path_.join(this.path, DIR_NAME.DEX))){
            this.mkWDir(DIR_NAME.DEX);
        }
        if(!_fs_.existsSync(_path_.join(this.path, DIR_NAME.HKWS))){
            this.mkWDir(DIR_NAME.HKWS);
        }
        if(!_fs_.existsSync(_path_.join(this.path, DIR_NAME.AUDIT))){
            this.mkWDir(DIR_NAME.AUDIT);
        }

        this.hookWS = new HookWorkspace({
            _base:_path_.join(this.path, DIR_NAME.HKWS),
            _ws:this
        });
        this.hookWS.init();

        Logger.success("[*] Working directory : "+this.path);
    }

    /**
     * To generate a new timestamped save file path
     * @returns {string} The timestamped save file path
     * @method
     */
    getNewSavefilePath():string{
        return _path_.join(this.path, DIR_NAME.SAVE, "autosave."+(new Date()).getTime()+".ddb");
    }


    getSaveDir():string{
        return _path_.join(this.path, DIR_NAME.SAVE);
    }

    getAppdataDir():string{
        return _path_.join(this.path, DIR_NAME.APPDATA);
    }

    /**
     * To get the path of audit folder where assurance model and audit report are stored
     *
     * @return {string} Audit directory path
     * @method
     */
    getAuditDir():string{
        return _path_.join(this.path, DIR_NAME.AUDIT);
    }

    getInputDir():string{
        return _path_.join(this.path, DIR_NAME.IN);
    }

    getRuntimeDir():string{
        return _path_.join(this.path, DIR_NAME.RUNTIME);
    }

    getRuntimeFilesDir():string{
        return _path_.join(this.path, DIR_NAME.RUNTIME_FILES);
    }

    getRuntimeBcDir():string{
        return _path_.join(this.path, DIR_NAME.RUNTIME_BC);
    }

    getTmpDir():string{
        return _path_.join(this.path, DIR_NAME.TMP);
    }


    /**
     * @method
     */
    getProjectCfgPath():string{
        return _path_.join(this.path, 'project.json');
    }
    
    getApkDir():string{

        return _path_.join(this.path, DIR_NAME.DEX);
    }

    getApkPath():string{
        return this.mainAPK.getPath();
    }

    getApk():APK{
        return this.mainAPK;
    }

    setApk( pApk:APK){
        this.mainAPK = pApk; //APK.fromJsonObject( Workspace.getMainApkPath(), pData); 
    }


    changeMainAPK( pPath:string){
        _fs_.copyFileSync( pPath, this.getApkPath());
        this.mainAPK = new APK( this.getApkPath());
    }

    getHookWorkspace():HookWorkspace {
        return this.hookWS;
    }

    /**
     * To generate a new timestamped file path
     * @param {string} prefix The string part before the timestamp
     * @param {string} suffix The string part after the timestamp
     * @returns {string} The timestamped save file path
     * @method
     */
    getTimestampedFilePath(prefix:string,suffix:string):string{
        return _path_.join(this.path,DIR_NAME.SAVE,prefix+(new Date()).getTime()+suffix);
    }

    /**
     * To join a path relative to project workspace root directory
     *
     * @param pRelPath
     * @return {string}
     */
    join( pRelPath:string ):string {
        const unsafe = _path_.join(this.getPath(), pRelPath);
        if(unsafe.indexOf(this.getPath())!=0){
            throw RuntimeSecurityException.PATH_TRAVERSAL_IS_FORBIDDEN();
        }

        return unsafe;
    }

}

