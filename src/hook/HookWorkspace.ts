import * as _path_ from "path"
import * as _fs_ from "fs"
import * as Log from "../Logger";
import Util from "../Utils";
import ShellHelper from "../ShellHelper";
import ProjectWorkspace from "../ProjectWorkspace";
import DexcaliburEngine from "../DexcaliburEngine";
import {fork, spawnSync} from "child_process";
import * as VM from "vm";
import * as FridaCompile from "@reversense/dexcalibur-frida-compile";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


const DIR_NAME = {
    LIB: "lib",
    DIST: "dist",
    BACKUP: "backup"
};


const FRIDA_COMPILE = 'frida-compile';

/**
 * A class used to interact with folder from project workspace
 * where the hook script is built
 *
 * TODO : use Git as CVS on this directory
 *
 * @class
 */
export default class HookWorkspace {

    /**
     * Base path of the hook workspace of the project
     *
     * @type {string}
     * @field
     * @private
     */
    private _base:string = null;
    private _compileBin = 'frida-compile';
    private _defaultName = 'index.js';
    private _defaultOutName = 'index.min.js';
    private _ws:ProjectWorkspace = null;

    private _compiler:any = null;


    /**
     *
     * @param {any} pConfig
     * @constructor
     */
    constructor( pConfig:any = null) {
        if(pConfig!=null){
            for(const i in pConfig){
                this[i] = pConfig[i];
            }
        }

        /*if(FRIDA_COMPILER == null){
            HookWorkspace.importFridaCompiler();
        }*/
    }

    /**
     *
     */
    runFridaCompiler( pInputPath:string, pOutputPath:string):any{

        const ctx = {
            param:{
                projectRoot: _path_.dirname(_path_.normalize(pInputPath)),
                inputPath: pInputPath,
                outputPath: pOutputPath,
                Logger:Logger
            }
        };
        const mod_url = _path_.join(__dirname, "..", "..", "node_modules", "frida-compile", "dist", "compiler.js");

        // ../../ext/frida-compile/dist/compiler.js
        VM.createContext(ctx);
        VM.runInNewContext(
            `
            param.Logger.raw("[HOOK WORKSPACE] frida-compile VM start");
            
            async function runFrida(){
            param.Logger.raw("[HOOK WORKSPACE] frida-compile VM import : ${mod_url}");
               const compiler = await import("${mod_url}"); 
               param.Logger.raw("[HOOK WORKSPACE] frida-compile VM after import");
               compiler.build({
                    projectRoot: pPar.projectRoot,
                    inputPath: pPar.inputPath,
                    outputPath: pPar.outputPath,
                    sourceMaps:  "included",
                    compression: "none"
                });
               param.Logger.raw("[HOOK WORKSPACE] frida-compile VM built");
            }
            runFrida(param);
            
            param.Logger.raw("[HOOK WORKSPACE] frida-compile VM end");
            `,ctx
        );

        Logger.raw("[HOOK WORKSPACE] frida-compile VM done");
        //const script = _fs_.readFileSync(pOutputPath, { encoding:'utf8' });
        const script = "";
        Logger.raw(script);
        return script;
    }

    /**
     *
     */
    execFridaCompiler( pInputPath:string, pOutputPath:string):string{

        const ctx = {
            param:{
                projectRoot: _path_.dirname(_path_.normalize(pInputPath)),
                inputPath: pInputPath,
                outputPath: pOutputPath,
                Logger:Logger
            }
        };
        const fridaCli = _path_.join(__dirname, "..", "..", "node_modules", "frida-compile", "dist", "cli.js");
        const interpreterPath = process.execPath;
        const env = process.env;
        let script = "";

        env.ELECTRON_RUN_AS_NODE = "1";
        env.PATH = process.env.PATH;

        Logger.info('[execPath='+process.execPath+']');
        Logger.info('[fridaCompilePath='+fridaCli+']');
        Logger.info('[inputPath='+ShellHelper.escape(_path_.normalize(pInputPath))+']');
        Logger.info('[outputPath='+ShellHelper.escape(_path_.normalize(pOutputPath))+']');


        let ferr:number, fout:number;
        try{
            ferr = _fs_.openSync( _path_.join(this._base, 'frida_compiler_err.log'),'w+');
            fout = _fs_.openSync( _path_.join(this._base, 'frida_compiler_out.log'),'w+');

            const env = process.env;
            env.ELECTRON_RUN_AS_NODE = "1";
            env.PATH = process.env.PATH;

            Logger.info('[execPath='+process.execPath+']');


            const child = spawnSync(process.execPath,
                [
                    fridaCli+' '+ShellHelper.escape(_path_.normalize(pInputPath))+' -o '+ShellHelper.escape(_path_.normalize(pOutputPath))
                ],{
                cwd: this._base,
                shell: false,
                stdio: ['ignore', fout, ferr],
                env:env
               // argv0: interpreterPath
            });

            Logger.raw("[HOOK WORKSPACE] exec frida-compile done");

            script = _fs_.readFileSync(pOutputPath, { encoding:'utf8' });
            Logger.raw("[HOOK WORKSPACE] frida-compile output : \n"+script);


         }catch(err){
                Logger.error("[HOOK WS] Compile error: ("+err.message+")");
         }finally {
                _fs_.closeSync(ferr);
                _fs_.closeSync(fout);
         }

        return script;
    }

