import Asset from "./Asset.js";
import Threat from "./Threat.js";
import CodeThreat from "./CodeThreat.js";
import CodeConstraint from "./CodeConstraint.js";
import Control from "./Control.js";

export enum AssuranceModelType {
    SECURITY="sec",
    PRIVACY="pri",
    ECOLOGY="eco",
    QUALITY="qua",
}


export default class AssuranceModel {


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

    globalThreats:Threat[] = [];


    controls:Control[] = [];

    protected _ready = false;


    constructor( pConfig:any = null) {
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

    getThreats():Threat[] {
        return this.globalThreats;
    }

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

    getPrimaryAssets():Asset[] {
        return this.primaryAssets;
    }
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

        return o;
    }

    toJsonObject():any {
        const o:any = {};

        o.id = this.id;
        o.name = this.name;
        o.description = this.description;
        o.scannerID = this.scannerID;
        o.generic = this.generic;
        o.links = this.links;

        o.controls = [];
        this.controls.map( x => {
            o.controls.push(x.toJsonObject());
        })
        o.globalThreats = [];
        this.globalThreats.map( x => {
            o.globalThreats.push(x.toJsonObject());
        });
        o.primaryAssets = [];
        this.primaryAssets.map( x => {
            o.primaryAssets.push(x);//.toJsonObject());
        });
        o.secondaryAssets = [];
        this.secondaryAssets.map( x => {
            o.secondaryAssets.push(x);//.toJsonObject());
        });

        return o;
    }

    isGeneric():boolean {
        return this.generic;
    }
}