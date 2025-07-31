import * as _path_ from "path"
import * as _fs_ from "fs"
import * as Log from "../Logger.js";
import Util from "../Utils.js";
import ShellHelper from "../ShellHelper.js";
import ProjectWorkspace from "../ProjectWorkspace.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import {spawnSync} from "child_process";
import * as VM from "vm";
import * as FridaCompile from "@dexcalibur/dexcalibur-frida-compile";
import * as TS_OriginalFridaCompile from "@dexcalibur/dxc-frida-compile";
import ts  from "@dexcalibur/dxc-frida-compile/ext/typescript.js";
import { performance } from "perf_hooks";
import * as Frida from "frida";

import {TargetLanguage} from "./common.js";
import {Nullable} from "../core/IStringIndex.js";
import {HookManagerException} from "../errors/HookManagerException.js";
import {getNodeSystem} from "./ext/System.js";
import chalk from "chalk";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


const styleReset = chalk.reset;
const styleFile = chalk.cyan.bold;
const styleLocation = chalk.yellow.bold;
const styleCode = chalk.gray;


export interface TsDiagnosticMessage {
    file:any,
    start:any,
    messageText:any
}


export interface ScriptCompilerDiagnosticMessage {
    file?:any,
    line?:number,
    character?:number,
    messageText?:string,
    logMsg?:string
    type?:any
}

export interface ScriptCompilerOutput {
    bundle:Nullable<string>;
    compiler:string;
    diags: ScriptCompilerDiagnosticMessage[];
}


interface HookRequirements {
    interruptor:boolean;
    fridaCompile:boolean;
}

const DIR_NAME = {
    LIB: "lib",
    DIST: "dist",
    BACKUP: "backup"
};


const FRIDA_COMPILE = 'frida-compile';


export interface HookWorkspaceState {
    commit:string
}

