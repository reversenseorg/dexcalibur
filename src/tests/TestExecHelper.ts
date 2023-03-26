
import * as  _fs_ from "fs";
import * as _path_ from "path";
import * as _child_process_ from "child_process";
import * as _util_ from "util";


let _exec_ = _util_.promisify(_child_process_.exec);

class TestExecHelperClass {

    interceptors:any = null;

    constructor(){
        this.interceptors = {
            exec: []
        };
    }

    interceptExec( pInterceptor:any, pReturn:any){
        if( this.interceptors.exec == null) this.interceptors.exec = [];
        this.interceptors.exec.push({ test:pInterceptor, ret:pReturn });
    }

    filterInterceptor( pType:string, pInput:any):any{
        if(this.interceptors[pType] == undefined)return {success:false};

        for(let i:number=0; i<this.interceptors[pType].length; i++){
            if(this.interceptors[pType][i].test(pInput)){
                return {success:true, ret: this.interceptors[pType][i].ret};
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
        let res:any = this.filterInterceptor( "exec", pCmd);
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
        let res:any = this.filterInterceptor( "exec", pCmd);
        if(res.success){
            return res.ret;
        }else{
            return await _exec_(pCmd);;
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



export var TestExecHelper = new TestExecHelperClass();