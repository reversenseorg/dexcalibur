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
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import DataScope from "../DataScope.js";
import * as _path_ from "path";
import ModelFile from "../ModelFile.js";
import DexcaliburProject from "../DexcaliburProject.js";
import * as path from "path";
import {IDbCollection} from "@reversense/dexcalibur-orm";
import Util from "../Utils.js";
import {ConnectionFactory} from "../organization/conn/ConnectionFactory.js";
import {ConnectionProtocol} from "../organization/conn/Connection.js";
import {ORG_WEB_API} from "./organization.web.api.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {MerlinSearchRequest} from "../search/MerlinSearchRequest.js";
import {MerlinSearchRequestException} from "../search/error/MerlinSearchRequestException.js";
import ModelMethod from "../ModelMethod.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const APP_WEB_API: DelegateWebApi = new DelegateWebApi("APP");


/**
 * /api/application/cmp?type=[dex|ks|libs|strings] ...
 */
APP_WEB_API.addAsyncAuthenticatedRoute(
    '/cmp',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {


            try{
                if(req.dxc.project == null){
                    throw new Error("Project UID is missing or you have not right privileges.")
                }

                req.dxc.$.sendSuccess( res, req.dxc.project.find.provider('name:/.*/').toJsonObject());
                /*
                res.status(HTTP_CODE_SUCCESS).send(JSON.stringify({
                    success: true,
                    data: $.project.find.provider('name:.*').toJsonObject()
                }));*/
            }catch(err){

                req.dxc.$.sendError( res, err.message);
                /*res.status(HTTP_CODE_ERROR).send(JSON.stringify({
                    success: false,
                    msg: err.message
                }));*/
            }


        }
    }

);


APP_WEB_API.addAsyncAuthenticatedRoute(
    '/package/content',
    {
        'get': async function(req:DelegateRequest, res:DelegateResponse):Promise<any> {


            const $:WebServer = req.dxc.$;
            let proj:DexcaliburProject = null;

            const data:any[] = [];
            let target = "";
            let unsafeNomalizedPath:string = null;


            try{
                if(req.dxc.project == null){
                    throw new Error("Project cannot be opened");
                }

                proj = req.dxc.project;
                const SCOPE:DataScope = proj.dataAnalyzer.getScope('PKG');

                if(req.query.path!=null && req.query.path!="null"){

                    unsafeNomalizedPath = Util.trim(_path_.normalize(req.query.path as string));
                    if((unsafeNomalizedPath!='.') && (unsafeNomalizedPath !== req.query.path)){
                        throw new Error('[SECURITY] Path traversal is not allowed. ');
                    }

                    if(/^\.+$/.test(unsafeNomalizedPath)){
                        unsafeNomalizedPath = _path_.sep;
                    }
                    else if (unsafeNomalizedPath[0]!=_path_.sep){
                        unsafeNomalizedPath = _path_.sep+unsafeNomalizedPath;
                    }

                    target = unsafeNomalizedPath;

                }else{
                    target = ".";//_path_.sep;//SCOPE.getBasePath();
                }

                const files:IDbCollection = await proj.dataAnalyzer.getIndex('PKG');

                files.map( (vOffset:number, vFile:ModelFile)=>{
                    //Logger.info(vFile.getRelativePath()+" =?= "+target+" > "+vFile.hasRelDir(target));
                    if(vFile.hasRelDir(target)){
                        data.push({ _uid: vFile.getUID(), n:vFile.getName(), _r:vFile.getRelativePath(),  _t: vFile._d, t:vFile.getType() });
                    }
                });

                $.sendSuccess( res, data);
            }catch(err){
                Logger.error("[API][APP] Package content cannot be read : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "Package content cannot be read ");
            }
        }
    }
);



APP_WEB_API.addAsyncAuthenticatedRoute(
    '/au/:aid/info',
    {
        'get': async function(pReq:DelegateRequest, pRes:DelegateResponse):Promise<any> {
            const $:WebServer = pReq.dxc.$;

            try{
                const app = await $.context.getOrgManager().getDirectApplication(
                    (pReq as any).user,
                    pReq.params.aid
                );

                $.sendSuccess(
                    pRes,
                    app.toJsonObject()
                );
            }catch(err){

                $.sendErrorAfterException(
                    pRes, APP_WEB_API.name,
                    "Details about Application Unit cannot be retrieved from organization.",
                    err,{cause:err.message});
            }
        }
    }
);


APP_WEB_API.addAsyncAuthenticatedRoute(
    '/au/:aid/store/download',
    {
        'post': async function(pReq:DelegateRequest, pRes:DelegateResponse):Promise<any> {
            const $:WebServer = pReq.dxc.$;

            try{
                const app = await $.context.getOrgManager().getDirectApplication(
                    (pReq as any).user,
                    pReq.body.aid
                );

                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    app.orgUnit
                );

                // download from store and upload to DB
                const upl = await $.context.getOrgManager().downloadApp(
                    pReq.user, org, app, pReq.body.cid
                );

                // gather extra data from store
                
                $.sendSuccess(
                    pRes, { download: upl.map(x => x.getUID()) }
                );
            }catch(err){

                $.sendErrorAfterException(
                    pRes, APP_WEB_API.name,
                    "Details about Application Unit cannot be retrieved from organization.",
                    err,{cause:err.message});
            }
        }
    }
);





