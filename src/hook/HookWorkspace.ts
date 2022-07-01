import * as _path_ from "path"
import * as _fs_ from "fs"
import * as Log from "../Logger";
import Util from "../Utils";
import ShellHelper from "../ShellHelper";


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
        this._compileBin = Util.whereIs(FRIDA_COMPILE);

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
    compileDefaultScript( pOutputPath:string = null):string {
        const out = _path_.join(this._base, (pOutputPath!=null? pOutputPath : this._defaultOutName));

        return this.compileScript( _path_.join(this._base, this._defaultName), out);
    }

    /**
     * To compile the file at pInputPath using frida-compile, and write output in pOutputPath
     * @param pOutputPath
     */
    compileScript( pInputPath:string, pOutputPath:string):string {
        let out = null;
        let script = null;
        try {
            out = Util.execSync(this._compileBin + ' ' +
                ShellHelper.escape(_path_.normalize(pInputPath))+' -o '+
                ShellHelper.escape(_path_.normalize(pOutputPath)));
            Logger.info("[HOOK WS] Compile script ("+out.length+") : \n"+out);

            script = _fs_.readFileSync(pOutputPath, { encoding:'utf8' });
        }catch(e){
            Logger.error("[HOOK WS] Compile script ("+e.message.length+") : \n"+e.message);
        }

        return script;
    }
}