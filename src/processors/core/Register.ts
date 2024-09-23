import {Nullable} from "../../core/IStringIndex.js";
import {RegisterSpace} from "./RegisterSpace.js";

export class Register {

    name:string;
    space:Nullable<RegisterSpace> = null;

    constructor(pName:string, pSpace:Nullable<RegisterSpace> = null) {
        this.name = pName;
        this.space = pSpace;
    }
}