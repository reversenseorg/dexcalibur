import got, {Options} from "got";
import {IStringIndex} from "../core/IStringIndex.js";
import Control from "./common/Control.js";
import AssuranceModel, {AssuranceModelPreview} from "./common/AssuranceModel.js";
import {DeviceModel} from "../DeviceModel.js";
import {Brand} from "../Brand.js";
import * as Log from "../Logger.js";
import {INode, TagCategory} from "@dexcalibur/dexcalibur-orm";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {BomPurpose} from "../bom/BomPurpose.js";
import {ReversenseProduct, ReversenseProductUUID} from "../billing/ReversenseProduct.js";
const GOT = got.default;


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface SignatureServerOptions extends IStringIndex<any> {
    host: string;
    port: string;
    ssl: boolean;
    auth: any;
}

/**
 * The Client API of a remote SignatureServer
 *
 * TODO : add SSL pining
 *
 * @class
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
        Logger.info("[SIGNATURE SERVER API] uppdateTracker > ");
        Logger.debugRAW(raw);
        return raw;
    }

    async addTracker(pControl:Control):Promise<string> {

        const response = await GOT(this.baseURL+"api/signatures/trackers/new",{
            method: 'POST',
            body: JSON.stringify(pControl.toJsonObject())
        });
        const raw = JSON.parse(response.body);
        Logger.info("[SIGNATURE SERVER API] addTracker > ");
        Logger.debugRAW(raw);
        return raw;
    }

    async deleteTracker(pControl:Control):Promise<boolean> {
        const response = await GOT(this.baseURL+"api/signatures/trackers/edit/"+encodeURIComponent(pControl.id),{
            method: 'DELETE'
        });
        const raw = JSON.parse(response.body);
        Logger.info("[SIGNATURE SERVER API] deleteTracker > ");
        Logger.debugRAW(raw);
        return raw;
    }


    async getModels():Promise<AssuranceModel[]> {

        const response = await GOT(this.baseURL+"api/signatures/models");
        const raw = JSON.parse(response.body);
        const models:AssuranceModel[] = [];

        if(raw.success){
            raw.data.map( x => {
                models.push( AssuranceModel.fromJsonObject(x));
            });
        }

        return models;
    }

    /**
     *
     */
    async getBomPurposes():Promise<BomPurpose[]> {

        try{
            const response = await GOT(this.baseURL+"api/signatures/bompurposes");
            const raw = JSON.parse(response.body);

            if(raw.success && Array.isArray(raw.data)){
                return raw.data;
            }else{
                return [];
            }
        }catch (err){
            console.log(err.msg,err.stack);
            return [];
        }

    }

    /**
     *
     * @param pModelUID
     */
    async getAssuranceModel(pModelUID:string):Promise<AssuranceModel> {

        // prevent SSRF
        const safeModelUID = AssuranceModel.TYPE.getProperty('_uid').sanitize(pModelUID);

        const response = await GOT(this.baseURL+"api/signatures/model/"+safeModelUID.getValue());

        const raw = JSON.parse(response.body);

        if(raw.success){
            return AssuranceModel.fromJsonObject(raw.data);
        }else{
            return null;
        }
    }


    async getDeviceModels():Promise<DeviceModel[]> {

        const response = await GOT(this.baseURL+"api/devices/models/list");
        const raw = JSON.parse(response.body);
        const models:DeviceModel[] = [];

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

        if(raw.success){
            raw.data.map( x => {
                models.push( new DeviceModel(x));
            });
        }

        return models;
    }

    async find( pNodeType:number, pFilter:any):Promise<INode> {

        switch (pNodeType){
            case NodeInternalType.ASSURANCE_MODEL:
                const model =  await this.getAssuranceModel(pFilter._uid);
                model.updateControlTree(model.controls);
                return model;
                break;
            default:
                Logger.error("Node type is not supported by SignatureServer API.");
                return null;
        }
    }


    /**
     *
     */
    async listTrackerPurpose():Promise<TagCategory[]> {
        return [];
    }

    async listModelsByProduct(pProduct: ReversenseProductUUID):Promise<AssuranceModelPreview[]> {
        // prevent SSRF
        const safeUID =  ReversenseProduct.TYPE.getProperty("code").sanitize(pProduct);

        const response = await GOT(this.baseURL+"api/signatures/search/preview/by/scannerID/"+safeUID.getValue());

        const raw = JSON.parse(response.body);

        if(raw.success){
            return raw.data;
        }else{
            return [];
        }
    }
}