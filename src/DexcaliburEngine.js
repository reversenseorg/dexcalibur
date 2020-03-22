const _fs_ = require('fs');
const _path_ = require('path');
const _os_ = require("os");


var Logger = require("./Logger.js")();

const Configuration = require("./Configuration.js");
const DexcaliburWorkspace = require("./DexcaliburWorkspace");


const DEXCALIBUR_CONFIG = {
    DEBUG: false,
    TEST: false
};

/**
 * 
 * Boot :
 *  - Read /home/ * /.dexcalibur/config.json
 *  - If 'installed' flag is FALSE, then turn into install mode and start 
 *  - Else, import Configuration,
 *  - Init DexcaliburWorkspace  
 *  - Start Dexcalibur
 *  - When the user selects or creates a project from SplashScreen, corresponding 
 *  Project are loaded / created
 */
class DexcaliburEngine
{
    constructor(){
        /**
         * Global configuration of Dexcalibur
         * @field
         */
        this.config = null;

        /**
         * Workspace of Dexcalibur. 
         * By default, this workspace contains all project workspaces.
         * 
         * @field
         */
        this.ws = null;
    }
    

    /**
     * To detect if Dexcalibur has been installed by NPM
     */
    static isNPMsetup(){
        return _fs_.existsSync( _path_.join( _os_.homedir(), '.dexcalibur'));
    }
    
    /**
     * To load bootstrap file or configuration from home
     * 
     * @returns {Boolean} TRUE if ready to start, FALSE if install is required.
     */
    boot( pRestore=false){
        let conf = null, data=null;
        
        conf = _path_.join( 
            _os_.homedir(), 
            '.dexcalibur',  
            (pRestore ? 'config.backup.json' : 'config.json'));

        // detect config
        if(_fs_.existsSync(conf) == false){
            // error
            console.error('[ERROR] Configuration file not found into :'+conf);
            console.error('Aborted :(');
            process.exit();
        }

        // init config
        this.config = new Configuration();
        
        // read configuration file 
        data = JSON.parse(_fs_.readFileSync(conf));

        // Start Dexcalibur
        if(data.installed == true){
            this.config.import( data, true, true);
            this.ws = new DexcaliburWorkspace( this.config.getWorkspaceDir() );
            
            return true;
        }

        // Turn into install mode
        return false;
    }

    /**
     * 
     * @param {String} pConfigurationPath 
     * @method
     */
    init( pConfigurationPath){
        if( _fs_.existsSync(pConfigurationPath)){
            this.config = new Configuration();

        }else{
            Logger.error(`Dexcalibur configuration file [ ${pConfigurationPath} ] not found.`);
            return false;
        }
    }
}

module.exports = DexcaliburEngine;

