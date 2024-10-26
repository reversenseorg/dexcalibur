import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import {Device} from "../Device.js";
import WebServer, {HTTP_CODE_ERROR} from "../WebServer.js";
import DeviceManager from "../DeviceManager.js";
import FridaHelper from "../FridaHelper.js";
import {Router, Request, Response} from "express";
import * as Log from "../Logger.js";
import {IDbIndex} from "../persist/orm/DbAbstraction.js";
import DataScope from "../DataScope.js";
import * as _path_ from "path";
import ModelFile from "../ModelFile.js";
import {UserSession} from "../user/session/UserSession.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {DexcaliburProjectMap} from "../DexcaliburEngine.js";
import Util from "../Utils.js";
import Platform from "../platform/Platform.js";
import AccessControl from "../user/acl/AccessControl.js";
import {AccessZone} from "../user/acl/Zones.js";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol.js";
import * as _fs_ from "fs";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {TagManager} from "../tags/TagManager.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const ORG_WEB_API: DelegateWebApi = new DelegateWebApi();



ORG_WEB_API.addAuthenticatedRoute(
    '/ou/:uid',
    {
        'get':  (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{
                const data:any[] = [];
                const proj = $.context.getActiveProjects(req.dxc.sess.getUserAccount());

                for(const i in proj) data.push( proj[i].toJsonObject());
                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][PROJECT] List of actives projects cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "List of actives projects cannot be retrieved. Cause : "+err.message);
            }
        },
        'post': (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            // [EE] : On enterprise server, for multiple users, store active project into user session
            // [PE] : On professional, add auth but keep global active project
            // [CE] : On community ed, just change global active project
            let proj:DexcaliburProjectMap;
            let success = false;

            try{


                if(!req.body.hasOwnProperty('uid')
                    || (Util.isEmpty(req.body['uid'], Util.FLAG_WS | Util.FLAG_CR | Util.FLAG_TB))){
                    throw new Error("Invalid project UID.");
                }

                proj = $.context.getActiveProjects(req.dxc.sess.getUserAccount());
                for(const i in proj){
                    if(i===req.body.uid){
                        (req.dxc.sess as UserSession).setDefaultActiveProject(proj[i]);
                        success = true;
                        break;
                    }
                }


                if(success){
                    $.sendSuccess( res, {})
                }else{
                    throw DexcaliburProjectException.INVALID_NAME();
                }
            }catch(err){
                Logger.error("[API][PROJECT] Specified project cannot be set as default project. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "Specified project cannot be set as default project. Cause : "+err.message);
            }
        }
    }
)


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/list',
    {
        'get':  async (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{
                const data:any[] = [];
                const orgs = await $.context.orgMgr.listOrganizations(req.dxc.sess.getUserAccount());

                orgs.map( o => data.push( o.toJsonObject()));
                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][ORG] List of organizations cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "List of organizations cannot be retrieved. Cause : "+err.message);
            }
        }
    }
);

ORG_WEB_API.addAuthenticatedRoute(
    '/ou/create',
    {
        'post':  (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{
                const data:any[] = [];
                const proj = $.context.getActiveProjects(req.dxc.sess.getUserAccount());

                for(const i in proj) data.push( proj[i].toJsonObject());
                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][PROJECT] List of actives projects cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "List of actives projects cannot be retrieved. Cause : "+err.message);
            }
        }
    }
);



ORG_WEB_API.addAuthenticatedRoute(
    '/ou/org/:uid',
    {
        'put':  (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{
                const data:any[] = [];
                const proj = $.context.getActiveProjects(req.dxc.sess.getUserAccount());

                for(const i in proj) data.push( proj[i].toJsonObject());
                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][PROJECT] List of actives projects cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "List of actives projects cannot be retrieved. Cause : "+err.message);
            }
        },
        'delete':  (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{
                const data:any[] = [];
                const proj = $.context.getActiveProjects(req.dxc.sess.getUserAccount());

                for(const i in proj) data.push( proj[i].toJsonObject());
                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][PROJECT] List of actives projects cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "List of actives projects cannot be retrieved. Cause : "+err.message);
            }
        }
    }
);
