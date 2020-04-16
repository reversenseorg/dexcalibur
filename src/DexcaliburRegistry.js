const https = require("https");

const Utils = require("./Utils");



class DexcaliburRegistry
{
    constructor( pURL){
        this.url = pURL;

        this.cache = null;
    }

    /**
     * To enumerates downloadable platform
     */
    enumeratePlatform(){
        https.get(this.url, (vData)=>{
            console.log( JSON.parse(vData));
        });
    }

    /*downloadPlatform( pName){

    }*/
}

module.exports = DexcaliburRegistry;