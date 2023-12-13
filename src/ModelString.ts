import {Savable, STUB_TYPE} from "./ModelSavable.js";
import {createHash} from "crypto";
import {NodeInternalType} from "./NodeInternalType.js";
import {NodeType, DataSourceHelper,  NodeProperty, DbDataType, DbKeyType, INode} from "@dexcalibur/dexcalibur-orm";
import {DataLocation, DataLocationType} from "./DataLocation.js";
import ModelBasicBlock from "./ModelBasicBlock.js";
import ModelMethod from "./ModelMethod.js";
import ModelInstruction from "./ModelInstruction.js";
import {AbstractHook} from "./hook/AbstractHook.js";
import HookSession from "./HookSession.js";
import HookTemplateFragment from "./hook/HookTemplateFragment.js";
import ModelFile from "./ModelFile.js";

const UID_ALGO = 'sha1';

/**
 * Represent a string from anywhere, captured statically or dynamically
 *
 *
 *
 * Replace ModelStringValue
 *
 * @class
 */
export default class ModelString extends Savable
{
    static TYPE:NodeType = (new NodeType( "strings", NodeInternalType.STRING, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
        //(new NodeProperty("_uid")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
        (new NodeProperty("location")).volatile().type(DbDataType.STRING).def(null),
        (new NodeProperty("value")).volatile().type(DbDataType.STRING).def(null),
        (new NodeProperty("tags")).volatile().type(DbDataType.STRING).def(null)
    ])).dataSource("MEM", "strings");

    __:NodeInternalType = NodeInternalType.STRING;

    // SRC_NODE_TYPE : SRC_UUID : STR_TYPE : UID
    _uid:string;

    location:DataLocation = null;
    value:string = null;
    tags:number[] = [];

    constructor(pConfig:any) {
        super(STUB_TYPE.STRING_VALUE);

        if(pConfig !== null)
            for(const i in pConfig)
                this[i] = pConfig[i];
    }

    static generateUID(pString:ModelString):string {
        return `${pString.location.getUID()}:${createHash(UID_ALGO).update(pString.value).digest('hex')}`;
    }

    static fromFile(  pFile:ModelFile, pOffset:any, pValue:string = null ):ModelString {
        return new ModelString({
            location: new DataLocation({
                type: DataLocationType.BYTECODE,
                source: {
                    nodeType: NodeInternalType.FILE,
                    node: pFile,
                    offset: pOffset
                },
            }),
            value: pValue
        });
    }


    static fromByteCode(  pMethod:ModelMethod, pBasicBlock:ModelBasicBlock, pInstr:ModelInstruction, pValue:string = null ):ModelString {
        return new ModelString({
            location: new DataLocation({
                type: DataLocationType.BYTECODE,
                source: {
                    nodeType: NodeInternalType.METHOD,
                    node: pMethod,
                    bbOffset: pBasicBlock.offset,
                    insOffset: pInstr.offset
                },
            }),
            value: pValue
        });
    }

    static fromHook(  pHook:AbstractHook, pFrag:HookTemplateFragment, pValue:string = null ):ModelString {
        return new ModelString({
            location: new DataLocation({
                type: DataLocationType.HOOK,
                source: {
                    hook: pHook,
                    frag: pFrag
                },
            }),
            value: pValue
        });
    }

    getUID(): string {
        return this._uid;
    }
}