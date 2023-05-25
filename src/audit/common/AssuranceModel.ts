import Asset from "./Asset.js";
import Threat from "./Threat.js";
import CodeThreat from "./CodeThreat.js";
import CodeConstraint from "./CodeConstraint.js";

export enum AssuranceModelType {
    SECURITY="sec",
    PRIVACY="pri",
    ECOLOGY="eco",
    QUALITY="qua",
}


export default class AssuranceModel {

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


    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
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

    toJsonObject():any {
        const o:any = {};

        o.generic = this.generic;
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