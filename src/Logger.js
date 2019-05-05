const Chalk = require("chalk");
const Process = require("process"); 


function multi_concat(msg){
    let ret="";
    for(let i=0; i<msg.length; i++)
        ret += msg[i];

    return ret;
}

var callbacks = {
    exit: function(){
        Process.exit();
    }
};

var prefix = [];


var flush = function(){
    let s = prefix.join("");
    prefix = [];
    return s;
}

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
};