
/**
 * Test helper
 */
const _path_ = require("path");

const Configuration = require("./Configuration.js");

class TestHelper
{
    constructor(){
        this.testCfg = require("../test/test_configuration.js");
        this.config = null;
    }
    newConfiguration(){
        this.config = new Configuration();
        this.config.import(require(_path_.join(process.cwd(),this.testCfg.configuration)));
        this.config.workspacePath = _path_.join(process.cwd(),'./test/workspace/');
        return this.config;
    } 

    getConfiguration(){
        return this.config;
    }

    getConfigurationPath(){
        return this.testCfg.configuration;
    }
}

module.exports =  new TestHelper();