
/**
 * Constant values describing a stub type.
 */
export enum STUB_TYPE {
    METHOD= 0x1,
    FIELD= 0x2,
    ANNOTATION= 0x3,
    INSTR= 0x4,
    MISSING= 0x5,
    CLASS= 0x6,
    OBJ_TYPE= 0x7,
    BASIC_TYPE= 0x8,
    VALUE_CONST= 0x9,
    STRING_VALUE= 0xa,
    CIRCULAR= 0xb,
    VARIABLE= 0xc,
    CALL= 0xd,
    NATIVE_FUNC= 0xe,
    SYSCALL= 0xf,
    TAG
}



export class Stub
{
    __type__:number = null;

    constructor(type:number, data:any, exclude:any=null){
        this.__type__ = type;
        if(exclude==null) exclude=[];

        for(let i in data){
            if(exclude.indexOf(i)==-1)
                this[i]=data[i]
        }

    }

}


export class Savable
{
    $:STUB_TYPE;

    constructor(pType:STUB_TYPE) {
        this.$ = pType;
    }

    export( pStubType:STUB_TYPE=null, pExclude:string[]=null):Stub{
        return new Stub(
            (pStubType!==null ? pStubType : this.$),
            this,
            pExclude
        )
    }

    import( pConfig:any):any{
        for(let i in pConfig) this[i] = pConfig[i];

        return this;
    }
}