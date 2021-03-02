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
import {ModelFileExecutable} from "./ModelFileExecutable";
import ModelFileSection from "./ModelFileSection";
import ModelExecutableSection from "./ModelExecutableSection";
import {ModelFunction} from "./ModelFunction";
import ModelFile from "./ModelFile";
import {ModelNativeRef} from "./ModelNativeRef";
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
    _h:any = {};

    /**
     * r2pipe
     */
    _p:any = null;

    // todo: file path or buffer (such as dump or memory segment)
    target:ModelFile = null;

    opts:any = {};


    constructor( pBinary:ModelFile, pType:R2_TYPE, pOptions:any = {}) {
        this._t = pType;
        this.target = pBinary;
        this.opts = pOptions;
    }

    static parseSections(pOut:any):ModelExecutableSection[] {
        let secs:ModelExecutableSection[] = [];
        let sec:any;
        let data:string[] = pOut.split(EOL);
        let cols:string[] = [];
        let cn:number;


        if(data.length == 0) return secs;


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
        /*

        if(data[0]=="[Sections]") data.shift();
        // parse header
        data[0].split(' ').map( v =>{
            if(v.length>0){
                cols.push( COLS_SECTIONS[v]);
            }
        });

        // parse data
        if(cols.length>0){
            for(let i=1; i<data.length; i++){
                cn = 0;
                sec = {};
                data[i].split(' ').map( (v,o) =>{
                    if(v.length>0){
                        if(cn==0 || cn==3 || cn==4)
                            sec[cols[cn]] = parseInt(v,10);
                        if(cn==1 || cn==2)
                            sec[cols[cn]] = parseInt(v,16);
                        else
                            sec[cols[cn]] = v;
                        cn++;
                    }
                });

                secs.push(new ModelExecutableSection(sec));
            }
        }

        Logger.info(JSON.stringify(secs));

        return secs;*/
    }


    static parseFunctionList(pOut:any, pOptions:any = null):ModelFunction[] {
        let fns:ModelFunction[] = [];
        let fn:ModelFunction;
        let data:string[] = pOut.split(EOL);
        let cn:number;



        Logger.info(JSON.stringify(pOut));
        pOut.map( vFn => {

            let f:ModelFunction = new ModelFunction({
                name: vFn.name,
                addr: vFn.offset,
                sz: vFn.size,
                nbbs: vFn.nbbs,
                edges: vFn.edges,
                stack: vFn.stackframe,
                ctype: vFn.calltype,
                src: pOptions.src
            });

            vFn.callrefs.map( ref => {
                f.cref.push( new ModelNativeRef({
                    addr: ref.addr,
                    at: ref.at,
                    __t: ref.type
                }))
            });
            vFn.datarefs.map( ref => {
                f.dref.push( new ModelNativeRef({
                    addr: ref.addr,
                    at: ref.at,
                    __t: ref.type
                }))
            });
            vFn.codexrefs.map( ref => {
                f.xcref.push( new ModelNativeRef({
                    addr: ref.addr,
                    at: ref.at,
                    __t: ref.type
                }))
            });
            vFn.dataxrefs.map( ref => {
                f.xdref.push( new ModelNativeRef({
                    addr: ref.addr,
                    at: ref.at,
                    __t: ref.type
                }))
            });
            fns.push(f);
        })

        return fns;

/*
        if(data.length == 0) return fns;

        // parse data
        for(let i=1; i<data.length; i++){
            cn = 0;
            fn = {};
            data[i].split(' ').map( (v,o) =>{
                if(v.length>0){
                    Logger.info(cn+'',' = ',COLS_AFL[cn],' => ',v);
                    if(cn == 0)
                        fn[COLS_AFL[cn]] = parseInt(v, 16);
                    else if(cn <= 2)
                        fn[COLS_AFL[cn]] = parseInt(v, 10);
                    else
                        fn[COLS_AFL[cn]] = v;
                    cn++;
                }
            });

            fns.push(new ModelFunction(fn));
        }


        Logger.info(JSON.stringify(fns));

        return fns;*/
    }

    isReadyFor( pCommands:string[]):boolean {
        let f:boolean = true;
        pCommands.map( v => {
            f = f && (this._h[v]===true ? true : false);
        });
        return f;
    }

    runCmd( pCommands:string[], pOptions:any= {}):void {
        pCommands.map( async (vCmd:string)=>{
            switch(vCmd){
                case 'sections':
                    this._p.cmdj("iSj", (data)=>{
                        this._h.sections = true;
                        this.target.setProgramSection(RadareHelper.parseSections(data.res));
                    });
                    break;
                case 'f_list':
                    this._p.cmdj("afl", (data)=>{
                        this._h.funcs = true;
                        this.target.appendFunctions(RadareHelper.parseFunctionList(data.res, { src:this.target }));
                    });
                    break;
                case 'f_disass':
                    if(pOptions.fn.addr!=null){
                        this._p.cmdj("pdf @ "+pOptions.fn.addr, (data)=>{
                            pOptions.fn.addDisass(RadareHelper.parseDisassembly(data.res));
                        });
                    }

                    break;
                case 'syscall':
                    // TODO : detect platform x86 vs ARM to custome command, default ARM
                    // automatically choose
                    this._p.cmdj("/ad/ svc", (data)=>{
                        this._h.funcs = true;
                        this.target.appendFunctions(RadareHelper.parseFunctionList(data.res));
                    });
                    break;
            }
        });
    }

     async start(pProfile:any):Promise<void>{
        /*if(!_fs_.existsSync(this.target)){
            throw new Error(`[RADARE2 HELPER] Target file [${this.target}] not exists`)
        }*/
        try {
            this._p = await R2Pipe.open(this.target.getPath());

            let res:any = await this._p.cmdj("asl");

            if(res!=null){
                Logger.info('RADARE2 Configuration : '+JSON.stringify(res));
            }
            res = await this._p.cmdj("aa;aac");

            if(res != null){
                Logger.info(JSON.stringify(res));
                this.runCmd(['sections','f_list']);
            }


                 //f(['sections','f_list']);

                 // extract section
                 /* r2p.cmdj("iS", (data)=>{
                     this._h.sections = true;
                     this.target.setProgramSection(RadareHelper.parseSections(data.res));
                 }); */

                 // extract function
                 /*r2p.cmdj("afl", (data)=>{
                     this._h.funcs = true;
                     this.target.appendFunctions(RadareHelper.parseFunctionList(data.res));
                 });*/

         } catch(err)  {
             Logger.error(`[R2] Error: ${err.message}`)
         }
        /*r2.pipe(this.target.getPath(), (err,r2p)=>{
            self._p = r2p;
            self.bridge(err,r2p);
        });*/
    }

    extractInformation(){

    }

    listSection(){

    }


    private static parseDisassembly(res: any) {
        
    }
}
