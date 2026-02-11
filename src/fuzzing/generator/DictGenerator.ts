import {IFuzzGenerator} from "../common.js";

export class DictGenerator implements IFuzzGenerator{
    dict:any[];
    index:number = 0;
    constructor(pDict:any[]){
        // read dict in a file or hard coded.
        this.dict = pDict;
    }

    init(){
        this.index = 0;
    }
    next(){
        return this.dict[this.index++];
    }
}
