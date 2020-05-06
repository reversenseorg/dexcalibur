const _path_ = require("path");
const _url_ = require("url");
const _got_ = require("got");

const Utils = require("./Utils");

const PLATFORM_FOLDER = "platforms";
const DEVICE_FOLDER = "devices";


class DexcaliburRegistry
{
    constructor( pRegistryURL, pRegistryApiURL ){
        this.url = new URL(pRegistryURL);
        this.api = new URL(pRegistryApiURL);

        this.cache = {
            platforms: [],
            devices: [],
            inspectors: []
        }
    }

   

    /*loadPlatforms( ){
        
        (async () => {
            try {
                var response = await _got_(this.api+"/platforms");

                var version, name, source, vendor, model;

                response = JSON.parse(response.body);

                for(let i=0; i<response.length; i++){

                    this.cache.platforms.push(
                        new platform({

                        })
                    )
                }
                this.cache 
                console.log(response.body);
                //=> '<!doctype html> ...'
            } catch (error) {
                throw new Error("[REGISTRY] Unable to enumerate the remote registry");
            }
        })();
    }*/

    /**
     * To enumerates downloadable platform
     */
    async enumeratePlatforms(){
       
        var response = null;
        try {
            response = await _got_(this.api+"/platforms");
            response = JSON.parse(response.body);

        } catch (error) {
            throw new Error("[REGISTRY] enumeratePlatforms(): Unable to enumerate the remote registry");
        } finally {

           return response;
        }
    }

    async enumerateInspectors(){
       
        var response = null;
        try {
            response = await _got_(this.api+"/inspectors");
            response = JSON.parse(response.body);

        } catch (error) {
            throw new Error("[REGISTRY] enumerateInspectors(): Unable to enumerate the remote registry");
        } finally {

           return response;
        }
    }
    
}

module.exports = DexcaliburRegistry;