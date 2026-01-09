

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
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
       /* (new NodeProperty("_uid"))
            .type(DbDataType.STRING)
            .schema({ type:"string", format:"uuid" })
            .descr("Boolean flag to indicate if the device is enrolled. A device is enrolled when it is ready to be instrumented or explored")
            .key(DbKeyType.PRIMARY),*/
        (new NodeProperty("os"))
            .type(DbDataType.STRING)
            .schema({ type:"string", enum: Object.values(OperatingSystem) as OperatingSystem[] })
            .descr("Operating system of this syscall")
            .def(null),
        (new NodeProperty("arch"))
            .type(DbDataType.STRING)
            .schema({ type:"string", enum: Object.values(Architecture) as Architecture[] })
            .descr("Architecture of this syscall")
            .def(null),
        (new NodeProperty("sysnum"))
            .type(DbDataType.STRING)
            .schema({ type:"number" })
            .descr("Syscall number")
            .def(null),
        (new NodeProperty("name"))
            .type(DbDataType.STRING)
            .schema({ type:"string" })
            .descr("Human name of the syscall. Can be used to identify the syscall in the log. Can be null if not available.")
            .def(null),
        (new NodeProperty("args"))
            .type(DbDataType.STRING)
            .schema({ type:"array", items: { type:"object" } })
            .descr("Properties for each argument of the syscall. Can be null if not available.")
            .def(null),
        (new NodeProperty("retType"))
            .type(DbDataType.STRING)
            .schema({ type:"object" })
            .descr("Type of return")
            .def(null),
        (new NodeProperty("errCodes"))
            .type(DbDataType.STRING)
            .schema({ type:"array", items: { type:"object" } })
            .descr("List of error codes")
            .def(null),
        (new NodeProperty("tags"))
            .type(DbDataType.STRING)
            .schema({ type:"array", items: { type:"number" } })
            .descr("List of tags")
            .serialize(DbSerialize.JSON).def("[]")
    ])).descr(`
    This model represents a system call independently of the operating system and kernel version.
    Instance of ModelSyscall are manipulated by HookManager to generate hooks for the target application.
    System calls are instrumented by Interruptor by patching interruptions at instruction-level
    `).dataSource("MEM", "syscalls");

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