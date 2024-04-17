

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

export class ProjectInputViewer {
    static print(pProjectInput:ProjectInput){
        return `| ${pProjectInput.purpose} | ${pProjectInput.location} | ${pProjectInput.type} | ${JSON.stringify(pProjectInput.extractOpts)} | ${pProjectInput.data} `;
    }
}
