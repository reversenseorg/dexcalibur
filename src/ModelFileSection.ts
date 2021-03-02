/**
 * Represents a section into a file
 *
 * @class
 * @since 1.0.0
 */
export default class ModelFileSection {
    o:number = -1;
    t:string = "";

    constructor(pOffset:number, pType:string) {
        this.o = pOffset;
        this.t = pType;
    }

    getOffset():number {
        return  this.o;
    }

    getType():string {
        return this.t;
    }
}