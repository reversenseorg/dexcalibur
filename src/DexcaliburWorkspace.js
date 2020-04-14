const _fs_ = require('fs');
const _path_ = require('path');


const FILENAME_CONFIG = 'config.json';
const FILENAME_OLDCONFIG = 'config.backup.json';
const FILENAME_TESTCONFIG = 'config.test.json';



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
class DexcaliburWorkspace
{
    constructor(pPath){
        this.path = pPath;

        this.dxcFolder = null;
        this.binFolder = null;
        this.apiFolder = null;
        this.cfgFolder = null;
        this.devFolder = null;
        this.tmpFolder = null;

        this.configPath = null;
        this.oldconfigPath = null;
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

    static mkdirIfNotExists( pPath ){
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
    }

    /**
     * To get location of Dexcalibur's workspace 
     * 
     * @returns {String} Path of Dexcalibur workspace
     */
    getLocation(){
        return this.path;
    }

    /**
     * To save Configuration instance into workspace, and to 
     * create a copy of the current configuration
     * @param {Configuration} pNewConfiguration 
     */
    saveConfiguration( pNewConfiguration){
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

    readConfigurationFile(){
        return JSON.parse( _fs_.readFileSync( this.configPath));
    }

    readConfigurationBackupFile(){
        return JSON.parse( _fs_.readFileSync( this.oldconfigPath));
    }

    /**
     * To get the path of the configuration file into the workspace
     * 
     * @returns {String} Path of the configuration file
     * @method 
     */
    getConfigurationLocation(){
        return _path_.join( this.cfgFolder, FILENAME_CONFIG);
    }

    /**
     * To get a list of existing project into the workspace
     * 
     * @returns {String[]} Array of project names
     * @method
     */
    listProjects(){
        let projects = [];
        let dirs =  _fs_.readdirSync(this.path);

        dirs.map(function(x){
            if(x !== '.dxc')
                projects.push(x);
        });

        return projects;
    }
}

module.exports = DexcaliburWorkspace;