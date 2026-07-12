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

import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Tag, TagCategory} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "../core/IStringIndex.js";
import UT from "../Utils.js";



let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const TAG_MGT_WEB_API: DelegateWebApi = new DelegateWebApi();

TAG_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/categories',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse)=>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            const data = [];

            try{
                project = req.dxc.project;

                // ==== LOGIC

                const cats = await project.getTagManager().getCategories();

                cats.map( (vCat:TagCategory)=>{
                    data.push(vCat.toJsonObject());
                })

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][TAG MANAGER] Tag categories cannot be listed  : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        },
        'post': async (req:DelegateRequest, res:DelegateResponse)=>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            const data = [];

            try{
                project = req.dxc.project;

                // ==== LOGIC

                const unsafeCat = new TagCategory(req.body.category)

                await project.getTagManager().addCategory(unsafeCat);

                $.sendSuccess(res, {});
            }catch(err){
                Logger.error("[API][TAG MANAGER] Tag categories cannot be created  : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        },
        'put': async (req:DelegateRequest, res:DelegateResponse)=>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            const data = [];

            try{
                project = req.dxc.project;

                // ==== LOGIC

                const unsafeCat = new TagCategory(req.body.category)

                await project.getTagManager().updateCategory(unsafeCat);

                $.sendSuccess(res, {});
            }catch(err){
                Logger.error("[API][TAG MANAGER] Tag categories cannot be created  : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        },
        'delete': async (req:DelegateRequest, res:DelegateResponse)=>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            const data = [];

            try{
                project = req.dxc.project;

                // ==== LOGIC
                throw new Error("Operation forbidden");

                $.sendSuccess(res, {});
            }catch(err){
                Logger.error("[API][TAG MANAGER] Tag categories cannot be created  : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    }
);

TAG_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/tags',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse)=>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            const data = [];

            try{
                project = req.dxc.project;

                // ==== LOGIC
                let tags:Tag[];
                let filter:any = null;
                if(req.query.filter != null){
                    Logger.info("TAG API > GET /tag/tags > filter = "+(req.query.filter as string));
                    filter = JSON.parse(UT.b64_decode(req.query.filter as string));
                    tags = await project.getTagManager().searchTagsFromCache(filter.request,filter.options);
                }else{
                    tags = await project.getTagManager().getTags(true);
                }

                tags.map( (vTag:Tag)=>{
                    data.push(vTag.toJsonObject());
                })

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][TAG MANAGER] Tags cannot be listed : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        },
        'post': async (req:DelegateRequest, res:DelegateResponse)=>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            const data = [];

            try{
                project = req.dxc.project;

                // ==== LOGIC
                let unsafeTag:Tag = new Tag(req.body.data) ;

                let tag = await (project.getTagManager().getTag(req.body.data._uid));
                let cat = await (project.getTagManager().getCategoryByName(req.body.data.category));

                if(cat==null){
                    throw new Error("Invalid Tag Category");
                }

                if(tag != null){
                    tag.label = unsafeTag.label;
                    tag.descr = unsafeTag.descr;
                    tag.styles = unsafeTag.styles;
                    await (project.getTagManager().updateTag(tag));

                }else{
                    unsafeTag.category = cat;
                    tag = unsafeTag;
                    await (project.getTagManager().importTag(tag));
                }


                await project.getTagManager().refreshCache();

                $.sendSuccess(res, {});
            }catch(err){
                Logger.error("[API][TAG MANAGER] Tags cannot be imported/updated : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    },{
        readProject: true
    }
);


