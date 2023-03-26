import * as _os_ from "os";

class Param
{

    name:string|string[] = "";
    required:boolean = false;
    hasVal:boolean = false;
    help:string = "";
    value:any = null;
    default:any = null;
    callback:any = null;

    options:Param[] = [];

    constructor(config:any){

        for(let i in config)
            this[i] = config[i];

        if(this.options.length > 0){
            for(let i=0; i<this.options.length; i++){
                this.options[i] = new Param(this.options[i]);
            }
        }
        return this;
    }


    /**
     *
     * @param {String} arg The arguments values
     */
    is(arg:string):boolean{
        let i:number=0;
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
    parse(context:any, arg:string, pAllArgs:string[]):boolean{
        let i:number=0;

        if(this.hasVal && (i=arg.indexOf("="))>-1){
            this.value = arg.substr(arg.indexOf("=")+1);
        }

        if(this.callback != null){
            this.callback(context, this);
        }

        if(this.options.length > 0){
            for(let i=0; i<this.options.length; i++){
                for(let j=0; j<pAllArgs.length; j++){
                    if(this.options[i].is(pAllArgs[j])){
                        this.options[i].parse(context, pAllArgs[j], pAllArgs);
                    }

                }
            }
        }

        return true;
    }

    /**
     * To get help for options as a string
     * @param pIndent
     * @param pIndentPattern
     */
    getOptionsHelp(pIndent:number=0,pIndentPattern="\t"):string {
        let str = "";
        this.options.map((vParam,vIndex)=>{
            str += pIndentPattern.repeat(pIndent)+" ";
            if(Array.isArray(vParam.name))
                str += "["+vParam.name.join(" | ")+"] \t";
            else
                str += "["+vParam.name+"] \t";

            str += vParam.help+_os_.EOL;
         });
        return str;
    }
}



export default class ArgParser
{

    program:string = "";
    param_config:Param[] = null;
    context:any = null;
    help:string = '';

    constructor(ctx:any, pProgramName:string, params:any[]){
        this.param_config = [];
        this.context = ctx;
        this.program = pProgramName;

        for(let i=0; i<params.length; i++)
            this.param_config.push(new Param(params[i]));

        return this;
    }


    argParse(arg:string, pAllArgs:string[]){
        for(let i=0; i<this.param_config.length; i++){
            if(this.param_config[i].is(arg)) {
                this.param_config[i].parse(this.context, arg, pAllArgs);
            }
        }
    }


    /**
     * To parse given process arguments
     * @param {Array} args Function call arguments
     * @returns {}
     * @function
     */
    parse(args:string[]){
        for(let i=0; i<args.length; i++){
            this.argParse(args[i], args);
        }
    }



    /**
     * To get the help command message
     * @returns {String} Help message
     * @function
     */
    getHelp():string{
        if(this.help.length > 0)
            return this.help;

        let usage:string = "Usage: "+this.program+" ";
        let submenus = "";

        this.help = "";

        for(let i=0; i<this.param_config.length; i++){
            if(Array.isArray(this.param_config[i].name )){
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

            if(this.param_config[i].options.length > 0){
                submenus += _os_.EOL+"Command : "+this.param_config[i].name+_os_.EOL+this.param_config[i].getOptionsHelp()+_os_.EOL;
            }


            this.help += _os_.EOL ;
        }

        return this.help = usage+_os_.EOL+_os_.EOL+this.help+_os_.EOL+submenus;
    }
}
