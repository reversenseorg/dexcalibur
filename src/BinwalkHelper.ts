import ModelFile from "./ModelFile";
import Util from "./Utils";
import * as _path_ from "path";
import DexcaliburProject from "./DexcaliburProject";
import {EOL} from "os";
import Event from "./Event";


import * as Log from './Logger';
import ModelFileSection from "./ModelFileSection";
import {External} from "./external/External";
import * as _fs_ from "fs";
import * as  _ps_ from "child_process";
import DexcaliburWorkspace from "./DexcaliburWorkspace";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class BinwalkHelper extends  External.ExternalHelper {



    constructor() {
        super()
    }

    /**
     *
     * @param pPath
     * @param pOptions
     */
    analyze( pPath:string, pOptions:any = {}):ModelFile {

        let out:string;
        const RE = /^([0-9]+)\s+(0x[0-9a-fA-F]+)\s+(.+)/;
        let file:ModelFile = new ModelFile();
        let res:any, l:string[];

        try{
            out = Util.execSync(BinwalkHelper.getExtPath()+' '+_path_.join(pPath));
            l = out.split(EOL);

            while(l[0]=="") l.shift();

            l[1] = _path_.normalize(l[1].substr(l[1].indexOf(':')));

            file.name = _path_.basename( l[1]);
            file.__p.md5 = Util.trim(l[2].substr(l[2].indexOf(':')));

            if(l.length>7){
                file.__p.m = [];
            }
            for(let i=7; i<l.length; i++){
                if(l[i]!=null){
                    res = RE.exec(l[i]) ;

                    if(res != null && res[3]!=null){
                        if(i==7){
                            file.type = res[3].split(' ')[0];
                        }

                        // __p = properties
                        // m = map
                        // o = offset
                        // t = type
                        file.appendSection(new ModelFileSection(res[1], res[3]));
                    }else{
                        Logger.info("Format not detected in : "+l[i]);
                    }
                }
            }
        }catch(err){
            Logger.error("[FILE FORMAT DETECTION] Binwalk failed to scan path : "+pPath);
            return null;
        }


        return file;

    }



    /**
     * To scan APK content with binwalk
     *
     * @param {string} pPath Folder to scan
     * @param {DexcaliburProject} pContext Active project
     * @param {Function} pSkipIf Function to detect is the file must be skipped
     * @return {ModelFile[]} An array of ModelFile
     */
    analyzeFolder(pPath:string, pContext:DexcaliburProject, pSkipIf:Function):ModelFile[] {

        let out:string;
        const RE = /^([0-9]+)\s+(0x[0-9a-fA-F]+)\s+(.+)/;
        let files:ModelFile[] = [];
        let opts = {stdio: [null,null,null] };
        let tmp:string;

        try{

            tmp = DexcaliburWorkspace.getInstance().createTempFile('binwalk-', true);

            opts.stdio[2] = _fs_.openSync(tmp, 'w+');

            Logger.info(JSON.stringify(process.env));
            Logger.info(Util.execSync("which binwalk"));

            out = Util.execSync(BinwalkHelper.getExtPath()+' '+_path_.join(pPath,'**','*')+' > '+tmp, "utf8", opts);

            if(Util.isEmpty(out, Util.FLAG_CR | Util.FLAG_WS) || out.length==0) {
                out = _fs_.readFileSync(tmp).toString();
                _fs_.closeSync(opts.stdio[2]);
                //_fs_.unlinkSync(tmp);
                Logger.info("[BINWALK HELPER] Binwalk stdout is empty, reading file ("+tmp+") "+out.length+" = "+out);
            }else{
                Logger.info("[BINWALK HELPER] Binwalk stdout not empty : "+out.length+" = "+out);
            }
        }catch(err){
            Logger.error("[BINWALK HELPER] Binwalk failed to scan path (1) : "+pPath+"\n"+err.message+"\n"+err.stack);
            try{
                tmp = DexcaliburWorkspace.getInstance().createTempFile('binwalk-', true);

                opts.stdio[2] = _fs_.openSync(tmp, 'w+');

                out = Util.execSync(BinwalkHelper.getExtPath()+' '+_path_.join(pPath,'*'),"utf8", opts);

                if(Util.isEmpty(out, Util.FLAG_CR | Util.FLAG_WS) || out.length==0) {
                    out = _fs_.readFileSync(tmp).toString();
                    _fs_.closeSync(opts.stdio[2]);
                    //_fs_.unlinkSync(tmp);
                    Logger.info("[BINWALK HELPER] Binwalk stdout is empty, reading file ("+tmp+") "+out.length+" = "+out);
                }else{
                    Logger.info("[BINWALK HELPER] Binwalk stdout not empty : "+out.length+" = "+out);
                }

                //out = Util.execSync(BinwalkHelper.getExtPath()+' '+_path_.join(pPath,'*'));
            }catch(err2){
                Logger.error("[BINWALK HELPER] Binwalk failed to scan path (2) : "+pPath+"\n"+err2.message+"\n"+err2.stack);
                return files;
            }
        }

        Logger.info(out);

        out.split(EOL+EOL+EOL).map( pDetails => {

            try{

                let f:ModelFile = new ModelFile();
                let res:any = null;
                let l:string[] = pDetails.split(EOL);

                while(l[0]=="") l.shift();

                l[1] = _path_.normalize(Util.trim(l[1].substr(l[1].indexOf(':')+1)));

                // skip file if pSkipIf() return TRUE
                if(pSkipIf(pPath, l[1])){
                    l = null;
                    return;
                }

                f.name = _path_.basename( l[1]);
                //Logger.info(l[1]);
                f.path = l[1]; //.substr(lp);
                f.__p.md5 = Util.trim(l[2].substr(l[2].indexOf(':')));

                if(l.length>7){
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
                            f.appendSection( new ModelFileSection(res[1], res[3]));
                        }else if(l[i].length>0){
                            Logger.info("Format not detected in : "+l[i]);
                        }
                    }
                }

                files.push(f);

                // TODO : move to a step where UID is set
                pContext.bus.send(new Event({
                    type: "data.file.new.knownFmt",
                    data: f
                }))

            }catch(err){
                Logger.error('[BINWALK HELPER] Error while "analyzeFolder" : '+"\n"+err.message);
            }

        });

        return files;
    }

}