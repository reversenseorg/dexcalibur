import {IStringIndex} from "../../core/IStringIndex.js";



export abstract class GenericParser {

    static ALL:IStringIndex<GenericParser> = {};

    uid:string;

    constructor() {

    }


    abstract parse():Promise<any>;
}