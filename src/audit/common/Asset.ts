

export interface AssetOptions {

}

export default class Asset  {

    constructor( pConfig:AssetOptions = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}