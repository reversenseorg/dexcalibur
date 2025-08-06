import * as _fs_ from 'fs';
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

import {NodeInternalType, OperatingSystem} from "@dexcalibur/dxc-core-api";
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
import {Device, DeviceUUID} from "../../Device.js";
import ModelStringValue from "../../ModelStringValue.js";
import {AssuranceScanner} from "./AssuranceScanner.js";
import {INodeRef} from "../../INode.js";
import {Metadata} from "./Metadata.js";
import {ApplicationUnit} from "../../organization/ApplicationUnit.js";
import {Indicator} from "./Indicator.js";
import {ExportOptions} from "../ExplainedReport.js";
import ControlAssessment from "./ControlAssessment.js";
import Control from "./Control.js";
import {IControl} from "./IControl.js";

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

    // expl
    deviceInfo?:any;
    appInfo?:any;
    title?:string;
    description?:string;
    controls?:ControlNode[];
    meta?:Metadata[];
    indicators?: Indicator[];
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
    modelInfo:any = {};

    primaryAssets:ConstraintMatch<Asset>[] = [];
    secondaryAssets:ConstraintMatch<Asset>[] = [];
    globalThreats:ConstraintMatch<Threat>[] = [];
    assets:ConstraintMatch<Asset>[] = [];

    matches:Record<ControlNodeCanonicalUID, Match> = {};

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
                case "_model":
                case "_proj":
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
                    // context :
                case "appInfo":
                case "deviceInfo":
                case "title":
                case "description":
                case "metadata":
                case "indicators":
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
                                        uid: (x.node.getUID!=null)? x.node.getUID() : (x.node.uid!=null ? x.node.uid : x.node._uid),
                                        val: "" //AssuranceReport._extractNodeValue(canonicalUID,x)
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
                                    o.matches[canonicalUID].match.push({
                                        ruleIdx: x.ruleIdx,
                                        node: node,
                                        meta: x.meta
                                    });
                                }

                            }

                        })
                    }
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



    private _doSampling(pMatches: any[], pOptions: any): any {

        let out: any[] = [];

        if (pOptions.grpNode) {
            const groups: any = {};

            pMatches.map(m => {
                if (groups[m.node.__] == null) {
                    groups[m.node.__] = [];
                }
                if (groups[m.node.__].length < pOptions.grpSize) {
                    groups[m.node.__].push(m);
                }
            });


            console.log("EXPLAIN :  SAMPLED (WITH GRP) : ", out);
            Object.values(groups).map(x => {
                out = out.concat(x)
            });
        } else {

            console.log("EXPLAIN :  SAMPLED (NO GRP): ", out);
            out = pMatches.slice(0, pOptions.grpSize);
        }
        return out;
    }

    setModel(pModel: AssuranceModel): void {
        this._model = pModel;

        this.model = pModel.getUID();

        if(this._dirty){
            // restore matches
            for(let canonicalUID in this.matches){
                if(typeof this.matches[canonicalUID].assessment==='string'){
                    this.matches[canonicalUID].assessment = pModel.getControlNode(this.matches[canonicalUID].assessment as any);
                }
            }
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
        let out: any = {
            metadata: pControl.metadata,
            name: pControl.name,
            id: pControl.id,
            links: (pControl as any).links
        };

        // removed : assessments

        ['tags', 'children'].map(x => {
            if ((pControl as any)[x] != null
                && Array.isArray((pControl as any)[x])
                && (pControl as any)[x].length > 0) {
                out[x] = (pControl as any)[x];
            }
        });

        ['verified', 'country', 'addDate', 'category'].map(x => {
            if ((pControl as any)[x] != null) {
                out[x] = (pControl as any)[x];
            }
        });


        return out;
    }

    private _buildControlResults(pOptions: any): void {

        let ctrl: IControl;
        let r: Record<string, any> = {};
        let tree: ControlTree = {};


        for (let canonicalUID in this.matches) {
            ctrl = this._model.searchControlByCID(canonicalUID);
            if (ctrl != null) {
                (ctrl as ControlAssessment).matches = this.matches[canonicalUID].match;
            }

            r[canonicalUID] = {
                control: ctrl,
                match: this.matches[canonicalUID]
            };
        }

        console.log("_buildControlResults", r);

        Object.keys(r).sort((a: string, b: string) => {
            return (a.localeCompare(b) > 0 ? 1 : -1);
        }).map(x => {
            let p = x.split('.');
            let uid: string = "";
            let node: ControlNode;
            let root = tree;

            if (p[0] == "*") p.shift();

            let o = x.lastIndexOf('.');
            let s = -1;
            let e: ControlNode;
            let part: string;


            for (let i = 0; i < p.length + (x.indexOf(':') > o ? 1 : 0); i++) {
                part = p[(i < p.length ? i : p.length - 1)];
                s = part.indexOf(':');

                if (i == p.length) {
                    uid = x;
                } else {
                    if (s > -1) {
                        part = part.slice(0, s);
                    }
                    uid += (i > 0 ? "." : "") + part;
                }

                if (root[part] == null) {
                    node = root[part] = {
                        //parent: (i>0 ? tree[p[i-1]] : undefined),
                        ctrl: (pOptions.clean === true ? this._cleanControl(this._model.searchControlByCID(uid)) : this._model.searchControlByCID(uid)),
                        canonicalID: uid,
                        children: {}
                    };


                    if (i > 0) {
                        e = (i < p.length ? root[p[i - 1]] : root[p[i - 2]]);
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

                if (r["*." + uid] != null) {
                    if (this._options.sampling == true) {
                        node.matches = this._doSampling(
                            r["*." + uid].match.match,
                            {
                                grpSize: this._options.samplingSize,
                                grpNode: this._options.groupSampleByNode
                            }
                        );
                    } else {
                        node.matches = r["*." + uid].match.match;
                    }
                    node.matches = this._transformMatches(node.matches);
                }

                if (node.children != null) {
                    root = node.children;
                }
            }
        });

        this.controls = Object.values(tree);
    }

    /**
     * To build final report by merging ControlTree from the model with the list of
     * @param pOptions
     */
    build( pOptions: Nullable<ExportOptions> = null): AssuranceReport {

        this._options = pOptions;
        console.log("BUILD CONTROL RESULTS > ");
        this._buildControlResults(pOptions);
        this._buildKpis();
        console.log("BUILT REPORT > ", this);
        return this;
    }

    private _buildKpis(): void {

    }


    static controlTreeToJsonObject(pRoot:ControlNode):any {
        const o:any = {
            canonicalID: pRoot.canonicalID,
            parent: (pRoot.parent!=null ? pRoot.parent.canonicalID : null),
            ctrl: (pRoot.ctrl!=null ? ((pRoot.ctrl as Control).toJsonObject !=null ? (pRoot.ctrl as Control).toJsonObject() : pRoot.ctrl)  : null),
            children: {}
        };

        if((pRoot.ctrl as ControlAssessment).matches!=null){
            o.ctrl.matches = [];
            (pRoot.ctrl as ControlAssessment).matches.map((vMatch:any) => {
                o.ctrl.matches.push({
                    node: {
                        // new format : node is as INodeRef object
                        __:  vMatch.node.__,
                        _uid: NodeUtils.asNodeRef(vMatch.node)._uid,
                        // 'uid' is deprecated
                        uid: (vMatch.node.getUID!=null)? vMatch.node.getUID() : vMatch.node.uid,
                        // 'value' should be moved to Metadata
                        value: (vMatch.node.getUID!=null)? AssuranceReport._extractNodeValue("",vMatch) : null,
                    },
                    meta: vMatch.meta,
                    ruleIdx: vMatch.ruleIdx //pMatch.ruleIdx
                });
            })
        }
        if(pRoot.children != null){
            for(let k in pRoot.children){
                o.children[k] = AssuranceReport.controlTreeToJsonObject(pRoot.children[k]);
            }
        }
        return o;
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

    withoutMatches():AssuranceReport {
        const r = new AssuranceReport(this as any);
        r.matches = {};
        return r;
    }
}
AssuranceReport.TYPE.builder(AssuranceReport);