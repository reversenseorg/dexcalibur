
/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import * as  _util_ from 'util';
import * as  _ps_ from 'child_process';

const _exec_ = _util_.promisify(_ps_.exec);

import ModelFile from "./ModelFile.js";
import Util from "./Utils.js";
import * as _path_ from "path";
import DexcaliburProject from "./DexcaliburProject.js";
import {EOL} from "os";
import BusEvent from "./BusEvent.js";
import * as _glob_ from "glob";
import ModelFileSection from "./ModelFileSection.js";
import {External} from "./external/External.js";
import {IFileAnalyzer} from "./analyzer/IFileAnalyzer.js";
import ShellHelper from "./ShellHelper.js";
import {FileScanResult} from "./DataAnalyzer.js";
import * as Log from './Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export class BinwalkHelper extends  External.ExternalHelper implements IFileAnalyzer{

    name = "binwalk";

    /**
     *
     */
    duration:number = -1;

    constructor() {
        super()
    }

    /**
     * To check if Binwalk is installed and can be used
     *
     * @return {Promise<boolean>}  TRUE if ready, else FALSE
     * @async
     * @static
     * @method
     */
    static async check():Promise<boolean> {
        const cmd = BinwalkHelper.getExtPath("binwalk");
        const out = await _exec_(cmd+' -h');

        return (out.stdout!=null)
            && (/Binwalk v[0-9]\.[0-9]\.[0-9]/.test(out.stdout))
            && (/Usage: binwalk/.test(out.stdout)) ;
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
            out = Util.execSync(BinwalkHelper.getExtPath("binwalk")+' '+ShellHelper.escape(_path_.normalize(pPath)));
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


                    console.log("binwalk parsing > ",res);
                    if(res != null && res[3]!=null){
                        if(i==7){
                            file.type = res[3].split(' ')[0];
                        }

                        // __p = properties
                        // m = map
                        // o = offset
                        // t = type
                        file.appendChunk(new ModelFileSection(res[1], res[3]));
                    }else{
                        Logger.debug("Format not detected in : "+l[i]);
                    }
                }
            }
        }catch(err){
            Logger.error("[FILE FORMAT DETECTION] Deep  failed to scan path : "+pPath);

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
                        f.appendChunk( new ModelFileSection(res[1], res[3]));
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
                            f.appendChunk( new ModelFileSection(res[1], res[3]));
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
     * To scan a folder content with binwalk
     *
     * @param {string} pPath Folder to scan
     * @param {DexcaliburProject} pContext Active project
     * @param {Function} pSkipIf Glob pattern to skip
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
            const vFiles:any[] = _glob_.default.sync(pPath+"/**/*", {
                dot:true,
                nodir: true,
                ignore: pSkipIf,
                absolute: true
            });

            let counter:number = 0;
            const m = '/'+vFiles.length+' Files analyzed by data carving';

            this._wf.computeStepUp(vFiles.length);
            vFiles.map( (vFile:string) => {
                out = Util.execSync(BinwalkHelper.getExtPath("binwalk")+' '+ShellHelper.escape(vFile)); //, "utf8", opts);

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
                    pContext.bus.send(new BusEvent<FileScanResult>({
                        type: "data.file.new.knownFmt",
                        data: {
                            src: "binwalk",
                            file: f
                        }
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

        this.duration = (Util.time()-b)

        Logger.info("Time file format scan : "+this.duration);

        return files;
    }

}