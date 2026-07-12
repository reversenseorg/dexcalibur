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

import {MerlinSearchRequest} from "../../search/MerlinSearchRequest.js";
import {MerlinRule} from "../../search/MerlinRule.js";
import {INode} from "../../INode.js";
import Control from "./Control.js";
import {IControl} from "./IControl.js";
import {TestType} from "./TestPlan.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {Metadata} from "./Metadata.js";
import {MerlinPrimitive, MerlinType} from "../../search/MerlinPrimitive.js";
import {MerlinUnserializer} from "../../search/MerlinUnserializer.js";
import {NodeUtils} from "@dexcalibur/dexcalibur-orm";
import AssuranceReport from "./AssuranceReport.js";
import {MatchOccurence} from "./Match.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";

/**
 * TODO : move into separate package shared with signature-server
 *
 * @enum
 */
export enum AnalysisType {
    /**
     * Rules perform search on graph
     *
     *
     * Evidence is composed of :
     * - Search Request / Rule and its matching results
     * - Commit ID of Hook Workspace
     */
    SAST, // support VT/PT

    /**
     * Rules create hook, if the hook is trigged, the rule is satisfied
     *
     *
     * Evidence is composed of :
     * - Search Request / Rule and its matching results
     * - Hooks
     * - Hook traces
     * - Commit ID of Hook Workspace
     */
    DAST, // support VT/PT

    /**
     * Rules create hook and optionnally action, if the hook and/or action is trigged, and if resulting
     * RuntimeEvent is trigged, the rule is satisfied.
     *
     * Evidence is composed of :
     * - Runtime Events, including hook message
     * - Search Request / Rule and its results used to generate hooks
     * - Hooks
     * - Hook traces
     * - Commit ID of Hook Workspace
     */
    IAST
}


export interface ControlAssessmentMap {
    [key:string] :ControlAssessment;
}



export interface ControlAssessmentOpts {
    id?:string;

    name?:string;

    description?:string;

    links?:string;

    metadata?:Metadata[];

    testType?:TestType;

    analType?:AnalysisType;

    rules?:(MerlinRule|MerlinSearchRequest)[];

}

interface Match {
    ctrl: Control;
    assess: string;
    rule: MerlinRule | MerlinSearchRequest;
    match: INode | any;
}




export enum DataOperation {
    SOURCING,
    PROCESSING,
    STORING,
    SHARING,
    ENCRYPTING,
    DECRYPTING,
    HASHING
}
export enum DataOperationSource {
    UI,
    API
}


/**
 * Represent a
 */
export default class ControlAssessment implements IControl {


    __ = NodeInternalType.CTRL_ASMT;

    id:string;

    name:string;

    description = "";

    links = "";

    metadata:Metadata[] = [];

    testType:TestType = TestType.STATIC_SCAN;

    analType:AnalysisType = AnalysisType.SAST;

    rules:MerlinPrimitive[] = [];

    matches:MatchOccurence<any>[] = [];

    //matches:Match[] = [];

    constructor( pConfig:ControlAssessmentOpts = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    getRules():MerlinPrimitive[] {
        return this.rules;
    }

    addMatches(pMatch:any):void {
        this.matches.push(pMatch);
    }

    toJsonObject():any{
        const o:any = {};

        for(let i in this){
            switch (i){
                case "matches":
                    o.matches = [];

                    this.matches.map((vMatch:any)=>{
                        o.matches.push({
                            node: {
                                // new format : node is as INodeRef object
                                __:  vMatch.node.__,
                                _uid: NodeUtils.asNodeRef(vMatch.node)._uid,
                                // 'uid' is deprecated
                                uid: (vMatch.node.getUID!=null)? vMatch.node.getUID() : vMatch.node.uid,
                                // 'value' should be moved to Metadata
                                // value: (vMatch.node.getUID!=null)? AssuranceReport._extractNodeValue("",vMatch) : null,
                            },
                            meta: vMatch.meta,
                            ruleIdx: vMatch.ruleIdx //pMatch.ruleIdx
                        });
                    });
                    break;
                case "rules":
                    o.rules = [];
                    this.rules.map( x => {
                        if(x!=null){

                            if(x.toJsonObject!=null)
                                o.rules.push(x.toJsonObject())
                            else
                                o.rules.push(x)

                        }
                    });
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }

        CoreDebug.checkJsonSerialize(o, "ControlAssessment");

        return o;
    }


    static fromJsonObject(pOpts:any):ControlAssessment {
        const a = new ControlAssessment(pOpts);


        if(a.rules.length>0){
            a.rules.map((vRule,vIndex)=>{
                let type = vRule.TYPE!=null ? vRule.TYPE : (vRule as any)._type;
                if(type == null && (vRule as any).engine=="merlin"){
                    type = MerlinType.RULE;
                }

                if(type===MerlinType.REQUEST){
                    a.rules[vIndex] = MerlinSearchRequest.fromJsonObject(null, vRule);
                }else{
                    a.rules[vIndex] = MerlinUnserializer.fromSerializedMerlinPrimitive(vRule as any);
                }
            });
        }

        return a;
    }

    isControlAssessment(): boolean {
        return true;
    }

    isControl(): boolean {
        return false;
    }
}