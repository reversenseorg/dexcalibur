import Asset from "./Asset.js";


export default class PrivacyAsset extends Asset {

    constructor( pConfig:any = null) {
        super(pConfig);

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}