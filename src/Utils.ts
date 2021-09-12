import * as fs from "fs";
import * as Process from "child_process";
import chalk from "chalk";
import * as Path from "path";
import * as crypto from "crypto";

import * as  _util_ from 'util';
import * as _stream_  from 'stream';
import got  from "got";

import {TestHelper} from "./TestHelper";
import * as _os_ from "os";


const _exec_:any = _util_.promisify(Process.exec);
const _spawn_:any = _util_.promisify(Process.spawn);

const RE_REPLACE:RegExp = /[-\/\\^$*+?.()|[\]{}]/g;

function checksum(str:string, algorithm:string ='md5', encoding:any ='hex'):string {
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


let PRINT = null;

const LOG_FILE = (process.env.DXC_LOG_PATH? process.env.DXC_LOG_PATH : null);

if(LOG_FILE!=null)
    PRINT = function ( pMessage:string){
        fs.appendFileSync(LOG_FILE, pMessage+_os_.EOL);
    };
else
    PRINT = console.log;

PATTERNS[FLAG_CR] = new RegExp("^[\n]*$");
PATTERNS[FLAG_WS] = new RegExp("^[\s]*$");
PATTERNS[FLAG_TB] = new RegExp("^[\t]*$");
PATTERNS[FLAG_CR | FLAG_WS] = new RegExp("^[\n\s]*$");
PATTERNS[FLAG_CR | FLAG_TB] = new RegExp("^[\n\t]*$");
PATTERNS[FLAG_WS | FLAG_TB] = new RegExp("^[\s\t]*$");
PATTERNS[FLAG_WS | FLAG_CR | FLAG_TB] = new RegExp("^[\s\t\n]*$");

export default class Util {
    static ALPHA:string = 'abcdefghijklmnopqrstuvwxyz';
    static ALPHANUM:string =  'abcdefghijklmnopqrstuvwxyz0123456789';
    static FLAG_CR:number =  FLAG_CR;
    static FLAG_WS:number =  FLAG_WS;
    static FLAG_TB:number =  FLAG_TB;
    static NO_FLAG:number =  NO_FLAG;

    /**
     * To retrieve the value of an arbitrary field from an arbitrary object
     * and to return a default fixed value if the field not exists.
     *
     * Important : it work only is the requested field has not getter.
     *
     * @param {any} pRawObject The target object
     * @param {string} pFieldName The field name
     * @param {any} pDefault The default value is the field is empty
     * @return {any} The value of the field or the default value
     * @method
     * @static
     * @since 1.0
     */
    static getValue( pRawObject:any, pFieldName:string, pDefault:any):any {
        return (pRawObject!=null && pRawObject.hasOwnProperty(pFieldName)? pRawObject[pFieldName] : pDefault);
    }

    /**
     * To encode
     */
    static sha1_file(path:string){
        return checksum(
            fs.readFileSync(path).toString(),
            'sha1'
        );
    }

    static sha1_buffer(data:string){
        return checksum(
            data,
            'sha1'
        );
    }

    static b64_encode(src:string):string{
        return Buffer.from(src).toString('base64');
    }

    static b64_decode(src:string):string{
        return Buffer.from(src, 'base64').toString('ascii');
    }

    static decodeURI(uri:string):string{
        return decodeURIComponent(uri);
    }

    static encodeURI(uri:string):string{
        return encodeURIComponent(uri);
    }

    static trim(str:string, pRemoveCrlf:boolean=false):string{
        //if(!(str instanceof String)) console.error("trim() : the argument must be a string");

        const wl = (pRemoveCrlf ? ["\t"," "] : ["\t"," ","\r","\n"]);

//        while(str[0]!=undefined && (str[0]=="\t"||str[0]==" "))
        while(str[0]!=undefined && (wl.indexOf(str[0])>-1))
                str=str.substr(1);

//        while(str[str.length]!=undefined && (str[str.length]=="\t"||str[str.length]==" "))
        while(str[str.length-1]!=undefined && (wl.indexOf(str[str.length-1])>-1))
            str=str.substr(0,str.length-1);

        return str;
    }

    // do  a deep copy of an object to a var
    static deepCopy(src:any,dst:any){
        for(let k in src){
            if(src[k] instanceof Object)
                Util.deepCopy(src[k],dst[k]);
            else
                dst[k]=src[k];
        }
    }

    static forEachFileOf(path:string ,callback:any ,isDir:boolean=false){
        let dir:string[]=null, elemnt:string=null, stat:fs.Stats=fs.lstatSync(path);

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
    }

    static count(list:any):number{
        let k=0;
        for(let j in list) k++;
        return k;
    }

    static makeTable(array:any[], fields:string[]=null):string{
        if(array.length == 0) return "";

        // filtre les colonnes
        let header:string[] = [], body:any[]=[], row:any={}, w:number=0, maxwidth:any={} ;

        if(fields !== null){
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
        let width:number = 0, sep:string="",out:string="", isize:number=" Index  |".length, v:string="";
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
    }

    static msgBox(title:string,ctn:string[]){
        let header:string = "╔═══════════════════════════[ "+title+" ]═══════════════════════════════╗\n";
        let msg:string = "";

        for(let i in ctn){
            msg += "║ "+ctn[i]+" ".repeat(header.length-ctn[i].length-4)+"║\n";
        }
        
        PRINT(header+msg+"╚"+"═".repeat(header.length-3)+"╝\n");
    }

    static time():number{
        return (new Date()).getTime();
    }

    static RegExpEscape(val:string):string{
        return val.replace(RE_REPLACE,'\\$&');
    }

    static escapeRE(data:string):string{
        // regexp replace ici
        while(data.indexOf(".")>-1) data.replace(".","<<>>");
        while(data.indexOf("<<>>")>-1) data.replace("<<>>","\\.");
        return data;
    }

    static execSync(command:string, charset:any="utf8", opts:any=null):string{
        let ret:string;
        
        if(process.env.DEXCALIBUR_TEST){
            ret = TestHelper.execSync(command);
        }else{
            PRINT(chalk.bold.red("Execute command request : "+command));

            if(opts!=null)
                ret = Process.execSync(command,opts);
            else
                ret = Process.execSync(command).toString(charset);

            PRINT(ret);
        }

        return ret;
    }

    static async  execAsync(command:string):Promise<any>{
        let ret:Promise<any>;

        if(process.env.DEXCALIBUR_TEST){
            ret = await TestHelper.execAsync(command);
            PRINT(JSON.stringify(ret));
        }else{
            PRINT(chalk.bold.red("Execute command request (async): "+command));
            ret = await _exec_(command);
        }

        return ret;
    }

    static spawn(pCmd:string, pArgs:any=[], pOptions:any={}):any{
        let ret:any;

        if(process.env.DEXCALIBUR_TEST){
            ret = TestHelper.spawn(pCmd);
        }else{
            PRINT(chalk.bold.red("Spawning : "+pCmd));
            ret = Process.spawn(pCmd, pArgs, pOptions);
        }

        return ret;
    }

    static randString(size:number, charset:string):string{
        let s:string ="";

        while(s.length <= size){
            s += charset[Math.round(Math.random() * (charset.length-1))];
        }
        return s;
    }

    static isEmpty( pVar:any, pFlags:any=NO_FLAG):boolean{
        let f:boolean=null;

        if(Array.isArray(pVar)){
            if(pFlags != null)
                f = (pVar.length==0);
            else{
                f = true;
                for(let i=0; i<pVar.length; i++){
                    f = f && Util.isEmpty( pVar[i], Util.FLAG_WS | Util.FLAG_CR);
                }
            }
            return f;
        }

        switch(typeof pVar){
            case 'string':
                f = true;
                if(pFlags == Util.NO_FLAG)
                    f = f && (pVar.length==0);
                else{
                    f = f && PATTERNS[pFlags].test(pVar);
                }
                break;
            default: 
                f = undefined;
                break;
        }

        return f;
    }

    static download(pRemoteURL:string, pLocalPath:string, pCallbacks:any, pMode:number=0o777, pEncoding:BufferEncoding='binary'){
        
        _stream_.pipeline(
            got.stream(pRemoteURL),
            fs.createWriteStream(pLocalPath, {
                flags: 'w+',
                mode: pMode,
                encoding: pEncoding
            }),
            (err)=>{
                if(pCallbacks.onSuccess != null)
                        pCallbacks.onSuccess(err);
            }
        );

    }

    static recursiveRmDirSync(pPath:string){
        if (fs.existsSync(pPath)) {
          fs.readdirSync(pPath).forEach((file, index) => {
            let curPath:string = Path.join(pPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { 
              Util.recursiveRmDirSync(curPath);
            } else {
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(pPath);
        }
      }

    static parseIPv4( pAddress:string, pHasPortNumber:boolean=false):any{
        const IPv4 = '(?<a>25[0–5]|2[0–4][0–9]|1[0-9]{2}|[0-9]{1,2})\.(?<b>25[0–5]|2[0–4][0–9]|1[0-9]{2}|[0-9]{1,2})\.(?<c>25[0–5]|2[0–4][0–9]|1[0-9]{2}|[0-9]{1,2})\.(?<d>25[0–5]|2[0–4][0–9]|1[0-9]{2}|[0-9]{1,2})';
        const PORT ='(?<port>[0-9]{1,5})' ;

        if(pAddress == null) return { valid:false };

        let RE:RegExp = new RegExp(IPv4 + (pHasPortNumber? ':'+PORT:''));
        let res:RegExpExecArray = RE.exec(pAddress) ;

        if(res !== null && res.index==0 && pAddress==res[0]){

            if(parseInt(res.groups.port,10) > 65535) return false;

            return { valid:true, ip: `${res.groups.a}.${res.groups.b}.${res.groups.c}.${res.groups.d}`, port:res.groups.port };
        }else{
            return { valid:false };
        }
    }


    /*
    static parseIPv6( pAddress, pHasPortNumber=false){
        const IPv6 =  '^((([0–9A-Fa-f]{1,4}:){7}[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){6}:[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){5}:([0–9A-Fa-f]{1,4}:)?[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){4}:([0–9A-Fa-f]{1,4}:){0,2}[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){3}:([0–9A-Fa-f]{1,4}:){0,3}[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){2}:([0–9A-Fa-f]{1,4}:){0,4}[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){6}((b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b).){3}(b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b))|(([0–9A-Fa-f]{1,4}:){0,5}:((b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b).){3}(b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b))|(::([0–9A-Fa-f]{1,4}:){0,5}((b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b).){3}(b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b))|([0–9A-Fa-f]{1,4}::([0–9A-Fa-f]{1,4}:){0,5}[0–9A-Fa-f]{1,4})|(::([0–9A-Fa-f]{1,4}:){0,6}[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){1,7}:))';
        const PORT ='(?<port>[0-9]{1,5})' 

        if(pAddress == null) return { valid:false };

        let RE = new RegExp(IPv4 + (pHasPortNumber? ':'+PORT:''));

        
        let res = RE.exec(pAddress) ;

        console.log(pAddress,res);


        if(res !== null && res.index==0 && pAddress==res[0]){

            if(res.groups.port > 65535) return false;

            return { valid:true, ip: `${res.groups.a}.${res.groups.b}.${res.groups.c}.${res.groups.d}`, port:res.groups.port };
        }else{
            return { valid:false };
        }
    },
*/

};

