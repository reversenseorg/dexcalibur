const _fs_ = require('fs');
const _path_ = require('path');


const FILENAME_CONFIG = 'config.json';
const FILENAME_OLDCONFIG = 'config.backup.json';
const FILENAME_TESTCONFIG = 'config.test.json';


/**
 * 
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

        this.configPath = null;
        this.oldconfigPath = null;
    }

    static mkdirIfNotExists( pPath ){
        if( ! _fs_.existsSync( pPath))
            _fs_.mkdirSync( pPath);
    }

    /**
     * To intiialize Dexcalibur workspace by creating .dxc/* directories
     */
    init(){
        this.dxcFolder = Path.join( this.path, '.dxc'); 
        this.binFolder = Path.join( this.dxcFolder, 'bin');
        this.apiFolder = Path.join( this.dxcFolder, 'api');
        this.cfgFolder = Path.join( this.dxcFolder, 'cfg');
        this.devFolder = Path.join( this.dxcFolder, 'dev');

        // config
        this.configPath = Path.join( this.cfgFolder, FILENAME_CONFIG);
        this.oldconfigPath = Path.join( this.cfgFolder, FILENAME_OLDCONFIG);


        DexcaliburWorkspace.mkdirIfNotExists(this.dxcFolder);
        DexcaliburWorkspace.mkdirIfNotExists(this.binFolder);
        DexcaliburWorkspace.mkdirIfNotExists(this.apiFolder);
        DexcaliburWorkspace.mkdirIfNotExists(this.cfgFolder);
        DexcaliburWorkspace.mkdirIfNotExists(this.devFolder);
    }

    /**
     * 
     * @param {Configuration} pNewConfiguration 
     */
    saveConfiguration( pNewConfiguration){
        // remove old configuration
        if(_fs_.existsSync( this.oldconfigPath )){
            _fs_.unlinkSync( this.oldconfigPath);
        }
        // backup current configuration
        _fs_.copyFileSync( this.configPath, this.oldconfigPath);

        // remove current
        _fs_.unlinkSync( this.configPath);

        // export new to current
        pNewConfiguration.exportTo( Path.join( this.cfgFolder, FILENAME_TESTCONFIG) );
    }
}

module.exports = DexcaliburWorkspace;