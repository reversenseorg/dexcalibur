import {
    NodeType,
    NodeProperty,
    DbDataType,
    DbKeyType,
    INode,
    Tag,
    DbSerialize,
    TagUUID, SerializeOptions
} from "@dexcalibur/dexcalibur-orm";

import {NodeInternalType, OperatingSystem} from "@dexcalibur/dxc-core-api";
import {Metadata, MetadataType} from "../audit/common/Metadata.js";
import {Savable, STUB_TYPE} from "../ModelSavable.js";
import {ModelLocation} from "../ModelLocation.js";
import {SecurityZone} from "../security/SecurityZone.js";

export enum AccessControlModel {
    DAC = 'DAC',
    RBAC = 'RBAC',
    MAC = 'MAC',
    ABAC = 'ABAC',
    PBAC = 'PBAC',
}

const PREFIX_UID_ANDROID_PERMISSION = "ANDROID__";

export class ModelPermission extends Savable
{
    static TYPE:NodeType = (new NodeType( "permission", NodeInternalType.ANDROID_PERM, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("alias")).type(DbDataType.STRING).def(null),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("os")).type(DbDataType.STRING).def(null),
        (new NodeProperty("sources")).type(DbDataType.BLOB).def([]),
        (new NodeProperty("controls")).type(DbDataType.BLOB).def([]),
        (new NodeProperty("tags")).type(DbDataType.BLOB).def([]),
        (new NodeProperty("accessControl")).type(DbDataType.STRING).def(null),
        (new NodeProperty("metadata")).type(DbDataType.BLOB).def([])
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.ANDROID_PERM;

    name: string = null;
    alias: string = null;
    description: string = null;
    os: OperatingSystem = null;
    sources: ModelLocation[] = null;
    controls: string[] = null; // list of Controls._uid
    tags: TagUUID[] = [];
    accessControl: AccessControlModel;
    metadata: Metadata[] = [];

    __raw:any = null;

    constructor(config:any=null){
        super(STUB_TYPE.PERMISSION);
        if (config != null) {
            for (let i in config) {
                this[i] = config[i];
            }
        }
    }

    getUID():string {
        return  this._uid;
    }

    getName():string{
        return this.name;
    }

    addTag(vTag:Tag){
        const uuid = vTag.getUUID();
        if(this.tags.indexOf(uuid)==-1)
            this.tags.push(uuid);
    }

    hasTag(vTag:Tag):boolean{
        const uuid = vTag.getUUID()
        for(let i=0; i<this.tags.length; i++){
            if(this.tags[i]===uuid){
                return true;
            }
        }
        return false;
    }

    getTags():number[]{
        return this.tags;
    }

    update(otherPerm:ModelPermission, override:boolean=false){
        for(let i in otherPerm){
            if(override || (this[i]===null)){
                this[i] = otherPerm[i];
            }
        }
    }

    toXmlObject():any{
        let o:any = {$:{}};

        for(let i in this){
            o.$["android:"+i] = this[i];
        }

        return o;
    }

    static fromXml(xmlobj:any):ModelPermission{
        let p:ModelPermission = new ModelPermission();

        p.__raw = xmlobj;
        for (let i in xmlobj) {
            if (i.startsWith('android:')) {
                if (i.substring(8) == 'name') {
                    p.name = xmlobj[i];
                    p._uid = PREFIX_UID_ANDROID_PERMISSION + p.name.substring(p.name.lastIndexOf(".") + 1);
                } else {
                    // maxSdkVersion
                    let meta:Metadata = {'key':i.substring(8), 'type':MetadataType.TEXT, 'value':xmlobj[i]};
                    p.metadata.push(meta);
                }
            } else {
                let meta:Metadata = {'key':i, 'type':MetadataType.TEXT, 'value':xmlobj[i]};
                p.metadata.push(meta)
            }
        }

        return p;
    }

