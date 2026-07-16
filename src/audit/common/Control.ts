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

import {AssetOptions} from "./Asset.js";
import ControlAssessment from "./ControlAssessment.js";
import {Metadata} from "./Metadata.js";
import {IControl} from "./IControl.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {Nullable} from "../../core/IStringIndex.js";
import {Match} from "./AssuranceReport.js";
import {MatchOccurence} from "./Match.js";
import {NodeInternalType} from "@reversense/dxc-core-api";

export interface ControlMap {
    [key:string] :Control|ControlAssessment;
}

export interface ControlOptions {
    id?:string;
    name?:string;
    description?:string;
    links?:string[];
    children?:Control[];
    assessments?:ControlAssessment[];
    metadata?:Metadata[];
}


export interface Country {
    name: string;
    code: string;
}

export type ControlUUID = string;

/**
 * Represent a set of control points / assessments
 *
 * @class
 */
export default class Control implements IControl {

    __ = NodeInternalType.CONTROL;
    /**
     * Unique control ID
     * @type {string}
     * @field
     */
    id:ControlUUID;

    /**
     * Control point name
     * @type {string}
     * @field
     */
    name:string;

    description:string;

    metadata:Metadata[] = [];

    category:string[] = []

    links:Record<string,any>;

    children:Control[] = [];

    country:Nullable<Country> = null;

    assessments:ControlAssessment[] = []

    tags:number[] = [];

    matches:MatchOccurence<any>[] = [];


    constructor( pConfig:ControlOptions = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    getUID():ControlUUID {
        return this.id;
    }

    hasChildren():boolean {
        return (this.children.length > 0);
    }

    hasAssessments():boolean {
        return (this.assessments.length > 0);
    }

    update(pConfig:any, pUpdateChildren = false):void {
        if(pConfig.id!=null) this.id = pConfig.id;
        if(pConfig.name!=null) this.name = pConfig.name;
        if(pConfig.description!=null) this.description = pConfig.description;
        if(pConfig.links!=null) this.links = pConfig.links;
        if(pConfig.metadata!=null) this.metadata = pConfig.metadata;
        if(pConfig.country!=null) this.country = pConfig.country;
        if(pConfig.category!=null) this.category = pConfig.category;
        if(pConfig.matches!=null) this.matches = pConfig.matches;

        if(pUpdateChildren){
            if(pConfig.children!=null) this.children = pConfig.children;
            if(pConfig.assessments!=null) this.assessments = pConfig.assessments;
        }
    }

    static fromJsonObject(pObject:any):Control {
        const control = new Control(pObject);

        if(control.hasChildren()){
            control.children.map((vChild,index)=>{
                control.children[index] = Control.fromJsonObject(vChild);
            });
        }

        if(control.hasAssessments()){
            control.assessments.map((vChild,index)=>{
                control.assessments[index] = ControlAssessment.fromJsonObject(vChild);
            });
        }

        return control;
    }

    toJsonObject():any {
        let o:any = {
            __: this.__,
            id: this.id,
            name: this.name,
            description: this.description,
            links: this.links,
            children: [],
            assessments: [],
            metadata: this.metadata,
            category: this.category,
            country: this.country,
            matches: this.matches
        };

        if(this.hasChildren()){
            this.children.map(x => {
                if(x.toJsonObject!=null)
                    o.children.push(x.toJsonObject())
                else
                    o.children.push(x)
            });
        }

        if(this.hasAssessments()){
            this.assessments.map(x => {
                if(x.toJsonObject!=null)
                    o.assessments.push(x.toJsonObject())
                else
                    o.assessments.push(x)
            });
        }

        CoreDebug.checkJsonSerialize(o,"Control");

        return o;
    }



    isControlAssessment(): boolean {
        return false;
    }

    isControl(): boolean {
        return true;
    }
}