import * as _fs_ from 'fs';
import Asset from "./Asset.js";
import Threat from "./Threat.js";
import {ConstraintMatch} from "./ConstraintMatch.js";
import CodeConstraint from "./CodeConstraint.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import AssuranceModel, {ControlNode} from "./AssuranceModel.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {MerlinSearchAPI} from "../../search/MerlinSearchAPI.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {FinderResult} from "../../search/FinderResult.js";
import {
    DbDataType,
    DbKeyType,
    DbSerialize,
    INode,
    NodeProperty,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import ModelMethod from "../../ModelMethod.js";
import {Nullable} from "../../core/IStringIndex.js";
import {AuditManagerException} from "../errors/AuditManagerException.js";
import {CryptoUtils} from "../../CryptoUtils.js";


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
export default class AssuranceReport implements INode {

    static TYPE:NodeType = new NodeType("reports", NodeInternalType.ASSURANCE_REPORT,[]);
    __:NodeInternalType = NodeInternalType.ASSURANCE_REPORT;

    uid:Nullable<string> = null;

    time:number;

    application:string;

    device:string;

    project:DexcaliburProject;

    _dirty = false;

    model:AssuranceModel;

    primaryAssets:ConstraintMatch<Asset>[] = [];
    secondaryAssets:ConstraintMatch<Asset>[] = [];
    globalThreats:ConstraintMatch<Threat>[] = [];


    assets:ConstraintMatch<Asset>[] = [];
    matches:MatchesMap = {};

    tags:TagUUID[] = [];


    constructor( pConfig:AssuranceReportOptions = {}) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    /**
     * To get
     */
    getUID(): string | null {
        return this.uid;
    }

    /**
     * To generate report UID
     *
     * @method
     */
    generateUID(){
        if(this.project==null){
            throw AuditManagerException.REPORT_UID_CANNOT_BE_GENERATED("project is missing");
        }
        if(this.model==null){
            throw AuditManagerException.REPORT_UID_CANNOT_BE_GENERATED("assurance model is missing");
        }
        this.uid = CryptoUtils.sha256(this.project.getUID()+":"+this.model.getUID()+":"+this.time);
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

    setProject(pProject:DexcaliburProject):void {
        this.project = pProject;

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
        //console.log('> addMatch : ',pControl.canonicalID, pRuleOffset, pNode);
        if(this.matches[pControl.canonicalID]==null) {

            this.matches[pControl.canonicalID] = {
                assessment: pControl,
                match: []
            };
        }

        this.matches[pControl.canonicalID].match.push({
            node: pNode,
            ruleIdx: pRuleOffset
        });
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
     * To serialize project properties
     *
     * @private
     */
    private _projectToJsonObject():any {

        const project:any = {
            uid: this.project.getUID(),
            app: this.project.pkg,
            platform: null,
            device: null
        };

        if(this.project.getPlatform()!=null){
            project.platform = {
                api: this.project.getPlatform().getApiVersion(),
                uid: this.project.getPlatform().getUID()
            };
        }

        if(this.project.getDevice()!=null){
            const dev = this.project.getDevice();
            project.device = {
                uid: dev.getUID(),
                os: null,
                arch: null,
                abi: null,
                platform: null
            };

            if(dev.getProfile()!=null){
                if(dev.getProfile().getSystemProfile()){
                    const prof = dev.getProfile().getSystemProfile();
                    project.device.os = prof.getOperatingSystem();
                    project.device.arch = prof.getArchitecture();
                    project.device.abi = prof.getABI();
                }
            }
            if(dev.getPlatform()!=null){
                project.device.platform = {
                    api: dev.getPlatform().getApiVersion(),
                    uid: dev.getPlatform().getUID()
                };
            }
        }

        return project;
    }
    /**
     *
     */
    toJsonObject(pOptions?:SerializeOptions):any {
        const o:any = {};
        let match:Match;

        for(let i in this){
            switch (i){
                /*case "primaryAssets":
                case "secondaryAssets":
                case "globalThreats":
                case "assets":
                    o[i] = [];
                    (this[i] as any).map(x => {
                        o[i].push((x as ConstraintMatch<any>).toJsonObject());
                    })
                    break;*/
                case "project":

                    if(this.project.toJsonObject==null){
                        o.project = (this.project as any)
                    }else{
                        o.project = this._projectToJsonObject();
                    }


                    break;


                case "time":
                case "application":
                case "device":
                    o[i] = this[i];
                    break;
                case "matches":
                    o.matches = {};
                    for(let canonicalUID in this.matches){
                        match = this.matches[canonicalUID];

                        if(match==null){
                            o.matches[canonicalUID] = {
                                assessment: null,
                                match: [] //
                            };
                        }else{
                            o.matches[canonicalUID] = {
                                assessment: (typeof match.assessment==='string')? match.assessment : match.assessment.canonicalID,
                                match: [] //
                            };
                        }

                        this.matches[canonicalUID].match.map((x)=>{

                            if(x.node==null){
                                o.matches[canonicalUID].match.push({
                                    ruleIdx: x.ruleIdx,
                                    node: null
                                });
                            }else{

                                let node:any;

                                try{
                                    node = {
                                        __: x.node.__,
                                        uid: (x.node.getUID!=null)? x.node.getUID() : x.node.uid
                                    };
                                    if(node.uid==null){
                                        throw new Error();
                                    }
                                }catch(err){
                                    switch(x.node.__){
                                        case NodeInternalType.STRING:
                                            console.log(x.node);
                                            node = {
                                                __: x.node.__,
                                                uid: (typeof x.node==='string')? x.node : x.node._uid
                                            };
                                            break;
                                        default:
                                            console.error("[ASSURANCE REPORT] toJsonObject > node UID error",x.node);
                                            break;
                                    }
                                }
                                


                                o.matches[canonicalUID].match.push({
                                    ruleIdx: x.ruleIdx,
                                    node: node
                                });
                            }

                        })
                    }

                    break;
                case "model":
                    if(typeof this.model!=='string'){
                        o.model = this.model.getID(); //toJsonObject();
                    }else{
                        o.model = this.model;
                    }
                    break;
            }
        }

        CoreDebug.checkJsonSerialize(o, "AssuranceReport");
        return o;
    }

    dirty():void {
        this._dirty = true;
    }

    isDirty():boolean {
        return this._dirty;
    }

    setModel(pModel:AssuranceModel){
        this.model = pModel;
        if(this._dirty){
            // restore matches
            for(let canonicalUID in this.matches){
                if(typeof this.matches[canonicalUID].assessment==='string'){
                    this.matches[canonicalUID].assessment = this.model.getControlNode(this.matches[canonicalUID].assessment as any);
                }
            }
        }
    }

    /**
     *
     */
    cleanReferences():void{
        if(!this._dirty) return;

        //let merlin = new MerlinSearchAPI(this.project.getSearchEngine().getDatabase());
        let meth:string;
        let result:FinderResult;
        for(let canonicalUID in this.matches){
            this.matches[canonicalUID].match.map(vMatch => {
                if(vMatch.node != null && vMatch.node.uid != null){

                    try{
                        meth = MerlinSearchAPI.getMethodFromNodeType(vMatch.node.__);
                        result = this.project.getSearchEngine().byID()[meth].apply(this.project.getSearchEngine(),[vMatch.node.uid]);
                        if(result.count()>0){
                            vMatch.node = result.get(0);
                        }

                    }catch(err){

                    }

                }
            });
        }
        this._dirty = false;
    }

    static fromJsonObject(pData:any):AssuranceReport {
        const a = new AssuranceReport(pData);
        a.dirty();

        return a;
    }
}
AssuranceReport.TYPE.builder(AssuranceReport);