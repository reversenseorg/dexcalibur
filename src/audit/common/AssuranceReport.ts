import * as _fs_ from 'fs';
import Asset from "./Asset.js";
import Threat from "./Threat.js";
import {ConstraintMatch} from "./ConstraintMatch.js";
import CodeConstraint from "./CodeConstraint.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../../DexcaliburProject.js";
import AssuranceModel, {AssuranceModelUUID, ControlNode, ControlNodeCanonicalUID} from "./AssuranceModel.js";
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
    NodeType, NodeUtils,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import ModelMethod from "../../ModelMethod.js";
import {Nullable} from "../../core/IStringIndex.js";
import {AuditManagerException} from "../errors/AuditManagerException.js";
import {CryptoUtils} from "../../CryptoUtils.js";
import {randomUUID} from "crypto";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {DeviceUUID} from "../../Device.js";
import ModelStringValue from "../../ModelStringValue.js";
import {AssuranceScanner} from "./AssuranceScanner.js";
import {INodeRef} from "../../INode.js";
import {Metadata} from "./Metadata.js";

export interface MatchGroup {
    model: AssuranceModelUUID,
    cuid: string // canonical uuid
}

export interface MatchingNode {
    node: (INode|INodeRef);
    ruleIdx?:number;
    meta?:Metadata[];
}
export interface Match {
    assessment?: ControlNode;
    ruleIdx?: number;
    match: any; // MatchingNode[]; //any;
    g?:Nullable<MatchGroup>;
}


export interface AssuranceReportOptions {
    time?:number;
    /**
     * @since 1.3.10
     */
    started?:number;
    /**
     * @since 1.3.10
     */
    terminated?:number;

    application?:any;
    device?:DeviceUUID;

    _model?:Nullable<AssuranceModel>;
    model?:AssuranceModelUUID;

    project?:DexcaliburProjectUUID;
    _proj?:Nullable<DexcaliburProject>;

    primaryAssets?:ConstraintMatch<Asset>[];
    secondaryAssets?:ConstraintMatch<Asset>[];
    globalThreats?:ConstraintMatch<Threat>[];
    matches?:Record<string, Match>;
}

export type AssuranceReportUUID = string;

/**
 * Represent a scan report
 *
 * @class
 */
export default class AssuranceReport implements INode {

    static TYPE:NodeType = new NodeType("reports", NodeInternalType.ASSURANCE_REPORT,[]);
    __:NodeInternalType = NodeInternalType.ASSURANCE_REPORT;

    uid:Nullable<AssuranceReportUUID> = null;

    time:number;

    /**
     Start time
     * @since 1.3.10
     */
    started:number = -1;

    /**
     * Terminated / Aborted time
     * @since 1.3.10
     */
    terminated:number = -1;



    application:string;

    device:Nullable<DeviceUUID> = null;

    project:Nullable<DexcaliburProjectUUID> = null;
    private _proj:Nullable<DexcaliburProject> = null;

    _dirty = false;

    _model:Nullable<AssuranceModel> = null;

    model:AssuranceModelUUID;

    primaryAssets:ConstraintMatch<Asset>[] = [];
    secondaryAssets:ConstraintMatch<Asset>[] = [];
    globalThreats:ConstraintMatch<Threat>[] = [];
    assets:ConstraintMatch<Asset>[] = [];

    matches:Record<ControlNodeCanonicalUID, Match> = {};

    tags:TagUUID[] = [];


    constructor( pConfig:AssuranceReportOptions = {}) {
        if(pConfig!=null) for(const i in pConfig)
            this[i]=pConfig[i];
    }

