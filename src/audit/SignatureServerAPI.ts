import got, {Options} from "got";
import {IStringIndex} from "../core/IStringIndex.js";
import Control from "./common/Control.js";
import AssuranceModel from "./common/AssuranceModel.js";
import {DeviceModel} from "../DeviceModel.js";
import {Brand} from "../Brand.js";
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

        const response = await GOT(this.baseURL+"api/signatures/trackers/list");
        const raw = JSON.parse(response.body);
        const ctrls:Control[] = [];

        if(raw.success){
            raw.data.map( x => {
                ctrls.push( Control.fromJsonObject(x));
            });
        }

        return ctrls;
    }

    async uppdateTracker(pControl:Control):Promise<boolean> {

        const response = await GOT(this.baseURL+"api/signatures/trackers/edit/"+encodeURIComponent(pControl.id),{
            method: 'PUT',
            body: JSON.stringify(pControl.toJsonObject())
        });
        const raw = JSON.parse(response.body);
        console.log("[SIGNATURE SERVER API] uppdateTracker > ",raw);
        return raw;
    }

    async addTracker(pControl:Control):Promise<string> {

        const response = await GOT(this.baseURL+"api/signatures/trackers/new",{
            method: 'POST',
            body: JSON.stringify(pControl.toJsonObject())
        });
        const raw = JSON.parse(response.body);
        console.log("[SIGNATURE SERVER API] addTracker > ",raw);
        return raw;
    }

    async deleteTracker(pControl:Control):Promise<boolean> {
        const response = await GOT(this.baseURL+"api/signatures/trackers/delete/"+encodeURIComponent(pControl.id),{
            method: 'POST'
        });
        const raw = JSON.parse(response.body);
        console.log("[SIGNATURE SERVER API] deleteTracker > ",raw);
        return raw;
    }


    async getModels():Promise<AssuranceModel[]> {

        const response = await GOT(this.baseURL+"api/signatures/models");
        const raw = JSON.parse(response.body);
        const models:AssuranceModel[] = [];


        console.log(raw);
        if(raw.success){
            raw.data.map( x => {
                models.push( AssuranceModel.fromJsonObject(x));
            });
        }

        return models;
    }

    async getDeviceModels():Promise<DeviceModel[]> {

        const response = await GOT(this.baseURL+"api/devices/models/list");
        const raw = JSON.parse(response.body);
        const models:DeviceModel[] = [];


        console.log(raw);
        if(raw.success){
            raw.data.map( x => {
                models.push( new DeviceModel(x));
            });
        }

        return models;
    }

    async getBrands():Promise<Brand[]> {

        const response = await GOT(this.baseURL+"api/devices/brands/list");
        const raw = JSON.parse(response.body);
        const models:Brand[] = [];


        console.log(raw);
        if(raw.success){
            raw.data.map( x => {
                models.push( new Brand(x));
            });
        }

        return models;
    }

    async searchDeviceModels(pPpt:string, pPattern:string, pContains:boolean):Promise<DeviceModel[]> {

        const response = await GOT(
            this.baseURL+"api/devices/models/search?ppt="+pPpt+"&pattern="+encodeURIComponent(pPattern)+"&contains="+pContains
        );

        const raw = JSON.parse(response.body);
        const models:DeviceModel[] = [];


        console.log(raw);
        if(raw.success){
            raw.data.map( x => {
                models.push( new DeviceModel(x));
            });
        }

        return models;
    }
}