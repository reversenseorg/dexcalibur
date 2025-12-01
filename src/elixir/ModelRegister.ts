import {RegisterType} from "./common.js";
import {DataType} from "../types/DataType.js";

export interface ModelRegisterOptions {
    type?: RegisterType;
    id: number;
    dataType?: DataType;
    name?: string;
    initialValue?:any;
}

/**
 * Represents a model register with defined properties and initialization options.
 */
export class ModelRegister {

    type?: RegisterType;
    id: number;
    dataType?: DataType;
    name?: string;
    initialValue?:any;

    constructor(pOptions:ModelRegisterOptions) {
        if(pOptions.type!=null) this.type=pOptions.type;
        if(pOptions.id!=null) this.id=pOptions.id;
        if(pOptions.dataType!=null) this.dataType=pOptions.dataType;
        if(pOptions.name!=null) this.name=pOptions.name;
        if(pOptions.initialValue!=null) this.initialValue=pOptions.initialValue;
    }

    setInitialValue( pValue:any):void {
        this.initialValue=pValue;
    }
}