    /**
     * To create a directory into the application working directory.
     * @param {string} dirName The name of the directory to create
     * @method
     */
    private _mkWDir(pDirName:string){
        _fs_.mkdirSync(_path_.join(this._base, pDirName), {recursive: true});
    }

    /**
     * To check if the workspace is ready for a build
     *
     *
     *
     * @return {boolean}
     * @method
     */
    isReady():boolean {
        let ready = true;

        ready = ready && _fs_.existsSync(this._base);

        return ready;
    }

    /**
     * To initialize the frida workspace
     *
     * This method should be executed only when :
     * - project is created and target device is know
     * - dexcalibur is updated
     *
     * @return {boolean}
     * @method
     */
    init():boolean {

        // create base folder
        if(!_fs_.existsSync(this._base)){
            _fs_.mkdirSync(this._base, {recursive: true});
        }

        // create hook backup folder
        if(!_fs_.existsSync(_path_.join(this._base, DIR_NAME.BACKUP))){
            this._mkWDir(DIR_NAME.BACKUP);
        }

        // we assume frida-compile is configured as external tool
        // if frida-compile is configured as external tool, use it, else use built-in compiler
        const globalSettings = DexcaliburEngine.getInstance().getSettings()
        const fridaCompile = globalSettings.getExternalSettings().getTool('frida-compile');
        if(fridaCompile != null){
            this._compileBin = fridaCompile;
        }else{
            this._compileBin = Util.whereIs(FRIDA_COMPILE);
        }



        // copy prebuilt-libs : interruptor, agent, ...
        this.updateHookLibs();

        return true;
    }

    private _copyHookFile(){
        const agentSrc = _path_.join(__dirname, '..','..', 'agent');
        const destBase = _path_.join(this._base, DIR_NAME.LIB);

        _fs_.readdirSync(agentSrc).map( (vFileName:string)=>{
            const src = _path_.join(agentSrc,vFileName);
            const dest = _path_.join(destBase,vFileName)
            Logger.info("[HOOK WORKSPACE] Copy Agent lib from '"+src+"'  to  '"+dest+"'");
            _fs_.copyFileSync(src,dest);
        })
    }

    /**
     *
     * @param pForce
     */
    updateHookLibs( pForce=false){
        let doUpdate:boolean = pForce;
        if(!_fs_.existsSync(_path_.join(this._base, DIR_NAME.LIB))){
            // create folder
            this._mkWDir(DIR_NAME.LIB);
            doUpdate = true;
        }

        if(doUpdate){
            this._copyHookFile();
        }
    }

    /**
     * To extend the frida workspace to support a new architecture/os
     *
     * This method should be executed only when :
     * - a new arch/os is targeted
     *
     * @return {boolean}
     * @method
     */
    addNewPlatform():boolean {
        return false;
    }

    /**
     * To write the script into the default file : index.js
     */
    writeDefaultScript( pScript:string){
        _fs_.writeFileSync(
            _path_.join(this._base, this._defaultName),
            pScript,
            {

            }
        );
    }

    /**
     *
     * @param pOutputPath
     */
    async compileDefaultScript( pOutputPath:string = null):Promise<string> {
        const out = _path_.join(this._base, (pOutputPath!=null? pOutputPath : this._defaultOutName));

        //return this.execFridaCompiler(_path_.join(this._base, this._defaultName), out);
        return this.compileScriptWith10_2_5(_path_.join(this._base, this._defaultName), out);
    }

