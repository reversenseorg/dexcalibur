// add xml, yaml, properties, jks, bks (...)  parsers
// add file type identifier

import * as _fs_ from "fs";
import * as _path_ from 'path';
import Util from "./Utils";
import ModelFile from "./ModelFile";
import {EOL} from 'os';
import DexcaliburProject from "./DexcaliburProject";
import BusEvent from "./BusEvent";


import * as Log from './Logger';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class EncodedDataType
{
    mime:string = null;
    ext:string = null;

    constructor(pConfig:any){
        if(pConfig!=null)
            for(let i in pConfig)
                this[i]=pConfig[i];
    }


    isMIME(format:string):boolean{
        return this.mime===format;
    }

    isExt(format:string):boolean{
        return this.ext===format;
    }
}


export const TYPES = {
    BKS: new EncodedDataType({ ext: "bks" }),
    XML: new EncodedDataType({ ext: "xml" }),
    JSON: new EncodedDataType({ ext: "json" }),
    YAML: new EncodedDataType({ ext: "yml" }),
    PROP: new EncodedDataType({ ext: "properties" })
};



// TODO : provide better file detection (binwalk, file, yara, r2, ...)
export class FileTypeDetector{
    /*this.reader = null;
    this.writer = null;
    this.dumper = null;
    this.new = null;
    */
    stats:any = {};


    constructor(pConfig:any=null){
        /*this.reader = null;
        this.writer = null;
        this.dumper = null;
        this.new = null;
        */
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    /**
     * TODO : speculative parsing : json > yaml > propertie
     * @param extension
     */

    search(extension:string):EncodedDataType{
        let type:EncodedDataType=null;
        for(let i in TYPES){
            if(extension==TYPES[i].ext){
                type = TYPES[i];
                this.stats[type.ext]++;
                break;
            }
        }

        return type;
    }


    /**
     * To scan APK content with binwalk
     * @param pPath
     * @param pSkipIf
     */
    advancedScan(pPath:string, pContext:DexcaliburProject, pSkipIf:Function):ModelFile[] {


        let out:string;
        const RE = /^([0-9]+)\s+(0x[0-9a-fA-F]+)\s+(.+)/;
        let files:ModelFile[] = [];

        try{
            out = Util.execSync('binwalk '+_path_.join(pPath,'**','*'));
        }catch(err){
            try{
                out = Util.execSync('binwalk '+_path_.join(pPath,'*'));
            }catch(err2){
                Logger.error("[FILE FORMAT DETECTION] Binwalk failed to scan path : "+pPath);
                return files;
            }
        }


        out.split(EOL+EOL+EOL).map( pDetails => {

            try{

                let f:ModelFile = new ModelFile();
                let res:any = null;
                let l:string[] = pDetails.split(EOL);

                while(l[0]=="") l.shift();

                l[1] = _path_.normalize(l[1].substr(l[1].indexOf(':')));

                // skip file if pSkipIf() return TRUE
                if(pSkipIf(pPath, l[1])){
                    l = null;
                    return;
                }

                f.name = _path_.basename( l[1]);
                f.__p.md5 = Util.trim(l[2].substr(l[2].indexOf(':')));

                if(l.length>7){
                    f.__p.m = [];
                }
                for(let i=7; i<l.length; i++){
                    if(l[i]!=null){
                        res = RE.exec(l[i]) ;

                        if(res != null && res[3]!=null){
                            if(i==7){
                                f.type = res[3].split(' ')[0];
                            }

                            // __p = properties
                            // m = map
                            // o = offset
                            // t = type
                            // f.__p.m.push({ o: res[1], t:res[3] })
                        }else{
                            Logger.info("Format not detected in : "+l[i]);
                        }
                    }
                }

                files.push(f);

                pContext.bus.send(new BusEvent({
                    type: "data.file.new.knownFmt",
                    data: f
                }))

            }catch(err){
                Logger.error('[File Format DETECTOR] Error on : '+"\n"+pDetails);
            }

        })

        return files;
    }

    scanWithBinwalk(pFilePath:string){
        Util.execSync('bin')
    }

    getStats():any{
        return this.stats;
    }
}
