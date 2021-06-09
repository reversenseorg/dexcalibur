import * as _ps_ from "child_process";
import * as _fs_ from "fs";
import * as _path_ from "path";
import * as _stream_ from 'stream';
import * as _co_ from 'co';
import got from "got";
import * as _xz_ from "xz";
//import * as r2 from 'r2pipe';
import {
    R2Pipe
} from 'r2pipe-promise';

import DexcaliburWorkspace from "./DexcaliburWorkspace";

import {EOL} from "os";

import * as Log from './Logger';
import ModelFileSection from "./ModelFileSection";
import ModelExecutableSection from "./ModelExecutableSection";
import {ModelFunction} from "./ModelFunction";
import ModelFile from "./ModelFile";
import {ModelNativeRef} from "./ModelNativeRef";
import ModelInstruction from "./ModelInstruction";
import ModelCpuInstruction from "./ModelCpuInstruction";
import {ModelVariable} from "./ModelVariable";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export enum R2_TYPE {
    LOCAL,
    HTTP
}



const COLS_SECTIONS = {'Nm':'n', 'Vaddr':'vaddr', 'Paddr':'paddr', 'Size':'sz', 'Memsz':'memsz', 'Perms':'perm', 'Name':'name'};
const COLS_AFL = ['addr','sz','bbs','name'];

/**
 * @class
 * @author Georges-B MICHEL
 */
export default class RadareHelper
{

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
    _p:any = null;

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


        Logger.info("R2 > parse functions ...");

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
                    src: pOptions.src.getUID()
                });


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

                ['regvars','spvars','bpvars'].map( vType => {
                    if(vFn.hasOwnProperty(vType)){
                        f[vType] = [];
                        vFn[vType].map( ref => {
                            f[vType].push( new ModelVariable({
                                    n: ref.name,
                                    __t: ref.kind,
                                    type: ref.type,
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


        Logger.info("Parsed functions ", JSON.stringify(fns))
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
    async runCmd( pCommands:string[], pOptions:any= {}):Promise<number> {
        let k:number = 0;
        let data:any;

        Logger.info('[R2] Run command : '+pCommands);

        for(let i=0; i<pCommands.length; i++){
            switch(pCommands[i]){
                case 'sections':
                    data = await this._p.cmdj("iSj");
                    this._h.sections = true;
                    this.target.setProgramSection(await this.parseSections(await data));
                    if(data) k++;
                    break;
                case 'f_list':
                    data = await this._p.cmdj("aflj");
                    this._h.f_list = true;
                    this.target.appendFunctions(await this.parseFunctionList(await data, { src:this.target }));
                    if(data) k++;
                    break;
                case 'f_disass':
                    if((pOptions.fn instanceof  ModelFunction) && (pOptions.fn.getAddr()!=null)){
                        data = await this._p.cmdj("pdfj @ "+pOptions.fn.getAddr());
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
                    let cfg:any = await this._p.cmdj("aslj");
                    this.updateHelperConfig(cfg);
                    break;
            }
        }

        return k;
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
     async start(pProfile:any):Promise<any>{
        let data:any = null;
        try {
            Logger.info(`[R2] Start analysis of : ${this.target.getPath()}`)
            this._p = await R2Pipe.open(this.target.getPath());

            let res:any = await this._p.cmd("aa;aac");

            if(res!=null){
                data = await this.runCmd(['sections','f_list']);
            }
         } catch(err)  {
             Logger.error(`[R2] Error: ${err.message}`)
         }

         return data;
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
}