APP_WEB_API.addAsyncAuthenticatedRoute(
    '/au/:aid/store/info/:upload_id',
    {
        'post': async function(pReq:DelegateRequest, pRes:DelegateResponse):Promise<any> {
            const $:WebServer = pReq.dxc.$;

            try{
                const app = await $.context.getOrgManager().getDirectApplication(
                    (pReq as any).user,
                    pReq.params.aid
                );

                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    app.orgUnit
                );


                const res = await $.context.getWebserver()
                                                        .uploader.getResource(
                                                            pReq.params.upload_id);

                if(res==null){
                    throw new Error("Uploaded resource not found");
                }

                // gather extra data from store

                $.sendSuccess(
                    pRes, { info: await $.context.getOrgManager().extractInfo(res, app.os) }
                );
            }catch(err){

                $.sendErrorAfterException(
                    pRes, APP_WEB_API.name,
                    "Details about Application Unit cannot be retrieved from organization.",
                    err,{cause:err.message});
            }
        }
    }
);


APP_WEB_API.addAsyncAuthenticatedRoute(
    '/scan',
    {
        'post': async (pReq:DelegateRequest, res:DelegateResponse) => {
            const $:WebServer = pReq.dxc.$;
            let project:DexcaliburProject = null;
            try{
                if(pReq.body['project']!=null){
                    project = $.context.getActiveProjects(pReq.dxc.sess.getUserAccount())[pReq.body['project']];
                }else if(pReq.dxc.project != null){
                    project = pReq.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                if(pReq.body.obj==null || pReq.body.obj.__==null || pReq.body.obj._uid==null){
                    throw new Error("Invalid object to scan");
                }


                if(!project.isReady()){
                    project = (await $.context.getProjectManager().preloadForDirect(pReq.user, pReq.params.pid));
                }

                // get object
                const result = (await (MerlinSearchRequest.getByRef({
                    __: parseInt(pReq.body.obj.__,10),
                    _uid: pReq.body.obj._uid
                },project.getMerlinEngine() )).executePDB(project));

                if(result==null || result.count()==0){
                    throw MerlinSearchRequestException.NODE_NOT_FOUND(
                        parseInt(pReq.body.obj.__,10),
                        Util.decodeURI(Util.b64_decode(pReq.body.obj._uid))
                    )
                }

                if(/^[a-zA-Z0-9]+\.[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/.test(pReq.body.evt)===false){
                    throw new Error("Invalid scan type");
                }

                const wf = await project.getContext().getProjectManager().createWorkflow(
                    pReq.user.getUID(),
                    (project.getContext().getNodeUUID()!=null? project.getContext().getNodeUUID() : null),
                    project.getUID(),
                    "sod", // scan on demand
                    true
                );

                project.trigger({
                    type: pReq.body.evt,
                    data: {
                        obj: result.get(0),
                        wf: wf
                    }
                });

                $.sendSuccess( res, { wf: wf.getUID() });
            }catch(err){
                $.sendErrorAfterException(
                    res, APP_WEB_API.name,
                    "Cannot scan the specified object.",
                    err,{cause:err.message});
            }
        }
    }
);