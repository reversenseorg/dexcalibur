import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR} from "../WebServer.js";
import * as Log from "../Logger.js";
import {UserSession} from "../user/session/UserSession.js";
import {DexcaliburProjectMap} from "../DexcaliburEngine.js";
import Util from "../Utils.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {OrganizationManager} from "../organization/OrganizationManager.js";
import { OrganizationUnit } from "@dexcalibur/dxc-orgs";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const ORG_WEB_API: DelegateWebApi = new DelegateWebApi();



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/:uid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{
                const data:any[] = [];
                //const org = await $.context.getOrgManager().getOrgUnit(req.dxc.sess.getUserAccount());

                //for(const i in proj) data.push( proj[i].toJsonObject());
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
                const orgs = await $.context.getOrgManager().listOrganizations(req.dxc.sess.getUserAccount());

                orgs.map( o => data.push( o.toJsonObject()));
                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][ORG] List of organizations cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "List of organizations cannot be retrieved. Cause : "+err.message);
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/create',
    {
        'post':  async (req:DelegateRequest, res:DelegateResponse):Promise<any>=>{

            const $:WebServer = req.dxc.$;

            try{
                const org = await $.context.getOrgManager().createOrganizations(
                    req.dxc.sess.getUserAccount(),
                    new OrganizationUnit(req.body));

                $.sendSuccess( res, org.toJsonObject());

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
