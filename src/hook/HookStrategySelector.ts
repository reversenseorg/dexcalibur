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

/**
 * Represents the object which search pattern into application and generate
 * corresponding insttrumentation.
 *
 * By default, such HookStrategy are executed when the application has been analyzed,
 * however if it is attached to particular a particular event, it can be trigged earlier or later.
 *
 * @class
 */
import {NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {CoreDebug} from "../core/CoreDebug.js";
import {Nullable} from "../core/IStringIndex.js";
import {Operation} from "../search/MerlinSearchRequest.js";;


export interface HookStrategySelectorOptions {
    type: string;
    uid?:Nullable<any>;
    req?:Nullable<string|Operation[]>;
    opts?:any;
}


export const HookStrategySelectorSchema = {
    type: "object",
    properties: {
        type: {
            type: "string",
            description: "The type of node to search for (e.g., method, class, package)"
        },
        uid: {
            oneOf: [
                { type: "string" },
                {
                    type: "array",
                    items: { type: "string" }
                },
                { type: "null" }
            ],
            description: "Unique identifier(s) of the target node(s). Can be a single UID, an array of UIDs, or null"
        },
        req: {
            oneOf: [
                { type: "string" },
                {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            type: { type: "string" },
                            args: { type: "object" }
                        },
                        required: ["type"]
                    }
                },
                { type: "null" }
            ],
            description: "Search engine request. Can be a Merlin query string, an array of Operation objects, or null"
        },
        opts: {
            type: "object",
            description: "Optional additional options for the selector"
        }
    },
    required: ["type"],
    additionalProperties: false
}

export default class HookStrategySelector {

    /**
     * Search Engine request
     * @private
     */
    type:string = "";

    uid?:any = null;

    req?:string|Operation[] = null;


    /**
     * Group of hook
     *
     * @param {HookStrategySelectorOptions} config
     */
    constructor(pConfig:Nullable<HookStrategySelectorOptions>=null){

        // this.requiresNode = [];
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];


    }

    static from(pData:HookStrategySelectorOptions):HookStrategySelector {
        return new HookStrategySelector(pData);
    }

    getUids():string[] {
        if(this.isUidList()){
            return this.uid;
        }else{
            return [this.uid];
        }
    }

    isUidList():boolean {
        return (this.uid != null && Array.isArray(this.uid));
    }

    isUidSelector():boolean {
        return (this.uid != null);
    }

    setRequest(pReq:string|Operation[]){
        this.req = pReq;
    }

    getRequest():string|Operation[]{
        return this.req;
    }

    hasMerlinRequest():boolean {
        return (this.req != null) && (Array.isArray(this.req));
    }

    isMethod(){
        return (NodeType.ALL[this.type].getType() === NodeInternalType.METHOD);
    }

    isNativeFunc(){
        return (NodeType.ALL[this.type].getType() === NodeInternalType.FUNC);
    }

    isSystemCall(){
        return (NodeType.ALL[this.type].getType() === NodeInternalType.SYSCALL);
    }

    isRaw(){
        return (NodeType.ALL[this.type].getType() === null);
    }

    static fromJsonObject(pObj:any):HookStrategySelector {
        const o = new HookStrategySelector();
        if(pObj.req != null) o.req = pObj.req;
        if(pObj.uid != null) o.uid = pObj.uid;
        if(pObj.type != null) o.type = pObj.type;
        return o;
    }

    toJsonObject():any {
        const o:any = {};
        if(this.req != null) o.req = this.req;
        if(this.uid != null) o.uid = this.uid;

        o.type = this.type;

        CoreDebug.checkJsonSerialize(o, "HookStrategySelector");
        return o;
    }
}