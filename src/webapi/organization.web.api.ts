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
        'put': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $:WebServer = pReq.dxc.$;

            try{
                $.sendSuccess(
                    pRes,
                    await $.context.getOrgManager().updateOrganization(
                        pReq.session.passport.user,
                        new OrganizationUnit({
                            name: pReq.body.name,
                            description: pReq.body.description,
                            companyName: pReq.body.companyName,
                        })
                    )
                );
            }catch(err){
                Logger.error("[API][PROJECT] Specified project cannot be set as default project. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, "Specified project cannot be set as default project. Cause : "+err.message);
            }
        },
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
                $.sendError(res, "List of organizations cannot be retrieved.", {cause:err.message});
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/create',
    {
        'post':  async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{

            const $:WebServer = pReq.dxc.$;

            try{
                const org = await $.context.getOrgManager().createOrganizations(
                    pReq.session.passport.user,
                    new OrganizationUnit({
                        name: pReq.body.name,
                        description: pReq.body.description,
                        companyName: pReq.body.companyName,
                    }));

                $.sendSuccess( pRes, org.toJsonObject());

            }catch(err){
                Logger.error("[API][ORG] Organization unit cannot be created : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, "Organization unit cannot be created. ", {cause:err.message });
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


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/sso/conf/test',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{
            const $:WebServer = pReq.dxc.$;

            try{
                const result = await $.context.getOrgManager().testSsoConnection(
                    pReq.session.passport.user,
                    {
                       clientId: pReq.body.clientId,
                        clientSecret: pReq.body.clientSecret,
                        discoverUri: pReq.body.discoverUri,
                    });

                $.sendSuccess( pRes, { conn: result });

            }catch(err){
                Logger.error("[API][ORG] Organization Identity provider unreachable : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, "Organization Identity provider unreachable. ", {cause:err.message });
            }
        }
    }
);

