import {Nullable} from "../core/IStringIndex.js";
import {ValidationRule} from "../Validator.js";
import {SecurityZone} from "../security/SecurityZone.js";


export enum ProjectInputType {
    REGULAR_FILE='regular_file',
    BUFFER='buffer',
    FOLDER='folder'
}

export enum ProjectInputLocation {
    DEVICE="device",
    REMOTE="remote",
    LOCAL="local",
    DB_UPL="db_upl"
}

export enum ProjectInputPurpose{
    MAIN="main",
    EXTRA="extra"
}

export type ProjectInputData = string | Buffer;

export interface InputExtractOptions {
    type:string;
}

export interface IProjectInput {
    data: ProjectInputData,
    location: ProjectInputLocation,
    type: ProjectInputType,
    extractOpts?: InputExtractOptions,
    purpose: ProjectInputPurpose
}

export interface ProjectInputOptions {
    data?: ProjectInputData,
    location?: ProjectInputLocation,
    type?: ProjectInputType,
    extractOpts?: InputExtractOptions,
    purpose?: ProjectInputPurpose,
    originalName?: string,
    path?:string;
}

export class ProjectInputViewer {
    static print(pProjectInput:IProjectInput){
        return `| ${pProjectInput.purpose} | ${pProjectInput.location} | ${pProjectInput.type} | ${JSON.stringify(pProjectInput.extractOpts)} | ${pProjectInput.data} `;
    }

    static printList(pProjectInput:IProjectInput[]){
        let s = "";
        pProjectInput.map(x => s+"\n"+ProjectInputViewer.print(x));
        return s;
    }
}

export class ProjectInput implements IProjectInput{

    static VALIDATE = {
        purpose: ValidationRule.newPinklistAssert([
            ProjectInputPurpose.MAIN,
            ProjectInputPurpose.EXTRA
        ])
    };

    data: ProjectInputData;
    location: ProjectInputLocation;
    type: ProjectInputType;
    extractOpts: Nullable<InputExtractOptions> = null;
    purpose: ProjectInputPurpose;
    originalName: Nullable<string> = null;
    path: string

    constructor(pOptions:ProjectInputOptions = {}) {
        if(pOptions!=null){
            for(let i in pOptions) this[i] = pOptions[i];
        }
    }

    static from(pOptions:ProjectInputOptions):ProjectInput {
        return new ProjectInput(pOptions);
    }

    getOriginalName():Nullable<string> {
        return this.originalName;
    }

    isFile():boolean{
        return (this.type===ProjectInputType.REGULAR_FILE);
    }

    setPath(pPath:string):void {
        this.data = pPath;
    }

    toJsonObject(pZone = SecurityZone.PUBLIC):any {

        const o = {
            data: this.data,
            location: (pZone==SecurityZone.PRIVATE ? this.location : ""),
            type: this.type,
            extractOpts: this.extractOpts,
            purpose: this.purpose,
            originalName: this.originalName
        }

        return o;
    }
}