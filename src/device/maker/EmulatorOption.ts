import {ValidationRule} from "../../Validator.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {VirtualDeviceFactoryException} from "../error/VirtualDeviceFactoryException.js";



export enum OptsPurpose {
    DEFAULT,
    NETWORK,
    UI,
    SYSTEM,
    DEBUG
}

export interface EmulatorOptionSetting {
    name:EmulatorOptionID,
    value?:string,
    descr?:string,
    /**
     * To set if value is required (TRUE) or not (FALSE)
     */
    required?:boolean,
    purpose?:OptsPurpose,
    rule?:ValidationRule
}

export type EmulatorOptionID = string;

export class EmulatorOption {

    name:EmulatorOptionID;

    value?:string;

    descr:string = "";
    /**
     * To set if value is required (TRUE) or not (FALSE)
     */
    required:boolean = false;

    purpose:OptsPurpose = OptsPurpose.DEFAULT;

    rule:Nullable<ValidationRule> = null;

    constructor(pOptions:EmulatorOptionSetting) {
        this.name = pOptions.name;
        this.value = pOptions.value;
        this.descr = pOptions.descr;
        this.required = pOptions.required;
        this.purpose = pOptions.purpose;
        this.rule = pOptions.rule;
    }

    /**
     * To check if the value is valid
     *
     * @returns {boolean}
     * @method
     */
    isValid(pValue:any):boolean{

        if(this.rule==null){
            throw VirtualDeviceFactoryException.OPTION_CANNOT_BE_VALIDATED(this.name);
        }

        if(!this.rule.test(pValue)){
            console.log(pValue, this.rule.refValue);
            throw VirtualDeviceFactoryException.OPTION_VALUE_IS_INVALID(this.name);
        }

        return true;
    }

    getName():EmulatorOptionID {
        return this.name;
    }

    getValue():string {
        return this.value;
    }

    toJsonObject():any {
        return {
            name: this.name,
            value: this.value,
            descr: this.descr,
            required: this.required,
            purpose: this.purpose,
            rule: this.rule
        };
    }
}