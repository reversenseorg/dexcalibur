const fs = require("fs");
const Process = require("child_process");
const Chalk = require("chalk");
const Path = require("path");
const crypto = require("crypto");

const _stream_      = require('stream');
const _got_         = require("got");
const {promisify}   = require('util');


//const TestHelper = require("./TestHelper.js");

const RE_REPLACE = /[-\/\\^$*+?.()|[\]{}]/g;
const CR = ""; //\n";

function checksum(str, algorithm, encoding) {
    return crypto
      .createHash(algorithm || 'md5')
      .update(str, 'utf8')
      .digest(encoding || 'hex')
  }

const NO_FLAG = 0x0;
const FLAG_CR = 0x1;
const FLAG_WS = 0x2;
const FLAG_TB = 0x4;

const PATTERNS = {};

PATTERNS[FLAG_CR] = new RegExp("^[\n]*$");
PATTERNS[FLAG_WS] = new RegExp("^[\s]*$");
PATTERNS[FLAG_TB] = new RegExp("^[\t]*$");
PATTERNS[FLAG_CR | FLAG_WS] = new RegExp("^[\n\s]*$");
PATTERNS[FLAG_CR | FLAG_TB] = new RegExp("^[\n\t]*$");
PATTERNS[FLAG_WS | FLAG_TB] = new RegExp("^[\s\t]*$");
PATTERNS[FLAG_WS | FLAG_CR | FLAG_TB] = new RegExp("^[\s\t\n]*$");

