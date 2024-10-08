

export class DataType
{
    /**
     * Type name
     */
    name:string;

    /**
     *
     */
    signed:boolean;

    /**
     * Bit len
     */
    len:number;

    fmt:string;

    str = false;

    /**
     * To represent a primitive type
     * @param {string} raw_type - The raw name of the type as it can be found in Smali code
     * @param {boolean} isArray - Array flag should be TRUE if the type is an array, else FALSE
     * @constructor
     */
    constructor(name:string, bitLen:number, signed=false){
        this.name = name;
        this.len = bitLen;
        this.detectFlags();
    }

    detectFlags(){
        if(/^u[a-z0-9]+_t$/g.test(this.name) || this.name.startsWith('unsigned')){
            this.signed = true;
        }
        else if(this.name==="char *"){
            this.str = true;
        }
    }

    /**
     *
     */
    isString():boolean {
        return this.str;
    }

    getName():string {
        return this.name;
    }

}