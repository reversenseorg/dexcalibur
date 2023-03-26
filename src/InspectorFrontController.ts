import * as Express from 'express';

import DexcaliburProject from "./DexcaliburProject.js";
import {DelegateWebApi} from "./webapi/DelegateWebApi.js";


const HANDLER_TYPE = {
    GET: "get",
    POST: "post"
};

export enum IFC_TYPE {
    GET="get",
    POST="post",
    PUT="put",
    DEL="delete"
}

interface Handlers {
    [id :string] :Function
}

export default class InspectorFrontController
{
    ctx:DexcaliburProject = null;
    handlers:Handlers = {};
    webapi:DelegateWebApi = null;

    constructor() {

    }

    injectContext(context:DexcaliburProject):InspectorFrontController{
        this.ctx = context;
        return this;
    }

    hasHandler(type:IFC_TYPE):boolean{
        return this.handlers[type] instanceof Function;
    }

    registerHandler(type:IFC_TYPE, handler:any):void{
        this.handlers[type] = handler;
    }


    registerDelegateWebApi( pWebApi:DelegateWebApi):void{
        this.webapi = pWebApi;
    }

    performGet(req:Express.Request, res:Express.Response):any{
        if(this.handlers.get instanceof Function)
            return this.handlers.get(this.ctx, req, res);
        else
            return null;
    }

    performPost(req:Express.Request, res:Express.Response):any{
        if(this.handlers.post instanceof Function)
            return this.handlers.post(this.ctx, req, res);
        else
            return null;
    }
}
