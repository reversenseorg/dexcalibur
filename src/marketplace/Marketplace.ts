import DexcaliburEngine from "../DexcaliburEngine.js";



export enum MarketplaceLocation {
    REMOTE="remote",
    LOCAL="local"
}

export class Marketplace {


    /**
     * @type {DexcaliburEngine}
     * @private
     */
    private _ctx:DexcaliburEngine;

    /**
     * Marketplace location
     * Can be remote or local
     *
     */
    location = MarketplaceLocation.REMOTE;



    constructor() {

    }
}