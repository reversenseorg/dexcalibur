import {R2CmdResult, R2Pipe} from './external/R2Pipe.js';

import * as Log from './Logger.js';
import ModelExecutableSection from "./ModelExecutableSection.js";
import {ModelFunction} from "./ModelFunction.js";
import ModelFile from "./ModelFile.js";
import {ModelNativeRef} from "./ModelNativeRef.js";
import ModelCpuInstruction from "./ModelCpuInstruction.js";
import {ModelVariable, ModelVariableLocation} from "./ModelVariable.js";
import {External} from "./external/External.js";
import Util from "./Utils.js";
import {NativeAnalyzerCommands} from "./analyzer/NativeAnalyzerCommands.js";
import {DATATYPE_CATEGORY, TypeManager} from "./types/TypeManager.js";
import {DataType} from "./types/DataType.js";
import {TagManager} from "./tags/TagManager.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {INativeHelper, NativeHelperCmd} from "./analyzer/INativeHelper.js";
import {NativeBackend} from "./NativeAnalyzer.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export enum R2_TYPE {
    LOCAL,
    HTTP
}



const COLS_SECTIONS = {'Nm':'n', 'Vaddr':'vaddr', 'Paddr':'paddr', 'Size':'sz', 'Memsz':'memsz', 'Perms':'perm', 'Name':'name'};
const COLS_AFL = ['addr','sz','bbs','name'];

const ARCH_RET = {
    aarch64: "x0",
    aarch32: "r0",
    // x64: "rdx",
    // x86: "edx",
}

/**
 * @class
 * @author Georges-B MICHEL
 */
export default class RadareHelper implements INativeHelper
{

    readonly BACKEND_TYPE = NativeBackend.R2;

    _t:R2_TYPE = R2_TYPE.LOCAL;

    // history :  holds commands already executed
    /**
     * An history holding commands previously executed for this
     * instance
     *
     * @field
     * @type {any}
     * @since 1.0.0
     */
    _h:any = {};

    /**
     * r2pipe instance
     *
     * @field
     * @type {R2Pipe}
     * @since 1.0.0
     */
    _p:Nullable<R2Pipe> = null;

    /**
     * r2 config
     *
     * @field
     * @type {any}
     * @since 1.0.0
     */
    _cfg:any = {}

    // todo: file path or buffer (such as dump or memory segment)
    /**
     * File analyzed buy this instance of r2
     *
     * @field
     * @type {ModelFile}
     * @since 1.0.0
     */
    target:ModelFile = null;

    /**
     * r2  options
     *
     * @field
     * @type {any}
     * @since 1.0.0
     */
    opts:any = {};

    /**
     * Type manager of the project
     *
     * @field
     * @type {TypeManager}
     * @since 1.0.0
     */
    private _typeMgr: TypeManager;

    /**
     * Tag manager of the project
     *
     * @field
     * @type {TypeManager}
     * @since 1.0.0
     */
    private _tagMgr: TagManager;

    /**
     *
     * @param {ModelFile} pBinary File to analyze
     * @param {R2_TYPE} pType
     * @param pOptions
     * @since 1.0.0
     */
    constructor( pBinary:ModelFile, pType:R2_TYPE, pOptions:any = {}) {
        this._t = pType;
        this.target = pBinary;
        this.opts = pOptions;
        this._typeMgr = pOptions.ctx.getTypeManager();
        this._tagMgr = pOptions.ctx.getTagManager();
    }

    /**
     * To instanciante object representing file section from r2 json output
     *
     * @param {any} pOut A poor JSON object containing sections from Radare2
     * @return {ModelExecutableSection[]} An array of execautable sections
     * @method
     * @static
     * @since 1.0.0
     */
     async parseSections(pOut:any):Promise<ModelExecutableSection[]> {
        let secs:ModelExecutableSection[] = [];

        console.log(pOut);

        pOut.map( vSec => {
            secs.push(new ModelExecutableSection({
                name: (vSec.name=="")? '[base]' : vSec.name,
                perm: vSec.perm,
                memsz: vSec.vsize,
                sz: vSec.sz,
                paddr: vSec.paddr,
                vaddr: vSec.vaddr,
            }));
        });

        return secs;
    }



