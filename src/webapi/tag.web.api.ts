import {DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {TagCategory} from "../tags/TagCategory.js";
import {Tag} from "../tags/Tag.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const TAG_MGT_WEB_API: DelegateWebApi = new DelegateWebApi();

TAG_MGT_WEB_API.addAuthenticatedRoute(
    '/categories',
    {
        'get': async (req:Request, res:Response)=>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            const data = [];

            try{
                project = req.dxc.project;

                // ==== LOGIC
                project.getTagManager().getCategories().map( (vCat:TagCategory)=>{
                    data.push(vCat.toJsonObject());
                })

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][TAG MANAGER] Tag categories cannot be listed  : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    },{
        readProject: true
    }
);

TAG_MGT_WEB_API.addAuthenticatedRoute(
    '/tags',
    {
        'get': async (req:Request, res:Response)=>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            const data = [];

            try{
                project = req.dxc.project;

                // ==== LOGIC
                project.getTagManager().getTags().map( (vTag:Tag)=>{
                    data.push(vTag.toJsonObject());
                })

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][TAG MANAGER] Tags cannot be listed : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    },{
        readProject: true
    }
);


