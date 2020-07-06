


/**
 * Represents a Syscall
 * @param {Object} config Optional, an object wich can be used in order to initialize the instance
 * @constructor
 */
export default class ModelSyscall
{
    sysnum:any = [];
    func_name:string = null;
    sys_name:string = null;
    args:any = [];
    ret:any = null;

    constructor(pConfig:any=null){
        if(pConfig!==null)
            for(let i in pConfig)
                this[i]=pConfig[i];
    }

    toJsonObject():any{
        let o:any = new Object();
        for(let i  in this) o[i] = this[i];
        o.sysnum = this.sysnum.join(",");
        o.args = this.args.join(",");
        return o;
    }
}