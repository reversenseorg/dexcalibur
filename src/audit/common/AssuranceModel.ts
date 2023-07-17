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

export enum AssuranceModelType {
    SECURITY="sec",
    PRIVACY="pri",
    ECOLOGY="eco",
    QUALITY="qua",
}


export default class AssuranceModel extends Auditable implements IAuditableAccess {


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

    protected _ready = false;


    constructor( pConfig:any = null) {
        super(null);

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    /**
     * @method
     */
    getID():string {
        return this.id;
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

    load():void {
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

        pData.globalThreats.map( (x,i) => {
           o.globalThreats[i] = new Threat(x);
        });

        pData.primaryAssets.map( (x,i) => {
            o.primaryAssets[i] = new Asset(x);
        });

        pData.secondaryAssets.map( (x,i) => {
            o.secondaryAssets[i] = new Asset(x);
        });

        pData.controls.map( (x,i) => {
            o.controls[i] = Control.fromJsonObject(x);
        });



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
        this.controls.map( x => {
            o.controls.push(x.toJsonObject());
        });

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
        });

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

        if(pUpdateChildren){
            if(pObject.primaryAssets!=null) this.primaryAssets = pObject.primaryAssets;
            if(pObject.secondaryAssets!=null) this.secondaryAssets = pObject.secondaryAssets;
            if(pObject.globalThreats!=null) this.globalThreats = pObject.globalThreats;
            if(pObject.controls!=null) this.controls = pObject.controls;
        }
    }

    /**
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