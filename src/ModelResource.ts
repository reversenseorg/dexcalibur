import {Savable, STUB_TYPE} from "./ModelSavable.js";
import {createHash} from "crypto";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {DbDataType, DbKeyType, DbSerialize, NodeProperty, NodeType} from "@dexcalibur/dexcalibur-orm";
import {DataLocation, DataLocationType} from "./DataLocation.js";
import ModelBasicBlock from "./ModelBasicBlock.js";
import ModelMethod from "./ModelMethod.js";
import ModelInstruction from "./ModelInstruction.js";
import {AbstractHook} from "./hook/AbstractHook.js";
import HookTemplateFragment from "./hook/HookTemplateFragment.js";
import ModelFile from "./ModelFile.js";
import {Nullable} from "./core/IStringIndex.js";
import {AndroidResourceType} from "./android/AndroidResource.js";

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
        (new NodeProperty("value")).type(DbDataType.STRING).def(null),
        (new NodeProperty("ppts")).type(DbDataType.BLOB).def({}), //.serialize(DbSerialize.JSON).def({}),
        (new NodeProperty("tags")).type(DbDataType.STRING).def(null)
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.RESOURCE;

    _uid:string;
    location:DataLocation = null;
    value:string = null;
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


    /**
     *
     * @param pUID
     * @param pValue
     * @param pRes
     */
    static fromAndroidResource(pUID:string, pValue:any, pRes: AndroidResourceType):ModelResource {

        const type = pUID.split("/")[0].substring(1);
        switch (type){

        }

        return new ModelResource({
            location: new DataLocation({
                type: DataLocationType.FILE,
                source: {
                    nodeType: NodeInternalType.FILE,
                    // node: pRes.,
                    // offset: pOffset,
                    // length: pLength
                }
            }),
            name: pUID,
            value: pValue,
            ppts: pRes._children
        });
    }
}
ModelResource.TYPE.builder(ModelResource);