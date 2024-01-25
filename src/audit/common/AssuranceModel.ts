import Asset from "./Asset.js";
import Threat from "./Threat.js";
import CodeThreat from "./CodeThreat.js";
import CodeConstraint from "./CodeConstraint.js";
import Control from "./Control.js";
import {Metadata} from "./Metadata.js";
import {Auditable} from "../../Auditable.js";
import {IAuditableAccess} from "../../user/acl/IAuditableAccess.js";
import {ProjectAccessControl} from "../../user/acl/rbac/ProjectAccessContol.js";
import {AuditAccessControl} from "../../user/acl/rbac/AssuranceModelAccessControl.js";
import ControlAssessment from "./ControlAssessment.js";
import {IControl} from "./IControl.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {Nullable} from "../../core/IStringIndex.js";
import {NodeInternalType} from "../../NodeInternalType.js";
import {DbDataType, DbKeyType, INode, NodeProperty, NodeType, ValidationRule} from "@dexcalibur/dexcalibur-orm";

export enum AssuranceModelType {
    SECURITY="sec",
    PRIVACY="pri",
    ECOLOGY="eco",
    QUALITY="qua",
}

export const CANONICALIZED_ROOT = "*";
export const CANONICAL_ID_SEPARATOR = ".";

export interface  ControlNode {
    parent?:ControlNode;
    ctrl?: IControl; //Control | ControlAssessment;
    canonicalID: string;
    children?:ControlTree;
}
export interface ControlTree {
    [canonicalUID:string]: ControlNode;
}




export default class AssuranceModel extends Auditable implements IAuditableAccess, INode {

    __ = NodeInternalType.ASSURANCE_MODEL;

    static TYPE:NodeType = (new NodeType( "assurance_model", NodeInternalType.ASSURANCE_MODEL, [
        (new NodeProperty("_uid")).type(DbDataType.STRING)
            .key(DbKeyType.PRIMARY)
            .addValidationRule(ValidationRule.newRegexpAssert(/^[a-zA-Z0-9_]+$/)),
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
        (new NodeProperty("controls")).type(DbDataType.STRING).def([]),
        (new NodeProperty("metadata")).type(DbDataType.STRING).def([])
    ]));


    /**
     * Unique identifier for the model
     */
    id:string;

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

    _beforeLoad:Nullable<(server:any, self:AssuranceModel)=>void> = null;


    protected _ready = false;

    protected _controlTree: ControlTree = {};

    tags:number[];

    constructor( pConfig:any = null) {
        super(null);
        this.update(pConfig, true);
    }

    getUID(): string {
        return this.id;
    }

    /**
     * @method
     */
    getID():string {
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
        const o = new AssuranceModel(pData);

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
        }

        this.updateControlTree(this.controls);
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
            const canonicalID = current.canonicalID+CANONICAL_ID_SEPARATOR+vCtrl.id;
            const node:ControlNode = {
                parent:current,
                canonicalID:canonicalID,
                ctrl: vCtrl,
                children: {}
            };

            if(vCtrl.hasOwnProperty('children') && (vCtrl as Control)!=null && (vCtrl as Control).children.length>0){
                this.updateControlTree((vCtrl as Control).children as Control[], node);
            }

            if(vCtrl.hasOwnProperty('assessments') && (vCtrl as Control)!=null && (vCtrl as Control).assessments.length>0){
                this.updateControlTree((vCtrl as Control).assessments as ControlAssessment[], node);
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

    /**
     * To retrieve the version from metadata
     *
     * @return {number} Version
     * @method
     */
    getVersion():number {
        let version = 0;
        this.metadata.map(x => {
            if(x.key=="version"){
                version = parseInt(x.value);
            }
        });
        return version;
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
        for(const k in AuditAccessControl.attr){
            this.setAccessAttribute(AuditAccessControl.attr[k], AuditAccessControl.attr[k].value);
        }
    }
}
AssuranceModel.TYPE.builder(AssuranceModel);
