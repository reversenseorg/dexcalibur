
/**
 * Test helper
 */
const _path_ = require("path");
const _process_ = require("process");

const Configuration = require("./Configuration.js");

class TestHelper
{
    constructor(){
        this.testCfg = require("../test/test_configuration.js");
        this.config = null;
        this.interceptors = {
            exec: []
        };
    }
    newConfiguration(){
        this.config = new Configuration();
        this.config.import(require(_path_.join( __dirname, '..', this.testCfg.configuration)));
        this.config.workspacePath = _path_.join( __dirname, '../test/workspace/');
        return this.config;
    } 

    getConfiguration(){
        return this.config;
    }

    getConfigurationPath(){
        return this.testCfg.configuration;
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

}

module.exports =  new TestHelper();