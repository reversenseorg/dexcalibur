/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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
