
import got, {Options} from "got";
const GOT = got.default;

import DexcaliburEngine from "../DexcaliburEngine.js";
import {Nullable} from "./IStringIndex.js";

export interface HttpClientOptions {
    host?:string;
    ssl?:string;
    port?:string;
    ctx?:DexcaliburEngine;
}

export class HttpClient {

    options:HttpClientOptions;
    baseURL:string;

    constructor(pOptions:HttpClientOptions) {
        this.options = pOptions;
        this.baseURL = "http"+(pOptions.ssl?'s':'')+'://'+this.options.host+':'+this.options.port+'/';
    }

    perform(pUri:string,pOptions:any = null,pMethod:string = 'GET'):Promise<any>{
        if(pOptions!=null){
            return GOT(this.baseURL+pUri, pOptions);
        }else{
            return GOT(this.baseURL+pUri);
        }
    }
}