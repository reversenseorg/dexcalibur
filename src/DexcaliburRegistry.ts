
import { URL } from "url";
import got from "got";


const PLATFORM_FOLDER = "platforms";
const DEVICE_FOLDER = "devices";


export default class DexcaliburRegistry
{
    url:URL;
    api:URL;

    constructor( pRegistryURL:string, pRegistryApiURL:string ){

        this.url = new URL(pRegistryURL);
        this.api = new URL(pRegistryApiURL);

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
            throw new Error("[REGISTRY] enumerateInspectors(): Unable to enumerate the remote registry");
        } finally {

           return response;
        }
    }
    
}
