const CLASS = require("./CoreClass.js")

var BINDING = [
    "android.",
    "dalvik.",
    "javax.",
    "org.apache.http.",
    "org.json.",
    "org.xml.sax.",
    "junit.",
    "java."
];

function VM() {
    this._reg= [];
    this._regSize= 0;
    this._local= [];
    this._localSize= 0;
    this._env={};
    this._mock={};

    this._binding = {};
    

    this.init = function(localSize,regSize){
        this._regSize = regSize;
        this._localSize = localSize;
    };

    this.mock = function(signature,mock){
        this.mock[signature] = mock;
    };

    this.exec = function(instrBlock){
        for(let i=0; i<instrBlock.length; i++){
            instrBlock[i].exec(this._local,this._reg,this._env);
        }
    };
    

    // return TRUE if the method is a part of the android SDK
    this.hasBinding = function(fqxn){
        for(let i in BINDING)
            if(fqxn.indexOf(BINDING[i])==0)
                return true;

        return false;
    };


    this.getBinding = function(bind,clsFqcn){
        let cls=null, ef=null, x=null, hash=null;
        
        if(clsFqcn === undefined)
            clsFqcn = bind.fqcn; 

        if(this._binding[clsFqcn]===undefined){
            this._binding[clsFqcn] = new CLASS.Class();
            this._binding[clsFqcn].fqcn = clsFqcn;
            // this._binding[clsFqcn].name = clsFqcn;            
            // this._binding[clsFqcn].simpleName = clsFqcn.substr(clsFqcn.lastIndexOf(".")+1);
            
            this._binding[clsFqcn].name = clsFqcn.substr(clsFqcn.lastIndexOf(".")+1);
            
            this._binding[clsFqcn]._isBinding = true;
        }    

        // specialisation de FieldReference en Field
        if(bind instanceof CLASS.FieldReference){
            
            if(this._binding[clsFqcn].hasField(bind.name)){
                return this._binding[clsFqcn].fields[bind.name];
            }else{
                //console.log(bind.fullname,this._binding[clsFqcn]);

                x = bind.toField(this._binding[clsFqcn]);
                x._isBinding=true;
                this._binding[clsFqcn].fields[bind.name] = x;
                return x;      
            }
            
        }
        else if(bind instanceof CLASS.MethodReference){
            
            hash = bind.signature();
            
            // si elle a deja ete binde on la recupere
            if(this._binding[clsFqcn].hasMethod(hash)){
                return this._binding[clsFqcn].methods[hash];
            }
            // sinon on la cree
            else{
                x = bind.toMethod(this._binding[clsFqcn]);
                x._isBinding=true;
                this._binding[clsFqcn].methods[hash] = x;
                return x;      
            }
            
        }
        else{
            return this._binding[clsFqcn];
        }
    };

    this.getBindingFromFQCN = (fqcn)=>{
        return this.getBinding({ fqcn:fqcn });
    };
};


module.exports = new VM();