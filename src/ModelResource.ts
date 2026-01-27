import {Savable, STUB_TYPE} from "./ModelSavable.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType,
    NodeUtils,
    SerializeOptions
} from "@dexcalibur/dexcalibur-orm";
import {DataLocation, DataLocationFileSource, DataLocationType} from "./DataLocation.js";
import ModelFile from "./ModelFile.js";
import {Nullable} from "./core/IStringIndex.js";
import ModelStringValue from "./ModelStringValue.js";
import {INodeRef} from "./INode.js";

export interface ResourceOpts {
    _uid?:string;
    location?:DataLocation;
    value?:any;
    name?:string;
    ppts?:Record<string,any>;
    tags?:number[];
}
/**
 * Represent a string from anywhere, captured statically or dynamically
 *
 *
 *
 * Replace ModelStringValue
 *
 * @class
 */
export default class ModelResource<T> extends Savable
{
    static TYPE:NodeType = (new NodeType( "resources", NodeInternalType.RESOURCE, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("location"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState)=>{
                if(x.p==null) return null;
                return (x.p as DataLocation).toJsonObject(); // .serialize(x.p);
            })
            .wakeUp( (x:NodePropertyState)=>{
                if(x.p==null)
                    return null;

                /*const dl = new DataLocation(x.p);
                switch (dl.type){
                    case DataLocationType.FILE:
                        (dl.source as any).file = (x.ctx as DexcaliburProject).find.get.files((dl.source as DataLocationFileSource).fileUID);
                        break;
                }*/

                return new DataLocation(x.p);
            })
            .def(null),//.serialize(DbSerialize.JSON),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("value"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState)=>{
                return NodeUtils.serialize(x.p);
            })
            .wakeUp( (x:NodePropertyState)=>{
                if(x.p==null) return null;

                if(Array.isArray(x.p)){
                    const ar:INode[] = [];
                    x.p.map(y => {
                        switch(y.__){
                            case NodeInternalType.STRING:
                                ar.push(new ModelStringValue(y));
                                break;
                            default:
                                return y;
                        }
                    });
                }else if(typeof x.p === 'object'){
                    if(x.p!=null && x.p.__ != null){
                        switch(x.p.__){
                            case NodeInternalType.STRING:
                                return new ModelStringValue(x.p);
                            default:
                                return x.p;
                        }
                    }else{
                        return x.p;
                    }
                }else{
                    return x.p;
                }
            })
            .def(null),
        (new NodeProperty("ppts")).type(DbDataType.BLOB).def({}), //.serialize(DbSerialize.JSON).def({}),
        (new NodeProperty("tags")).type(DbDataType.STRING).def(null),
        (new NodeProperty("stringNodes")).volatile().def([])

    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.RESOURCE;

    _uid:string = "";
    location:DataLocation = null;
    value:Nullable<T> = null;
    name:string;
    ppts:Record<string,any> = {}
    tags:number[] = [];

    stringNodes:ModelStringValue[] = [];

    constructor(pConfig:Nullable<ResourceOpts> = null) {
        super(STUB_TYPE.STRING_VALUE);

        if(pConfig != null){
            for(const i in pConfig)
                this[i] = pConfig[i];
        }
    }

    /**
     * To check if the ressource has string nodes (ModelStringValue)
     *
     * @method
     */
    hasStringValue():boolean {
        return NodeUtils.isNode(this.value) && ((this.value as unknown as INode).__===NodeInternalType.STRING);
    }


    /**
     *
     * @param pFile
     * @param pOptions
     * @param pOffset
     * @param pLength
     */
    static fromFile(  pFile:ModelFile, pOptions:ResourceOpts, pOffset = -1, pLength=-1):ModelResource<any> {
        return new ModelResource({
            location: new DataLocation({
                type: DataLocationType.FILE,
                source: {
                    nodeType: NodeInternalType.FILE,
                    node: pFile,
                    offset: pOffset,
                    length: pLength
                }
            }),
            ...pOptions
        });
    }

    getUID(): string {
        return this._uid;
    }

    /**
     *
     * @param pFile
     * @param pOffset
     * @param pLength
     */
    setFileLocation( pFile:ModelFile, pOffset:any = null, pLength:any = null):void {
        this.location = DataLocation.fromFile(pFile, pOffset);
    }

    /**
     * To check if the specified value is a ModelStringValue node
     *
     * @param {any} pValue The. object to test
     * @return {boolean} TRUE is the argument is a ModelStringValue
     * @static
     * @method
     */
    static is(pValue:any):boolean{
        return (pValue!=null && NodeUtils.isNode(pValue) && pValue.__===NodeInternalType.RESOURCE);
    }

    /**
     * To get the list of string node contained in this resource
     *
     * Search in :
     * - value
     * - direct value of key-pair in ppts
     * - 1st level of entries of an array in a direct value of a key-pair in ppts
     *
     * @return {ModelStringValue[]} A list of string node
     * @method
     */
    getStringNodes():ModelStringValue[] {
        let str:ModelStringValue[] = [];

        if(ModelStringValue.is(this.value)){
            str.push(this.value as unknown as ModelStringValue);
        }

        // browse properties
        for(let ppt in this.ppts){
            if(Array.isArray(this.ppts[ppt])) {
                this.ppts[ppt].map((x:any) => {
                    if(ModelStringValue.is(x)){
                        str.push(x);
                    }
                });
            }else if(typeof this.ppts[ppt]==='object'){
                if(this.ppts[ppt]==null) continue;

                if(ModelStringValue.is(this.ppts[ppt])){
                    str.push(this.ppts[ppt]);
                }else if(ModelResource.is(this.ppts[ppt])){
                    str = str.concat(this.ppts[ppt].getStringNodes());
                }else{
                    for(let i in this.ppts[ppt]){
                        if(ModelStringValue.is(this.ppts[ppt][i])){
                            str.push(this.ppts[ppt][i]);
                        }else if(ModelResource.is(this.ppts[ppt][i])){
                            str = str.concat(this.ppts[ppt][i].getStringNodes());
                        }
                    }
                }
            }
        }

        return str;
    }

    toJsonObject(pOption?: SerializeOptions): any {
        const o:any = {
            value: null,
            __: this.__,
            _uid: this._uid,
            name: this.name,
            ppts: this.ppts,
            tags: this.tags,
            location: null
        };

        if(this.location != null){
            o.location = this.location.toJsonObject();
        }

        if(this.value!=null){
            if(Array.isArray(this.value) || NodeUtils.isNode(this.value)){
                o.value = NodeUtils.serialize(this.value as unknown as (INode | INode[]));
            }else{
                o.value = (this.value as any).toJsonObject!=null ? (this.value as any).toJsonObject() : this.value;
            }
        }



        return o;
    }

    getFile():Nullable<ModelFile|INodeRef> {
        if(this.location!=null && this.location.type==DataLocationType.FILE){
            const l = (this.location.source as DataLocationFileSource);
            if(l.file!=null)
                return l.file;
            else if(l.ref!=null)
                return l.ref;
            else
                return null;
        }else{
            return null;
        }
    }

    /**
     *
     * @param pName
     * @param pValue
     */
    getProperty(pName: string):any {
        return this.ppts[pName];
    }


    /**
     *
     * @param pName
     * @param pValue
     */
    setProperty(pName: string, pValue: any):void {
        this.ppts[pName] = pValue;
    }

    /**
     * To check if the resource value point to a node (plain node or INodeRef)
     */
    hasNodeValue():boolean {
        return (this.value!=null && NodeUtils.isNode(this.value));
    }

    /**
     * To automatically create a hashmap and add the key / value pair
     *
     * @param pPptName
     * @param pValue
     * @param pValue
     */
    appendProperty(pPptName: string, pKey: string, pValue: any):void {
        if(this.ppts[pPptName]==null){
            this.ppts[pPptName] = {};
        }

        this.ppts[pPptName][pKey] = pValue;
    }
}
ModelResource.TYPE.builder(ModelResource<any>);