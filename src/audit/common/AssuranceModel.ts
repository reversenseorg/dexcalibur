import Asset from "./Asset.js";
import Threat from "./Threat.js";
import CodeThreat from "./CodeThreat.js";
import CodeConstraint from "./CodeConstraint.js";
import Control from "./Control.js";
import {Metadata, MetadataType} from "./Metadata.js";
import {Auditable} from "../../Auditable.js";
import {AuditAccessControl} from "../../user/acl/rbac/AuditAccessControl.js";
import ControlAssessment, {AnalysisType, DataOperation, MetadataTopic} from "./ControlAssessment.js";
import {IControl} from "./IControl.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {Nullable} from "../../core/IStringIndex.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType,
    ValidationRule
} from "@dexcalibur/dexcalibur-orm";
import {AccessAttribute, AccessAttributeMap} from "../../user/acl/AccessAttribute.js";
import {Indicator, IndicatorUUID} from "./Indicator.js";
import {AuditManagerException} from "../errors/AuditManagerException.js";
import {CycloneDX} from "../../bom/CycloneDX.js";
import DataFlow = CycloneDX.DataFlow;
import AssuranceReport from "./AssuranceReport.js";
import {ExplainedReport, ExportOptions} from "../ExplainedReport.js";
import DexcaliburProject from "../../DexcaliburProject.js";

export type AssuranceModelUUID = string;
export enum AssuranceModelType {
    SECURITY="sec",
    PRIVACY="pri",
    ECOLOGY="eco",
    QUALITY="qua",
}

export const CANONICALIZED_ROOT = "*";
export const CANONICAL_ID_SEPARATOR = ".";

export type ControlNodeCanonicalUID = string;

export interface  ControlNode {
    parent?:ControlNode;
    ctrl?: IControl; //Control | ControlAssessment;
    canonicalID: ControlNodeCanonicalUID;
    children?:ControlTree;
    [extra:string]:any;
}
export interface ControlTree {
    [canonicalUID:ControlNodeCanonicalUID]: ControlNode;
}





export default class AssuranceModel extends Auditable implements INode {

    __ = NodeInternalType.ASSURANCE_MODEL;

