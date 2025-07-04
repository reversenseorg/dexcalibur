import {ModelFunction} from "../ModelFunction.js";
import ModelExecutableSection from "../ModelExecutableSection.js";

export enum NativeHelperCmd {
    LIST_SECTIONS='sections',
    LIST_FUNCS='f_list'
}

export interface INativeHelper {

    start(pCommands:string[]):Promise<any>;

    listFunctions():Promise<ModelFunction[]>;

    listSections():Promise<ModelExecutableSection[]>;
}