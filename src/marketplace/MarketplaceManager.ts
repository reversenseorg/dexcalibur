import DexcaliburEngine from "../DexcaliburEngine.js";


/**
 * Represent the manager to pull information and plugins from
 * marketplace
 *
 * @class
 */
export class MarketplaceManager {

    /**
     * @type {DexcaliburEngine}
     * @private
     */
    private _ctx:DexcaliburEngine;



    /**
     * To create
     *
     * @param pEngine
     */
    constructor(pEngine:DexcaliburEngine) {
        this._ctx = pEngine;
    }
}