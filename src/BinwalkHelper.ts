import ModelFile from "./ModelFile.js";
import Util from "./Utils.js";
import * as _path_ from "path";
import DexcaliburProject from "./DexcaliburProject.js";
import {EOL} from "os";
import BusEvent from "./BusEvent.js";
import * as _glob_ from "glob";


import * as Log from './Logger.js';
import ModelFileSection from "./ModelFileSection.js";
import {External} from "./external/External.js";
import * as _fs_ from "fs";
import * as  _ps_ from "child_process";
import DexcaliburWorkspace from "./DexcaliburWorkspace.js";
import {IFileAnalyzer} from "./analyzer/IFileAnalyzer.js";
import StatusMessage from "./StatusMessage.js";
import ShellHelper from "./ShellHelper.js";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class BinwalkHelper extends  External.ExternalHelper implements IFileAnalyzer{



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
            out = Util.execSync(BinwalkHelper.getExtPath()+' '+ShellHelper.escape(_path_.normalize(pPath)));
            if(out==null || out.split ==null){
                throw new Error("Binwalk returns empty result");
            }
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

    spawn( pPath:string):any {
        /*let child:_ps_.ChildProcessWithoutNullStreams = _ps_.spawn(BinwalkHelper.getExtPath()+' '+pPath, {
            stdio: 'pipe',
            shell: false
        });

        child.stdout.on('data', (vData:any)=>{
            Logger.raw("out: "+vData.toString());
        });

        child.stderr.on('data', (vData:any)=>{
            Logger.raw("err: "+vData.toString());
        });
        child.on('exit', (vData:any)=>{
            this._close_fn(self, {closed:true, msg:'[Process exited.]'});
            //this._stderr_fn(self,{closed:true, msg:'[Process exited.]'});
        });
        */
    }

    private _parseBinwalkBasicOutput( pOut:string):ModelFile {

        const RE = /^([0-9]+)\s+(0x[0-9a-fA-F]+)\s+(.+)/;
        let l:string[];
        let f:ModelFile;
        let res:any = null;

        try{

            f = new ModelFile();
            l = pOut.split(EOL);

            l.shift(); // skip EOL
            l.shift(); // rm header
            l.shift(); // rm ----


            if(l.length>1){
                f.__p.m = [];
            }

            for(let i=0; i<l.length; i++){
                if(l[i]!=null){
                    res = RE.exec(l[i]) ;

                    if(res != null && res[3]!=null){
                        if(i==0){
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

            // TODO : move to a step where UID is set



        }catch(err){
            Logger.error('[BINWALK HELPER] Error while "analyzeFolder" : '+"\n"+err.message+"\n"+err.stack);
            Logger.error('[BINWALK HELPER] Error while "analyzeFolder" : '+JSON.stringify(l));
            f = null;
        }

        return f;
    }

    private _parseBinwalkMultipleOutput( pOut:string,):ModelFile[] {

        const RE = /^([0-9]+)\s+(0x[0-9a-fA-F]+)\s+(.+)/;
        let l:string[];
        let all:ModelFile[] = [];
        let res:any = null;

        const entries:string[] = pOut.split(EOL+EOL+EOL);

        entries.map( (vBinEntries:string) => {

            let f:ModelFile;
            try{

                f = new ModelFile();
                l = vBinEntries.split(EOL);

                while(l[0]=="") l.shift();
                // skip l[0] => Scan Time
                // relative path will be updated when scope will be defined
                f.path = _path_.normalize(Util.trim(l[1].substr(l[1].indexOf(':')+1)));

                // skip file if pSkipIf() return TRUE
                f.name = _path_.basename( f.path);
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
                            f.appendSection( new ModelFileSection(res[1], res[3]));
                        }else if(l[i].length>0){
                            Logger.info("Format not detected in : "+l[i]);
                        }
                    }
                }

                all.push(f);

            }catch(err){
                Logger.error('[BINWALK HELPER] Error while "analyzeFolder" : '+"\n"+err.message+"\n"+err.stack+"\n"+JSON.stringify(l));
                f = null;
            }

        });

        return all;
    }

    /**
     * To scan APK content with binwalk
     *
     * @param {string} pPath Folder to scan
     * @param {DexcaliburProject} pContext Active project
     * @param {Function} pSkipIf Function to detect is the file must be skipped
     * @return {ModelFile[]} An array of ModelFile
     */
    analyzeFolder(pPath:string, pContext:DexcaliburProject, pSkipIf:any):ModelFile[] {

        const b = Util.time();
        let out:string;
        let files:ModelFile[] = [];
        //let opts:any = {stdio: [null,null,null], shell:false };
        let opts:any = {stdio: 'pipe', shell:false }; //[null,'pipe','pipe'], shell:false };
        let tmp:string;
        // let errFile

        try{
            const vFiles:any[] = _glob_.sync(pPath+"/**/*", {
                dot:true,
                nodir: true,
                ignore: pSkipIf,
                absolute: true
            });

            let counter:number = 0;
            const m = '/'+vFiles.length+' Files analyzed (binwalk)';

            this._wf.computeStepUp(vFiles.length);
            vFiles.map( (vFile:string) => {
                out = Util.execSync(BinwalkHelper.getExtPath()+' '+ShellHelper.escape(vFile), "utf8", opts);

                const f:ModelFile = this._parseBinwalkBasicOutput(out);
                f.name = _path_.basename(vFile);
                f.path = vFile;

                //Logger.info(JSON.stringify(f.toJsonObject()));
                counter++;
                this._wf.pushDirectStatus(counter+m);


                // send update counter
                if(f==null) return;

                files.push(f);

                if(pContext!=null){
                    pContext.bus.send(new BusEvent({
                        type: "data.file.new.knownFmt",
                        data: f
                    }))
                }
            });
/*
            Util.forEachFileOf(pPath, (vPath:string, vFilename:string)=>{
                out = Util.execSync(BinwalkHelper.getExtPath()+' '+vPath, "utf8", opts);
                Logger.info(out);

                const f:ModelFile = this._parseBinwalkBasicOutput(out);
                f.name = vFilename;
                f.path = vPath;

                if(f==null) return;

                files.push(f);

                if(pContext!=null){
                    pContext.bus.send(new Event({
                        type: "data.file.new.knownFmt",
                        data: f
                    }))
                }
            });

            //out = _ps_.spawnSync(BinwalkHelper.getExtPath(), [_path_.join(pPath,'**','*')], { stdio:'pipe', shell:ShellHelper.getExtPath() });

            //out = _ps_.execSync(
            //    BinwalkHelper.getExtPath()+' '+pPath+(pPath[pPath.length-1]=='/'?'* * /*':'/ * * / *'),
            //    { stdio:'pipe', shell:ShellHelper.getExtPath() }).toString();*/

            /*out = _fs_.readFileSync(tmp).toString();
            _fs_.closeSync(opts.stdio[1]);
            _fs_.unlinkSync(tmp);*/
            //Logger.info("[BINWALK HELPER] Binwalk stdout is empty, reading file #1 ("+tmp+") "+out.length+" = "+out);

            //if(out.length==0) throw new Error("Retry binwalk");

            //files = this._parseBinwalkMultipleOutput(out);
            /*
            if(Util.isEmpty(out, Util.FLAG_CR | Util.FLAG_WS) || out.length==0) {
                out = _fs_.readFileSync(tmp).toString();
                _fs_.closeSync(opts.stdio[2]);
                //_fs_.unlinkSync(tmp);
                Logger.info("[BINWALK HELPER] Binwalk stdout is empty, reading file ("+tmp+") "+out.length+" = "+out);
            }else{
                Logger.info("[BINWALK HELPER] Binwalk stdout not empty : "+out.length+" = "+out);
            }*/
        }catch(err){
            Logger.error("[BINWALK HELPER] Binwalk failed to scan path (1) : "+pPath+"\n"+err.message+"\n"+err.stack);
        }


        Logger.info("Time (after binwalk check): "+(Util.time()-b));

        return files;
    }

}