    toJsonObject(pOptions:SerializeOptions = {}, pZone = SecurityZone.PUBLIC):any{
        let o:any = {};

        o.uid = this._uid;
        o.name = this.name;
        o.alias = this.alias;
        o.description = this.description;
        o.os = this.os;
        o.sources = this.sources;
        o.controls = this.controls;
        o.tags = this.tags;
        o.accessControl = this.accessControl;
        if (this.metadata != null && Array.isArray(this.metadata)) {
            o.metadata = this.metadata.map(m => {
                let v = {key: m.key, type: m.type, value:m.value};
                if (m.value.toJsonObject != null) {
                    v.value = m.value.toJsonObject();
                }
                return v;
            });
        }
        return o;
    }
}
ModelPermission.TYPE.builder(ModelPermission);


export class AndroidPermissionGroup
{
    description:string = null;
    label:string = null;
    name:string = null;

    children:ModelPermission[] = [];

    constructor(config=null){

        // auto config
        if(config != null){
            for(let i in config)
                if(this[i] !==  undefined)
                    this[i] = config[i];
        }
/*
        for(let i=0; i<this.children.length; i++){
            if(this.children[i].permissionGroup === null){
                this.children[i].permissionGroup = this;
            }
        }
 */
    }


    toXmlObject():any{
        let o:any = {$:{}};

        for(let i in this){
            o.$["android:"+i] = this[i];
        }

        return o;
    }

    static fromXml(xmlobj:any):AndroidPermissionGroup{
        let p = new AndroidPermissionGroup();
        for(let i in xmlobj){
            if(i.startsWith('android:'))
                p[i.substr(8)] = xmlobj[i];
            else
                p[i] = xmlobj[i];
        }
        return p;
    }
}


export class AndroidPermissionTree
{
    icon:string = null;
    label:string = null;
    name:string = null;

    constructor(config:any=null){

        // auto config
        if(config != null){
            for(let i in config)
                if(this[i] !==  undefined)
                    this[i] = config[i];
        }
    }


    toXmlObject():any{
        let o:any = {$:{}};

        for(let i in this){
            o.$["android:"+i] = this[i];
        }

        return o;
    }

    static fromXml(xmlobj:any):AndroidPermissionTree{
        let p = new AndroidPermissionTree();
        for(let i in xmlobj){
            if(i.startsWith('android:'))
                p[i.substr(8)] = xmlobj[i];
            else
                p[i] = xmlobj[i];
        }
        return p;
    }
}


export class AndroidProtectionLevel
{
    static NORMAL:AndroidProtectionLevel = new AndroidProtectionLevel({ name:"normal" });
    static SIGNATURE:AndroidProtectionLevel = new AndroidProtectionLevel({ name:"signature" });
    static SPECIAL:AndroidProtectionLevel = new AndroidProtectionLevel({ name:"special" });
    static DANGEROUS:AndroidProtectionLevel = new AndroidProtectionLevel({ name:"dangerous" });
    static PRIVILEGED:AndroidProtectionLevel = new AndroidProtectionLevel({ name:"privileged" });
    static DEVELOPMENT:AndroidProtectionLevel = new AndroidProtectionLevel({ name:"development" });

    name:string = null;

    constructor(config:any=null){

        if(config != null){
            for(let i in config){
                this[i] = config[i];
            }
        }
    }

    equals(pStr:string){
        return (this.name===pStr);
    }
}


export class AndroidPermissionSdk23
{
    static MODEL = {
        name:"string",
        maxSdkVersion:"integer"
    }

    name:string = null;
    maxSdkversion:string = null;

    constructor(){

    }


    toXmlObject():any{
        let o:any = {$:{}};

        for(let i in this){
            o.$["android:"+i] = this[i];
        }

        return o;
    }

    static fromXml(xmlobj){
        let o = new AndroidPermissionSdk23();

        for(let i in xmlobj){
            if(i.startsWith('android:')){
                o[i.substr(8)] = xmlobj[i];
            }else{
                o[i] = xmlobj[i];
            }
        }

        return o;
    }
}