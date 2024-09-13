import {Savable, STUB_TYPE} from "./ModelSavable.js";
import {createHash} from "crypto";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {
    DbDataType,
    DbKeyType,
    DbSerialize, INode, Node,
    NodeProperty,
    NodePropertyState,
    NodeType, SerializeOptions
} from "@dexcalibur/dexcalibur-orm";
import {DataLocation, DataLocationType} from "./DataLocation.js";
import ModelFile from "./ModelFile.js";
import {Nullable} from "./core/IStringIndex.js";
import {AndroidResourceType} from "./android/AndroidResource.js";
import ModelFileSection from "./ModelFileSection.js";
import {NodeUtils} from "@dexcalibur/dexcalibur-orm";
import ModelStringValue from "./ModelStringValue.js";

export interface ResourceOpts {
    _uid?:string;
    location?:DataLocation;
    value?:string;
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
export default class ModelResource extends Savable
{
    static TYPE:NodeType = (new NodeType( "resources", NodeInternalType.RESOURCE, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("location")).type(DbDataType.BLOB).def(null),//.serialize(DbSerialize.JSON),
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
        (new NodeProperty("tags")).type(DbDataType.STRING).def(null)
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.RESOURCE;

    _uid:string;
    location:DataLocation = null;
    value:any = null;
    name:string;
    ppts:Record<string,any> = {}
    tags:number[] = [];

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
        return NodeUtils.isNode(this.value) && (this.value.__===NodeInternalType.STRING);
    }


    /**
     *
     * @param pFile
     * @param pOptions
     * @param pOffset
     * @param pLength
     */
    static fromFile(  pFile:ModelFile, pOptions:ResourceOpts, pOffset = -1, pLength=-1):ModelResource {
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


    toJsonObject(pOption?: SerializeOptions): any {
        const o:any = {};

        o.__ = this.__;
        o._uid = this._uid;
        if(this.location != null){
            o.location = this.location.toJsonObject();
        }else{
            o.location = null;
        }

        o.value = NodeUtils.serialize(this.value);

        o.name = this.name;
        o.ppts = this.ppts;
        o.tags = this.tags;

        return o;
    }
}
ModelResource.TYPE.builder(ModelResource);