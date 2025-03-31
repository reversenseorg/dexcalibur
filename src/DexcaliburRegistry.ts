
import { URL } from "url";

import * as Got from "got";
const got = Got.default;


import * as Log from './Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const PLATFORM_FOLDER = "platforms";
const DEVICE_FOLDER = "devices";

export enum RegistryType {
    REMOTE="remote",
    LOCAL="local"
}

export default class DexcaliburRegistry
{
    type:RegistryType = RegistryType.REMOTE;
    url:string;
    api:string;

    constructor( pRegistryURL:string, pRegistryApiURL:string ){

        this.url = pRegistryURL; //new URL(pRegistryURL);
        this.api = pRegistryApiURL; //new URL(pRegistryApiURL);
    }


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
            //throw new Error("[REGISTRY] enumeratePlatforms(): Unable to enumerate the remote registry");
            response = [];
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
     * @param {string} pPath
     */
    static newLocal(pPath:string):DexcaliburRegistry{
        const reg = new DexcaliburRegistry("","");
        reg.type = RegistryType.LOCAL;
        return reg;
    }
}
