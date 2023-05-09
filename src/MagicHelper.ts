import ModelFile from "./ModelFile.js";
import Util from "./Utils.js";
import * as _path_ from "path";
import DexcaliburProject from "./DexcaliburProject.js";
import {EOL} from "os";
import BusEvent from "./BusEvent.js";
import * as _glob_ from "glob";
import * as _os_ from "os";
import * as _fs_ from "fs";
import * as  _ps_ from "child_process";

import * as Log from './Logger.js';
import ModelFileSection from "./ModelFileSection.js";
import {External} from "./external/External.js";
import DexcaliburWorkspace from "./DexcaliburWorkspace.js";
import DexcaliburEngine from "./DexcaliburEngine.js";
import {Settings} from "./Settings.js";
import ExternalSettings = Settings.ExternalSettings;
import ShellHelper from "./ShellHelper.js";
import {IFileAnalyzer} from "./analyzer/IFileAnalyzer.js";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 * Magic number-based file identification
 */
export class MagicHelper extends  External.ExternalHelper implements IFileAnalyzer{

    private __sh:string;

    constructor() {
        super()
    }

    static getToolPath():string {
        if(_os_.platform()=="win32"){
            throw new Error("Magic mode is not supported on Windows");
        }else{
            return Util.trim(
                _ps_.execSync("which file",{shell:ShellHelper.getExtPath()}).toString()
            );
        }
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
            out = Util.execSync(MagicHelper.getExtPath()+' '+ShellHelper.escape(_path_.normalize(pPath)));
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

    private _parseBasicOutput( pOut:string):ModelFile {
        const out:string[] = pOut.split(EOL);

        while(out[0].indexOf(':')==-1) out.shift();

        const f:ModelFile = new ModelFile();
        f.type = Util.trim(out[0].split(':')[1]);

        return f;
    }

    /**
     * To scan APK content with binwalk
     *
     * @param {string} pPath Folder to scan
     * @param {DexcaliburProject} pContext Active project
     * @param {Function} pSkipIf Function to detect is the file must be skipped
     * @return {ModelFile[]} An array of ModelFile
     */
    analyzeFolder(pPath:string, pContext:DexcaliburProject, pSkipGlob:string = ""):ModelFile[] {

        const b = Util.time();



        let out:string;
        let files:ModelFile[] = [];
        //let opts:any = {stdio: [null,null,null], shell:false };
        let opts:any = {stdio: 'pipe', shell:ShellHelper.getExtPath() }; //[null,'pipe','pipe'], shell:false };
        const bin = MagicHelper.getToolPath();

        try{
            const vFiles:any[] = _glob_.default.sync(pPath+(pPath[pPath.length-1]=="/"?"**/*":"/**/*"), {
                dot:true,
                nodir: true,
                ignore: pSkipGlob,
                absolute: true
            });

            const vCtd = vFiles.length;
            let counter:number = 0;

            // update progress bar
            this._wf.computeStepUp(vFiles.length);

            vFiles.map( (vFile:string) => {

                out = Util.execSync(bin+' '+ShellHelper.escape(vFile), "utf8", opts);

                const f:ModelFile = this._parseBasicOutput(out);
                f.name = _path_.basename(vFile);
                f.path = vFile;

                Logger.info(JSON.stringify(f.toJsonObject()));
                counter++;

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

        }catch(err){
            Logger.error("[MAGIC HELPER] Magic helper failed to scan path (1) : "+pPath+"\n"+err.message+"\n"+err.stack);
        }

        Logger.info("Time (after magic check): "+(Util.time()-b));

        return files;
    }

}