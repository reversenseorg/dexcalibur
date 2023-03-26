
import { URL } from "url";

import * as Got from "got";
const got = Got.default;


import * as Log from './Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const PLATFORM_FOLDER = "platforms";
const DEVICE_FOLDER = "devices";


export default class DexcaliburRegistry
{
    url:string;
    api:string;

    constructor( pRegistryURL:string, pRegistryApiURL:string ){

        this.url = pRegistryURL; //new URL(pRegistryURL);
        this.api = pRegistryApiURL; //new URL(pRegistryApiURL);

        /*
        this.cache = {
            platforms: [],
            devices: [],
            inspectors: []
        }*/
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
    async enumeratePlatforms():Promise<any>{
       
        let response:any = null;
        try {
            response = await got(this.api+"/platforms");
            response = JSON.parse(response.body);

        } catch (error) {
            Logger.error("[REGISTRY] enumeratePlatforms(): Unable to enumerate the remote registry : "+error.message);
            throw new Error("[REGISTRY] enumeratePlatforms(): Unable to enumerate the remote registry");
        } finally {
           return response;
        }
    }

    async enumerateInspectors():Promise<any>{
       
        let response = null;
        try {
            response = await got(this.api+"/inspectors");
            response = JSON.parse(response.body);

        } catch (error) {
            Logger.error("[REGISTRY] enumerateInspectors(): Unable to enumerate the remote registry : "+error.message);
            throw new Error("[REGISTRY] enumerateInspectors(): Unable to enumerate the remote registry");
        } finally {

           return response;
        }
    }

    /**
     *
     */
    static getOfficial():DexcaliburRegistry {
        return new DexcaliburRegistry(
            "",
            ""
        )
    }
    
}
