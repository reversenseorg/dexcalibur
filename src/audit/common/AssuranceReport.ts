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

import Asset from "./Asset.js";
import Threat from "./Threat.js";
import {ConstraintMatch} from "./ConstraintMatch.js";
import CodeConstraint from "./CodeConstraint.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../../DexcaliburProject.js";
import AssuranceModel, {
    AssuranceModelUUID,
    ControlNode,
    ControlNodeCanonicalUID,
    ControlTree
} from "./AssuranceModel.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {MerlinSearchAPI} from "../../search/MerlinSearchAPI.js";

import {NodeInternalType, OperatingSystem} from "@reversense/dxc-core-api";
import {FinderResult} from "../../search/FinderResult.js";
import {
    DbDataType, DbKeyType,
    INode,
    NodeProperty,
    NodeType,
    NodeUtils,
    SerializeOptions,
    TagUUID,
    ValidationRule
} from "@reversense/dexcalibur-orm";
import {Nullable} from "../../core/IStringIndex.js";
import {AuditManagerException} from "../errors/AuditManagerException.js";
import {CryptoUtils} from "../../CryptoUtils.js";
import {Device, DeviceUUID} from "../../Device.js";
import ModelStringValue from "../../ModelStringValue.js";
import {INodeRef} from "../../INode.js";
import {Metadata} from "./Metadata.js";
import {ApplicationUnit} from "../../organization/ApplicationUnit.js";
import {Indicator} from "./Indicator.js";
import {ExportOptions} from "../ExplainedReport.js";
import ControlAssessment from "./ControlAssessment.js";
import Control from "./Control.js";
import {MatchOccurence} from "./Match.js";
import {RuntimeSessionUUID} from "../../runtime/RuntimeSession.js";

export interface ReportExportOptions {
    appendApp: boolean,
    appendDevice: boolean,
    appendPlatform: boolean,
    clean: boolean,
    embedKpis: boolean,
    groupSampleByNode: boolean,
    sampling: boolean,
    samplingSize: number
}

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
    match: MatchOccurence<any>[]; // MatchingNode[]; //any;
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

    // expl
    deviceInfo?:any;
    appInfo?:any;
    title?:string;
    description?:string;
    controls?:ControlNode[];
    meta?:Metadata[];
    indicators?: Indicator[];
    uid?:AssuranceReportUUID;
    tags?:TagUUID[];
}

export type AssuranceReportUUID = string;

/**
 * Represent a scan report
 *
 * @class
 */
export default class AssuranceReport implements INode {

