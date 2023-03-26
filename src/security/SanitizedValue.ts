import {RuntimeSecurityException} from "../errors/RuntimeSecurityException.js";


export abstract class IncomingValue {
    protected name:string;
    protected value:any;

    constructor( pName:string, pValue:any) {
        this.name = pName;
        this.value = pValue;
    }

    abstract getName(): string;
    abstract getValue(): any;
}

export class SanitizedValue extends IncomingValue {

    getName(): string {
        return this.name;
    }

    getValue(): any {
        return this.value;
    }
}

export class PassthroughValue extends IncomingValue {

    getName(): string {
        return this.name;
    }

    getValue(): any {
        return this.value;
    }
}



export class UnsafeValue extends IncomingValue {

    getName(): string {
        return this.name;
    }

    getValue(): any {
        throw RuntimeSecurityException.USE_OF_UNSAFE_VALUE(new PassthroughValue( this.name, this.value));
    }
}