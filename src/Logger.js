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
    constructor(){
        this.prefix = [];
        this.cache = [];
        this.cacheTag = null;
    }

    error(){
        this.cache.push({ type:"error", val:multi_concat(arguments) });
        return callbacks;
    }

    debug(){
        this.cache.push({ type:"debug", val:multi_concat(arguments) });
        return callbacks;
    }

    info2(){
        this.cache.push({ type:"info", val:multi_concat(arguments) });
        return callbacks;
    }

    info(){
        this.cache.push({ type:"info", val:multi_concat(arguments) });
        return callbacks;
    }

    setTagCache(tag){
        this.cacheTag = tag;
    }

    removeTagCache(tag){
        this.cacheTag = null;
    }

    expect(cache, fn=null){
        let f = false;
        this.cacheTag.map(x => {
            if(x.type==cache.type){
                if(f!=null)
                    f = fn(cache, x);
                else
                    f = (x.val===cache.val);
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
    constructor(){
        this.prefix = [];

    }

    error(){
        console.log(Chalk.bold.red('[ERROR] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    debug(){
        console.log(Chalk.bold.red('[DEBUG] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    info2(){
        console.log(Chalk.yellow('[INFO] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    info(){
        console.log(Chalk.yellow('[INFO] '+prefix.join("")+multi_concat(arguments)));
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

class LoggerFactory
{
    static createLogger(testMode=false){
        if(testMode)
            return new TestLogger();
        else
            return new ProdLogger();
    }
}



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

module.exports = LoggerFactory.createLogger; //()