    static TYPE:NodeType = new NodeType("reports", NodeInternalType.ASSURANCE_REPORT,[
        (new NodeProperty("uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY)
            .schema({ type: "string", format: "uuid" })
            .descr("Unique identifier of the assurance report"),
    ]);
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
    modelInfo:any = {};

    primaryAssets:ConstraintMatch<Asset>[] = [];
    secondaryAssets:ConstraintMatch<Asset>[] = [];
    globalThreats:ConstraintMatch<Threat>[] = [];
    assets:ConstraintMatch<Asset>[] = [];

    matches:ControlNodeCanonicalUID[] = [];

    private _rawMatches:Record<ControlNodeCanonicalUID, Match> = {};

    tags:TagUUID[] = [];

    // private _project: DexcaliburProject;
    private _device: Device;
    private _options: ExportOptions;


    // --- BEGIN OF EXPLAINED REPORT ---
    title: string;

    description = "";

    controls: ControlNode[] = [];

    metadata: Metadata[] = [];

    indicators: Indicator[] = [];

    sessions: RuntimeSessionUUID[] = [];

    // --- END OF EXPLAINED REPORT ---
    private deviceInfo: Nullable<{ uid: string; os: OperatingSystem; emulated: boolean; arch: string }> = null;
    private appInfo: Nullable<{ package: string; os: OperatingSystem; version:string }>=null;




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

    getContext(): Nullable<DexcaliburProject> {
        return this._proj;
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
        if(this._rawMatches[pControl.canonicalID]==null) {

            this._rawMatches[pControl.canonicalID] = {
                assessment: pControl,
                match: []
            };
        }

        this._rawMatches[pControl.canonicalID].match.push({
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

        // TODO : replace by device linked to the RuntimeSessions mapped to this scan
        // this.runtimeSessions.map(x=>{})
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
                case "indicators":
                case "metadata":
                case "device":
                case "tags":
                case "model":
                case "sessions":
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
        const excl = (pOptions!=null && pOptions.exclude!=null)? pOptions.exclude as string[] : [];

        for(let i in this){

            if(excl.indexOf(i)!=-1){
                continue;
            }
            if(this[i]==null){
                o[i] = null;
                continue;
            }

            switch (i){
                case "_model":
                case "_proj":
                    break;
                case "project":
                    if((this.project!=null) && (typeof this.project==='string')){
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
                    // context :
                case "appInfo":
                case "deviceInfo":
                case "title":
                case "description":
                case "metadata":
                case "indicators":
                case "matches":
                    o[i] = this[i];
                    break;
                case "_rawMatches":
                    o._rawMatches = {};
                    /*
                    for(let canonicalUID in this._rawMatches){
                        match = this._rawMatches[canonicalUID];

                        o._rawMatches[canonicalUID] = {
                            match: [] //
                        };

                        this._rawMatches[canonicalUID].match.map((x)=>{

                            if(x.node==null){
                                o._rawMatches[canonicalUID].match.push({
                                    ruleIdx: x.ruleIdx,
                                    node: null
                                });
                            }else{

                                let node:any;

                                try{
                                    node = {
                                        __: x.node.__,
                                        uid: (x.node.getUID!=null)? x.node.getUID() : (x.node.uid!=null ? x.node.uid : x.node._uid)
                                    };
                                    if(node.uid==null){
                                        throw new Error();
                                    }
                                }catch(err){
                                    console.log(err);
                                    switch(x.node.__){
                                        case NodeInternalType.STRING:
                                            node = {
                                                __: x.node.__,
                                                uid: (typeof x.node==='string')? x.node : x.node._uid,
                                                val: "" //AssuranceReport._extractNodeValue(canonicalUID,x)
                                            };
                                            break;
                                        default:
                                            console.error("[ASSURANCE REPORT] toJsonObject > node UID error",x.node);
                                            break;
                                    }
                                }



                                if(node!=null){
                                    o._rawMatches[canonicalUID].match.push({
                                        ruleIdx: x.ruleIdx,
                                        node: node,
                                        meta: x.meta
                                    });
                                }

                            }

                        })
                    }*/
                    break;
                case "controls":
                    o.controls = [];
                    this.controls.map(x => o.controls.push(AssuranceReport.controlTreeToJsonObject(x)));
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

    /**
     *
     */
    cleanReferences():void{
        if(!this._dirty) return;

        //let merlin = new MerlinSearchAPI(this.project.getSearchEngine().getDatabase());

        /*
        let meth:string;
        let result:FinderResult;
        for(let canonicalUID in this.controls){


            this.controls[canonicalUID].match.map(vMatch => {
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
        }*/
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
    static serializeMatch( pMatch:any, pSerializeControlNode = false):any {
        const s:any = {
            match: []
        };

        if(pMatch.assessment!=null && pSerializeControlNode){
            s.assessment = pMatch.assessment.canonicalID;
        }

        if(pMatch.matches==null){
            return s;
        }

        pMatch.matches.map((v:any)=>{
            s.match.push({
                node: {
                    // new format : node is as INodeRef object
                    __:  v.node.__,
                    _uid: (v.node.getUID!=null ? NodeUtils.asNodeRef(v.node)._uid : v.node._uid),
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

    static _extractNodeValue(pCanonicalUID: string, pMatch:any) {
        switch (pMatch.node.__){
            case NodeInternalType.STRING:
                return (pMatch.node as ModelStringValue).value;
            default:
                return null;
        }
    }


    /**
     * To sample match occurences to avoid to produce huge report
     * The most interesting finding are:
     * - findings linked to control point from extra report
     * - have the highest entropy result set (from node signatures) to keep useful data
     *
     * @param pMatches
     * @param pOptions
     * @private
     */
    private _doSampling(pMatches: MatchOccurence<any>[], pOptions: any): MatchOccurence<any>[] {

        let out: MatchOccurence<any>[] = [];
        let inp: MatchOccurence<any>[] = pMatches;


        // sort to keep occurance with metadata at begin of list
        inp = inp.sort((a,b)=>{
            return  b.meta.length - a.meta.length ;
        });

        if (pOptions.grpNode) {
            const groups: Record<number, MatchOccurence<any>[]> = {};

            inp.map(m => {
                if (groups[m.node.__] == null) {
                    groups[m.node.__] = [];
                }
                if (groups[m.node.__].length < pOptions.grpSize) {
                    groups[m.node.__].push(m);
                }
            });

            if(pOptions.grpSize>-1){


                for(let n in groups){
                    /*groups[n] = groups[n].sort((a, b) => {
                        return  b.meta.length - a.meta.length ;
                    });*/
                    groups[n] = groups[n].slice(0, pOptions.grpSize);
                }
            }

            Object.values(groups).map(x => {
                out = out.concat(x)
            });

            // console.log("EXPLAIN :  SAMPLED (WITH GRP) : ", out.length);
        } else {

            inp = inp.sort((a, b) => {
                return b.meta.length - a.meta.length ;
            });
            out = inp.slice(0, pOptions.grpSize);
            // console.log("EXPLAIN :  SAMPLED (NO GRP): ", out.length);
        }
        return out;
    }

    setModel(pModel: AssuranceModel): void {
        this._model = pModel;

        this.model = pModel.getUID();

        if(this._dirty){
            // restore matches
            /*for(let canonicalUID in this.matches){
                if(typeof this.matches[canonicalUID].assessment==='string'){
                    this.matches[canonicalUID].assessment = pModel.getControlNode(this.matches[canonicalUID].assessment as any);
                }
            }*/
        }

        // explained report =>
        this.title = pModel.name;
        this.description = pModel.description;
        this.modelInfo = {
            uid: pModel.getID(),
            version: pModel.getVersion(),
            official: pModel.generic,
            authors: pModel.getAuthor(),
            release: pModel.getRelease(),
            links: pModel.getLinks()
        };
    }

    setAppUnit(pApp: ApplicationUnit): void {
        this.application = pApp.getUID();
        this.appInfo = {
            package: pApp.packageID,
            os: pApp.os,
            version: "?"
        }
    }

    setProject(pProject: DexcaliburProject): void {

        if(this.project==null) {
            this.project = pProject.getUID();
        }

        this._proj = pProject;

        if (this.appInfo != null) {
            (this.appInfo as any).version = pProject.meta['version'];
        }
    }


    setDevice(pDevice: Device): void {
        this._device = pDevice;

        this.deviceInfo = {
            uid: pDevice.getUID(),
            os: pDevice.os,
            emulated: pDevice.isEmulated,
            arch: pDevice.model
        };
    }

    // ------------ EXPLAIN REPORT -------------------

    private _transformMatches(pMatches: any[]): any[] {

        return pMatches.map((x: Match) => {
            // @ts-ignore
            x.node.__ = NodeInternalTypeName[x.node.__] as any;
            return x;
        });
    }

    private _cleanControl(pControl: ControlAssessment | Control): any {
        let o:any;
        if( pControl.__ === NodeInternalType.CONTROL){
            o = {
                __: pControl.__,
                metadata: pControl.metadata,
                name: pControl.name,
                id: pControl.id,
                matches: pControl.matches
            };
        }else{
            o = {
                __: pControl.__,
                metadata: pControl.metadata,
                name: pControl.name,
                id: pControl.id,
                analType: (pControl as ControlAssessment).analType,
                testType: (pControl as ControlAssessment).testType,
                matches: pControl.matches
            };
        }

        if(pControl.description!="") o.description = pControl.description;

        return o;
    }

    private _buildControlResults2(pOptions: any): void {

        let tree: ControlTree = {};

        Object.keys(this._rawMatches).sort((a: string, b: string) => {
            return (a.localeCompare(b) > 0 ? 1 : -1);
        }).map(canonUID => {
            let uidParts = canonUID.split('.');
            let uid: string = "";
            let node: ControlNode;
            let root = tree;
            let o = canonUID.lastIndexOf('.');
            let s = -1;
            let e: ControlNode;
            let part: string;
            let relCUID = "";

            if (uidParts[0] == "*") uidParts.shift();

            for (let i = 0; i < uidParts.length + (canonUID.indexOf(':') > o ? 1 : 0); i++) {
                part = uidParts[(i < uidParts.length ? i : uidParts.length - 1)];

                s = part.indexOf(':');

                if (i == uidParts.length) {
                    relCUID = uid = canonUID;
                } else {
                    if (s > -1) {
                        part = part.slice(0, s);
                    }
                    uid += (i > 0 ? "." : "") + part;
                    relCUID = "*."+ uid;
                }

                if (root[part] == null) {
                    node = root[part] = {
                        //parent: (i>0 ? tree[p[i-1]] : undefined),
                        ctrl: (pOptions.clean === true ? this._cleanControl(this._model.searchControlByCID(uid)) : this._model.searchControlByCID(uid)),
                        canonicalID: relCUID,
                        children: {}
                    };

                    if (i > 0) {
                        e = (i < uidParts.length ? root[uidParts[i - 1]] : root[uidParts[i - 2]]);
                        if (e != null) {
                            if (e.children == null) {
                                e.children = {};
                            }
                            e.children[part] = node;
                        }
                    }
                } else {
                    node = root[part];
                }

                if (this._rawMatches[relCUID] != null) {
                    if (this._options.sampling == true) {
                        (node.ctrl as any).matches = this._doSampling(
                            this._rawMatches[relCUID].match,
                            {
                                grpSize: this._options.samplingSize,
                                grpNode: this._options.groupSampleByNode
                            }
                        );
                    } else {
                        node.ctrl.matches = this._rawMatches[relCUID].match;
                    }
                }

                if (node.children != null) {
                    root = node.children;
                }
            }
        });

        // set structured matches
        this.controls = Object.values(tree);
        this.matches = Object.keys(this._rawMatches);
    }

    /**
     * To build final report by merging ControlTree from the model with the list of
     * @param pOptions
     */
    build( pOptions: Nullable<ExportOptions> = null): AssuranceReport {

        this._options = pOptions;
        console.log("BUILD CONTROL RESULTS > ");
        this._buildControlResults2(pOptions);
        console.log(`BUILT REPORT :
\t Project : ${this._proj.getUID()}
\t DB : ${this._proj.getProjectDB().name}
\t Report : ${this.getUID()}`);
        return this;
    }


    static controlTreeToJsonObject(pRoot:ControlNode):any {
        const o:any = {
            canonicalID: pRoot.canonicalID,
            parent: (pRoot.parent!=null ? pRoot.parent.canonicalID : null),
            ctrl: (pRoot.ctrl!=null ? ((pRoot.ctrl as Control).toJsonObject !=null ? (pRoot.ctrl as Control).toJsonObject() : pRoot.ctrl)  : null),
            children: {}
        };
        let matches:MatchOccurence<any>[] = [];

        if((pRoot.ctrl as ControlAssessment).matches!=null){
            (pRoot.ctrl as ControlAssessment).matches.map((vMatch:any) => {
                matches.push({
                    node: {
                        // new format : node is as INodeRef object
                        __:  vMatch.node.__,
                        _uid: (vMatch.node.getUID != null ? NodeUtils.asNodeRef(vMatch.node)._uid : vMatch.node._uid)
                    },
                    meta: vMatch.meta,
                    ruleIdx: vMatch.ruleIdx //pMatch.ruleIdx
                });
            });
            o.ctrl.matches = matches;
        }

        let i=0;
        if(pRoot.children != null){
            for(let k in pRoot.children){
                o.children[k] = AssuranceReport.controlTreeToJsonObject(pRoot.children[k]);
                i++;
            }
        }
        if(i===0) delete o.children;
        if(o.parent===null) delete o.parent;


        return o;
    }

    searchControlNode(pCanonicalUID:ControlNodeCanonicalUID):Nullable<ControlNode> {

        const l = pCanonicalUID.lastIndexOf(':');

        const parts = pCanonicalUID.split(".");
        const pt = (parts[parts.length-1].indexOf(":")>-1)? parts[parts.length-1].split(":"):[parts[parts.length-1]];

        parts[parts.length-1] = pt[0];

        //const parts = (l>-1 ? pCanonicalUID.substring(0,l):pCanonicalUID).split('.');
        let root:ControlNode[] = this.controls;
        let node:Nullable<ControlNode> = null;
        let start = (parts[0]=="*"?"*.":"");

        if(parts[0]=="*") parts.shift();

        for(let i=0; i<parts.length; i++){
            node = root.find(x => ( x.canonicalID === start+parts[i]));
            if(node != null && Object.keys(node.children).length>0){
                start += parts[i]+".";
                root = Object.values(node.children);
            }
        }

        if(root.length>0 && pt.length>1 && pCanonicalUID.lastIndexOf(':',l)>-1){
            // canonicalUID point to control assessment
            node = root.find(x => (x.canonicalID === pCanonicalUID));
        }

        return node;
    }

    OLD_searchControlNode(pCanonicalUID:ControlNodeCanonicalUID):Nullable<ControlNode> {

        const l = pCanonicalUID.lastIndexOf(':');

        const parts = (l>-1 ? pCanonicalUID.substring(0,l):pCanonicalUID).split('.');
        let root:ControlNode[] = this.controls;
        let node:Nullable<ControlNode> = null;
        let start = (parts[0]=="*"?"*.":"");

        if(parts[0]=="*") parts.shift();

        for(let i=0; i<parts.length; i++){
            node = root.find(x => ( x.canonicalID === start+parts[i]));
            if(node != null && Object.keys(node.children).length>0){
                start += parts[i]+".";
                root = Object.values(node.children);
            }
        }

        if(root.length>0 && l>-1 && pCanonicalUID.lastIndexOf(':',l)>-1){
            // canonicalUID point to control assessment
            node = root.find(x => (x.canonicalID === pCanonicalUID));
        }

        return node;
    }

    getRawMatchUIDs():ControlNodeCanonicalUID[] {
        return Object.keys(this._rawMatches);
    }

    getRawMatch(pUID:ControlNodeCanonicalUID):Nullable<Match> {
        return this._rawMatches[pUID];
    }

    setRawMatchOccurences(pUID:ControlNodeCanonicalUID, pOcc:MatchOccurence<any>[]):void {
        this._rawMatches[pUID].match = pOcc;
    }

    removeRawMatch(pUID:ControlNodeCanonicalUID):void {

        let n:Record<string, Match> = {};
        for(let u in this._rawMatches) {
            if(u!==pUID){
                n[u] = this._rawMatches[u];
            }
        }
        this._rawMatches = n;
    }

    static controlTreeFromJsonObject(pRoot:any):any {
        const o:any = {
            canonicalID: pRoot.canonicalID,
            parent: (pRoot.parent!=null ? pRoot.parent.canonicalID : null),
            ctrl:null,
            children: {}
        };



        if((pRoot.ctrl as any).analType!==undefined){
            o.ctrl = new ControlAssessment(pRoot.ctrl as any);
        }else{
            o.ctrl = new Control(pRoot.ctrl as any);
        }

        if((pRoot.ctrl as ControlAssessment).matches!=null){
            o.ctrl.matches = [];
            (pRoot.ctrl as ControlAssessment).matches.map((vMatch:any) => {
                o.ctrl.matches.push({
                    node: {
                        // new format : node is as INodeRef object
                        __:  vMatch.node.__,
                        _uid:  vMatch.node._uid,
                        // 'uid' is deprecated
                        uid: vMatch.node._uid,
                        // 'value' should be moved to Metadata
                        value: vMatch.node.value,
                    },
                    meta: vMatch.meta,
                    ruleIdx: vMatch.ruleIdx //pMatch.ruleIdx
                });
            })
        }

        if(pRoot.children != null){
            for(let k in pRoot.children){
                o.children[k] = AssuranceReport.controlTreeFromJsonObject(pRoot.children[k]);
            }
        }
        return o;
    }


    /**
     * Add indicator
     *
     * @param pKPI
     */
    addIndicator( pKPI:Indicator):void {
        for(let i=0; i<this.indicators.length; ++i){
            if(this.indicators[i].getUID()===pKPI.getUID()){
                // exists
                this.indicators[i] = pKPI;
                return;
            }
        }

        this.indicators.push(pKPI);
        return;
    }

    removeIndicator( pKPI:Indicator):void {
        this.indicators = this.indicators.filter(x => (x.getUID()!==pKPI.getUID()));
    }

    getRawMatches():Record<string, Match> {
        return this._rawMatches;
    }

    hasIndicator(pUID: string) {
        return (this.indicators.find( i => (i.getUID()===pUID))!=null);
    }

    getIndicator(pUID: string):Indicator {
        const kpi = this.indicators.find( i => (i.getUID()===pUID));

        if(kpi==null){
            throw AuditManagerException.KPI_NOT_FOUND(this.uid, this.model,pUID);
        }

        return kpi;
    }

    exportJson(pOptions:ReportExportOptions):any {

        let opts:any = {exclude:[]};
        if(pOptions.appendApp===false) opts.exclude.push("appInfo");
        if(pOptions.appendDevice===false) opts.exclude.push("deviceInfo");
        //if(pOptions.appendPlatform===false) opts.exclude.push("project");

        return this.toJsonObject(opts);
    }
}
AssuranceReport.TYPE.builder(AssuranceReport);