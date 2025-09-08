import ModelResource from "../ModelResource.js";
import {DataLocation, DataLocationType} from "../DataLocation.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import ModelStringValue from "../ModelStringValue.js";


export interface PlistOptions {
    data?:any;
}

/**
 *
 */
export class PlistDocument {


    data:any = {};

    constructor(pOptions:any = {}) {
        if(pOptions.data!=null) this.data = pOptions.data;
    }

    getData(pKey:string):any {
        return this.data[pKey];
    }

    addPair(pKey: string, pData: any) {
        if(typeof pData==="string"){
            this.data[pKey] = new ModelStringValue({
                value: pData
            })
        }else{
            this.data[pKey] = pData;
        }
    }


    toModelResource( pLocation:Nullable<DataLocation> = null):ModelResource<any> {

        return new ModelResource({
            location: pLocation,
            _uid: null,
            //name: this.getLocalId(pUID),
            value: this.data
        });
    }
}