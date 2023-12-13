
import {NodeInternalType} from "./NodeInternalType.js";
import {OperatingSystem} from "./OperatingSystem.js";
import {Architecture} from "./Architecture.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {
    NodeType,
    DataSourceHelper,
    NodeProperty,
    DbDataType,
    DbKeyType,
    INode,
    DbSerialize
} from "@dexcalibur/dexcalibur-orm";


/**
 * Represents a Syscall
 * @param {Object} config Optional, an object wich can be used in order to initialize the instance
 * @constructor
 */
export default class ModelSyscall implements INode
{
    static TYPE:NodeType = (new NodeType( "syscall", NodeInternalType.SYSCALL, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("os")).type(DbDataType.STRING).def(null),
        (new NodeProperty("arch")).type(DbDataType.STRING).def(null),
        (new NodeProperty("sysnum")).type(DbDataType.STRING).def(null),
        (new NodeProperty("name")).type(DbDataType.STRING).def(null),
        (new NodeProperty("args")).type(DbDataType.STRING).def(null),
        (new NodeProperty("retType")).type(DbDataType.STRING).def(null),
        (new NodeProperty("errCodes")).type(DbDataType.STRING).def(null),
        (new NodeProperty("tags")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def("[]")
    ])).dataSource("MEM", "syscalls");

    __:NodeInternalType = NodeInternalType.SYSCALL;

    os:OperatingSystem;

    arch:Architecture; //InstructionSet = InstructionSet.AARCH64;

    sysnum:number;

    func_name:string = null;

    name:string = null;

    args:any = [];

    ret:any = null;
    retType?:any = null;
    errCodes?:any = null;
    tags:number[] = [];

    probing = false;

    hooks:any[] = [];

    constructor(pConfig:any=null){
        if(pConfig!=null){
            for(const i in pConfig)
                this[i]=pConfig[i];
        }
    }

    /**
     *
     * @param pOsUid
     * @param pArch
     * @param pDefine
     * @return {ModelSyscall}
     *
     */
    static fromInterruptorDefine( pOsUid:OperatingSystem, pArch:Architecture, pDefine:any[] ):ModelSyscall {
        return new ModelSyscall({
            os: pOsUid,
            arch: pArch,
            sysnum: pDefine[0],
            name: pDefine[1],
            args: pDefine[3],
            ret: pDefine[4],
            errCodes: (pDefine[4]!=null ? pDefine[4].e : null)
        });
    }

    toJsonObject():any{
        const o:any = {};
        for(const i  in this) o[i] = this[i];
        // o.sysnum = this.sysnum.join(",");
        // o.args = this.args.join(",");
        CoreDebug.checkJsonSerialize(o, "ModelSyscall");
        return o;
    }

    /**
     * @return {number}
     * @method
     */
    getNumber():number {
        return this.sysnum;
    }

    getUID(): string {
        return this.os+':'+this.arch+':'+this.sysnum;
    }
}
ModelSyscall.TYPE.builder(ModelSyscall);