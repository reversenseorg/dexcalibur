import WebServer from "../WebServer.js";
import {Request, Response, Router} from "express";

import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {UserSession} from "../user/session/UserSession.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export enum HTTP_VERB {
    GET="get",
    POST="post",
    DEL="del",
    PUT="put"
}

export interface DelegateRequest extends Request {
    dxc: {
        project?: DexcaliburProject,
        $?: WebServer,
        sess?:UserSession,
        filt?:any
    }
}


export interface AuthenticatedRouteOptions {
    async?:boolean;
    readProject?:boolean;
    readProjectStrict?:boolean;
}

export interface DelegateResponse extends Response {

}

export interface RequestHandlers {
    [type: string] :((pReq:DelegateRequest,pRes:DelegateResponse)=>void)
}

/**
 * To create a delegate web API.
 *
 * It helps to separate API endpoints implementation into several files,
 * and define some access control per endpoints
 *
 * @class
 */
export class DelegateWebApi
{
    /**
     * The webserver instance where routes of  the endpoint are registered
     *
     * @type {WebServer}
     * @public
     * @field
     */
    srv: WebServer;

    /**
     * The Express router instance holding every routes of the current endpoint
     *
     */
    router: Router;
    private _l:any = null;

    constructor() {
        // @ts-ignore
        this.router = new Router();
    }

    /**
     * To perform check if the current session is valid, get user info and retrieve active project
     * instance
     *
     * @param pRequest {Request} HTTP Request
     * @param pWebServer {WebServer} WebServer instance
     * @return {DexcaliburProject} Active dexcalibur project requested by user
     * @method
     * @public
     */
    doProjectSecurityChecks( pRequest:DelegateRequest, pWebServer:WebServer, pOptions:AuthenticatedRouteOptions):DexcaliburProject {

        if (pRequest.dxc == null || !pWebServer.context.getUserService().verifySession(pRequest.dxc.sess)) {
            throw AuthenticationException.AUTHENTICATION_FAILED();
        }

        let project = null;

        if(pRequest.body['project']!=null){
            project = pWebServer.context.getActiveProjects(pRequest.dxc.sess.getUserAccount())[pRequest.body['project']];
        }else if(pRequest.dxc.project != null){
            project = pRequest.dxc.project;
        }

        if(pOptions.readProjectStrict && (project == null || !project.isReady()) ) {
            throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
        }

        return project;
    }

    onInject( pCallback:any ) {
        this._l = pCallback;
    }

    injectServer( pWebserver: WebServer):void {
        this.srv = pWebserver;
        if(this._l != null){
            (this._l)(this, WebServer);
        }
    }

    getRouter():Router {
        return this.router;
    }


    addAsyncPublicRoute( pRoute:string, pHandlers:any, pOptions:any = {} ):void{
        if(pOptions==null) pOptions = {};
        pOptions.async = true;
        this.addPublicRoute( pRoute, pHandlers, true);
    }

    addPublicRoute( pRoute:string, pHandlers:any, pOptions:any = {async:false}  ):void {
        let self = this;
        for(let httpVerb in pHandlers){

            if(pOptions.async){
                this.router[httpVerb](pRoute, async function(req:DelegateRequest, res:DelegateResponse):Promise<any> {
                    req.dxc.$ = self.srv;
                    return  await pHandlers[httpVerb](req, res);
                });
            }else{
                this.router[httpVerb](pRoute, function(req:DelegateRequest, res:DelegateResponse):any {
                    req.dxc.$ = self.srv;
                    return pHandlers[httpVerb](req, res);
                });
            }

        }
    }

    /**
     *
     * @param pRoute
     * @param pHandlers
     * @param pOptions
     */
    addAsyncAuthenticatedRoute( pRoute:string, pHandlers:any, pOptions:any = {} ):void{
        if(pOptions==null) pOptions = {};
        pOptions.async = true;
        this.addAuthenticatedRoute( pRoute, pHandlers, pOptions);
    }

    addAuthenticatedRoute(
        pRoute:string,
        pHandlers:RequestHandlers,
        pOptions:AuthenticatedRouteOptions = {
            async:false,
            readProjectStrict:true
        }
    ):void {
        const self = this;
        for(let httpVerb in pHandlers){
            if(pOptions.async){
                this.router[httpVerb](pRoute, async function(req:DelegateRequest, res:DelegateResponse):Promise<any> {
                    req.dxc.$ = self.srv;
                    try{
                        if(self.srv.context.getUserService().verifySession(req.dxc.sess)){
                            if(pOptions.readProject){
                                req.dxc.project = self.doProjectSecurityChecks(req, self.srv, pOptions);
                            }
                            pHandlers[httpVerb](req, res);
                        }else{
                            self.srv.sendError( res, "Authentication is required. Incident has been saved.");
                        }
                    }catch(err){
                        self.srv.sendError( res, "Authentication failed : "+err.message);
                    }
                });
            }else{
                this.router[httpVerb](pRoute, function(req:DelegateRequest, res:DelegateResponse):any {
                    req.dxc.$ = self.srv;
                    try{
                        if(self.srv.context.getUserService().verifySession(req.dxc.sess)){
                            if(pOptions.readProject){
                                req.dxc.project = self.doProjectSecurityChecks(req, self.srv, pOptions);
                            }
                            pHandlers[httpVerb](req, res);
                        }else{
                            self.srv.sendError( res, "Authentication is required. Incident has been saved.");
                        }
                    }catch(err){
                        self.srv.sendError( res, "Authentication failed : "+err.message);
                    }
                });
            }
        }
    }
/*
    addRestrictedRoute( pRoute:string, pAccess:Access[], pHandlers:any ):void {
        for(let httpVerb in pHandlers){
            this.router[httpVerb](async function(req:DelegateRequest, res:DelegateResponse):Promise<any> {
                try{
                    if(this.srv.context.getUserService().verifySession(req.dxc.sess)){
                        AccessControl.check(
                            AccessZone.PROJECT,
                            ProjectAccessControl.access.SETTINGS_EDIT,
                            unsafe_UID,
                            req.dxc.sess
                        );

                        pHandlers[httpVerb](this, req, res);
                    }else{
                        this.srv.sendError( res, "Authentication is required. Incident has been saved.");
                    }
                }catch(err){
                    this.srv.sendError( res, "Authentication failed : "+err.message);
                }
            });
        }
    }
*/

}