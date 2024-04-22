import {Nullable} from "../core/IStringIndex.js";


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

export interface ProjectInput {
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
    purpose?: ProjectInputPurpose
}

export class ProjectInputViewer {
    static print(pProjectInput:ProjectInput){
        return `| ${pProjectInput.purpose} | ${pProjectInput.location} | ${pProjectInput.type} | ${JSON.stringify(pProjectInput.extractOpts)} | ${pProjectInput.data} `;
    }

    static printList(pProjectInput:ProjectInput[]){
        let s = "";
        pProjectInput.map(x => s+"\n"+ProjectInputViewer.print(x));
        return s;
    }
}

export class ProjectInput2 {


    data: ProjectInputData;
    location: ProjectInputLocation;
    type: ProjectInputType;
    extractOpts: Nullable<InputExtractOptions> = null;
    purpose: ProjectInputPurpose;

    constructor(pOptions:ProjectInputOptions = {}) {
        if(pOptions!=null){
            for(let i in pOptions) this[i] = pOptions[i];
        }
    }

    static from(pOptions:ProjectInputOptions):ProjectInput2 {
        return new ProjectInput2(pOptions);
    }
}