    async compileScriptWith10_2_5( pInputPath:string, pOutputPath:string):Promise<string> {
        //let child = null;
        let done:any;

        return await (FridaCompile.build(pInputPath, pOutputPath, {
            bytecode: false,
            sourcemap: "included",
            compress: false,
            useAbsolutePaths: true,
            cwd: this._base,
            standalone: null
        }) as Promise<void>).then( x=>{
            const s =  _fs_.readFileSync(pOutputPath, { encoding:'utf8' });
            return s;
        });
    }

    /**
     * To compile the file at pInputPath using frida-compile, and write output in pOutputPath
     * @param pOutputPath
     */
    async compileScript( pInputPath:string, pOutputPath:string):Promise<void> {
        //let child = null;
        let done:any;

        // .then(this.execFridaCompiler)
        //let mod = this._asyncEval(`return import("frida-compile/dist/compiler.js")`)

        // "../../ext/frida-compile/dist/compiler.mjs"
        /*done = .then( async vMod => {

            Logger.raw(`[FRIDA COMPILE] in=${pInputPath} out=${pOutputPath}`);
            await vMod.build({
                projectRoot: _path_.dirname(_path_.normalize(pInputPath)),
                inputPath: pInputPath,
                outputPath: pOutputPath,
                sourceMaps:  "included", //opts.sourceMaps ? "included" : "omitted",
                compression: "none" //opts.compress ? "terser" : "none",
            });

            return true;
        })*/

        /*
        await (await import("../../ext/frida-compile/dist/compiler.mjs")).build({
            projectRoot: _path_.dirname(_path_.normalize(pInputPath)),
            inputPath: pInputPath,
            outputPath: pOutputPath,
            sourceMaps:  "included", //opts.sourceMaps ? "included" : "omitted",
            compression: "none" //opts.compress ? "terser" : "none",
        });*/

        /*return await (HookWorkspace.importFridaCompiler().build({
            projectRoot: _path_.dirname(_path_.normalize(pInputPath)),
            inputPath: pInputPath,
            outputPath: pOutputPath,
            sourceMaps:  "included",
            compression: "none"
        }) as Promise<void>).then( x=>{
            Logger.raw(`[HOOK WORKSPACE] frida-compile done`);
            return new Promise(()=>{
                Logger.raw(`[HOOK WORKSPACE] frida-compile :  dump `);
                return _fs_.readFileSync(pOutputPath, { encoding:'utf8' });
            })
        });
/*
        if(done){
            Logger.raw(`[HOOK WORKSPACE] frida-compile done`);
            return  _fs_.readFileSync(pOutputPath, { encoding:'utf8' });
        }else{
            Logger.raw(`[HOOK WORKSPACE] frida-compile aborted/skipped`);
            return null;
        }



        //try {

            //try{
                //ferr = _fs_.openSync( _path_.join(app.getPath('logs'), 'fork_err.log'),'w+');
                //fout = _fs_.openSync( _path_.join(app.getPath('logs'), 'fork_out.log'),'w+');
/*
                const env = process.env;
                env.ELECTRON_RUN_AS_NODE = "1";
                env.PATH = process.env.PATH;

                Logger.info('[execPath='+process.execPath+']');


                child = spawnSync(this._compileBin,
                    [
                        ShellHelper.escape(_path_.normalize(pInputPath)),
                        ' -o ',
                        ShellHelper.escape(_path_.normalize(pOutputPath))
                    ],{
                        env: env,
                        execPath: process.execPath
                    });
                child.on('error', (err) => {
                    Logger.error(JSON.stringify(err))
                    // This will be called with err being an AbortError if the controller aborts
                });
                child.on('close', (err) => {
                    script = _fs_.readFileSync(pOutputPath, { encoding:'utf8' });
                    Logger.error(script)
                    // This will be called with err being an AbortError if the controller aborts
                });

           // }catch(err){
               // Logger.error("[HOOK WS] Compile error: ("+err.message+")");
            //}finally {
                //_fs_.closeSync(ferr);
                //_fs_.closeSync(fout);
            //}
/*

            out = Util.execSync(this._compileBin + ' ' +
                ShellHelper.escape(_path_.normalize(pInputPath))+' -o '+
                ShellHelper.escape(_path_.normalize(pOutputPath)));
            Logger.info("[HOOK WS] Compile script ("+out.length+") : \n"+out);*/

            //script = _fs_.readFileSync(pOutputPath, { encoding:'utf8' });
        /*}catch(e){
            Logger.error("[HOOK WS] Compile script ("+e.message.length+") : \n"+e.message);
        }*/

        //return script;
    }
}