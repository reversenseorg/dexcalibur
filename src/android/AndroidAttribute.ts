

export enum ATTR_TYPE {
    NONE,
    STRING,
    NUMBER,
    REFERENCE
};

// TODO : add resolving of @xxxx/yyyy references
export class AndroidAttribute {

    value:string;
    type:ATTR_TYPE = null;

    constructor(pValue:string, pType:ATTR_TYPE = ATTR_TYPE.NONE) {
        if(pType != ATTR_TYPE.NONE){
            this.value = pValue;
            if(pValue.length>0 && pValue[0]=='@')
                this.type = ATTR_TYPE.REFERENCE;
            else
                this.type = ATTR_TYPE.STRING;
        }else{
            this.value = pValue;
            this.type = pType;
        }
    }

    getValue(){
        return this.value;
    }
}


// TODO : add resolving of @xxxx/yyyy references
export interface AndroidAttributeSet {
    [ppt :string] :string
}
