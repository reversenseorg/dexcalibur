import {Nullable} from "../core/IStringIndex.js";
import {ValidationRule} from "../Validator.js";


export enum ProjectInputType {
    REGULAR_FILE='regular_file',
    BUFFER='buffer',
    FOLDER='folder'
}

export enum ProjectInputLocation {
    DEVICE="device",
    REMOTE="remote",
    LOCAL="local"
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
    originalName?: string
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

    toJsonObject():any {
        return this;
    }
}