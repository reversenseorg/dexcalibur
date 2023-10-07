import got, {Options} from "got";
import {IStringIndex} from "../core/IStringIndex.js";
import Control from "./common/Control.js";
const GOT = got.default;



export interface SignatureServerOptions extends IStringIndex<any> {
    host: string;
    port: string;
    ssl: boolean;
    auth: any;
}

/**
 *
 */
export class SignatureServerAPI {

    options:SignatureServerOptions;

    baseURL:string;

    constructor(pOptions:SignatureServerOptions) {
        this.options = pOptions;

        this.baseURL = "http"+(pOptions.ssl?'s':'')+'://'+this.options.host+':'+this.options.port+'/';
    }


    async getTrackers():Promise<Control[]> {

        const response = await GOT(this.baseURL+"api/trackers/list");
        const raw = JSON.parse(response.body);
        const ctrls:Control[] = [];

        if(raw.success){
            raw.data.map( x => {
                ctrls.push( new Control(x));
            });
        }

        return ctrls;
    }

    async uppdateTracker(pControl:Control):Promise<boolean> {

        const response = await GOT(this.baseURL+"api/trackers/edit/"+encodeURIComponent(pControl.id),{
            method: 'PUT',
            body: JSON.stringify(pControl.toJsonObject())
        });
        const raw = JSON.parse(response.body);
        console.log("[SIGNATURE SERVER API] uppdateTracker > ",raw);
        return raw;
    }

    async addTracker(pControl:Control):Promise<string> {

        const response = await GOT(this.baseURL+"api/trackers/new",{
            method: 'POST',
            body: JSON.stringify(pControl.toJsonObject())
        });
        const raw = JSON.parse(response.body);
        console.log("[SIGNATURE SERVER API] addTracker > ",raw);
        return raw;
    }

    async deleteTracker(pControl:Control):Promise<boolean> {
        const response = await GOT(this.baseURL+"api/trackers/delete/"+encodeURIComponent(pControl.id),{
            method: 'POST'
        });
        const raw = JSON.parse(response.body);
        console.log("[SIGNATURE SERVER API] deleteTracker > ",raw);
        return raw;
    }
}