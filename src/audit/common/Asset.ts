import AssuranceModel from "./AssuranceModel";

export default class Asset  {

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}