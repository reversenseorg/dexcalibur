import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodeType,
    SerializeOptions, Tag,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "../core/IStringIndex.js";
import {NodeInternalType} from "../NodeInternalType.js";
import {UserAccount} from "../user/UserAccount.js";
import {randomUUID} from "crypto";

export interface LogMessageOptions {
    node:string;
    time:number;
    msg:string;
    emitter?:string;
    user?:Nullable<string>;
    project?:Nullable<string>
    error?:number;
}

export class LogMessage implements INode{

    static TYPE = new NodeType('logs', NodeInternalType.LOG, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("time")).type(DbDataType.STRING).notnull(),
        (new NodeProperty("node")).type(DbDataType.STRING).notnull(),
        (new NodeProperty("msg")).type(DbDataType.STRING).notnull(),
        (new NodeProperty("emitter")).type(DbDataType.STRING).def(null),
        (new NodeProperty("user")).single(UserAccount.TYPE).def(null),
        (new NodeProperty("project")).type(DbDataType.STRING).def(null),
        (new NodeProperty("error")).type(DbDataType.NUMERIC).def(-1),
        (new NodeProperty("tags")).type(DbDataType.NUMERIC).def([]),
    ]).dataSource("ENGINE_DB");

    __:NodeInternalType = NodeInternalType.LOG;

    _id:string;
    _uid:string;
    node:number;
    time:number;
    msg:string;
    emitter:string;
    user:Nullable<string>;
    project:Nullable<string>;
    error:number = -1;

    tags:TagUUID[] = [];

    constructor(pConfig:LogMessageOptions) {
        for(let i in pConfig)
            this[i] = pConfig[i];

        this._uid = this._generateUID();
    }

    private _generateUID(){
        return this.node+"::"+this.time+'::'+randomUUID();
    }

    getUID(){
        return this._uid;
    }

    toJsonObject(pOption?: SerializeOptions): any {
        return this;
    }
}
LogMessage.TYPE.builder(LogMessage);