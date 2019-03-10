function Param(config){
    this.name = "";
    this.required = false;
    this.hasVal = false;
    this.help = "";
    this.value = null;
    this.default = null;
    this.callback = null;

    for(let i in config) this[i] = config[i];
    return this;
}
/**
 * 
 * @param {String} arg The arguments values
 */
Param.prototype.is = function(arg){
    let i=0;
    if((i=arg.indexOf("="))>-1){
        if(this.name instanceof Array)
            return this.name.indexOf(arg.substr(0,i))>-1;
        else
            return arg.substr(0,i)===this.name;
    }else{
        if(this.name instanceof Array)
            return this.name.indexOf(arg)>-1;
        else
            return arg===this.name;
    }
}
/**
 * To fill the param instance with the arguments value
 * @param {*} arg 
 */
Param.prototype.parse = function(context, arg){
    let i=0;

    if(this.hasVal && (i=arg.indexOf("="))>-1){
        this.value = arg.substr(arg.indexOf("=")+1);
    }

    if(this.callback != null){
        this.callback(context, this);
    }

    return true;
}

/**
 * 
 * @param {Array} params An array of Param instance
 * @constructor 
 */
function Parser(ctx, params){
    this.param_config = [];
    this.context = ctx;

    for(let i=0; i<params.length; i++)
        this.param_config.push(new Param(params[i]));

    return this;
}
Parser.prototype.argParse = function(arg){
    for(let i=0; i<this.param_config.length; i++){
        if(this.param_config[i].is(arg))
            this.param_config[i].parse(this.context, arg);
    }
}


/**
 * To parse given process arguments
 * @param {Array} args Function call arguments
 * @returns {} 
 * @function
 */
Parser.prototype.parse = function(args){
    for(let i=0; i<args.length; i++){
        this.argParse(args[i]);
    }
};



/**
 * To get the help command message
 * @returns {String} Help message
 * @function
 */
Parser.prototype.getHelp = function(){
    if(this.help != null) return this.help;
    let usage = "Usage: dexcalibur ";

    this.help = "";
    for(let i=0; i<this.param_config.length; i++){
        if(this.param_config[i].name instanceof Array){
            this.help += "\t";
            usage += "[";
            for(let j=0; j<this.param_config[i].name.length; j++){
                this.help += this.param_config[i].name[j]+",";
                usage += this.param_config[i].name[j]+"|";
            }
            this.help += this.help.substr(this.help.length-1)+"\t"+this.param_config[i].help;
            usage += usage.substr(usage.length-1)+"] ";
        }else{
            this.help += "\t"+this.param_config[i].name+"\t"+this.param_config[i].help;
            usage += "["+this.param_config[i].name+"]";
        }
        this.help +="\n";
    } 

    return this.help = usage+"\n\n"+this.help;
};

module.exports = Parser;
