import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodeType,
    SerializeOptions, Tag,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import HookSession, {HookSessionUUID} from "../HookSession.js";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {Device, DeviceUUID} from "../Device.js";
import {INodeRef} from "../INode.js";


export type RuntimeSessionUUID = string;

export interface RuntimeSessionOpts {
    uuid?:RuntimeSessionUUID;
    owner?:UserAccountUUID;
    project?:DexcaliburProjectUUID;
    device?:DeviceUUID;
}

export class RuntimeSession implements INode {

    static TYPE:NodeType = new NodeType("rtsess", NodeInternalType.RUNTIME_SESS,[
        (new NodeProperty("uuid"))
            .type(DbDataType.STRING)
            .key(DbKeyType.PRIMARY)
            .schema({ type:"string", format:"uuid", description:"Unique identifier of the runtime session" }),
        (new NodeProperty("hksess"))
            .multiple(HookSession.TYPE)
            .def([]),
        (new NodeProperty("owner"))
            .type(DbDataType.STRING)
            .def(null),
        (new NodeProperty("project"))
            .type(DbDataType.STRING)
            .schema(Tag.TYPE.getPrimaryKey().toJSONSchemaPart(true))
            .def(null),
        (new NodeProperty("device"))
            .type(DbDataType.STRING)
            .def(null),
        (new NodeProperty("tools"))
            .type(DbDataType.STRING)
            .def([])
            .schema({ type:"array", items:{type:"object"}}),
        (new NodeProperty("tags"))
            .def([])
            .schema(Tag.TYPE.getProperty('_').toJSONSchemaPart(true)),
    ]).dataSource("PROJECT_DB");

    __ = NodeInternalType.RUNTIME_SESS;

    uuid:RuntimeSessionUUID = null;
    hksess:HookSessionUUID[] = [];
    owner:UserAccountUUID = null;
    project:DexcaliburProjectUUID = null;
    device:DeviceUUID = null;
    tools:any[] = [];
    tags:TagUUID[] = [];

    _ctx:Nullable<DexcaliburProject> = null;



    constructor(pOpts:RuntimeSessionOpts){
        if(pOpts!=null){
            for (let i in pOpts){
                this[i] = pOpts[i];
            }
        }
    }

    getUID(): string | null {
        return this.uuid;
    }

    setContext(pCtx:DexcaliburProject){
        this._ctx = pCtx;
    }

    setDevice(pDev:DeviceUUID){
        this.device = pDev;
    }

    addHookSession(pSess:HookSessionUUID){
        this.hksess.push(pSess);
    }

    toJsonObject(pOption?: SerializeOptions): any {
        return {
            uuid: this.uuid,
            hksess: this.hksess,
            owner: this.owner,
            project: this.project,
            device: this.device,
            tools: this.tools,
            tags: this.tags
        }
    }
}
RuntimeSession.TYPE.builder(RuntimeSession);