    /**
     * To instanciante object representing function from r2 json output
     *
     * @param {any} pOut A poor JSON object containing functions from Radare2
     * @return {ModelFunction[]} An array of functions
     * @method
     * @static
     * @since 1.0.0
     */
    async parseFunctionList(pOut:any, pOptions:any = null):Promise<ModelFunction[]> {

        let fns:ModelFunction[] = [];


        Logger.debug("R2 > parse functions ...");

        try{
            pOut.map( vFn => {

                let f:ModelFunction = new ModelFunction({
                    name: vFn.name,
                    addr: vFn.offset,
                    sz: vFn.size,
                    nbbs: vFn.nbbs,
                    edges: vFn.edges,
                    stack: vFn.stackframe,
                    ctype: vFn.calltype,
                    src: pOptions.src //.getUID()
                });

                if(vFn.name.startsWith('sym.')){
                    if(vFn.name.startsWith('sym.imp.')){
                        f.symbol = vFn.name.substring(8);
                    }else{
                        f.symbol = vFn.name.substring(4);
                    }
                }

                if(!vFn.noreturn){
                    // todo : implement multi arch
                    f.setReturn(
                        new ModelVariable({
                            n: "ret",
                            __t: ModelVariableLocation.REG,
                            type: this._typeMgr.getNativeType("uint64_t"),
                            ref: ARCH_RET.aarch64
                        })
                    );
                }

                if(vFn.hasOwnProperty('callrefs')){
                    vFn.callrefs.map( ref => {
                        f.cref.push( new ModelNativeRef({
                            addr: ref.addr,
                            at: ref.at,
                            __t: ref.type
                        }))
                    });
                }

                if(vFn.hasOwnProperty('datarefs')) {
                    vFn.datarefs.map( addr => {
                        f.dref.push( new ModelNativeRef({
                            addr: addr,
                        }))
                    });
                }



                if(vFn.hasOwnProperty('codexrefs')) {
                    vFn.codexrefs.map( ref => {
                        f.xcref.push( new ModelNativeRef({
                            addr: ref.addr,
                            at: ref.at,
                            __t: ref.type
                        }))
                    });
                }


                if(vFn.hasOwnProperty('dataxrefs')) {
                    vFn.dataxrefs.map( addr => {
                        f.xdref.push( new ModelNativeRef({
                            addr: addr
                        }))
                    });
                }

                if(vFn.hasOwnProperty('regvars')){
                    f.regvars = [];
                    vFn.regvars.map( ref => {
                        f.regvars.push( new ModelVariable({
                                n: ref.name,
                                __t: (ref.kind==ModelVariableLocation.REG ? ModelVariableLocation.REG:ModelVariableLocation.STACK),
                                type: this._typeMgr.getNativeType(ref.type),
                                ref: ref.refs
                            })
                        )
                    });
                    f.args = f.regvars;
                }


                ['spvars','bpvars'].map( vType => {
                    if(vFn.hasOwnProperty(vType)){
                        f[vType] = [];
                        vFn[vType].map( ref => {
                            f[vType].push( new ModelVariable({
                                    n: ref.name,
                                    __t: (ref.kind==ModelVariableLocation.REG ? ModelVariableLocation.REG:ModelVariableLocation.STACK),
                                    type: this._typeMgr.getNativeType(ref.type),
                                    ref: ref.refs
                                })
                            )
                        });
                    }
                })


                fns.push(f);
            });
        }catch(err){
            Logger.error("[R2] Error : "+err.message);
        }


        return fns;
    }

