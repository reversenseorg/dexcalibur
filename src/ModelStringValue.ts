import {Savable, STUB_TYPE} from "./ModelSavable";

export default class ModelStringValue extends Savable
{
    src:any = null;
    instr:any = null;
    value:string = null;
    tags:string[] = [];

    constructor(pConfig:any=null) {
        super(STUB_TYPE.STRING_VALUE);

        if(pConfig !== null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }


    toJsonObject():any{
        let o:any = {};
        o.value = this.value;
        o.instr = this.instr.toJsonObject();
        o.tags = this.tags;
        return o;
    };

    addTag(tag:string){
        this.tags.push(tag);
    }

    hasTag(tagName:string):boolean{
        return this.tags.indexOf(tagName)>-1;
    }

    getTags():string[]{
        return this.tags;
    }

}
