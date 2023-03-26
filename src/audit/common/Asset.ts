import AssuranceModel from "./AssuranceModel.js";

export default class Asset  {

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}