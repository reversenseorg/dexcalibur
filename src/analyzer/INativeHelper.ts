import {ModelFunction} from "../ModelFunction.js";
import ModelExecutableSection from "../ModelExecutableSection.js";
import ModelStringValue from "../ModelStringValue.js";
import ModelCall from "../ModelCall.js";

export enum NativeHelperCmd {
    LIST_SECTIONS='sections',
    LIST_SEGMENTS='segments',
    LIST_SYSCALLS='sysc',
    LIST_XREFS='xrefs',
    LIST_STRINGS='str',
    LIST_FUNCS='f_list',
    SEARCH_INT='s_svc'
}

export interface INativeHelper {

    start(pCommands:string[]):Promise<any>;

    listFunctions():Promise<ModelFunction[]>;

    listSections():Promise<ModelExecutableSection[]>;

    listStrings(pOptions:any):Promise<ModelStringValue[]>;

    listSyscalls(pOptions:any):Promise<ModelCall[]>;

    listXrefs(pOptions:any):Promise<ModelCall[]>;
}