const Util = {
    FLAG_CR: FLAG_CR,
    FLAG_WS: FLAG_WS,
    FLAG_TB: FLAG_TB,
    NO_FLAG: NO_FLAG,
    /**
     * To encode
     */
    sha1_file: function(path){      
        return checksum(
            fs.readFileSync(path),
            'sha1'
        );
    },
    sha1_buffer: function(data){
        return checksum(
            data,
            'sha1'
        );
    },
    b64_encode: function(src){
        return Buffer.from(src).toString('base64');
    },
    b64_decode: function(src){
        return Buffer.from(src, 'base64').toString('ascii');
    },
    decodeURI: function(uri){
        return decodeURIComponent(uri);
    },
    encodeURI: function(uri){
        return encodeURIComponent(uri);
    },
    trim: function(str){
        if(! str instanceof String) console.error("trim() : the argument must be a string");

        while(str[0]!=undefined && (str[0]=="\t"||str[0]==" ")) 
            str=str.substr(1);

        while(str[str.length]!=undefined && (str[str.length]=="\t"||str[str.length]==" ")) 
            str=str.substr(0,str.length-1);

        return str;
    },
    // do  a deep copy of an object to a var
    deepCopy: function(src,dst){
        for(let k in src){
            if(src[k] instanceof Object)
                deepCopy(src[k],dst[k]);
            else
                dst[k]=src[k];
        }
    },
    forEachFileOf: function(path,callback,isDir=false){
        let dir=null, elemnt=null, ret = null, smali=[], stat=fs.lstatSync(path);

        if(isDir || stat.isDirectory()){
            dir=fs.readdirSync(path);
            for(let i in dir){
                elemnt = Path.join(path,dir[i]);
                if(fs.lstatSync(elemnt).isDirectory()){
                    this.forEachFileOf( elemnt, callback, true);
                }else{
                    // TODO : add additional test on file extension 
                    callback(elemnt, dir[i]);
                }
            }     
        }else{
            callback(path, Path.basename(path));
        }
    },
    count: function(list){
        let k=0;
        for(let j in list) k++;
        return k;
    },
    makeTable: function(array, fields){
        if(array.length == 0) return "";

        // filtre les colonnes
        let header = [], body=[], row={}, w=0, maxwidth={} ; 
        if(fields !== undefined){
            for(let i in array[0]){
                if(fields.indexOf(i)>-1){
                    header.push(i);
                    maxwidth[i] = i.length;   
                }
            }
        }else{
            for(let i in array[0]){
                header.push(i);
                maxwidth[i] = i.length;   
            }
        }
        
        // prepare le contenu
        for(let k=0; k<array.length; k++){
            row = [];
            for(let i in header){
                row[i] = array[k][header[i]]; 
                if(row[i] != null){
                    w = row[i].length - maxwidth[header[i]];
                    if(w > 0) maxwidth[header[i]] += w;   
                }
            }   
            body.push(row);
        }

        // dessine
        let width = 0, sep="",out="", isize=" Index  |".length,v="";
        for(let i in maxwidth) width += maxwidth[i]+7;

        sep = "+"+"-".repeat(isize+width+1)+"+\n";
        out = sep+"| Index  |"
        header.map(x=>{ out+="  "+x+(" ".repeat(maxwidth[x]-x.length+5))+"|"; });
        out += "\n"+sep;

        for(let k=0; k<body.length; k++){
            out+="| "+k+(" ".repeat(isize-2-(""+k).length))+"| ";
            for(let i in body[k]){
                //console.log(maxwidth[header[i]], body[k][i].length)
                v = (body[k][i] != undefined)?  body[k][i] : "";

                out += v+(" ".repeat(maxwidth[header[i]]-v.length+6))+"| "
            }
            out += "\n";
        }
        out += sep;
        
        return out;
    },
    msgBox: function(title,ctn){
        let header = "╔═══════════════════════════[ "+title+" ]═══════════════════════════════╗\n";
        let msg = "";

        for(let i in ctn){
            msg += "║ "+ctn[i]+" ".repeat(header.length-ctn[i].length-4)+"║\n";
        }
        
        console.log(header+msg+"╚"+"═".repeat(header.length-3)+"╝\n"); 
    },
    time: function(){
        return (new Date()).getTime();
    },
    RegExpEscape: function(val){
        return val.replace(RE_REPLACE,'\\$&');
    },
    escapeRE: function(data){
        // regexp replace ici
        while(data.indexOf(".")>-1) data.replace(".","<<>>");
        while(data.indexOf("<<>>")>-1) data.replace("<<>>","\\.");
        return data;
    },
    execSync: function(command,charset){
        var ret = null;
        
        if(process.env.DEXCALIBUR_TEST){
            ret = require('./TestHelper').execSync(command);
        }else{
            console.log(Chalk.bold.red("Execute command request : "+command));
            ret = Process.execSync(command);
        }

        return ret.toString(charset);
    },
    execAsync: function(command,charset,callback){
        // disable execSync here
        console.log(Chalk.bold.red("Async execute command request is not implemented "));

        //var ret = Process.execSync(command);
        //return ret.toString(charset);
    },
    randString: function(size, charset){
        let s="";
        while(s.length <= size){
            s += charset[parseInt(Math.random*charset.length)];
        }
        return s;
    },
    isEmpty: function( pVar, pFlags=NO_FLAG){
        let f=null, p=null;
        switch(typeof pVar){
            case 'array':
                if(pFlags != null)
                    f = (pVar.length==0);
                else{
                    f = true;
                    for(let i=0; i<pVar.length; i++){
                        f &= Util.isEmpty(pVar[i], Util.FLAG_WS | Util.FLAG_CR);
                    }
                }
                break;
            case 'string':
                f = true;
                if(pFlags == Util.NO_FLAG)
                    f &= (pVar.length==0);
                else{
                    f &= PATTERNS[pFlags].test(pVar);
                }
                break;
            default: 
                f = undefined;
                break;
        }

        return f;
    },
    download(pRemoteURL, pLocalPath, pCallbacks, pMode=0o666, pEncoding='binary'){
        
        _stream_.pipeline(
            _got_.stream(pRemoteURL),
            fs.createWriteStream(pLocalPath, {
                flags: 'w+',
                mode: 0o777,
                encoding: 'binary' // binary
            }),
            (err)=>{
                if(pCallbacks.onSuccess != null)
                        pCallbacks.onSuccess(err);
            }
        );

    },
    
};

module.exports = Util;
