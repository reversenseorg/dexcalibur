import DexcaliburProject from "./DexcaliburProject.js";
import ModelStringValue, {ModelStringValueOpts} from "./ModelStringValue.js";
import {ModelVariable} from "./ModelVariable.js";
import ModelPackage, {ModelPackageOptions} from "./ModelPackage.js";
import ModelClass from "./ModelClass.js";
import ModelMethod from "./ModelMethod.js";
import ModelField from "./ModelField.js";
import ModelInstruction from "./ModelInstruction.js";
import {ModelInstance} from "./ModelInstance.js";
import ModelFile from "./ModelFile.js";
import ModelBasicBlock from "./ModelBasicBlock.js";
import ModelConstantValue from "./ModelConstantValue.js";
import ModelCpuInstruction from "./ModelCpuInstruction.js";
import ModelDataBlock from "./ModelDataBlock.js";
import ModelExecutableSection from "./ModelExecutableSection.js";
import ModelFileSection from "./ModelFileSection.js";
import {ModelFunction} from "./ModelFunction.js";
import ModelCall from "./ModelCall.js";
import {ModelLocation} from "./ModelLocation.js";
import ModelMetadata from "./ModelMetadata.js";
import {ModelNativeRef} from "./ModelNativeRef.js";
import {
    ModelClassReference,
    ModelFieldReference,
    ModelMethodReference,
    ModelRegisterReference
} from "./ModelReference.js";
import {ModelBasicType, ModelObjectType} from "./ModelType.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";

/**
 * This API is a helper to create nodes  from event listener.
 *
 * Such nodes are ready to be incorporated
 * to the program modelling
 *
 * @class
 */
export class ModelAPI {

    context:DexcaliburProject;

    constructor( pProject:DexcaliburProject) {
        this.context = pProject;
    }

    newPackage( pOptions:ModelPackageOptions):ModelPackage {
       return new ModelPackage(pOptions);
    }

    newClass( pOptions:any):ModelClass {
        return new ModelClass(pOptions);
    }

    newMethod( pOptions:any):ModelMethod {
        return new ModelMethod(pOptions);
    }

    newField( pOptions:any):ModelField {
        return new ModelField(pOptions);
    }

    newInstruction( pOptions:any):ModelInstruction {
        return new ModelInstruction(pOptions);
    }

    newFile( pOptions:any):ModelFile {
        return new ModelFile(pOptions);
    }

    newInstance( pOptions:any):ModelInstance {
        return new ModelInstance(pOptions);
    }


    newBasicBlock( pOptions:any):ModelBasicBlock {
        return new ModelBasicBlock(pOptions);
    }

    newCall( pOptions:any):ModelCall {
        return new ModelCall(pOptions);
    }

    newConstantValue( pOptions:any):ModelConstantValue {
        return new ModelConstantValue(pOptions);
    }

    newCpuInstruction( pOptions:any):ModelCpuInstruction {
        return new ModelCpuInstruction(pOptions);
    }

    newDataBlock( pOptions:any):ModelDataBlock {
        return new ModelDataBlock(pOptions);
    }

    newExecutableSection( pOptions:any):ModelExecutableSection {
        return new ModelExecutableSection(pOptions);
    }

    newFileSection( pOffset:number, pType:string):ModelFileSection {
        return new ModelFileSection(pOffset,pType);
    }

    newFunction( pOptions:any):ModelFunction {
        return new ModelFunction(pOptions);
    }

    newStringValue( pOptions:ModelStringValueOpts):ModelStringValue {
        return new ModelStringValue(pOptions);
    }

    newLocation( pOptions:any):ModelLocation {
        return new ModelLocation(pOptions);
    }

    newMetadata( pOptions:any):ModelMetadata {
        return new ModelMetadata(pOptions);
    }

    newNativeRef( pOptions:any):ModelNativeRef {
        return new ModelNativeRef(pOptions);
    }

    newClassReference( pOptions:any):ModelClassReference {
        return new ModelClassReference(pOptions);
    }
    newMethodReference( pOptions:any):ModelMethodReference {
        return new ModelMethodReference(pOptions);
    }

    newFieldReference( pOptions:any):ModelFieldReference {
        return new ModelFieldReference(pOptions);
    }

    newRegisterReference( pOptions:any):ModelRegisterReference {
        return new ModelRegisterReference(pOptions);
    }

    newString( pOptions:any):ModelStringValue {
        return new ModelStringValue(pOptions);
    }

    newBasicType( pOptions:any):ModelBasicType {
        return new ModelBasicType(pOptions);
    }

    newObjectType( pOptions:any):ModelObjectType {
        return new ModelObjectType(pOptions);
    }

    newVariable( pOptions:any):ModelVariable {
        return new ModelVariable(pOptions);
    }

    getType(pName:string):NodeInternalType {
        return NodeInternalType[pName];
    }
}