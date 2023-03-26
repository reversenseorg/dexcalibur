import AssuranceModel from "./AssuranceModel.js";


export default class PrivacyModel extends AssuranceModel {

    constructor( pConfig:any = null) {
        super(pConfig);

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}