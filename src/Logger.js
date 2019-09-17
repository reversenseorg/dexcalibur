const Chalk = require("chalk");
const Process = require("process"); 



var callbacks = {
    exit: function(){
        Process.exit();
    }
};


var flush = function(){
    let s = prefix.join("");
    prefix = [];
    return s;
}


function multi_concat(msg){
    let ret="";
    for(let i=0; i<msg.length; i++)
        ret += msg[i];

    return ret;
}

var prefix = [];


class TestLogger
{
    static T_ERROR = 1;
    static T_INFO = 2;
    static T_DEBUG = 3;
    static T_WARN = 4;
    static T_SUCCESS = 5;
    static T_DEBUG = 8;

    constructor(debugMode){
        this.prefix = [];
        this.cache = [];
        this.cacheTag = null;
        this.debugEnabled = debugMode;

        this.T_ERROR = 1;
        this.T_INFO = 2;
        this.T_DEBUG = 3;
        this.T_WARN = 4;
        this.T_SUCCESS = 5;
        this.T_DEBUG = 8;
    }

    error(){
        this.cache.push({ type:TestLogger.T_ERROR, val:multi_concat(arguments) });
        return callbacks;
    }

    debug(){
        if(this.debugEnabled)
            this.cache.push({ type:TestLogger.T_DEBUG, val:multi_concat(arguments) });
        return callbacks;
    }
/*
    info2(){
        this.cache.push({ type:TestLogger.T_INFO, val:multi_concat(arguments) });
        return callbacks;
    }*/

    info(){
        this.cache.push({ type:TestLogger.T_INFO, val:multi_concat(arguments) });
        return callbacks;
    }

    warning(){
        this.cache.push({ type:TestLogger.T_WARN, val:multi_concat(arguments) });
        return callbacks;
    }

    success(){
        this.cache.push({ type:TestLogger.T_SUCCESS, val:multi_concat(arguments) });
        return callbacks;
    }

    setTagCache(tag){
        this.cacheTag = tag;
    }

    removeTagCache(tag){
        this.cacheTag = null;
    }

    expect(expected, fn=null){
        let f = false;
        this.cache.map(x => {
            if(x.type==expected.type){
                if(typeof f == "function")
                    f = fn(expected, x);
                else
                    f = (x.val===expected.value);
            }
        });
        return f;
    }

    clearCache(){
        this.cache = [];
    }

    pop(){
        return this.prefix.pop()
    }

    push(prefix){
        this.prefix.push(prefix);
        return this.prefix;
    }
}


class ProdLogger
{

    constructor(debugMode){
        this.prefix = [];
        this.debugEnabled = debugMode;
    }

    enableDebug(){
        this.debugEnabled = true;
    }

    error(){
        console.log(Chalk.bold.red('[ERROR] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    debug(){
        if(this.debugEnabled)
            console.log(Chalk.bold.blue('[DEBUG] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    warning(){
        if(this.debugEnabled)
            console.log(Chalk.bold.yellow('[DEBUG] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    success(){
        console.log(Chalk.bold.green(prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    info(){
        console.log('[INFO] '+prefix.join("")+multi_concat(arguments));
        return callbacks;
    }

    pop(){
        return this.prefix.pop()
    }

    push(prefix){
        this.prefix.push(prefix);
        return this.prefix;
    }
}


var loggerInstance = null;

function getInstance(config=null, override=false){
    if(loggerInstance===null || override){
        if(config===null){
            config={
                testMode: false,
                debugMode: false
            };
        }

        if(config!==null && config.testMode)
            loggerInstance = new TestLogger(config.debugMode);
        else
            loggerInstance = new ProdLogger(config.debugMode);
    }

    return loggerInstance;
}
/*
class Logger
{
    constructor(){

    }
    static getInstance(testMode=false){
        
    }

    static createLogger(testMode=false){
        if(testMode)
            return new TestLogger();
        else
            return new ProdLogger();
    }
}*/



/*

module.exports = {    
    error: function(msg){
        console.log(Chalk.bold.red('[ERROR] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    },
    debug: function(msg){
        console.log(Chalk.bold.red('[DEBUG] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    },
    info2: function(msg){
        console.log(Chalk.yellow('[INFO] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    },
    info: function(){
        console.log(Chalk.yellow('[INFO] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    },
    pop: function(){
        return prefix.pop()
    },
    push: function(str){
        prefix.push(str);
        return prefix;
    },
    flush: flush
};*/

module.exports = getInstance; //()