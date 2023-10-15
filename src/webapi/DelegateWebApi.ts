import WebServer from "../WebServer.js";
import {Request, Response, Router} from "express";

import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {UserSession} from "../user/session/UserSession.js";

import passport from 'passport';
import {IStringIndex} from "../core/IStringIndex.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export enum HTTP_VERB {
    GET="get",
    POST="post",
    DEL="del",
    PUT="put"
}


export interface ExtraMiddlewareOptions {
    afterAuth:any[],
    beforeAuth:any[],
    public:any[]
    auth?:any
}

export interface RoutePrototype {
    authenticated:boolean;
    route: string;
    middleware?: any[];
    callback: (req:DelegateRequest, res:DelegateResponse, next:any)=>any;
    async?:boolean;
}

export interface RouterPrototype extends IStringIndex<RoutePrototype[]> {
    [httpVerb:string]: RoutePrototype[]
}

export interface DelegateRequest extends Request {
    dxc: {
        project?: DexcaliburProject,
        $?: WebServer,
        sess?:UserSession,
        filt?:any
    },
    session?:any;
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


    private _routerProto:RouterPrototype = {};

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

        if(pOptions.readProjectStrict ) {
            if(project == null && (pRequest.body.project==null && pRequest.query._puid==null )){
                throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
            }
            else if (project == null || !project.isReady()){
                throw DexcaliburProjectException.PROJECT_NOT_READY(pRequest.body['project']);
            }

        }

