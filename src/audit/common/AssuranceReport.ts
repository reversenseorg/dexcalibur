import * as _fs_ from 'fs';
import Asset from "./Asset.js";
import Threat from "./Threat.js";
import Constraint from "./Constraint.js";
import { ConstraintMatch } from "./ConstraintMatch.js";
import CodeConstraint from "./CodeConstraint.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import AssuranceModel, {ControlNode} from "./AssuranceModel.js";
import Control from "./Control.js";
import ControlAssessment from "./ControlAssessment.js";
import {CoreDebug} from "../../core/CoreDebug.js";


export interface Match {
    assessment: ControlNode;
    ruleIdx?: number;
    match: any;
}

export interface MatchesMap {
    [canonicalID:string]:Match;
}

export interface AssuranceReportOptions {
    time?:number;

    application?:any;
    device?:any;

    model?:AssuranceModel;

    project?:DexcaliburProject;

    primaryAssets?:ConstraintMatch<Asset>[];
    secondaryAssets?:ConstraintMatch<Asset>[];
    globalThreats?:ConstraintMatch<Threat>[];
    matches?:MatchesMap;
}

/**
 * Represent a scan report
 *
 * @class
 */
export default class AssuranceReport {

    time:number;

    application:string;

    device:string;

    project:DexcaliburProject;

    model:AssuranceModel;

    primaryAssets:ConstraintMatch<Asset>[] = [];
    secondaryAssets:ConstraintMatch<Asset>[] = [];
    globalThreats:ConstraintMatch<Threat>[] = [];


    assets:ConstraintMatch<Asset>[] = [];
    matches:MatchesMap = {};



    constructor( pConfig:AssuranceReportOptions = {}) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    getAssets():ConstraintMatch<Asset>[] {
        return this.assets;
    }

    getThreats():ConstraintMatch<Threat>[] {
        return this.globalThreats;
    }
    getPrimaryAssets():ConstraintMatch<Asset>[] {
        return this.primaryAssets;
    }
    getSecondaryAssets():ConstraintMatch<Asset>[] {
        return this.secondaryAssets;
    }

    addCodeMatch( pConstraint:CodeConstraint, pSubject:any):void {
        if(pConstraint.el!=null){
            if(pConstraint.el instanceof Threat){
                this.globalThreats.push(
                    new ConstraintMatch<Threat>(
                        pConstraint,
                        pConstraint.pattern,
                        pSubject,
                        pConstraint.el
                    )
                );
            }
            else if(pConstraint.el instanceof Asset){
                this.primaryAssets.push(
                    new ConstraintMatch<Asset>(
                        pConstraint,
                        pConstraint.pattern,
                        pSubject,
                        pConstraint.el
                    )
                );

            }
        }
    }

    /**
     * To get the Assurance Model
     *
     * @return {AssuranceModel} Assurance model used to produce this report
     * @method
     */
    getModel():AssuranceModel {
        return this.model;
    }

    /**
     * To add a match to the report
     *
     * A match is a pair of assessed ControlNode and Node
     *
     *
     * @param pControl
     * @param pRuleOffset
     * @param pNode
     */
    addMatch(  pControl:ControlNode, pRuleOffset:number, pNode:any):void {

        if(this.matches[pControl.canonicalID]==null){
            this.matches[pControl.canonicalID] = {
                assessment: pControl,
                match: []
            };

            this.matches[pControl.canonicalID].match.push({
                node: pNode,
                ruleIdx: pRuleOffset
            });
        }

    }
    /**
     * To export the report to JSON file
     *
     * @param pPath
     */
    save( pPath:string){
        if(_fs_.existsSync(pPath)){
            _fs_.unlinkSync(pPath);
        }

        _fs_.writeFileSync(pPath, JSON.stringify(this.toJsonObject()));
    }

    /**
     *
     */
    toJsonObject():any {
        const o:any = {};
        let match:Match;

        for(let i in this){
            switch (i){
                case "primaryAssets":
                case "secondaryAssets":
                case "globalThreats":
                case "assets":
                    o[i] = [];
                    (this[i] as any).map(x => {
                        o[i].push((x as ConstraintMatch<any>).toJsonObject());
                    })
                    break;
                case "project":
                    o.project = {
                        uid: this.project.getUID(),
                        app: this.project.pkg,
                        platform: null,
                        device: null
                    };

                    if(this.project.platform!=null){
                        o.project.platform = {
                            api: this.project.getPlatform().getApiVersion(),
                            uid: this.project.getPlatform().getUID()
                        };
                    }

                    if(this.project.getDevice()!=null){
                        const dev = this.project.getDevice();
                        o.project.device = {
                            uid: dev.getUID(),
                            os: dev.getProfile().getSystemProfile().getOperatingSystem(),
                            arch: dev.getProfile().getSystemProfile().getArchitecture(),
                            abi: dev.getProfile().getSystemProfile().getABI(),
                            platform: {
                                api: dev.getPlatform().getApiVersion(),
                                uid: dev.getPlatform().getUID()
                            },
                        };
                    }
                    break;


                case "time":
                case "application":
                case "device":
                    o[i] = this[i];
                    break;
                case "matches":
                    o.matches = {};
                    for(let k in this.matches){
                        match = this.matches[k];
                        o.matches[k] = {
                            assess: match.assessment.canonicalID,
                            match: [] //
                        };

                        this.matches[k].match.map((x)=>{
                            o.matches[k].match.push({
                                ruleIdx: x.ruleIdx,
                                node: ( x.match!=null ? x.match.toJsonObject() : null)
                            });
                        })
                    }

                    break;
                case "model":
                    o.model = this.model.toJsonObject();
                    break;
            }
        }

        CoreDebug.checkJsonSerialize(o, "AssurandeReport");
        return o;
    }

    static fromJsonObject(pData:any):AssuranceReport {
        const a = new AssuranceReport(pData);

        return a;
    }
}