    static TYPE:NodeType = (new NodeType( "assurance_model", NodeInternalType.ASSURANCE_MODEL, [
        (new NodeProperty("_uid")).type(DbDataType.STRING)
            .key(DbKeyType.PRIMARY)
            .rule(ValidationRule.newRegexpAssert(/^[a-zA-Z0-9_\\.]+$/)),
        (new NodeProperty("id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        //(new NodeProperty("_uid")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
        (new NodeProperty("scannerID")).type(DbDataType.STRING).def(""),
        (new NodeProperty("name")).type(DbDataType.STRING).def(""),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("links")).type(DbDataType.STRING).def([]),
        (new NodeProperty("generic")).type(DbDataType.BOOLEAN).def(true),
        (new NodeProperty("primaryAssets")).type(DbDataType.STRING).def([]),
        (new NodeProperty("secondaryAssets")).type(DbDataType.STRING).def([]),
        (new NodeProperty("globalThreats")).type(DbDataType.STRING).def([]),
        (new NodeProperty("controls"))
            .type(DbDataType.STRING)
            .sleep((x:NodePropertyState)=>{
                if(x.p==null) return {};
                const i:any[] = [];
                x.p.map(y => {
                    i.push(y.toJsonObject())
                });
                return i;
            })
            .wakeUp((x:NodePropertyState)=>{
                if(x.p==null) return {};

                const i:Control[] = [];
                x.p.map(y => {
                    i.push(new Control(y))
                });
                return i;
            })
            .def([]),

        (new NodeProperty("metadata")).type(DbDataType.STRING).def([]),
        (new NodeProperty("indicators"))
            .type(DbDataType.STRING)
            .wakeUp( (x:NodePropertyState) => {
                if(x.p!=null){
                    const m:any[] = [];
                    x.p.map(x => m.push(x.toJsonObject()));
                    return m;
                }else{
                    return [];
                }
            })
            .def([]),
        (new NodeProperty("_attr"))
            .type(DbDataType.STRING)
            .wakeUp( (x:NodePropertyState) => {
                if(x.p!=null){
                    const m:AccessAttributeMap = {};
                    for(let k in x.p){
                        m[k] = AccessAttribute.from({
                            name: x.p[k]._n,
                            value: x.p[k]._v,
                            type: x.p[k]._t
                        });
                    }
                    return m;
                }else{
                    return {};
                }
            })
            .def({})
    ]));


    /**
     * Unique identifier for the model
     */
    id:AssuranceModelUUID;

    /**
     * ID of the scanner able to verify this model
     *
     */
    scannerID:string;

    name:string;

    description = "";

    links: string[] = [];

    /**
     * The assurance model source helps to differenciate
     * who create the models
     *
     * @type {AssuranceModelSource}
     */
    generic = true;

    primaryAssets:Asset[] = [];

    secondaryAssets:Asset[] = [];

    /**
     * @deprecated
     */
    globalThreats:Threat[] = [];

    controls:Control[] = [];

    metadata:Metadata[] = [];

    indicators:Indicator[] = [];

    _beforeLoad:Nullable<(server:any, self:AssuranceModel)=>void> = null;

    protected _ready = false;

    protected _controlTree: ControlTree = {};

    tags:number[];

    constructor( pConfig:any = null, pUpdate = true) {
        super(null);
        this.update(pConfig, pUpdate);
    }

    getUID(): AssuranceModelUUID {
        return this.id;
    }

    /**
     * @method
     */
    getID():AssuranceModelUUID {
        return this.id;
    }


    beforeLoad(pBeforeLoad:((server:any, model:AssuranceModel)=>void)):void{
        this._beforeLoad = pBeforeLoad;
    }


    getScannerID():string {
        return  this.scannerID;
    }

    /**
     *
     * @deprecated
     */
    getThreats():Threat[] {
        return this.globalThreats;
    }

    /**
     *
     * @deprecated
     */
    getCodeThreats():CodeThreat[] {
        const ths:CodeThreat[] = [];

        this.globalThreats.map( x => {
            if(x.isCodeCheckable()){
                if(x instanceof CodeThreat){
                    ths.push(x as CodeThreat);
                }else{
                    ths.push(new CodeThreat({
                        ...x,
                        signature: x.signature as CodeConstraint[]
                    }));
                }

            }
        });

        return ths;
    }

    /**
     *
     */
    getPrimaryAssets():Asset[] {
        return this.primaryAssets;
    }

    /**
     * Secondary assets are involved into transformations of primary assets
     *
     */
    getSecondaryAssets():Asset[] {
        return this.secondaryAssets;
    }

    load(pServer:Nullable<any>  = null):void {
        if(this._beforeLoad!=null){
            this._beforeLoad.apply(null, [pServer,this]);
        }
        return ;
    }

    /**
     * To check if the model is ready to be consumed by the scanner
     *
     * @return {boolean}
     * @method
     */
    isReady():boolean {
        return this._ready;
    }

    /**
     * To instanciate AssuranceModel from a poor object
     *
     * Default way to unserialize models stored into DB
     *
     * @param {any} pData Poor object
     * @return {AssuranceModel} Fresh instance
     * @method
     * @static
     */
    static fromJsonObject(pData:any):AssuranceModel {
        const o = new AssuranceModel(pData,false);

        if(pData.globalThreats!=null){
            pData.globalThreats.map( (x,i) => {
                o.globalThreats[i] = new Threat(x);
            });
        }else{
            o.globalThreats = [];
        }

        if(pData.secondaryAssets!=null){
            pData.secondaryAssets.map( (x,i) => {
                o.secondaryAssets[i] = new Asset(x);
            });
        }else{
            o.secondaryAssets = [];
        }

        if(pData.primaryAssets!=null){
            pData.primaryAssets.map( (x,i) => {
                o.primaryAssets[i] = new Asset(x);
            });
        }else{
            o.primaryAssets = [];
        }

        if(pData.controls!=null){
            pData.controls.map( (x,i) => {
                o.controls[i] = Control.fromJsonObject(x);
            });
        }else{
            o.controls = [];
        }


        if(pData.indicators!=null){
            pData.indicators.map( (x,i) => {
                o.indicators[i] = Indicator.fromJsonObject(x);
            });
        }else{
            o.indicators = [];
        }

        o.update(o,true);

        return o;
    }

    /**
     * To prepare an instance to be serialized
     *
     * @return {any} Poor object with no cyclic references
     * @method
     */
    toJsonObject():any {
        const o:any = {};

        o.id = this.id;
        o.name = this.name;
        o.description = this.description;
        o.scannerID = this.scannerID;
        o.generic = this.generic;
        o.links = this.links;
        o.metadata = this.metadata;
        o.tags = this.tags;

        o.indicators = [];
        this.indicators.map( (x,i) => {
            if(x.toJsonObject!=null){
                o.indicators.push(x.toJsonObject());
            }else{
                o.indicators.push(x);
            }

        });

        o.controls = [];
        this.controls.map( (x,i) => {
            if(x.toJsonObject!=null){
                o.controls.push(x.toJsonObject());
            }else{
                o.controls.push(x);
            }

        });

        CoreDebug.checkJsonSerialize(o, "AssuranceModel");
        /*
        o.globalThreats = [];
        this.globalThreats.map( x => {
            o.globalThreats.push(x.toJsonObject());
        });
        o.primaryAssets = [];
        this.primaryAssets.map( x => {
            //o.primaryAssets.push(x.toJsonObject());//.toJsonObject());
        });
        o.secondaryAssets = [];
        this.secondaryAssets.map( x => {
            //o.secondaryAssets.push(x);//.toJsonObject());
        });*/

        return o;
    }

    asPreview():any {
        const o:any ={};

        o.id = this.id;
        o.name = this.name;
        o.description = this.description;
        o.scannerID = this.scannerID;
        o.generic = this.generic;
        o.links = this.links;
        o.metadata = this.metadata;

        return o;
    }
    isGeneric():boolean {
        return this.generic;
    }

    getMetadata():Metadata[] {
        return this.metadata;
    }

    /**
     * To update properties
     *
     * @param pObject
     */
    /*update(pObject:any, pUpdateChildren = false):void {
        if(pObject.id!=null) this.id = pObject.id;
        if(pObject.scannerID!=null) this.scannerID = pObject.scannerID;
        if(pObject.name!=null) this.name = pObject.name;
        if(pObject.description!=null) this.description = pObject.description;
        if(pObject.links!=null) this.links = pObject.links;
        if(pObject.generic!=null) this.generic = pObject.generic;
        if(pObject.metadata!=null) this.metadata = pObject.metadata;
        if(pObject._attr!=null) this._attr = pObject._attr;


        if(pUpdateChildren){
            if(pObject.primaryAssets!=null) this.primaryAssets = pObject.primaryAssets;
            if(pObject.secondaryAssets!=null) this.secondaryAssets = pObject.secondaryAssets;
            if(pObject.globalThreats!=null) this.globalThreats = pObject.globalThreats;
            if(pObject.controls!=null) this.controls = pObject.controls;
        }

        this.updateControlTree(this.controls);
    }*/

    static stringifyDFlow(pType:DataOperation):string {
        switch (pType){
            case DataOperation.SOURCING:
                return "sourcing";
            case DataOperation.PROCESSING:
                return "processing";
            case DataOperation.STORING:
                return "storing";
            case DataOperation.SHARING:
                return "sharing";
            case DataOperation.ENCRYPTING:
                return "encrypting";
            case DataOperation.DECRYPTING:
                return "decrypting";
            case DataOperation.HASHING:
                return "hashing";
        }
    }

    static fromDFlowString(pType:string):DataOperation {
        switch (pType){
            case "sourcing":
                return DataOperation.SOURCING;
            case "processing":
                return DataOperation.PROCESSING;
            case "storing":
                return DataOperation.STORING;
            case "sharing":
                return DataOperation.SHARING;
            case "encrypting":
                return DataOperation.ENCRYPTING;
            case "decrypting":
                return DataOperation.DECRYPTING;
            case "hashing":
                return DataOperation.HASHING;
        }
    }

    static stringifyAnalType(pType:AnalysisType):string {
        switch (pType){
            case AnalysisType.SAST:
                return "sast";
            case AnalysisType.DAST:
                return "dast";
            case AnalysisType.IAST:
                return "iast";
        }
    }

    static fromAnalTypeString(pType:string):AnalysisType {
        switch (pType){
            case "sast":
                return AnalysisType.SAST;
            case "dast":
                return AnalysisType.DAST;
            case "iast":
                return AnalysisType.IAST;
        }
    }
    /**
     * To update the internal control tree
     *
     * @param pControls
     * @param pCurrNode
     */
    updateControlTree( pControls:Control[]|ControlAssessment[], pCurrNode:ControlNode|null = null):void {
        const current:ControlNode = (pCurrNode==null ? { canonicalID:CANONICALIZED_ROOT, children:{} } : pCurrNode );

        pControls.map((vCtrl:Control|ControlAssessment)=>{

            let canonicalID:string;

            if(vCtrl.id!=null){
                canonicalID = current.canonicalID+CANONICAL_ID_SEPARATOR+vCtrl.id;
            }else{
                canonicalID = current.canonicalID;
            }

            // retrieve MetadataTopic.DFLOW_STEP
            const dflow = vCtrl.metadata.find(x => x.key===MetadataTopic.DFLOW_STEP);
            if(dflow!=null){
                canonicalID = canonicalID+":"+AssuranceModel.stringifyDFlow(dflow.value);
            }

            // retrieve analType
            if(vCtrl.isControlAssessment()){
                const strAT = AssuranceModel.stringifyAnalType((vCtrl as ControlAssessment).analType);
                if((vCtrl as ControlAssessment).analType!=null){
                    canonicalID = canonicalID+":"+strAT;
                }else{
                    canonicalID = canonicalID+CANONICAL_ID_SEPARATOR+"default";
                }
            }


            const node:ControlNode = {
                parent:current,
                canonicalID:canonicalID,
                ctrl: vCtrl,
                children: {}
            };

            /*if(vCtrl.hasOwnProperty('children') && (vCtrl as Control)!=null && (vCtrl as Control).children.length>0){
                this.updateControlTree((vCtrl as Control).children as Control[], node);
            }*/

            if((vCtrl as Control)!=null){
                if(vCtrl.isControl() && (vCtrl as Control).children.length>0){
                    this.updateControlTree((vCtrl as Control).children as Control[], node);
                }

                if(vCtrl.hasOwnProperty('assessments') && (vCtrl as Control).assessments.length>0){
                    this.updateControlTree((vCtrl as Control).assessments as ControlAssessment[], node);
                }
            }



            current.children[canonicalID] = node;

            this._controlTree[canonicalID] = node;
        });

        if(current.parent==null){
            this._controlTree[current.canonicalID] = current;
        }
    }

    getControlNode(pCanonicalUID:string):ControlNode {
        return this._controlTree[pCanonicalUID];
    }

    getTextualMetadata(pName:string):Nullable<string>{
        const meta = this.metadata.find(m => {
            return (m.type===MetadataType.TEXT)&&(m.key===pName);
        });

        if(meta!=null){
            return meta.value;
        }else{
            return null;
        }
    }


    /**
     * To retrieve the version from metadata
     *
     * @return {number} Version
     * @method
     */
    getVersion():number{
        return parseInt(this.getTextualMetadata("version"),10);
    }

    getLinks():string[] {
        return this.metadata.filter(m => {
            return (m.type===MetadataType.URI);
        }).map(x => x.value);
    }


    getAuthor():Nullable<string> {
        return this.getTextualMetadata("author")
    }

    getRelease():Nullable<string> {
        return this.getTextualMetadata("release")
    }

    /**
     * To check if the model has been edited
     * after the date or version passed as arguments
     *
     * @param pVersion
     */
    isVersionGreaterThan(pVersion:number):boolean {
        return (pVersion < this.getVersion());
    }

    private _controlNodeHasChildren(pNode:ControlNode):boolean {
        return (pNode.children!=null) || (Object.values(pNode.children).length>0);
    }

    private _isTerminalControl(pNode:ControlNode):boolean {
        return (pNode.children==null) || (Object.values(pNode.children).length==0);
    }

    /**
     *
     * @param pCanonicalUID
     */
    getControlLeafsFrom(pCanonicalUID:string):ControlNode[] {
        const nodes:ControlNode[] = [];
        for(let canonUID in this._controlTree){
            if(canonUID.startsWith(pCanonicalUID) && this._isTerminalControl(this._controlTree[canonUID])){
                nodes.push(this._controlTree[canonUID]);
            }
        }
        return nodes;
    }

    /*
     * To setup attributes involved into ACL such as 'owner'
     *
     * TODO : add attr containing all authors
     *
     * @method
     */
    initAccessAttributes() {
        this.setAccessAttribute(AuditAccessControl.attr.OWNER);
    }


    /**
     * To update properties
     *
     * @param pObject
     */
    update(pObject:any, pUpdateChildren = false):void {
        if(pObject.id!=null) this.id = pObject.id;
        if(pObject.scannerID!=null) this.scannerID = pObject.scannerID;
        if(pObject.name!=null) this.name = pObject.name;
        if(pObject.description!=null) this.description = pObject.description;
        if(pObject.links!=null) this.links = pObject.links;
        if(pObject.generic!=null) this.generic = pObject.generic;
        if(pObject.metadata!=null) this.metadata = pObject.metadata;

        if(pUpdateChildren){
            if(pObject.primaryAssets!=null) this.primaryAssets = pObject.primaryAssets;
            if(pObject.secondaryAssets!=null) this.secondaryAssets = pObject.secondaryAssets;
            if(pObject.globalThreats!=null) this.globalThreats = pObject.globalThreats;
            if(pObject.controls!=null) this.controls = pObject.controls;
            if(pObject.indicators!=null) this.indicators = pObject.indicators;
        }

        this.updateControlTree(this.controls);
    }

    merge(pModel:AssuranceModel, pForce = false):void {

        const variant = this.getVariantName();
        let merged = false;

        if((pModel.getUID()==this.getUID())
            && (pModel.getVersion()<this.getVersion())) {
            throw AuditManagerException.CANNOT_MERGE_NEW_WITH_OLD(this.name,this.getVersion(),pModel.getVersion())
        }

        // update metadata
        if(pModel.id!=null) this.id = pModel.id;
        if(pModel.scannerID!=null) this.scannerID = pModel.scannerID;
        if(pModel.name!=null) this.name = pModel.name;
        if(pModel.description!=null) this.description = pModel.description;
        if(pModel.links!=null) this.links = pModel.links;
        if(pModel.generic!=null) this.generic = pModel.generic;
        if(pModel.metadata!=null) this.metadata = pModel.metadata;

        // merge controls
        this._mergeControls(pModel.controls, pForce);

        // merge indicators
        const isVariant = this._mergeIndicators(pModel.indicators, pForce)

        if(isVariant){
            this.setMeta(
                MetadataType.TEXT,
                'model.variant',
                (variant? `merge-from-${variant}`:`merge-from-${pModel.getVersion()}`)
            )
        }

        this.setMeta(
            MetadataType.TEXT,
            'version',
            pModel.getVersion()
        );

        this.updateControlTree(this.controls)


    }


    private _mergeControls(pControls:Control[], pForce = false){

        // new controls are added
        // not touched controls are updated
        // new conflicting controls are

        const existings:Record<string, Control> = {};

        this.controls.map(x => {
            existings[x.getUID()] = x;
        });

        pControls.map((vControl)=>{
            const current  = existings[vControl.getUID()];

            if(current==null){
                // add
                existings[vControl.getUID()] = vControl;
                return;
            }

            if(pForce){
                existings[vControl.getUID()] = vControl;
                //throw AuditManagerException.CONFLICT_IN_CTRL_IN_MERGE();
            }

            // else keep unchanged

        })

        this.controls = Object.values(existings);
    }

    private _mergeIndicators(pIndicators:Indicator[], pForce = false):boolean{
        const existings:Record<IndicatorUUID, Indicator> = {};
        let isVariant = false;

        this.indicators.map(x => {
            existings[x.getUID()] = x;
        });


        pIndicators.map((vIndicator)=>{
            const current  = existings[vIndicator.getUID()];

            if( (current==null) // new indicators are added
                || (current.compare(vIndicator).length==0) // not customised indicators are replaced
            ){
                existings[vIndicator.getUID()] = vIndicator;
                return;
            }

            existings[vIndicator.getUID()] = vIndicator;

            /*
            if(!pForce){
                throw AuditManagerException.CONFLICT_IN_KPI_IN_MERGE();
            }

            existings[vIndicator.getUID()] = vIndicator;
            isVariant = true;*/
        })

        this.indicators = Object.values(existings);

        return isVariant;
    }
    /**
     * To get a metadata by its name
     *
     * @param pKey
     */
    getMeta(pKey:string):Nullable<Metadata> {
        return this.metadata.find((vMeta)=>{ return (vMeta.key===pKey)});
    }

    /**
     * To set a meta data
     *
     * @param pType
     * @param pKey
     * @param pValue
     */
    setMeta(pType:MetadataType, pKey:string, pValue:any):void {
        const meta = this.getMeta(pKey);
        if(meta==null){
            this.metadata.push({
                type: pType,
                value: pValue,
                key: pKey
            })
        }else{
            meta.type = pType;
            meta.value = pValue;
        }
    }

    /**
     * To get the variant name
     * @method
     */
    getVariantName():Nullable<string> {
        const variant = this.getMeta('variant');
        if(variant==null) return null;

        return variant.value;
    }

    getControlTree():any {
        return this._controlTree;
    }

    /**
     *
     * @param pAssessment
     * @param pFlowStep
     * @param pAnalType
     */
    static isControlAssessmentMatch(pAssessment: ControlAssessment, pFlowStep: DataOperation, pAnalType: AnalysisType) {

        let flowOK = true, anaOK = true;

        if(pFlowStep!=null){
            flowOK = (pAssessment.metadata.find(x => (
                (x.key===MetadataTopic.DFLOW_STEP) && (x.value===pFlowStep)
            ))!=null);
            if(!flowOK) return false;
        }

        if(pAnalType!=null){
            anaOK = (pAssessment.analType===pAnalType);
        }

        return (anaOK && flowOK);
    }

    /**
     * To search a control assessment by its properties
     *
     * @param pCtrl
     * @param pAnalTypeS
     * @param pFlowStep
     */
    searchAssessmentByPart(pCtrl:Control, pFlowStep:string, pAnalTypeS:string ):Nullable<ControlAssessment> {

        const a = AssuranceModel.fromAnalTypeString(pAnalTypeS);
        const f = AssuranceModel.fromDFlowString(pFlowStep);

        for(let i=0; i<pCtrl.assessments.length; i++ ){
            if(AssuranceModel.isControlAssessmentMatch(pCtrl.assessments[i], f, a)){
                return pCtrl.assessments[i];
            }
        }
        return null;
    }


    searchControlByCID(pCanonUID:string):any {
        const lvl = pCanonUID.split(".");

        let found:Nullable<Control|ControlAssessment> = null;
        let nodeID:string ;
        let ctrlSet:Control[]|ControlAssessment[] = this.controls as any;
        let npart:string[], isCtrlAss = false;
        let o:number = -1;


        for(let i=(lvl[0]=='*'?1:0); i<lvl.length; i++){

            nodeID = lvl[i];

            ctrlSet = ctrlSet.sort((a:any,b:any)=>{
                if(a.id!=null && b.id!=null){
                    return a.id.localeCompare(b.id);
                }

                return (a.id==null ? 1 : -1);
            });


            o = nodeID.indexOf(":");
            if(o>-1){
                nodeID = nodeID.slice(0,o);
            }

            found = null as any;

            for(let k=0; k<ctrlSet.length; k++){
                // control
                if( nodeID!==""){
                    /*if(lvl.length==1){
                        console.log(nodeID,ctrlSet[k].id, ctrlSet[k].id!=null && nodeID===ctrlSet[k].id,
                            ctrlSet[k].isControl(),ctrlSet[k] , (ctrlSet[k] as Control).hasAssessments() );
                    }*/
                    if(ctrlSet[k].id!=null && nodeID===ctrlSet[k].id){
                        found = ctrlSet[k];
                        break;
                    }
                }
            }

            if(found){
                if((found as IControl).isControl()){
                    if((found as Control).assessments!=null && (found as Control).assessments.length>0){
                        break;
                    }else if(i<lvl.length-1 && (found as Control).hasChildren()){
                        ctrlSet = (found as Control).children;
                    }else{
                        break;
                    }
                }
            }
        }

        if(found!=null){
            if(o>-1){
                npart = lvl[lvl.length-1].split(":");
                // should be a control with assessments
                return this.searchAssessmentByPart((found as Control), npart[1], npart[2]);
            }
            //console.log(pCanonUID, 'FOUND', found  )
        }else{
            console.log(pCanonUID, 'NOT FOUND');
            return null;
        }

        return found;
    }



    explain( pReport:AssuranceReport, pProject:DexcaliburProject, pOptions:ExportOptions):ExplainedReport {
        const exp = new ExplainedReport();

        exp.setModel(this);
        if(pReport.project!=null){
            exp.setProject(pProject);
        }
        exp.setReport(pReport, pOptions);

        return exp;
    }
}
AssuranceModel.TYPE.builder(AssuranceModel);
