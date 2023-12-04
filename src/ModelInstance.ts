import ModelFile from "./ModelFile.js";
import {NodeInternalType} from "./NodeInternalType.js";
import {CodeLocation, LocationType, ModelLocation} from "./ModelLocation.js";
import {Nullable} from "./core/IStringIndex.js";

export interface ContextLocation {
    __: NodeInternalType,
    uid:string;
    offset?:number;
    bb?:number;
    line?:number;
}

/**
 * @class
 */
export class ModelInstance {

    /**
     * Instance location
     */
    location:ModelLocation = CodeLocation.MEM;

    /**
     * Runtime session
     */
    session:Nullable<string> = null;

    /**
     * Catcher : hook who caught the instance
     */
    catcher:Nullable<any> = null;

    /**
     * Context location (method, function, lib+offset,  ...)
     */
    ctx:Nullable<ContextLocation> = null;


    constructor(pConfig:any=null) {
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }


    /**
     * To get the location type
     *
     * There are several location type app :
     * - static *.dex,
     */
    getLocation():ModelLocation {
        return this.location;
    }


    /**
     * To get the location type
     *
     * There are several location type app :
     * - static *.dex,
     */
    getContext():ContextLocation {
        return this.ctx;
    }
    /**
     * To get the location type
     *
     * There are several location type app :
     * - static *.dex,
     */
    getSession():string {
        return this.session;
    }


    /**
     * To get the location type
     *
     * There are several location type app :
     * - static *.dex,
     */
    getCatcher():any {
        return this.catcher;
    }

    /**
     *
     */
    isFileLocated():boolean {
        return (this.location.getType() == LocationType.FILE);
    }

    /**
     *
     */
    isMemoryLocated():boolean {
        return (this.location.getType() == LocationType.MEM);
    }

    /**
     *
     */
    toJsonObject():any{
        return {
          location: this.location,
          ctx: this.ctx,
          catcher: this.catcher!=null ? this.catcher.getUID() : null,
          sessions: this.session
        };
    }
}

