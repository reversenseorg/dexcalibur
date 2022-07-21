import {Savable, STUB_TYPE} from "./ModelSavable";
import {createHash} from "crypto";
import {NodeType} from "./persist/orm/NodeType";
import {NodeInternalType} from "./NodeInternalType";
import {NodeProperty} from "./persist/orm/NodeProperty";
import {DbDataType, DbKeyType} from "./persist/orm/DbAbstraction";
import {DataSourceHelper} from "./DataSourceHelper";
import {DataLocation, DataLocationType} from "./DataLocation";
import ModelBasicBlock from "./ModelBasicBlock";
import ModelMethod from "./ModelMethod";
import ModelInstruction from "./ModelInstruction";
import {AbstractHook} from "./hook/AbstractHook";
import HookSession from "./HookSession";
import HookTemplateFragment from "./hook/HookTemplateFragment";
import ModelFile from "./ModelFile";

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
    ])).dataSource(DataSourceHelper.MEM, "strings");

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
}