    /**
     * To check is a combination of commands have been already executed
     *
     * @param {string[]} pCommands Names of command to check
     * @return {boolean} Return TRUE if all commands have been executed, else FALSE
     * @method
     * @since 1.0.0
     */
    isReadyFor( pCommands:string[], pOptions:any=null):boolean {
        let f:boolean = true;
        pCommands.map( v => {
            if(pOptions!==null){
                // TODO : not supported
                f = f && false;
            }else{
                f = f && (this._h[v]===true ? true : false);
            }

        });
        return f;
    }

    /**
     * To execute a set of command into r2.
     *
     * Additional arguments can be passed through 'pOptions'
     *
     * @param {string[]} pCommands
     * @param (any} pOptions Optionnal. Additional argument for the commands
     * @return {number} Number of command successfully executed
     * @async
     * @method
     * @since 1.0.0
     */
    async runCmd( pCommands:string[], pOptions:any= { update:true }):Promise<R2CmdResult[]> {
        let k:number = 0;
        let data:any;
        let res:R2CmdResult[] =[];
        let parsedData:any;



        Logger.debug('[R2] Run command : '+pCommands.join(','));

        for(let i=0; i<pCommands.length; i++){

            if(this._h[pCommands[i]] === true && pOptions.force!==true) continue;

            data = null;

            switch(pCommands[i]){
                case NativeHelperCmd.LIST_SECTIONS:
                    data = await this._p.runCmd("iSj");

                    if(data.success){
                        this._h.sections = true;
                        data.data = await this.parseSections(data.data);
                        res.push(data);

                        if(pOptions.update){
                            this.target.setProgramSection(data.data);
                            //this.target.tagAs('$r');
                        }
                    }else{
                        res.push(null);
                    }


                    if(data){
                        k++;
                    }
                    break;
                case NativeHelperCmd.LIST_FUNCS:
                    data = await this._p.runCmd("aflj");
                    if(data.success){

                        this._h.f_list = true;

                        data.data = await this.parseFunctionList(data.data, {
                            src: {
                                __:ModelFile.TYPE.getType(),
                                _uid: this.target.getUID()
                            }
                        });

                        res.push(data);


                        if(pOptions.update){
                            this.target.appendFunctions(data.data);
                            //this.target.tagAs('$r');
                        }
                    }else{
                        res.push(null);
                    }
                    if(data) k++;
                    break;
                case NativeAnalyzerCommands.FUNC_CMD.DISASS:
                    if((pOptions.fn instanceof  ModelFunction) && (pOptions.fn.getAddr()!=null)){
                        data = await this._p.runCmd("pdfj @ "+pOptions.fn.getAddr(), {json:true, ignoreErr: false});
                        if(data != null){
                            pOptions.fn.addDisass(await this.parseDisassembly(await data.ops));
                            //this._h.f_disass = true;
                        }
                        if(data) k++;
                    }
                    break;
                case 'syscall':
                    // TODO : detect platform x86 vs ARM to custome command, default ARM
                    // automatically choose
                    //data = await this._p.cmdj("/ad/ svc");
                    //this._h.syscall = true;
                    //this.target.appendFunctions(RadareHelper.parseFunctionList(data));
                    break;
                case 'config':
                    let cfg:any = await this._p.runCmd("aslj");
                    this.updateHelperConfig(cfg);
                    break;
            }

            if(data!=null){
                res.push(data);
            }
        }

        return res;
    }

    /**
     * To patch r2 path into r2pipe module
     */
    static init( pTool:External.Tool):void {

        if(pTool.getPath()[0]!=='/') {
            Logger.info("[R2] $PATH env : ",process.env.PATH);
            R2Pipe.setPath(Util.whereIs(R2Pipe.NAME));
            Logger.info("[R2] Path of radare2 found into  : ",R2Pipe.R2PIPE_PATH);
        }else{
            R2Pipe.setPath(pTool.getPath());
            Logger.info("[R2] Path of radare2 manually configured   : ",R2Pipe.R2PIPE_PATH);
        }
    }

