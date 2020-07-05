import { CONST } from "./CoreConst";

interface PackedCaseList {
    [p: number]: ModelSwitchCase
}

interface AssociativeCaseList {
    [p: string]: ModelSwitchCase
}


/**
 * To represent a specific case into a switch statement
 */
export class ModelSwitchCase
{
    value:number|string = null;
    target:any = null;
    type:any = null;

    constructor(value:number|string, target:any, type:any){
        this.value = value;
        this.target = target;
        this.type = type;
    }
}

/**
 * To represent a packed switch statement
 */
export class ModelPackedSwitchStatement
{
    start:number = null;
    cases:PackedCaseList = null;
    offset:number = null;
    length:number = 0;

    constructor(start:number){
        this.start = start;
        this.cases = {};
        this.offset = start;
        this.length = 0;
    }

    appendCase(tag:any){
        this.cases[this.offset+1] = new ModelSwitchCase(this.offset+1, tag, CONST.CASE_TYPE.PACKED);
        this.offset++;
        this.length++;
    }

    getStartValue():string{
        return this.start.toString();
    }

    forEach(fn:any){
        for(let i in this.cases) fn(i, this.cases[i]);
    }
}




/**
 * To represent a packed switch statement
 */
export class ModelSparseSwitchStatement
{
    cases:AssociativeCaseList = null;
    length:number = 0;

    constructor(){
        this.cases = {};
        this.length = 0;
    }

    appendCase(key:string, val:ModelSwitchCase){
        this.cases[key] = new ModelSwitchCase(key, val, CONST.CASE_TYPE.SPARSE);
        this.length++;
    }

    getKeys():string[]{
        return Object.keys(this.cases);
    }
}


