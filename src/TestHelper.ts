
/**
 * Test helper
 */
import * as _path_ from "path";
import * as _process_ from "process";
import * as _child_process_ from "child_process";
import * as _http_ from "http";
import * as _util_ from 'util';
import * as _fs_ from 'fs';
import DexcaliburEngine from "./DexcaliburEngine";
import {Application as ExpressApplication} from 'express';
import Configuration from "./Configuration";
import DexcaliburWorkspace from "./DexcaliburWorkspace";
import DexcaliburProject from "./DexcaliburProject";

let _exec_ = _util_.promisify(_child_process_.exec);


interface ITestInterceptor {

}


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
class TestHelperClass
{
    engine:DexcaliburEngine;
    app:ExpressApplication = null;
    testCfg:any = null;
    config:any = null;
    interceptors:any = null;
    project:DexcaliburProject = null;
    project_ready:DexcaliburProject = null;

    constructor(){
        if(process.env.DEXCALIBUR_TEST)
            this.testCfg = JSON.parse( _fs_.readFileSync(_path_.join( __dirname, "..",  "test", "config", "config.json")).toString() );

        this.interceptors = {
            exec: []
        };
    }

    /**
     * To verify if a NodeJS module is loaded or not by its name
     * CommonJS only
     *
     * @param {String} pModuleName Module name
     * @returns {Boolean} TRUE is the module is loaded, else FALSE
     * @method
     */
    checkIfModuleIsLoaded( pModuleName:string):boolean{
        let loaded:string[]= Object.keys(require('module')._cache);
        let pattern:string = '/node_modules/'+pModuleName+'/';

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
    setWebServerInstance( pInstance:ExpressApplication){
        this.app = pInstance;
    }


    newConfiguration():any{
        this.config = new Configuration();
        this.config.import(require(_path_.join( __dirname, this.testCfg.configuration)));
        this.config.workspacePath = _path_.join( __dirname, '../test/workspace/');
        return this.config;
    } 

    getConfiguration():any{
        return this.config;
    }

    getConfigurationPath():string{
        // return this.testCfg.configuration;
        return _path_.join( __dirname, this.testCfg.configuration);
    }

    interceptExec( pInterceptor:any, pReturn:any){
        if( this.interceptors.exec == null) this.interceptors.exec = [];
        this.interceptors.exec.push({ test:pInterceptor, ret:pReturn });
    }

    filterInterceptor( pType:string, pInput:any):any{
        if(this.interceptors[pType] == undefined)return {success:false};

        for(let i:number=0; i<this.interceptors[pType].length; i++){
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
    execSync( pCmd:string){
        let res:any = this.filterInterceptor( "exec", pCmd);
        if(res.success){
            return res.ret;
        }else{
            return _child_process_.execSync( pCmd);
        }
    }

    /**
     * To mock conditionnaly Process.execAsync()
     *
     * @param {*} pCmd
     */
    async execAsync( pCmd:string):Promise<any>{
        let res:any = this.filterInterceptor( "exec", pCmd);
        if(res.success){
            return res.ret;
        }else{
            return await _exec_(pCmd);;
        }
    }

    /**
     * 
     * @param {String} pMethod The HTTP method : GET | POST | PUT | DELETE
     * @param {*} pURL  
     * @param {*} pData 
     * @param {*} pContentType 
     */
    sendHTTPRequest( pMethod:string, pURL:string, pData:any=null, pContentType:string = null):_http_.ClientRequest{
        let req:_http_.ClientRequest = null;
        switch(pMethod){
            case 'GET':
                req = _http_.get(pURL);
                break;
            /*case 'POST':
                req = _http_.post(pURL)
                    .set('Content-Type', pContentType)
                    .send(pData);
                break;*/
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
    sendRequest_POST_JSON( pURL:string, pData:any):_http_.ClientRequest{
        return this.sendHTTPRequest( 'POST', pURL, pData, 'application/json'); 
    }

    /**
     * To send an HTTP GET request to a given URL.
     * 
     * @param {String} pURL 
     * @param {Object} pData 
     */
    sendRequest_GET( pURL:string):_http_.ClientRequest{
        return this.sendHTTPRequest( 'GET', pURL); 
    }

    /**
     * 
     * @param {*} pPath 
     * @method
     */
    resetDexcaliburWorkspace( pPath:string=null){
        if(pPath===null){
            pPath = _path_.join(__dirname,'..','test','ws');
        }
        let dxc = DexcaliburWorkspace.getInstance(
            pPath, true
        );
        dxc.init();
    }

    /**
     * @method
     */
    newDexcaliburEngine():DexcaliburEngine{
        
        DexcaliburWorkspace.clearInstance();

        let engine:DexcaliburEngine = DexcaliburEngine.getInstance();

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
    getDexcaliburEngine(pForce:boolean = false):DexcaliburEngine{
        if(this.engine == null || pForce){
            this.engine = this.newDexcaliburEngine();
        }

        return this.engine;
    }

    /**
     *
     * @returns {DexcaliburProject}
     */
    newDexcaliburProject():DexcaliburProject{
        this.project = new DexcaliburProject(
            DexcaliburEngine.getInstance(),
            'owasp.mstg.uncrackable1'
        );

        return this.project;
    }

    /**
     *
     * @param pForce
     * @returns {DexcaliburProject}
     */
    getDexcaliburProject(pForce:boolean = false):DexcaliburProject{
        if(this.project == null || pForce){
            this.project = this.newDexcaliburProject();
        }

        return this.project;
    }


    /**
     *
     * @param pForce
     * @returns {DexcaliburProject}
     */
    getInitializedDexcaliburProject(pForce:boolean = false):DexcaliburProject{
        if(this.project_ready == null || pForce){

            TestHelper.interceptExec( function(x){
                return (x.indexOf("adb kill-server")>-1);
            }, `true`);


            this.project_ready = new DexcaliburProject(
                this.newDexcaliburEngine(),
                'owasp.mstg.uncrackable1'
            );

            this.project_ready.init();
        }

        return this.project_ready;
    }

    /**
     * TODO : spawn mock
     * @param pCmd
     */
    spawn(pCmd:string,  pArgs:any=[], pOptions:any={}):any{
        return null;
    }

}

export var TestHelper = new TestHelperClass();