    /**
     * To get
     */
    getUID(): AssuranceReportUUID | null {
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
        this.uid = CryptoUtils.sha256(this.project+":"+this.model+":"+this.time);
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
        if(this.project==null) {
            this.project = pProject.getUID();
        }
        this._proj = pProject;
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
    getModel():AssuranceModelUUID {
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
     * To serialize project properties
     *
     * @private
     */
    projectToJsonObject(pProject:DexcaliburProject):any {

        const project:any = {
            uid: pProject.getUID(),
            app: pProject.pkg,
            platform: null,
            device: null
        };

        if(pProject.getPlatform()!=null){
            project.platform = {
                api: pProject.getPlatform().getApiVersion(),
                uid: pProject.getPlatform().getUID()
            };
        }

        if(pProject.getDevice()!=null){
            const dev = pProject.getDevice();
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


    asPreview():any {
        const o:any = {};
        let match:Match;

        for(let i in this){
            if(this[i]==null){
                o[i] = null;
                continue;
            }

            switch (i){
                case "_proj":
                    if(this._proj!=null){
                        o.project = this.projectToJsonObject(this._proj);
                    }
                    break;
                case "project":
                    if(this._proj==null){
                        o.project = this.project;
                    }
                    break;
                case "uid":
                case "time":
                case "started":
                case "terminated":
                case "application":
                case "device":
                case "tags":
                case "model":
                    o[i] = this[i];
                    break;
            }
        }

        o.__matchesLen = Object.keys(this.matches).length;

        return o;
    }
    /**
     *
     */
    toJsonObject(pOptions?:SerializeOptions):any {
        const o:any = {};
        let match:Match;

        for(let i in this){
            if(this[i]==null){
                o[i] = null;
                continue;
            }

            switch (i){
                case "_proj":
                    if(this._proj!=null){
                        o.project = this.projectToJsonObject(this._proj);
                    }
                    break;
                case "project":
                    if(this._proj==null){
                        o.project = this.project;
                    }
                    /*if(this.project.toJsonObject==null){
                        o.project = (this.project as any)
                    }else{
                        o.project = this._projectToJsonObject();
                    }
                    break;*/
                    break;
                case "uid":
                case "time":
                case "started":
                case "terminated":
                case "application":
                case "device":
                case "tags":
                case "model":
                    o[i] = this[i];
                    break;
                case "matches":
                    o.matches = {};
                    for(let canonicalUID in this.matches){
                        match = this.matches[canonicalUID];

                        o.matches[canonicalUID] = {
                            //assessment: null,
                            match: [] //
                        };
                        /*
                        if(match==null){
                            o.matches[canonicalUID] = {
                                //assessment: null,
                                match: [] //
                            };
                        }else{
                            o.matches[canonicalUID] = {
                                //assessment: (typeof match.assessment==='string')? match.assessment : match.assessment.canonicalID,
                                match: [] //
                            };
                        }*/

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
                                        uid: (x.node.getUID!=null)? x.node.getUID() : x.node.uid,
                                        val: AssuranceReport._extractNodeValue(canonicalUID,x)
                                    };
                                    if(node.uid==null){
                                        throw new Error();
                                    }
                                }catch(err){
                                    switch(x.node.__){
                                        case NodeInternalType.STRING:
                                            node = {
                                                __: x.node.__,
                                                uid: (typeof x.node==='string')? x.node : x.node._uid,
                                                val: AssuranceReport._extractNodeValue(canonicalUID,x)
                                            };
                                            break;
                                        default:
                                            console.error("[ASSURANCE REPORT] toJsonObject > node UID error",x.node);
                                            break;
                                    }
                                }
                                


                                if(node!=null){
                                    o.matches[canonicalUID].match.push({
                                        ruleIdx: x.ruleIdx,
                                        node: node
                                    });
                                }

                            }

                        })
                    }
                    break;
            }
        }

        console.log(o);

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
        this.model = pModel.getUID();
        if(this._dirty){
            // restore matches
            for(let canonicalUID in this.matches){
                if(typeof this.matches[canonicalUID].assessment==='string'){
                    this.matches[canonicalUID].assessment = pModel.getControlNode(this.matches[canonicalUID].assessment as any);
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
                        result = this._proj.getSearchEngine().byID()[meth].apply(this._proj.getSearchEngine(),[vMatch.node.uid]);
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

    /**
     *
     * @param pMatches
     */
    static serializeMatch( pMatch:Match, pSerializeControlNode = false):any {
        const s:any = {
            match: []
        };

        if(pMatch.assessment!=null && pSerializeControlNode){
            s.assessment = pMatch.assessment.canonicalID;
        }

        pMatch.match.map((v:any)=>{
            s.match.push({
                node: {
                    // new format : node is as INodeRef object
                    __:  v.node.__,
                    _uid: NodeUtils.asNodeRef(v.node)._uid,
                    // 'uid' is deprecated
                    uid: (v.node.getUID!=null)? v.node.getUID() : v.node.uid,
                    // 'value' should be moved to Metadata
                    value: (v.node.getUID!=null)? AssuranceReport._extractNodeValue("",v) : null,
                },
                meta: v.meta,
                ruleIdx: v.ruleIdx //pMatch.ruleIdx
            })
        });

        return s;
    }

    static unserializeMatch( pMatch:any):Match {
        const s:any = {
            // assessment: (pModel!=null ? pModel.getControlNode(pMatch.assessment) : null),
            match: []
        };

        pMatch.match.map((v:any)=>{
            s.match.push({
                node: {
                    __:  v.node.__,
                    uid: (v.node.getUID!=null)? v.node.getUID() : v.node.uid
                },
                ruleIdx: pMatch.ruleIdx
            })
        });

        return s as Match;
    }

    /*
    static unserializeMatches( pMatches:Record<string, Match>, pModel:AssuranceModel|string, pContext:DexcaliburEngine):Match {

        if(pModel==null){
            throw AuditManagerException.MODEL_NOT_FOUND();
        }

        const model:AssuranceModel;
        // get model
        if(typeof pModel==='object'){
            model = pModel as AssuranceModel;
        }else{
            model = await pContext.getAuditManager().getModelByUID(
                pContext.getInternalAcc(),
                pModel as string
            );
        }

        const s:any = {
            assessment: (pModel!=null ? pModel.getControlNode(pMatch.assessment) : null),
            match: []
        };


        pMatch.match.map((v:any)=>{
            s.match.push({
                node: {
                    __:  v.node.__,
                    uid: (v.node.getUID!=null)? v.node.getUID() : v.node.uid
                },
                ruleIdx: pMatch.ruleIdx
            })
        });

        return s as Match;
    }*/
    static _extractNodeValue(pCanonicalUID: string, pMatch:any) {
        switch (pMatch.node.__){
            case NodeInternalType.STRING:
                return (pMatch.node as ModelStringValue).value;
            default:
                return null;
        }
    }
}
AssuranceReport.TYPE.builder(AssuranceReport);