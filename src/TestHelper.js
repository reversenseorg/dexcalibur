
/**
 * Test helper
 */
const _path_ = require("path");
const _process_ = require("process");
const _http_ = require("http");


const Configuration = require("./Configuration.js");
const DexcaliburWorkspace = require('./DexcaliburWorkspace');
const DexcaliburEngine = require('./DexcaliburEngine');


/**
 * Unit test utility class
 * 
 * Help to:
 * - generate a valid Configuration instance into test/* folder
 * - allow to send request to test web server front controller
 * 
 * Test Helper configuration 
 * 
 * @class
 */
class TestHelper
{
    constructor(){
        this.app = null;
        this.testCfg = require( _path_.join( __dirname, "../test/test_configuration.js") );
        this.config = null;
        this.engine = null;
        this.interceptors = {
            exec: []
        };
    }

    /**
     * To verify if a NodeJS module is loaded or not by its name
     * 
     * @param {String} pModuleName Module name
     * @returns {Boolean} TRUE is the module is loaded, else FALSE
     * @method
     */
    checkIfModuleIsLoaded( pModuleName){
        let loaded= Object.keys(require('module')._cache);
        let pattern = '/node_modules/'+pModuleName+'/';

        for(let i=0; i<loaded.length; i++){
            if(loaded[i].indexOf(pattern)>-1)
                return true;
        }

        return false;
    }
    /**
     * To set the web server instance
     * @param {require('express').Application} pInstance Web server instance  
     * @method
     */
    setWebServerInstance( pInstance){
        this.app = pInstance;
    }


    newConfiguration(){
        this.config = new Configuration();
        this.config.import(require(_path_.join( __dirname, this.testCfg.configuration)));
        this.config.workspacePath = _path_.join( __dirname, '../test/workspace/');
        return this.config;
    } 

    getConfiguration(){
        return this.config;
    }

    getConfigurationPath(){
        // return this.testCfg.configuration;
        return _path_.join( __dirname, this.testCfg.configuration);
    }

    interceptExec( pInterceptor, pReturn){
        if( this.interceptors.exec == null) this.interceptors.exec = [];
        this.interceptors.exec.push({ test:pInterceptor, ret:pReturn });
    }

    filterInterceptor( pType, pInput){
        for(let i=0; i<this.interceptors[pType].length; i++){
            if(this.interceptors[pType][i].test(pInput)){
                return {success:true, ret: this.interceptors[pType][i].ret};
            }
        }

        return {success:false };
    }

    clearInterceptors(){
        this.interceptors = {};
    }

    /**
     * To mock conditionnaly Process.execSync()
     * 
     * @param {*} pCmd 
     */
    execSync( pCmd){
        let res = this.filterInterceptor( "exec", pCmd);
        if(res.success){
            return res.ret;
        }else{
            return _process_.execSync( pCmd);
        }
    }

    /**
     * 
     * @param {String} pMethod The HTTP method : GET | POST | PUT | DELETE
     * @param {*} pURL  
     * @param {*} pData 
     * @param {*} pContentType 
     */
    sendHTTPRequest( pMethod, pURL, pData=null, pContentType = null){
        let req = null;
        switch(pMethod){
            case 'GET':
                req = _http_.get(pURL);
                break;
            case 'POST':
                req = _http_.post(pURL)
                    .set('Content-Type', pContentType)
                    .send(pData);
                break;
        }

        return req;
    }
    /**
     * To send serialized data in JSON format through 
     * an HTTP POST request to a given URL.
     * 
     * @param {String} pURL 
     * @param {Object} pData 
     */
    sendRequest_POST_JSON( pURL, pData){
        return this.sendHTTPRequest( 'POST', pURL, pData, 'application/json'); 
    }

    /**
     * To send an HTTP GET request to a given URL.
     * 
     * @param {String} pURL 
     * @param {Object} pData 
     */
    sendRequest_GET( pURL){
        return this.sendHTTPRequest( 'GET', pURL); 
    }

    /**
     * 
     * @param {*} pPath 
     * @method
     */
    resetDexcaliburWorkspace( pPath=null){
        let dxc = DexcaliburWorkspace.getInstance(
            _path_.join(__dirname,'..','test','ws'), true
        );
        dxc.init();
    }

    /**
     * @method
     */
    newDexcaliburEngine(){
        
        DexcaliburWorkspace.clearInstance();

        let engine = DexcaliburEngine.getInstance();

        engine.loadWorkspaceFromConfig( 
            _path_.join( __dirname, '..', 'test', '.dexcalibur'),
            {
                workspace: _path_.join( __dirname, '..', 'test', 'ws')
            });

        engine.boot();
        
        return engine;
    }

    /**
     * 
     * @param {*} pForce 
     * @method
     */
    getDexcaliburEngine(pForce = false){
        if(this.engine == null || pForce){
            this.engine = this.newDexcaliburEngine();
        }

        return this.engine;
    }
}

module.exports =  new TestHelper();