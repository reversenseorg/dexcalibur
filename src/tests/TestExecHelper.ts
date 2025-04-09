
import * as  _fs_ from "fs";
import * as _path_ from "path";
import * as _child_process_ from "child_process";
import * as _util_ from "util";
import {IStringIndex} from "../core/IStringIndex.js";
import {Nullable} from "@dexcalibur/dxc-core-api";


let _exec_ = _util_.promisify(_child_process_.exec);

export type InterceptorFn = ((vInput:string)=>boolean);

export interface InterceptorOptions {
    ret:string|Buffer;
    name:string;
    testFn?:InterceptorFn;
    testRE?:RegExp
}

export enum InterceptorType {
    EXEC="exec",
    EXEC_ASYNC="execAsync",
    SPAWN="spawn"
}

interface HelperState {
    [key:string] :{
        offset:number;
        opts: InterceptorOptions
    }
}


export class TestExecHelperClass {

    private _map:IStringIndex<InterceptorOptions> = {};

    interceptors:IStringIndex<InterceptorOptions[]> = {
        [InterceptorType.EXEC as string]: [],
        [InterceptorType.EXEC_ASYNC as string]: [],
        [InterceptorType.SPAWN as string]: [],
    };

    constructor(){
        this.interceptors = {
            exec: [],
            execAsync: [],
            spawn: []
        };
    }

    static getInstance(){
        if(gInstance==null){
            gInstance = new TestExecHelperClass();
        }

        return gInstance;
    }

    /**
     *
     * @param {InterceptorFn} pInterceptor Function to test if the command must be mocked, return TRUE of FALSE (skip)
     * @param {string} pReturn Mock to return instead of original output
     * @method
     */
    interceptExec( pName:string, pInterceptor:InterceptorFn, pReturn:string){
        this.intercept( InterceptorType.EXEC, {
            name:pName,
            testFn:pInterceptor,
            ret:pReturn
        })
    }

    /**
     *
     * @param pType
     * @param pInterceptorOptions
     */
    intercept( pType:InterceptorType, pInterceptorOptions:InterceptorOptions ):void {
        const uid = `${pType}:${pInterceptorOptions.name}`;
        if(this.interceptors[pType]==null){
            this.interceptors[pType] = [];
        }

        this.interceptors[pType].push(
            this._map[uid] = pInterceptorOptions
        )
    }


    hasInterceptor( pType:InterceptorType, pName:string):boolean {
        return  (this._map[`${pType}:${pName}`] != null);
    }


    deleteInterceptor(pType:InterceptorType, pName:string){
        delete this._map[`${pType}:${pName}`];
    }


    /**
     *
     * @param pType
     * @param pInput
     */
    filterInterceptor( pType:string, pInput:any):any{
        if(this.interceptors[pType] == undefined)return {success:false};

        let interceptor:InterceptorOptions;
        for(let i:number=0; i<this.interceptors[pType].length; i++){
            interceptor = this.interceptors[pType][i];
            if(interceptor.testFn!=null){
                if(this.interceptors[pType][i].testFn.apply(null,[pInput])){
                    return {success:true, ret: interceptor.ret};
                }
            }
            else if(interceptor.testRE!=null){
                if(this.interceptors[pType][i].testRE.test(pInput)){
                    return {success:true, ret: interceptor.ret};
                }
            }

        }

        return {success:false };
    }

    clearInterceptors(){
        this.interceptors = {};
    }

    /**
     * To mock conditionnaly Process.execSync()
     *
     * @param {*} pCmd
     */
    execSync( pCmd:string){
        let res:any = this.filterInterceptor( InterceptorType.EXEC, pCmd);
        if(res.success){
            return res.ret;
        }else{
            return _child_process_.execSync( pCmd);
        }
    }

    /**
     * To mock conditionnaly Process.execAsync()
     *
     * @param {*} pCmd
     */
    async execAsync( pCmd:string):Promise<any>{
        let res:any = this.filterInterceptor( InterceptorType.EXEC_ASYNC, pCmd);
        if(res.success){
            return res.ret;
        }else{
            return await _exec_(pCmd);
        }
    }

    /**
     * TODO : spawn mock
     * @param pCmd
     */
    spawn(pCmd:string,  pArgs:any=[], pOptions:any={}):any{
        return null;
    }

}

let gInstance:Nullable<TestExecHelperClass> = null;

export var TestExecHelper = new TestExecHelperClass();