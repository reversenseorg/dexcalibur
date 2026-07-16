/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {Nullable} from "../core/IStringIndex.js";
import {ValidationRule} from "@reversense/dexcalibur-orm";
import {SecurityZone} from "../security/SecurityZone.js";
import {JsonObject} from "../Utils.js";
import {UploadedResourceUUID} from "../common/UploadedResource.js";

export interface DownloadedProjectInput {
    path:string;
    purpose:ProjectInputPurpose;
}

export enum ProjectInputType {
    REGULAR_FILE='regular_file',
    BUFFER='buffer',
    FOLDER='folder'
}

export enum ProjectInputLocation {
    DEVICE="device",
    REMOTE="remote",
    LOCAL="local",
    DB_UPL="db_upl",
    DB_PRJ="db_prj"
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
    upl?:UploadedResourceUUID;
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
    extractOpts: InputExtractOptions = null;
    purpose: ProjectInputPurpose;
    originalName: Nullable<string> = null;
    path: string
    predecessor: Nullable<ProjectInput> = null;
    upl:UploadedResourceUUID = null;

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

    isFolder(): boolean {
        return (this.type === ProjectInputType.FOLDER);
    }

    getPath():string {
        if (this.isFile() || this.isFolder()) {
            return this.data as string;
        }else{
            return null;
        }
    }

    setPath(pPath:string):void {
        this.data = pPath;
    }

    setWsPath(pPath:string):void {
        this.path = pPath;
    }

    getWsPath():string {
        return this.path;
    }

    setUploadUID(pUID:string):void {
        this.upl = pUID;
    }

    getUploadUID():Nullable<string> {
        return this.upl;
    }

    getPredecessor():Nullable<ProjectInput> {
        return this.predecessor;
    }

    setPredecessor(pPredecessor:Nullable<ProjectInput>):void {
        this.predecessor = pPredecessor;
    }


    /**
     * To perform comparison of type and checksum
     *
     * If the location is a local file, the location is alsop tested
     */
    isFileDifferent(pInput:ProjectInput):boolean {
        return (this.getPath()!=pInput.getPath());
    }

    toJsonObject(pZone = SecurityZone.PUBLIC): JsonObject {

        const o : JsonObject = {
            data: this.data as string,
            location: (pZone==SecurityZone.PRIVATE ? this.location : ""),
            type: this.type,
            purpose: this.purpose,
            originalName: this.originalName,
            path: (pZone==SecurityZone.PUBLIC ? null : this.path),
            upl: this.upl
        };

        if (this.extractOpts != null) {
            o.extractOpts = this.extractOpts as unknown as JsonObject;
        }
        if (this.getPredecessor() != null) {
            o.predecessor = this.getPredecessor().toJsonObject();
        }
        return o;
    }

    static fromJsonObject(pJson:any): ProjectInput {
        let o: ProjectInput = new ProjectInput(pJson);
        o.location = pJson.location as ProjectInputLocation;
        if (pJson.predecessor != null) {
            o.predecessor = ProjectInput.fromJsonObject(pJson.predecessor);
        }
        return o;
    }
}