import WebServer from "../WebServer.js";
import {Request, Response, Router} from "express";

import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {UserSession} from "../user/session/UserSession.js";

import passport from 'passport';
import {IStringIndex} from "../core/IStringIndex.js";
import {EngineNode} from "../core/EngineNode.js";
import {DexcaliburEngineMode} from "../DexcaliburEngine.js";

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
     * @throws {AuthenticationException | DexcaliburProjectException}
     * @method
     * @public
     */
    doProjectSecurityChecks( pRequest:DelegateRequest, pWebServer:WebServer, pOptions:AuthenticatedRouteOptions):DexcaliburProject {


        Logger.debug("[AUTH ROUTE] doProjectSecurityChecks : check session, project & authorizations ");

        if (pRequest.dxc == null || !pWebServer.context.getUserService().verifySession(pRequest.dxc.sess)) {
            throw AuthenticationException.AUTHENTICATION_FAILED();
        }

        let project = null;
        let activeProjects = pWebServer.context.getActiveProjects(pRequest.dxc.sess.getUserAccount());

        // TODO : check authorization

        let insecureProjectUID:string;
        if(pRequest.body['project']!=null){
            insecureProjectUID = pRequest.body['project'];
        }else if(pRequest.query['_puid']!=null){
            insecureProjectUID = pRequest.query['_puid'] as string;
        }

        if(Object.keys(activeProjects).indexOf(insecureProjectUID)>-1){
            project = activeProjects[insecureProjectUID];
        }
        else if(pRequest.dxc.project != null){
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

                    Logger.debug("Register "+(vProto.authenticated? 'authenticated':'public')+" route : "+pBaseRoute+vProto.route+"     :"+verb);
                    if(vProto.authenticated){
                        this.srv.app[verb].apply(this.srv.app, [pBaseRoute+vProto.route].concat(authMiddleW).concat([vProto.callback] as any));
                    }else{
                        this.srv.app[verb].apply(this.srv.app,  [pBaseRoute+vProto.route].concat(publicMiddleW).concat([vProto.callback] as any));
                    }

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


    /**
     * A public route is authenticated but not restricted by other attributes such as project UID
     * @param pRoute
     * @param pHandlers
     * @param pOptions
     */
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
                        let insecureProjectUID:string = null;
                        if(httpVerb=='get'){
                            insecureProjectUID = req.query['_puid'] as string;
                        }else{
                            insecureProjectUID = req.body['_puid'];
                        }

                        let nodes:EngineNode[] = [];
                        req.dxc.$ = self.srv;
                        if(insecureProjectUID!=null){
                            nodes = self.srv.context.nodeManager.getNodeByProject(insecureProjectUID);
                            if(nodes.length>0){
                                return await self.srv.context.nodeManager.forwardWebRequest(nodes[0], self.srv,  req, res);
                            }
                        }

                        return  await pHandlers[httpVerb](req, res);
                    }
                });
            }else{
                this._routerProto[httpVerb].push({
                    route: pRoute,
                    authenticated: false,
                    async: false,
                    callback: function(req:DelegateRequest, res:DelegateResponse):any {

                        let insecureProjectUID:string = null;
                        if(httpVerb=='get'){
                            insecureProjectUID = req.query['_puid'] as string;
                        }else{
                            insecureProjectUID = req.body['_puid'];
                        }

                        let nodes:EngineNode[] = [];
                        req.dxc.$ = self.srv;
                        if(insecureProjectUID!=null){
                            nodes = self.srv.context.nodeManager.getNodeByProject(insecureProjectUID);
                            if(nodes.length>0){
                                return nodes[0].forwardWebRequest(self.srv, req, res);
                            }
                        }

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
                    callback: async function (req: DelegateRequest, res: DelegateResponse): Promise<any> {

                        let nodes:EngineNode[] = [];
                        try {

                            Logger.debug("[AUTH ROUTE | ASYNC] Process request : verify session ");
                            // verify if user is authenticated, and user session has been successfully retrieved
                            if (self.srv.context.getUserService().verifySession(req.dxc.sess)) {

                                Logger.debug("[AUTH ROUTE | ASYNC] Process request : check project & authorizations ");

                                // check if the REST endpoint need to read project data
                                // else `req.dxc.project` will be null
                                if(pOptions.readProject){
                                    // check if the user is authorized to access to this project
                                    req.dxc.project = self.doProjectSecurityChecks(req, self.srv, pOptions);

                                    // node are linked to a project, so
                                    if(req.dxc.project==null){
                                        throw new Error("[ERROR] Project cannot be restored for user [user="+req.dxc.sess.getUserAccount().getUID()+"]")
                                        //nodes = self.srv.context.nodeManager.getNodeByProject(req.dxc.project.getUID());

                                    }


                                    if(self.srv.context.engine_type==DexcaliburEngineMode.MASTER){

                                        console.log(req.dxc.project.getUID());
                                        console.log(req.dxc.project);
                                       // nodes = self.srv.context.nodeManager.getNodeByProject(req.query.uid as string);
                                        nodes = self.srv.context.nodeManager.getNodeByProject(req.dxc.project.getUID());

                                        if(nodes.length==0){
                                            let node = self.srv.context.nodeManager.createNode(req.dxc.project.getUID())
                                            await node.spawn(
                                                "Request cannot be forwarded, because this project is not linked to a node",
                                                true
                                            );
                                            nodes.push(node);
                                        }
                                    }
                                }else{
                                    req.dxc.project = null;
                                }

                                // if the userAccount is authorized to access to this project, then continue to
                                // process the resquest.
                                // If the server is running in standalone mode, the request is processed immediately
                                // else the request is forwarded to the webserver instance of the node instance
                                // associated to requested project

                                if(nodes.length>0){
                                    self.srv.context.nodeManager.forwardWebRequest(nodes[0], self.srv, req, res);
                                }else{
                                    Logger.debug("[AUTH ROUTE | ASYNC] Process request");
                                    pHandlers[httpVerb](req, res);
                                }
                            } else {
                                Logger.debug("[AUTH ROUTE | ASYNC] Authentication is required. Incident has been saved.")
                                req.dxc.$.sendError(res, "Authentication is required. Incident has been saved.");
                            }
                        } catch (err) {
                            Logger.debug("[AUTH ROUTE | ASYNC] Authentication failed : " + err.message)
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

                        let nodes:EngineNode[] = [] ;
                        try{
                            //if(self.srv.hasSsoAuthentication()){
                            //console.log(req.originalUrl+" : is Autenticated ? "+(req as any).isAuthenticated())
                            //console.log(req.dxc);

                            /*
                            if(req.session?.passport?.user?.dxc != null){
                                req.dxc = (req.session as any).passport.user.dxc;
                                req.dxc.$ = self.srv;
                            }else{
                                console.log("SSO : Request is not authenticated. Exit");
                                throw new Error("SSO Error");
                            }
                            //}*/

                            Logger.debug("[AUTH ROUTE | SYNC] Process request : verify session ");
                            if(self.srv.context.getUserService().verifySession(req.dxc.sess)){

                                Logger.debug("[AUTH ROUTE | SYNC] Process request : check project & authorizations ");

                                if(pOptions.readProject){
                                    req.dxc.project = self.doProjectSecurityChecks(req, self.srv, pOptions);
                                    if(req.dxc.project!=null){
                                        nodes = self.srv.context.nodeManager.getNodeByProject(req.dxc.project.getUID());
                                    }
                                }

                                // if the userAccount is authorized to access to this project, then continue to
                                // process the resquest.
                                // If the server is running in standalone mode, the request is processed immediately
                                // else the request is forwarded to the webserver instance of the node instance
                                // associated to requested project

                                if(nodes.length>0){
                                    self.srv.context.nodeManager.forwardWebRequestSync(nodes[0], self.srv, req, res);
                                }else{
                                    pHandlers[httpVerb](req, res);
                                }
                            }else{
                                req.dxc.$.sendError( res, "[AUTH ROUTE | SYNC] Authentication is required. Incident has been saved.");
                            }
                        }catch(err){
                            req.dxc.$.sendError( res, "[AUTH ROUTE | SYNC] Authentication failed : "+err.message);
                        }
                    }
                });
            }
        }
    }
}