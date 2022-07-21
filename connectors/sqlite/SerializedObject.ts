import ModelPackage from "../../src/ModelPackage";
import ModelClass from "../../src/ModelClass";
import ModelField from "../../src/ModelField";
import ModelMethod from "../../src/ModelMethod";
import ModelDataBlock from "../../src/ModelDataBlock";
import ModelBasicBlock from "../../src/ModelBasicBlock";
import {ModelBasicType, ModelObjectType} from "../../src/ModelType";
import ModelCall from "../../src/ModelCall";
import {
    ModelClassReference,
    ModelFieldReference,
    ModelMethodReference,
    ModelRegisterReference,
    CodeLabel,
    XRef
} from "../../src/ModelReference";
import ModelInstruction from "../../src/ModelInstruction";
import ModelConstantValue from "../../src/ModelConstantValue";
import ModelStringValue from "../../src/ModelStringValue";
import {Stub} from "../../src/ModelSavable";
import {ModelPackedSwitchStatement, ModelSwitchCase} from "../../src/ModelSwitch";
import ModelCatchStatement from "../../src/ModelCatchStatement";
import ModelFile from "../../src/ModelFile";
import {UserAccount} from "../../src/user/UserAccount";
import UserRole from "../../src/UserRole";
import {Person} from "../../src/user/Person";



export default class SerializedObject
{
    static refs:any = {
        ModelPackage: ModelPackage,
        ModelClass: ModelClass,
        ModelMethod: ModelMethod,
        ModelField: ModelField,
        ModelDataBlock: ModelDataBlock,
        ModelBasicBlock: ModelBasicBlock,
        ModelObjectType: ModelObjectType,
        ModelBasicType: ModelBasicType,
        ModelCall: ModelCall,
        ModelFieldReference: ModelFieldReference,
        ModelMethodReference: ModelMethodReference,
        ModelClassReference: ModelClassReference,
        ModelInstruction: ModelInstruction,
        ModelConstantValue: ModelConstantValue,
        ModelStringValue: ModelStringValue,
        XRef: XRef,
        Tag: CodeLabel,
        Stub: Stub,
        File: ModelFile,
        ModelFile: ModelFile,
        ModelSwitchCase: ModelSwitchCase,
        ModelPackedSwitchStatement: ModelPackedSwitchStatement,
        ModelCatchStatement: ModelCatchStatement,
        ModelRegisterReference: ModelRegisterReference,
        UserAccount: UserAccount,
        UserRole: UserRole,
        Person: Person
    };

    __type:string = null;
    __raw:any = null;

    constructor(pConfig:any=null){
        if(pConfig!==null){
            for(let i in pConfig){
                this[i] = pConfig[i];
            }
        }
    }

    static isSerializable(obj:any):boolean{
        return (obj.serialize !=null) && (typeof obj.serialize==='function');
    }

    static isUnserializable(obj:any):boolean{
        return (obj.__type!=null)
            && (obj.__raw!=null)
            && (SerializedObject.refs[obj.__type]!==null);
    }

    static from(obj:any,type:string){
        let o = new SerializedObject();

        o.__type = type;
        o.__raw = obj;

        return o;
    }

    unserialize():any{
        return SerializedObject
            .refs[this.__type]
            .unserialize(this.__raw);
    }

}