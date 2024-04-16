
import * as _path_ from "path";
import {EOL} from "os";
import Util from "../../Utils.js";
import ShellHelper from "../../ShellHelper.js";


import ModelFileSection from "../../ModelFileSection.js";
import {ModelFileOptions} from "../../ModelFile.js";
import {isMainThread} from "worker_threads";

function removeEmptyLine(pLines:string[]) {
    let l = pLines;
    while((l[0]!=null) && (l[0].match(/^[\s\t]*$/))){ l.shift();  }
    l = l.reverse();
    while((l[0]!=null) && (l[0].match(/^[\s\t]*$/))){ l.shift();  }
    return l.reverse();
}

export class BinwalkRunner {


    /**
     *
     */
    duration:number = -1;

    binaryPath:string;

    parentPort:any = null;

    threadID:string = "";

    constructor(pBinPath:string) {
        this.binaryPath = pBinPath;
    }

    setMessagePort(pMsgPort:any, pThreadID:string){
        this.parentPort = pMsgPort;
        this.threadID = pThreadID;
    }

    log(pText:any):void {

        if(!isMainThread){
            if(this.parentPort==null) return;
            this.parentPort.postMessage({
                cmd: "log",
                data: pText,
                threadID: this.threadID
            });
        }else{
            console.log(pText);
        }

    }

    error(pText:any):void {
        if(!isMainThread){
            if(this.parentPort==null) return;
            this.parentPort.postMessage({
                cmd: "log",
                data: "",
                err: pText,
                threadID: this.threadID
            });
        }else{
            console.log(pText);
        }
    }

    /**
     *
     * @param pPath
     * @param pOptions
     */
    analyze( pPath:string, pOptions:any = {}):ModelFileOptions {

        let out:string;
        const RE = /^([0-9]+)\s+(0x[0-9a-fA-F]+)\s+(.+)/;
        let file:any = {
            __p:{}
        };
        let res:any, l:string[];

        try{
            out = Util.execSync(
                this.binaryPath+' '+ShellHelper.escape(_path_.normalize(pPath)),
                "utf-8",
                null,
                " | "+this.threadID+" | "
            );

            if(out==null || out.split ==null){
                 throw new Error("Binwalk returns empty result");
            }

            // split around EOL and remove empty rows
            l = removeEmptyLine(out.split(EOL));

            // remove header
            l.shift(); //  'DECIMAL       HEXADECIMAL     DESCRIPTION'
            l.shift(); //  '--------------------------------------------------------------------------------'

            // parse lines
            file.__p.m = [];

            for(let i=0; i<l.length; i++){
                if(l[i]!=null){
                    res = RE.exec(l[i]) ;

                    if(res != null && res[3]!=null){
                        if(i==0){
                            file.type = res[3].split(',')[0].split(' ')[0];
                        }

                        // __p = properties,  m = map, o = offset, t = type
                        file.__p.m.push(new ModelFileSection(parseInt(res[1],10), res[3]));
                    }else if(l[i].length>0){
                        this.log("Format not detected in : "+l[i]);
                    }
                }
            }

        }catch(err){
            this.error("[FILE FORMAT DETECTION] Deep  failed to scan path : "+pPath+"\n"+err.message);
            return null;
        }
        return file;
    }


    private _parseBinwalkMultipleOutput( pOut:string,):ModelFileOptions[] {

        const RE = /^([0-9]+)\s+(0x[0-9a-fA-F]+)\s+(.+)/;
        let l:string[];
        let all:ModelFileOptions[] = [];
        let res:any = null;

        const entries:string[] = pOut.split(EOL+EOL+EOL);

        entries.map( (vBinEntries:string) => {

            let f:ModelFileOptions;
            try{

                f = {
                    __p:{}
                };
                l = vBinEntries.split(EOL);

                while(l[0]=="") l.shift();
                // skip l[0] => Scan Time
                // relative path will be updated when scope will be defined
                f.path = _path_.normalize(Util.trim(l[1].substr(l[1].indexOf(':')+1)));

                // skip file if pSkipIf() return TRUE
                f.name = _path_.basename( f.path);

                this
                //Logger.info(l[1]);
                //f.path = l[1]; //.substr(lp);
                f.__p.md5 = Util.trim(l[2].substr(l[2].indexOf(':')));

                if(l.length>6){
                    f.__p.m = [];
                }
                for(let i=7; i<l.length; i++){
                    if(l[i]!=null){
                        res = RE.exec(l[i]) ;

                        if(res != null && res[3]!=null){
                            if(i==7){
                                f.type = res[3].split(',')[0].split(' ')[0];
                            }

                            // __p = properties
                            // m = map
                            // o = offset
                            // t = type
                            if (f.__p.m == null) f.__p.m = [];

                            f.__p.m.push(new ModelFileSection(res[1], res[3]));
                        }else if(l[i].length>0){
                            this.log("Format not detected in : "+l[i]);
                        }
                    }
                }

                all.push(f);

            }catch(err){
                this.error('[BINWALK HELPER] Error while "analyzeFolder" : '+"\n"+err.message+"\n"+err.stack+"\n"+JSON.stringify(l));
                f = null;
            }

        });

        return all;
    }


}