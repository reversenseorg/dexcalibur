import {R2CmdResult, R2Pipe} from './external/R2Pipe.js';

import * as Log from './Logger.js';
import ModelExecutableSection, {SectionType} from "./ModelExecutableSection.js";
import {ModelFunction} from "./ModelFunction.js";
import ModelFile from "./ModelFile.js";
import ModelCpuInstruction from "./ModelCpuInstruction.js";
import {ModelVariable} from "./ModelVariable.js";
import {External} from "./external/External.js";
import Util from "./Utils.js";
import {NativeAnalyzerCommands} from "./analyzer/NativeAnalyzerCommands.js";
import {DATATYPE_CATEGORY, TypeManager} from "./types/TypeManager.js";
import {DataType} from "./types/DataType.js";
import {TagManager} from "./tags/TagManager.js";
import {NodeInternalType, Nullable, OperatingSystem} from "@dexcalibur/dxc-core-api";
import {INativeHelper, NativeHelperCmd} from "./analyzer/INativeHelper.js";
import {NativeBackend} from "./NativeAnalyzer.js";
import {Architecture} from "./Architecture.js";
import {ModelRegister} from "./elixir/ModelRegister.js";
import ModelStringValue from "./ModelStringValue.js";
import ModelCall from "./ModelCall.js";
import ModelInstruction from "./ModelInstruction.js";
import {KernelInfoFactory} from "./platform/kernels/common/KernelFactory.js";
import ModelSyscall from "./ModelSyscall.js";
import DexcaliburProject from "./DexcaliburProject.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export enum R2_TYPE {
    LOCAL,
    HTTP
}

const DEFAULT_R2_OPTIONS = {
    update: true
    //force: false,
    //json: true,
    //ignoreErr: true,
};

interface AddrBased {
    addr:number,
}
interface InterruptMatch extends AddrBased {
    len:number,
    code:string
}

interface SyscallMatch extends AddrBased {
    name:string,
    sysnum:number
}

interface R2String  {
    vaddr:number,
    paddr:number,
    ordinal: number,
    size:number,
    length:number,
    section:string,
    type:string,
    string:string
}

const COLS_SECTIONS = {'Nm':'n', 'Vaddr':'vaddr', 'Paddr':'paddr', 'Size':'sz', 'Memsz':'memsz', 'Perms':'perm', 'Name':'name'};
const COLS_AFL = ['addr','sz','bbs','name'];

const ARCH_RET = {
    aarch64: "x0",
    aarch32: "r0",
    // x64: "rdx",
    // x86: "edx",
}

export interface R2HelperOptions {
    ctx?:DexcaliburProject;
    /**
     * URL to remote r2 server
     */
    url?:string;
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

    private _os:OperatingSystem = OperatingSystem.LINUX;

