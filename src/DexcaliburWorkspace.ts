import * as _fs_ from 'fs';
import * as _path_ from 'path';
import Util from "./Utils";


const FILENAME_CONFIG = 'config.json';
const FILENAME_OLDCONFIG = 'config.backup.json';
const FILENAME_TESTCONFIG = 'config.test.json';

let gWorkspaceInstance:DexcaliburWorkspace = null;

/**
 * 
 * ~/.dexcalibur/
 * 
 * <DexcaliburWorkspace>/
 *      .dxc/
 *          cfg/
 *              config.json
 *              config.backup.json
 *          bin/
 *              apktool.jar
 *              adb
 *              ...
 *          apis/
 *              android_24/
 *                  ...
 *              custom/
 *      <ProjectA_Workspace>/
 *          dex/
 *          save/
 *          runtime/
 *          appdata/
 *          ...
 *      <ProjectB_Workspace>/
 *      ...
 *      <ProjectX_Workspace>/
 *          
 */
export default class DexcaliburWorkspace
{
    path:string;
    dxcFolder:string = null;
    binFolder:string = null;
    apiFolder:string = null;
    cfgFolder:string = null;
    devFolder:string = null;
    tmpFolder:string = null;
    pluginsFolder:string = null;
    configPath:string = null;
    oldconfigPath:string = null;

    constructor(pPath:string){
        this.path = pPath;

        this.dxcFolder = null;
        this.binFolder = null;
        this.apiFolder = null;
        this.cfgFolder = null;
        this.devFolder = null;
        this.tmpFolder = null;
        this.pluginsFolder = null;

        this.configPath = null;
        this.oldconfigPath = null;
    }
    
    static clearInstance(){
        gWorkspaceInstance = null;
    }
    
    /**
     *
     *
     * @param {string} pPath Workspace location
     * @param {boolean} pOverride If TRUE a new object is instanced. Else not
     * @return {DexcaliburWorkspace} Workspace object
     * @method
     *
     */
    static getInstance( pPath:string = null, pOverride:boolean=false):DexcaliburWorkspace{
        if(gWorkspaceInstance == null || pOverride==true){
            gWorkspaceInstance = new DexcaliburWorkspace(pPath);
        }

        return gWorkspaceInstance;
    }


    // TODO
   /* static isWorkspacePath( pPath){
        // if path is valid, verify if ot contains a valid workspace
        if(_fs_.existsSync(pPath) == true){
            if( _fs_.existsSync( _path_.joinpPath) )
        }
        // else throw 'not found'
        else{
            return { valid:false, msg:'Invalid path, this folder already exists.' };
        }
    }*/

    static mkdirIfNotExists( pPath:string ){
        if( ! _fs_.existsSync( pPath))
            _fs_.mkdirSync( pPath);
    }

    /**
     * To intialize Dexcalibur workspace by creating .dxc/* directories
     */
    init(){
        this.dxcFolder = _path_.join( this.path, '.dxc'); 
        this.binFolder = _path_.join( this.dxcFolder, 'bin');
        this.apiFolder = _path_.join( this.dxcFolder, 'api');
        this.cfgFolder = _path_.join( this.dxcFolder, 'cfg');
        this.devFolder = _path_.join( this.dxcFolder, 'dev');
        this.pluginsFolder = _path_.join( this.dxcFolder, 'plugins');
        this.tmpFolder = _path_.join( this.dxcFolder, 'tmp');

        // config
        this.configPath = _path_.join( this.cfgFolder, FILENAME_CONFIG);
        this.oldconfigPath = _path_.join( this.cfgFolder, FILENAME_OLDCONFIG);

        DexcaliburWorkspace.mkdirIfNotExists(this.dxcFolder);
        DexcaliburWorkspace.mkdirIfNotExists(this.binFolder);
        DexcaliburWorkspace.mkdirIfNotExists(this.apiFolder);
        DexcaliburWorkspace.mkdirIfNotExists(this.cfgFolder);
        DexcaliburWorkspace.mkdirIfNotExists(this.devFolder);
        DexcaliburWorkspace.mkdirIfNotExists(this.tmpFolder);
        DexcaliburWorkspace.mkdirIfNotExists(this.pluginsFolder);
    }

