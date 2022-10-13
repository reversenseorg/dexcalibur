import Asset from "./Asset";


export default class AssuranceModel {

    primaryAssets:Asset[];
    secondaryAssets:Asset[];

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}