        return project;
    }

    onInject( pCallback:any ) {
        this._l = pCallback;
    }

    setAuthenticateMiddleware(pAuthMiddle:any){
        this.ensureLoggedIn = pAuthMiddle;
    }

    injectServer( pWebserver: WebServer, pBaseRoute:string = "", pOptions:ExtraMiddlewareOptions = {afterAuth:[], beforeAuth:[], public:[], auth:null } ):void {
        this.srv = pWebserver;
        if(this._l != null){
            (this._l)(this, WebServer);
        }

        const authMiddleW = pOptions.beforeAuth.concat([pOptions.auth!=null ? pOptions.auth : this.ensureLoggedIn]).concat(pOptions.afterAuth);
        const publicMiddleW = pOptions.public;

        if(Object.keys(this._routerProto).length>0){
            for(let verb in this._routerProto){
                this._routerProto[verb].map((vProto)=>{

                    console.log("Register "+(vProto.authenticated? 'authenticated':'public')+" route : "+pBaseRoute+vProto.route+"     :"+verb);
                    if(vProto.authenticated){
                        this.srv.app[verb].apply(this.srv.app, [pBaseRoute+vProto.route].concat(authMiddleW).concat([vProto.callback] as any));
                    }else{
                        this.srv.app[verb].apply(this.srv.app,  [pBaseRoute+vProto.route].concat(publicMiddleW).concat([vProto.callback] as any));
                    }

                    /*
                    if(vProto.async){
                        this.srv.app[verb].call(this.srv.app, [
                            vProto.route,
                            this._ensureAuthenticated,
                            vProto.callback
                        ]);
                    }else{

                        this.srv.app[verb].call(this.srv.app, [
                            vProto.route,
                            this._ensureAuthenticated,
                            vProto.callback
                        ]);
                    }*/

                })


            }
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

            if(this._routerProto[httpVerb] == null) this._routerProto[httpVerb] = [];

            if(pOptions.async){
                this._routerProto[httpVerb].push({
                    route: pRoute,
                    authenticated: false,
                    async: true,
                    callback: async function(req:DelegateRequest, res:DelegateResponse):Promise<any> {
                        req.dxc.$ = self.srv;
                        return  await pHandlers[httpVerb](req, res);
                    }
                });
            }else{
                this._routerProto[httpVerb].push({
                    route: pRoute,
                    authenticated: false,
                    async: false,
                    callback: function(req:DelegateRequest, res:DelegateResponse):any {
                        req.dxc.$ = self.srv;
                        return pHandlers[httpVerb](req, res);
                    }
                });
            }

        }
    }

    addPublicRoute2( pRoute:string, pHandlers:any, pOptions:any = {async:false}  ):void {
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

    ensureLoggedIn = (req, res, next) => {
            if (req.isAuthenticated()) {
            return next();
        }

        res.redirect('/login')
    };

    _ensureAuthenticated(req, res, next){
        if (req.isAuthenticated()) {
            return next();
        }

        res.redirect('/login')

        //return (this.ensureLoggedIn)(req,res,next);
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

            if(this._routerProto[httpVerb] == null) this._routerProto[httpVerb] = [];

            if(pOptions.async) {
                this._routerProto[httpVerb].push({
                    route: pRoute,
                    authenticated: true,
                    async: true,
                    callback: function (req: DelegateRequest, res: DelegateResponse): Promise<any> {

                        //req.dxc.$ = self.srv;
                        try {
                            //if(self.srv.hasSsoAuthentication()){
                            //console.log(req.originalUrl+" : is Autenticated ? "+(req as any).isAuthenticated())

                            /*if(req.session!=null && req.session.user!=null && req.session.user.dxc != null){
                                req.dxc = (req.session as any).user.dxc;
                                req.dxc.$ = self.srv;
                            }else{
                                console.log("SSO : Request is not authenticated. Exit");
                                throw new Error("SSO Error");
                            }
                            //}*/

                            if (self.srv.context.getUserService().verifySession(req.dxc.sess)) {
                                if (pOptions.readProject) {
                                    req.dxc.project = self.doProjectSecurityChecks(req, self.srv, pOptions);
                                }
                                pHandlers[httpVerb](req, res);
                            } else {
                                req.dxc.$.sendError(res, "Authentication is required. Incident has been saved.");
                            }
                        } catch (err) {
                            req.dxc.$.sendError(res, "Authentication failed : " + err.message);
                        }

                        return;
                    }
                });

            }else{
                this._routerProto[httpVerb].push({
                    route: pRoute,
                    authenticated: true,
                    async: false,
                    callback:function(req:DelegateRequest, res:DelegateResponse, next:any):any {

                        try{
                            //if(self.srv.hasSsoAuthentication()){
                            console.log(req.originalUrl+" : is Autenticated ? "+(req as any).isAuthenticated())
                            console.log(req.dxc);

                            /*
                            if(req.session?.passport?.user?.dxc != null){
                                req.dxc = (req.session as any).passport.user.dxc;
                                req.dxc.$ = self.srv;
                            }else{
                                console.log("SSO : Request is not authenticated. Exit");
                                throw new Error("SSO Error");
                            }
                            //}*/

                            if(self.srv.context.getUserService().verifySession(req.dxc.sess)){
                                if(pOptions.readProject){
                                    req.dxc.project = self.doProjectSecurityChecks(req, self.srv, pOptions);
                                }
                                pHandlers[httpVerb](req, res);
                            }else{
                                req.dxc.$.sendError( res, "Authentication is required. Incident has been saved.");
                            }
                        }catch(err){
                            req.dxc.$.sendError( res, "Authentication failed : "+err.message);
                        }
                    }
                });
            }
        }
    }

    /*

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
                this.router[httpVerb](
                    pRoute,
                    self._ensureAuthenticated,
                    function(req:DelegateRequest, res:DelegateResponse):Promise<any> {

                        req.dxc.$ = self.srv;
                        try{
                            console.log("SSO is Enabled: ",self.srv.hasSsoAuthentication());
                            if(self.srv.hasSsoAuthentication()){

                                if(req.dxc.sess._must_set_cookie){
                                    res.cookie(
                                        self.srv.context.getUserService().getCookieName(),
                                        req.dxc.sess.getSessUID(),
                                        { maxAge: 7*24*60} //, expires: 0  }
                                    );
                                    req.dxc.sess._must_set_cookie = false;
                                }

                                if(!(req as any).isAuthenticated()){
                                    console.log("SSO : Request is authenticated. Owner = ",req.dxc.sess);
                                }else{
                                    console.log("SSO : Request is NOT authenticated. Exit");
                                    throw new Error("SSO Error");
                                }
                            }
                            if(!req.dxc.sess._must_set_cookie && self.srv.context.getUserService().verifySession(req.dxc.sess)){
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

                        return;
                    });
            }else{
                this.router[httpVerb](
                    pRoute,
                    self._ensureAuthenticated,
                    function(req:DelegateRequest, res:DelegateResponse, next:any):any {

                        req.dxc.$ = self.srv;
                        try{

                            console.log("SSO is Enabled: ",self.srv.hasSsoAuthentication());
                           if(self.srv.hasSsoAuthentication()){

                               console.log(req.originalUrl+" : is Autenticated ? "+(req as any).isAuthenticated())
                               console.log((req as any).session,req);

                                //passport.authenticate('openidconnect', { failureRedirect:'/login' })(req,res);

                                if(req.dxc?.sess?._must_set_cookie){
                                    res.cookie(
                                        self.srv.context.getUserService().getCookieName(),
                                        req.dxc.sess.getSessUID(),
                                        { maxAge: 7*24*60} //, expires: 0  }
                                    );
                                    req.dxc.sess._must_set_cookie = false;
                                }

                                if(!(req as any).isAuthenticated()){
                                    console.log((req as any).dxc.sess);
                                    console.log((req as any).session);
                                    console.log("SSO : Request is authenticated. Owner = ");
                                }else{
                                    console.log("SSO : Request is NOT authenticated. Exit");
                                    throw new Error("SSO Error");
                                }
                            }
                            if(!req.dxc.sess._must_set_cookie && self.srv.context.getUserService().verifySession(req.dxc.sess)){
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