    /**
     * To get location of Dexcalibur's workspace 
     * 
     * @returns {String} Path of Dexcalibur workspace
     */
    getLocation():string{
        return this.path;
    }

    /**
     * To save Configuration instance into workspace, and to 
     * create a copy of the current configuration
     * @param {Configuration} pNewConfiguration 
     */
    saveConfiguration( pNewConfiguration:any){
        // remove old configuration
        if(_fs_.existsSync( this.oldconfigPath )){
            _fs_.unlinkSync( this.oldconfigPath);
        }
        // backup current configuration
        if(_fs_.existsSync( this.configPath )){
            // copy existing
            _fs_.copyFileSync( this.configPath, this.oldconfigPath);
            // remove current
            _fs_.unlinkSync( this.configPath);

        }

        // export new to current
        if(process.env.DEXCALIBUR_TEST)
            pNewConfiguration.exportTo( _path_.join( this.cfgFolder, FILENAME_TESTCONFIG) );
        else
            pNewConfiguration.exportTo( this.configPath );
    }

    readConfigurationFile():any{
        return JSON.parse( _fs_.readFileSync( this.configPath).toString("ascii"));
    }

    readConfigurationBackupFile():any{
        return JSON.parse( _fs_.readFileSync( this.oldconfigPath).toString("ascii"));
    }

    /**
     * To get the path of the configuration file into the workspace
     * 
     * @returns {String} Path of the configuration file
     * @method 
     */
    getConfigurationLocation():string{
        return _path_.join( this.cfgFolder, FILENAME_CONFIG);
    }


    /**
     * 
     */
    getPluginsFolderLocation():string{
        return this.pluginsFolder;
    }

    /**
     * To get the path of the device manager folder into the workspace
     * 
     * @returns {String} Path of the folder
     * @method 
     */
    getDeviceFolderLocation():string{
        return this.devFolder;
    }

    /**
     * To get the path of the folder containing external tools/binaries
     * 
     * @returns {String} Path of the folder
     * @method 
     */
    getBinaryFolderLocation():string{
        return this.binFolder;
    }

    /**
     * To get the path of the folder containing platform details
     * 
     * @returns {String} Path of the folder
     * @method 
     */
    getPlatformFolderLocation():string{
        return this.apiFolder;
    }

    /**
     * To get the path of the temporary folder containing
     * 
     * @returns {String} Path of the folder
     * @method 
     */
    getTempFolderLocation():string{
        return this.tmpFolder;
    }


    /**
     * To create a temporary file into dxc workspace temp folder.
     *
     * @param {string} pPrefix (Optional) A prefix of the filename. It can helps to sort/flush files
     * @param {boolean} pTouch (Optional) Default FALSE. If TRUE, the file is touched, it prevents conflicts.
     * @return {string} Path of the temporary file
     * @method
     * @since 1.0.0
     */
    createTempFile(pPrefix:string='', pTouch:boolean=false):string {
        let fpath:string = null;
        do{
            fpath = _path_.join(this.tmpFolder, pPrefix+Util.randString(16, Util.ALPHANUM));
        }while(_fs_.existsSync(fpath));

        if(pTouch){
            try {
                const t = new Date();
                _fs_.utimesSync(fpath, t, t);
            } catch (err) {
                _fs_.closeSync(_fs_.openSync(fpath, 'w'));
            }
        }
        return fpath;
    }

    /**
     * To get a list of existing project into the workspace
     * 
     * @returns {String[]} Array of project names
     * @method
     */
    listProjects():string[]{
        let projects:string[] = [];
        let dirs:string[] =  _fs_.readdirSync(this.path);

        dirs.map(function(x:string){
            if(x !== '.dxc')
                projects.push(x);
        });

        return projects;
    }
}