    /**
     *
     * @param {ModelFile} pBinary File to analyze
     * @param {R2_TYPE} pType
     * @param pOptions
     * @since 1.0.0
     */
    constructor( pBinary:ModelFile, pType:R2_TYPE, pOptions:R2HelperOptions = {}) {
        this._t = pType;
        this.target = pBinary;
        this.opts = pOptions;
        if(pOptions.ctx!=null){
            this._typeMgr = pOptions.ctx.getTypeManager();
            this._tagMgr = pOptions.ctx.getTagManager();
            this._os = pOptions.ctx.os;
        }
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

        if(pOut==null || pOut.length==0) return secs;

        pOut.map( vSec => {
            secs.push(new ModelExecutableSection({
                type: SectionType.SECTION,
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
     * To instanciante object representing file section from r2 json output
     *
     * @param {any} pOut A poor JSON object containing sections from Radare2
     * @return {ModelExecutableSection[]} An array of execautable sections
     * @method
     * @static
     * @since 1.0.0
     */
    async parseSegments(pOut:any):Promise<ModelExecutableSection[]> {
        let secs:ModelExecutableSection[] = [];

        if(pOut==null || pOut.length==0) return secs;

        pOut.map( vSec => {
            secs.push(new ModelExecutableSection({
                type: SectionType.SEGMENT,
                name: (vSec.name=="")? '[base]' : vSec.name,
                perm: vSec.perm,
                memsz: vSec.vsize,
                sz: vSec.size,
                paddr: vSec.paddr,
                vaddr: vSec.vaddr,
                flags: parseInt(vSec.flags,10)
            }));
        });

        return secs;
    }

    // [{"name":"PHDR","size":560,"vsize":560,"perm":"-r--","flags":0,"paddr":64,"vaddr":64}


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

        try{
            pOut.map( vFn => {

                let f:ModelFunction = new ModelFunction({
                    name: vFn.name,
                    addr: (vFn.addr!=null)? vFn.addr : vFn.offset,
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
                            //__t: ModelVariableLocation.REG,
                            type: (this._typeMgr!=null ? this._typeMgr.getNativeType("uint64_t") : null),
                            //ref: ARCH_RET.aarch64
                        })
                    );
                }

                /*
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
                }*/


                fns.push(f);
            });
        }catch(err){
            Logger.error("[R2] Error : "+err.message);
        }


        return fns;
    }

    /**
     * To get the mnemomic of the interrupt to search according to project architecture
     * @private
     */
    private _getIntMnemo():string {
        // todo
        return "svc";
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
    async runCmd( pCommands:string[], pOptions:any= DEFAULT_R2_OPTIONS):Promise<R2CmdResult[]> {
        let k:number = 0;
        let data:any;
        let res:R2CmdResult[] =[];
        let parsedData:any;

        Logger.info('[R2] Run command : '+pCommands.join(','));

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
                case NativeHelperCmd.LIST_SEGMENTS:
                    data = await this._p.runCmd("iSSj");

                    if(data.success){
                        this._h.sections = true;

                        // todo : parse segments + add
                        data.data = await this.parseSegments(data.data);
                        res.push(data);

                        if(pOptions.update){
                            this.target.setSegments(data.data);
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
                        const fnaddr = pOptions.fn.getMemoryAddress().toHex(-1);
                        data = await this._p.runCmd("pdfj @ "+fnaddr, {json:true, ignoreErr: false});
                        if(data != null){
                            pOptions.fn.addDisass(await this.parseDisassembly(data.data.ops));
                        }
                        res.push(data);
                        if(data) k++;

                        data = await this._p.runCmd("afvj @ "+fnaddr, {json:true, ignoreErr: false});
                        if(data != null){
                            pOptions.fn.addArguments(await this.parseLocals(data.data, "args", null));
                            pOptions.fn.addLocalVars(await this.parseLocals(data.data, "locals", null));
                        }
                    }
                    break;
                case NativeAnalyzerCommands.FUNC_CMD.DECOMPILE:
                    if((pOptions.fn instanceof  ModelFunction) && (pOptions.fn.getAddr()!=null)){
                        data = await this._p.runCmd("pdcj @ "+pOptions.fn.getAddr(), {json:true, ignoreErr: false});
                        if(data != null){
                            pOptions.fn.addDecompile(data.data.code);
                        }
                        if(data) k++;
                    }
                    break;
                case NativeHelperCmd.SEARCH_INT:
                    // TODO : replace svc by dynamically choosen interrupt
                    data = await this._p.runCmd('/ad/j svc');
                    if(data.success){
                        /*this._h.f_list = true;

                        data.data = await this.parseFunctionList(data.data, {
                            src: {
                                __:ModelFile.TYPE.getType(),
                                _uid: this.target.getUID()
                            }
                        });*/

                        res.push(data);

                        /*if(pOptions.update){
                            this.target.appendFunctions(data.data);
                            //this.target.tagAs('$r');
                        }*/
                    }else{
                        res.push(null);
                    }
                    if(data) k++;
                    break;
                case NativeHelperCmd.LIST_SYSCALLS:
                    data = await this._p.runCmd(`/asj ${pOptions.x_only? "@e:search.in=io.maps.x":""}`, {json:true, ignoreErr: false});
                    if(data?.data?.result !=null){
                        data.data = await this.parseSyscalls(data.data.results);

                        if(pOptions.fn!=null){
                            data.data.map( vCall => {
                                vCall.caller = pOptions.fn;
                            });
                        }else{
                            // TODO : for each syscall  search parent function
                            /*data.data.map( vCall => {
                                vCall.caller = this.target;
                            });*/
                        }
                        // save modelcalls
                        // TODO ; craft ModelCall from syscall results
                        // this.target.addSyscalls(data.data.results);

                        res.push(data);
                    }
                    if(data) k++;
                    break;
                case NativeHelperCmd.LIST_STRINGS:
                    data = await this._p.runCmd(`izj`, {json:true, ignoreErr: false});
                    if(data != null){
                        data.data = await this.parseStrings(data.data);
                        res.push(data);
                    }
                    if(data) k++;
                    break;
                    break;
                case NativeHelperCmd.LIST_XREFS:
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
     async start(pCommands=['sections','f_list',NativeHelperCmd.SEARCH_INT]):Promise<any>{
        let data:any = {
            success: false,
            data: null
        };
        try {
            Logger.info(`[R2] (extraCmds=${pCommands.join(',')}) Start analysis of : ${this.target.getPath()} `)
            this._p = R2Pipe.open(this.target.getPath());

            const isReady = (this._p.history.find(c => {
                return (c.cmd==="aa;aac\n")
            })!=null);

            if(isReady) return {
                success: true
            };

            let res:any = await this._p.runCmd("aa;aac", { json:false, ignoreErr:true });


            if(res != null){
                if(res.success && (this._typeMgr!=null && !this._typeMgr.isInitialized(DATATYPE_CATEGORY.NATIVE))){
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
        });

        return instrs;
    }

    /**
     * To create a list of ModelCall from interrupt instructions detected
     * `caller` part is not filled yet, because it depends of options.
     *
     *
     * @param {(InterruptMatch|SyscallMatch)[]} pRes
     */
    async parseSyscalls(pRes:(InterruptMatch|SyscallMatch)[] ):Promise<ModelCall[]> {
         if(pRes==null || pRes.length==0) return [];

         let syscalls:ModelCall[] = [];

         pRes.map( vRes => {

             let sc:Nullable<ModelSyscall> = null;
             if(pRes.hasOwnProperty('sysnum')){
                 // @ts-ignore
                 sc = KernelInfoFactory
                         .find(this._os,  /* KernelInfoFactory.getArch(this.target) */ Architecture.AARCH64, "4.0")
                         .getSyscall((pRes as any).sysnum);

                 if(sc==null){
                     sc = new ModelSyscall({
                         name: (pRes as any).name,
                         num: (pRes as any).sysnum
                     })
                 }
             }

             let c:ModelCall = new ModelCall({
                 instr: new ModelInstruction({
                     offset: vRes.addr,
                     _raw: (vRes as InterruptMatch).code ?? null,
                     // opcode: ElixirUtils.getOpcode(vRes.code),
                 }),
                 calleed: sc
             });

             syscalls.push(c);
         });

         return syscalls;
    }


    /**
     * To create a list of ModelCall from interrupt instructions detected
     * `caller` part is not filled yet, because it depends of options.
     *
     *
     * @param {(InterruptMatch|SyscallMatch)[]} pRes
     */
    async parseStrings(pRes:R2String[] ):Promise<ModelStringValue[]> {
        if(pRes==null || pRes.length==0) return [];

        const ft = ModelFile.TYPE.getType();

        return pRes.map( vRes => {
            return new ModelStringValue({
                value: vRes.string,
                src: [{
                    __: ft,
                    _uid: this.target.getUID(),
                    vaddr: vRes.vaddr,
                    paddr: vRes.paddr,
                }]
            });
        });
    }
    /**
     * To parse the JSON output of 'pdf' r2 command
     *
     *
     * @param res
     */
    async parseLocals(pData: any, pType:"args"|"locals", pArch:Nullable<Architecture>):Promise<ModelVariable[]> {
        let vars:ModelVariable[] = []

        // get SP reg name from Architecture and call convention
        const sp = "sp";

        switch(pType){
            case "locals":
                if(pData[sp]!=null && pData[sp].length>0){
                    pData[sp].map( vArg => {
                        if(vArg.kind=="var"){
                            vars.push(new ModelVariable({
                                n: vArg.name,
                                type: (this._typeMgr!=null ? this._typeMgr.getNativeType(vArg.type) : vArg.type),
                                offset: vArg.offset,
                                reg: new ModelRegister({
                                    name: vArg.ref.base,
                                    id: -1
                                })
                            }))
                        }
                    })
                }
                break;
            case "args":
                if(pData.reg!=null){
                    pData.reg.map( vArg => {
                        if(vArg.kind=="reg"){
                            vars.push(new ModelVariable({
                                n: vArg.name,
                                type: (this._typeMgr!=null ? this._typeMgr.getNativeType(vArg.type) : vArg.type),
                                offset: -1,
                                reg: new ModelRegister({
                                    name: vArg.ref,
                                    id: Number(vArg.ref.substring(1)).valueOf()
                                })
                            }))
                        }
                    });
                }

                if(pData.sp!=null){
                    const spReg = new ModelRegister({
                        name: "sp",
                        id: -1
                    });

                    pData.sp.map( vArg => {
                        if(vArg.kind=="arg"){
                            vars.push(new ModelVariable({
                                n: vArg.name,
                                type: (this._typeMgr!=null ? this._typeMgr.getNativeType(vArg.type) : vArg.type),
                                offset: vArg.ref,
                                reg: spReg
                            }))
                        }

                    })
                }
                break;
        }

        return vars;
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

    private async _listEl<T>(pCmd:NativeHelperCmd, pOptions:any = DEFAULT_R2_OPTIONS):Promise<T[]> {
        const res = await this.runCmd([pCmd],pOptions);

        if(res.length==0 || !res[0].success){
            return [];
        }else{
            return res[0].data as T[];
        }
    }

    async listSections():Promise<ModelExecutableSection[]> {
        return this._listEl<ModelExecutableSection>(NativeHelperCmd.LIST_SECTIONS);
    }

    async listSegments():Promise<ModelExecutableSection[]> {
        return this._listEl<ModelExecutableSection>(NativeHelperCmd.LIST_SEGMENTS);
    }

    async listStrings(pOptions:any = DEFAULT_R2_OPTIONS):Promise<ModelStringValue[]> {
        return this._listEl<ModelStringValue>(NativeHelperCmd.LIST_STRINGS, pOptions);
    }

    async listSyscalls(pOptions:any = DEFAULT_R2_OPTIONS):Promise<ModelCall[]> {
        return this._listEl<ModelCall>(NativeHelperCmd.LIST_SYSCALLS, pOptions);
    }

    async listXrefs(pOptions:any = DEFAULT_R2_OPTIONS):Promise<ModelCall[]> {
        return this._listEl<ModelCall>(NativeHelperCmd.LIST_XREFS, pOptions);
    }
}