    /**
     * To start the analysis of a the file with r2
     *
     * It spawns a new r2 process throught r2pipe and execute "aa;aac" command
     *
     * The analysis profile change behaviour depending of the
     * underlying platform of the project (android, ios, tizen, linux, ...)
     *
     * @param {any} pProfile The analysis profile
     * @return {any}
     * @async
     * @method
     * @since 1.0.0
     */
     async start(pCommands=['sections','f_list']):Promise<any>{
        let data:any = {
            success: false,
            data: null
        };
        try {
            Logger.debug(`[R2] (extraCmds=${pCommands.join(',')}) Start analysis of : ${this.target.getPath()} `)
            this._p = R2Pipe.open(this.target.getPath());

            let res:any = await this._p.runCmd("aa;aac", { json:false, ignoreErr:true });


            if(res != null){
                if(res.success && !this._typeMgr.isInitialized(DATATYPE_CATEGORY.NATIVE)){
                    await this.initDataTypes();
                }

                data.success = res.success;

                if(pCommands.length >0){
                    data.data = await this.runCmd(pCommands);
                }
            }else{
                data.success = false;
            }
         } catch(err)  {
             Logger.error(`[R2] Error: ${err.message} ${err.stack}`)
         }

         return data;
    }


    /**
     * To initialize or update native types into TypeManager by importing types from r2
     *
     * @return {Promise<boolean>}
     * @async
     * @method
     */
    async initDataTypes():Promise<any>{
        let success = false;
        let data:any;
        try {

            if(!this._typeMgr.isInitialized(DATATYPE_CATEGORY.NATIVE)){

                data = await this._p.runCmd("tj").catch(err => {
                    Logger.error(`[R2] Error 'tj' : ${err.message}`)
                });


                if(typeof data.data === 'string'){
                    data = JSON.parse(data.data);
                }

                const types:DataType[] = [];
                if(data.types!=null){
                    data.types.map( (vData:any)=>{
                        const t = new DataType(vData.type, vData.size);
                        t.fmt = vData.format;
                        types.push(t);
                    })
                }
                success = await this._typeMgr.initTypes( DATATYPE_CATEGORY.NATIVE, types);
            }else{
                success = true;
            }
        } catch(err)  {
            Logger.error(`[R2] Error: ${err.message} ${err.stack}`)

        }

        return data;
    }

    /**
     * To quit R2 child process
     *
     */
    quit():void {
         if(this._p != null){
             this._p.kill();
         }
    }

    extractInformation(){

    }

    listSection(){

    }

    /**
     * To parse the JSON output of 'pdf' r2 command
     *
     *
     * @param res
     */
     async parseDisassembly(res: any[]):Promise<ModelCpuInstruction[]> {
        let instrs:ModelCpuInstruction[] = []

        res.map( vInst => {
            let i:ModelCpuInstruction = new ModelCpuInstruction();
            for(let k in vInst){
                i[k] = vInst[k];
            }
            instrs.push(i);
        })
        return instrs;
    }

    /**
     * To save r2 configuration
     *
     * TODO : avoid prototype pollution
     *
     * @param {any} pConfig Radare2 configuration as returned by 'asl' command
     * @private
     * @method
     * @since 1.0.0
     */
    private updateHelperConfig(pConfig: any):void {
        for(let k in pConfig){
            this._cfg[k] = pConfig[k];
        }
    }

    async listFunctions():Promise<ModelFunction[]> {
        const funcs = await this.runCmd([NativeHelperCmd.LIST_FUNCS]);

        if(funcs.length==0 || !funcs[0].success){
            return [];
        }else{
            return funcs[0].data;
        }
    }

    async listSections():Promise<ModelExecutableSection[]> {
        const res = await this.runCmd([NativeHelperCmd.LIST_SECTIONS]);

        if(res.length==0 || !res[0].success){
            return [];
        }else{
            return res[0].data as ModelExecutableSection[];
        }
    }
}
