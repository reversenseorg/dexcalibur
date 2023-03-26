import Asset from "./Asset.js";


export default class AssuranceModel {

    primaryAssets:Asset[];
    secondaryAssets:Asset[];

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}