export interface TsCompilerOptions {
    sourceMaps?: "included" | "ommitted";
    compress?:boolean
}

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
    private _defaultName = 'index.';
    private _defaultOutName = 'index.min.js';
    private _ws:ProjectWorkspace = null;
    private _compiler:any = null;

    lang:TargetLanguage = TargetLanguage.TS;


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
        const mod_url = _path_.join(Util.__dirname(import.meta.url), "..", "..", "node_modules", "frida-compile", "dist", "compiler.js");

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
        const fridaCli = _path_.join(Util.__dirname(import.meta.url), "..", "..", "node_modules", "frida-compile", "dist", "cli.js");
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

        const status = this._checkRequirements();

        return ready && status.fridaCompile && status.interruptor;
    }

    getTsConfig():any {
        return {
            "compilerOptions": {
                "lib": ["es2017"],
                "target": "es2017", // es2017
                "module": "ES2020", // "commonjs",
                "declaration": true,
                "outDir": ".",
                "removeComments": true,
                "sourceMap": false,
                "strictNullChecks": false,
                "typeRoots": [
                    "node_modules/@types"
                ],
                "esModuleInterop": true,
                "types": [
                    "node",
                    "frida-gum",
                   // "chai",
                   // "mocha"
                ]
            },
            "include": [
                "src/**/*.ts",
                "*.ts"
            ],
            "exclude": [
                "node_modules",
                "**/*.spec.ts",
                "./test/",
                "./dist/"
            ]
        }

    }

    async createPackageJson(pFolder:string):Promise<void> {

        const pkgFile = _path_.join(pFolder,'package.json');

        if(_fs_.existsSync(pkgFile)){
            _fs_.unlinkSync(pkgFile);
        }
        _fs_.writeFileSync(
            pkgFile,
            JSON.stringify({
                "name": "hooks",
                "version": "1.0.0",
                "description": "",
                "main": "index.js",
                "directories": {
                    "lib": "lib"
                },
                "scripts": {

                },
                "type":"module",
                "author": "Dexcalibur Engine",
                "license": "ISC"
            })
        );
        return;
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
    async init():Promise<boolean> {

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

        // create package.json
        await this.createPackageJson(this._base);

        // create tsconfig file
        _fs_.writeFileSync(
            _path_.join(this._base, 'tsconfig.json'),
             JSON.stringify(this.getTsConfig())
        );

        const isInstalled = this._checkRequirements();

        // install requirements
        if(!isInstalled.interruptor) await this.installInterruptor();
        if(!isInstalled.fridaCompile) await this.installFridaCompile();

        // copy prebuilt-libs : interruptor, agent, ...
        await this.updateHookLibs();

        return true;
    }

    private _checkRequirements():HookRequirements{
        const reqs:HookRequirements = {
            interruptor: false,
            fridaCompile: false
        };
        const pkgFile = _path_.join(this._base,'package-lock.json');

        if(!_fs_.existsSync(pkgFile)) {
            return reqs;
        }

        try{
            const ctn = JSON.parse(_fs_.readFileSync(pkgFile,{encoding:'utf-8'}).toString());
            if(ctn!=null && ctn.packages !=null){
                reqs.interruptor = (ctn.packages['node_modules/@reversense/interruptor']!=null);
                reqs.fridaCompile = (ctn.packages['node_modules/frida-compile']!=null);
            }

        }catch(err){
            reqs.interruptor = false;
            reqs.fridaCompile = false;
        }

        return reqs;
    }

    private async _copyHookFile():Promise<void>{
        const agentSrc = _path_.join(Util.__dirname(import.meta.url), '..','..', 'agent');
        const destBase = _path_.join(this._base, DIR_NAME.LIB);

        Logger.info("[HOOK WORKSPACE] Copy the content of Agent folder ["+agentSrc+"]  to  ["+destBase+"] ");

        _fs_.cpSync(agentSrc, destBase, {
            recursive: true,
            verbatimSymlinks: false,
            dereference: false
        });
        /*
        _fs_.readdirSync(agentSrc).map( (vFileName:string)=>{
            const src = _path_.join(agentSrc,vFileName);
            const dest = _path_.join(destBase,vFileName)
            Logger.info("[HOOK WORKSPACE] Copy Agent lib from '"+src+"'  to  '"+dest+"'");
            _fs_.copyFileSync(src,dest);

        })*/
    }

    /**
     * To install Interruptor package inside hook workspace
     *
     * TODO : add offline install
     *
     * @async
     * @method
     */
    async installInterruptor():Promise<void> {
        await Util.execSync("cd "+this._base+" && npm install @reversense/interruptor");
        return;
    }

    /**
     * To install Interruptor package inside hook workspace
     *
     * TODO : add offline install
     *
     * @async
     * @method
     */
    async installFridaCompile():Promise<void> {
        await Util.execSync("cd "+this._base+" && npm install frida-compile");
        return;
    }



    /**
     *
     * @param pForce
     */
    async updateHookLibs( pForce=false):Promise<void>{


        let doUpdate:boolean = pForce;
        if(!_fs_.existsSync(_path_.join(this._base, DIR_NAME.LIB))){
            // create folder
            this._mkWDir(DIR_NAME.LIB);
            doUpdate = true;
        }

        if(doUpdate){
           await  this._copyHookFile();
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
    writeDefaultScript( pScript:string, pLang:TargetLanguage){
        this.lang = pLang;
        _fs_.writeFileSync(
            _path_.join(this._base, this._defaultName+(pLang==TargetLanguage.TS? 'ts':'js')),
            pScript,
            {

            }
        );
}

    /**
     *
     * @param pDiagMsg
     */
    static onTsCompilerDiagnostic( pDiagMsg :ts.Diagnostic):void{
        if (pDiagMsg.file !== undefined) {
            const { line, character } = ts.getLineAndCharacterOfPosition(pDiagMsg.file, pDiagMsg.start!);
            const message = ts.flattenDiagnosticMessageText(pDiagMsg.messageText, "\n");
            console.log(`${pDiagMsg.file.fileName} (${line + 1},${character + 1}): ${message}`);
        } else {
            console.log(ts.flattenDiagnosticMessageText(pDiagMsg.messageText, "\n"));
        }
    }

    private static _formatFilename(pPath:string, pPwd:string): string {
        const c = _path_.resolve(pPwd);
        const p = _path_.resolve(pPath);

        if (p.startsWith(c + _path_.sep)) {
            return p.slice(c.length + 1);
        }

        return pPath;
    }

    private static _formatCompiling( pPath:string, pPwd:string):string {
        return styleReset("")+
            "Compiling "+
            styleFile(HookWorkspace._formatFilename(pPath, pPwd))+
            styleReset("")+"...";
    }

    private static _formatCompiled( pPath:string, pPwd:string, pStarted:number, pFinished:number):string {
        return styleReset("")+
            "Compiled "+
            styleFile(HookWorkspace._formatFilename(pPath, pPwd))+
            styleReset("")+
            styleCode(` (${Math.floor(pFinished-pStarted)})`)+
            styleReset("")+"...";
    }


    private static _formatDiag( pDiag:any, pPwd:string):string {
        const { category, code, text, file } = pDiag;

        let prefix = "";
        if (file !== undefined) {
            const filename = HookWorkspace._formatFilename(file.path, pPwd);
            const line = file.line + 1;
            const character = file.character + 1;

            const pathSegment = styleFile(filename);
            const lineSegment = styleLocation(String(line));
            const charSegment = styleLocation(String(character));

            prefix = `${pathSegment}:${lineSegment}:${charSegment} - `;
        }

        //const categoryStyler = CATEGORY_STYLE[category] ?? styleReset;
       //const styledCategory = categoryStyler(category);
        const styledCode = styleCode(`TS${code}`);

        return `${prefix}${category}${styleReset("")} ${styledCode}${styleReset("")}: ${text}`;
    }


    /*private _compileListeners():any {
        return {
            onDiagnostic: ( pDiagMsg :ts.Diagnostic):void => {
                if (pDiagMsg.file !== undefined) {
                    const { line, character } = ts.getLineAndCharacterOfPosition(pDiagMsg.file, pDiagMsg.start!);
                    const message = ts.flattenDiagnosticMessageText(pDiagMsg.messageText, "\n");
                    Logger.error(` ${pDiagMsg.file.fileName} (${line + 1},${character + 1}): ${message}`);

                    compilerOutputs.diags.push({
                        file: pDiagMsg.file.fileName,
                        line: line + 1,
                        character: character + 1,
                        messageText: message,
                        logMsg: `${pDiagMsg.file.fileName} (${line + 1},${character + 1}): ${message}`
                    });
                } else {
                    compilerOutputs.diags.push({
                        logMsg: ts.flattenDiagnosticMessageText(pDiagMsg.messageText, "\n")
                    });
                    Logger.error(ts.flattenDiagnosticMessageText(pDiagMsg.messageText, "\n"));
                }
            },
        }
    }*/

    /**
     *
     * @param pInputFile
     * @param pOutputFile
     * @param pOptions
     */
    async compileTsScript(pInputFile:Nullable<string>=null,pOutputFile:Nullable<string>=null,
                           pOptions:any={
                                verbose:false,
                                typeCheck:"full",
                                bundleFmt:"esm",
                                outputFmt:"unescaped" }):Promise<ScriptCompilerOutput> {

        let compilerOutputs:ScriptCompilerOutput = {
            bundle: null,
            compiler: "ts",
            diags: []
        };

        const input = _path_.join(this._base,(pInputFile!=null ? pInputFile : this._defaultName+"ts"));
        const output = _path_.join(this._base, (pOutputFile!=null ? pOutputFile : this._defaultName+"js"));
        const outputDir = _path_.dirname(output);
        const fullOutputPath = output;
        let compilationStarted = -1;

        // check if input file exists
        if(!_fs_.existsSync(input)){
            throw HookManagerException.COMPILER_INPUT_NOT_FOUND();
        }

        const compiler = new Frida.Compiler(Frida.getDeviceManager());

        const options:any /*Frida.CompilerOptions*/ = {
            projectRoot: this._base,
            outputFormat: pOptions.outputFmt,
            sourceMaps: pOptions.sourceMaps ? Frida.SourceMaps.Included : Frida.SourceMaps.Omitted,
            compression: pOptions.compress ? Frida.JsCompression.Terser : Frida.JsCompression.None,
            typeCheck: pOptions.typeCheck
        };


        if(pOptions.verbose){
            compiler.starting.connect(()=>{
                compilationStarted = performance.now();
                /*
                                if (opts.watch) {
                                    readline.cursorTo(process.stdout, 0, 0);
                                    readline.clearScreenDown(process.stdout);
                                }
                */
                console.log(
                    HookWorkspace._formatCompiling(input, options.projectRoot)
                );
            });
            compiler.finished.connect(()=>{
                const timeFinished = performance.now();

                console.log(
                    HookWorkspace._formatCompiled(input, options.projectRoot, compilationStarted, timeFinished)
                );
            });
        }
        compiler.diagnostics.connect((diagnostics: any) => {
            compilerOutputs.diags = diagnostics;
            for (const diag of diagnostics) {
                console.log(HookWorkspace._formatDiag(diag, options.projectRoot));
            }
        })

        try{
            compilerOutputs.bundle = await compiler.build(input, options);

            // write bundle
            _fs_.mkdirSync(outputDir, { recursive: true });
            _fs_.writeFileSync(fullOutputPath, compilerOutputs.bundle!);
        }catch(err){
            Logger.error(err.message);
            Logger.error(err.stack);
            //throw HookC
        }

        return compilerOutputs;
    }



    /**
     * Replace exec of frida-compile
     *
     * @param {Nullable<string>} pInputFile Default NULL. Path relative to hook workspace
     * @param {Nullable<string>} pOutputFile  Default NULL. Path relative to hook workspace
     * @return {Nullable<string>}
     * @method
     */
    async compileTsScriptOLD(pInputFile:Nullable<string>=null,pOutputFile:Nullable<string>=null, pOptions:TsCompilerOptions={}):Promise<ScriptCompilerOutput> {

        let script:Nullable<string> = null;
        let compilerOutputs:ScriptCompilerOutput = {
            bundle: null,
            compiler: "ts",
            diags: []
        };

        const input = _path_.join(this._base,(pInputFile!=null ? pInputFile : this._defaultName+"ts"));
        const output = _path_.join(this._base, (pOutputFile!=null ? pOutputFile : this._defaultName+"js"));
        const outputDir = _path_.dirname(output);
        const fullOutputPath = output;

        // sanity check of hook folder, detect missing parts of frida-compile
        let compilerRoot:string;


        const fridaSystemRoot = _path_.join(this._base,"node_modules","frida-compile","dist","system","node.js");


        compilerRoot = _path_.join(this._base,"node_modules");

        // check if input file exists
        if(!_fs_.existsSync(input)){
            throw HookManagerException.COMPILER_INPUT_NOT_FOUND();
        }

        const system:ts.System = getNodeSystem(fridaSystemRoot);
        const assets  = TS_OriginalFridaCompile.queryDefaultAssets(this._base, system, compilerRoot);

        const options:TS_OriginalFridaCompile.BuildOptions = {
            entrypoint: input,
            projectRoot: this._base,
            sourceMaps: pOptions.sourceMaps ? "included" : "omitted",
            compression: pOptions.compress ? "terser" : "none",
            assets: assets,
            system: system,
            compilerRoot:compilerRoot,
            onDiagnostic: ( pDiagMsg :ts.Diagnostic):void => {
                if (pDiagMsg.file !== undefined) {
                    const { line, character } = ts.getLineAndCharacterOfPosition(pDiagMsg.file, pDiagMsg.start!);
                    const message = ts.flattenDiagnosticMessageText(pDiagMsg.messageText, "\n");
                    Logger.error(` ${pDiagMsg.file.fileName} (${line + 1},${character + 1}): ${message}`);

                    compilerOutputs.diags.push({
                        file: pDiagMsg.file.fileName,
                        line: line + 1,
                        character: character + 1,
                        messageText: message,
                        logMsg: `${pDiagMsg.file.fileName} (${line + 1},${character + 1}): ${message}`
                    });
                } else {
                    compilerOutputs.diags.push({
                        logMsg: ts.flattenDiagnosticMessageText(pDiagMsg.messageText, "\n")
                    });
                    Logger.error(ts.flattenDiagnosticMessageText(pDiagMsg.messageText, "\n"));
                }
            }
        };

        try{
            compilerOutputs.bundle = TS_OriginalFridaCompile.build(options);

            // write bundle
            _fs_.mkdirSync(outputDir, { recursive: true });
            _fs_.writeFileSync(fullOutputPath, compilerOutputs.bundle!);
        }catch(err){
            Logger.error(err.message);
            Logger.error(err.stack);
            //throw HookC
        }

        return compilerOutputs;
    }

    /**
     *
     * @param pOutputPath
     */
    async compileDefaultScript( pOutputPath:string = null):Promise<ScriptCompilerOutput> {
        const out = _path_.join(this._base, (pOutputPath!=null? pOutputPath : this._defaultOutName));
        const compilerOutput:ScriptCompilerOutput = {
            compiler: "js",
            bundle: null,
            diags: []
        };

        compilerOutput.bundle = await this.compileScriptWith10_2_5(_path_.join(this._base, this._defaultName+'js'), out);

        //return this.execFridaCompiler(_path_.join(this._base, this._defaultName), out);
        return compilerOutput
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

    getLastcommit():string {
        // TODO
        return "";
    }
}