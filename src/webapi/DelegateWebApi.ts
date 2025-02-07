import WebServer from "../WebServer.js";
import {Request, Response, Router} from "express";

import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {UserSession} from "../user/session/UserSession.js";
import {IStringIndex} from "../core/IStringIndex.js";
import {EngineNode, NodePurpose} from "../core/EngineNode.js";
import {DexcaliburEngineMode} from "../DexcaliburEngine.js";
import {UserAccount} from "../user/UserAccount.js";
import {EngineNodeManager, NodeState} from "../core/EngineNodeManager.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {ProjectManagerException} from "../errors/ProjectManagerException.js";

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
    project?:DexcaliburProject,
    session?:any;
    user?:UserAccount;
}


/**
 * @deprecated
 */
export interface AuthenticatedRouteOptions {
    // ok
    async?:boolean;
    lazyProject?:boolean;
    // deprecated
    readProject?:boolean;
    readProjectStrict?:boolean;
    projectReady?:boolean;
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

    name:string;


    private _routerProto:RouterPrototype = {};

    private _l:any = null;

    constructor(pName = '?') {
        // @ts-ignore
        this.router = new Router();
        this.name = pName;
    }

    /**
     * To perform check if the current session is valid, get user info and retrieve active project
     * instance
     *
     * TODO : to remove
     *
     * @param pRequest {Request} HTTP Request
     * @param pWebServer {WebServer} WebServer instance
     * @return {DexcaliburProject} Active dexcalibur project requested by user
     * @throws {AuthenticationException | DexcaliburProjectException}
     * @method
     * @deprecated
     * @public
     */
    /*doProjectSecurityChecks( pRequest:DelegateRequest, pWebServer:WebServer, pOptions:AuthenticatedRouteOptions):DexcaliburProject {

        /*

        Logger.debug("[AUTH ROUTE] doProjectSecurityChecks : check session, project & authorizations ");

        if (pRequest.dxc == null || !pWebServer.context.getUserService().verifySession(pRequest.dxc.sess,'doProjectSecurityChecks')) {
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
    }*/

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
            if (req.isAuthenticated !=null && req.isAuthenticated()) {
            return next();
        }


        Logger.error(`[WEBSERVER][MIDDLEWARE][ensureLoggedIn][path=${req.path}][ip=${req.ip}] Not authenticated, redirecting ...`);

        res.redirect('/login')
    };

    _ensureAuthenticated(req, res, next){
        if (req.isAuthenticated !=null && req.isAuthenticated()) {
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
            lazyProject: false,
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


                        // if the userAccount is authorized to access to this project, then continue to
                        // process the resquest.
                        // If the server is running in standalone mode, the request is processed immediately
                        // else the request is forwarded to the webserver instance of the node instance
                        // associated to requested project

                        let nodes:EngineNode[] = [];
                        try {

                            // check session, user and if the user can access to project

                            // check if the current user is authorized to access to this project
                            const unsafePUID = (httpVerb==="get"? req.query._puid : req.body._puid);
                            if(unsafePUID!=null){

                                // is user is not authorize, it throws an exception
                                self.srv.context.getProjectManager().isAuthorized(
                                    (req.user as UserAccount),
                                    unsafePUID
                                );

                                /*
                                  check engine node mode :
                                   - STANDALONE / SLAVE : process request
                                   - MASTER : forward to free SLAVE node
                                 */
                                switch (self.srv.context.getEngineMode()){
                                    case DexcaliburEngineMode.MASTER:
                                        let targetNode:Nullable<EngineNode> = null;
                                        nodes = self.srv.context
                                            .nodeManager
                                            .getNodeByProject(
                                                unsafePUID,
                                                NodePurpose.REVIEW
                                            );

                                        if(nodes.length>0){
                                            //targetNode = nodes[0];

                                            self.srv.context
                                                .nodeManager
                                                .forwardWebRequest(nodes[0], self.srv, req, res);
                                        }else{
                                            throw ProjectManagerException.PROJECT_NOT_LOADED(unsafePUID,"middleware-auth(master)");

                                            // check if
                                            // create
                                            /*
                                            targetNode = self.srv.context
                                                .nodeManager.createNode(unsafePUID, NodePurpose.REVIEW);

                                            await targetNode.spawn(
                                                "Request cannot be forwarded, because this project is not linked to a node",
                                                false
                                            );
                                            nodes.push(targetNode);*/
                                        }

                                        break;
                                    case DexcaliburEngineMode.STANDALONE:
                                    case DexcaliburEngineMode.SLAVE:
                                        // load project and inject it into request
                                        const authorizedProj = await self.srv.context.getProjectManager().getProject(req.user, unsafePUID);

                                        if(authorizedProj==null){
                                            // open project
                                            // (req as any).project = await self.srv.context.getProjectManager().getProject(req.user, unsafePUID);
                                            throw ProjectManagerException.PROJECT_NOT_FOUND(unsafePUID);
                                        }

                                        if(pOptions.lazyProject){
                                            req.project = authorizedProj;
                                        }else{
                                            // get corresponsing active instance
                                            req.project = (self.srv.context.getActiveProjects())[authorizedProj.getUID()];

                                            //(req as any).project = self.srv.context.getProject(unsafePUID);

                                            if(req.project==null){
                                                // open project
                                                // (req as any).project = await self.srv.context.getProjectManager().getProject(req.user, unsafePUID);
                                                throw ProjectManagerException.PROJECT_NOT_LOADED(unsafePUID,"middleware-auth(slave|standalone)");
                                            }
                                        }

                                        // TODO : remove later
                                        req.dxc.project = req.project;
                                        Logger.debug("[AUTH ROUTE | ASYNC] Process request");
                                        pHandlers[httpVerb](req, res);
                                        break;
                                }

                            }else{
                                Logger.debug("[AUTH ROUTE | ASYNC] Process request");
                                pHandlers[httpVerb](req, res);
                            }


                        } catch (err) {
                            Logger.error("[AUTH ROUTE | ASYNC] Authentication failed : " + err.message)
                            req.dxc.$.sendError(res, "Authentication failed : " + err.message);
                        }
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

                            // check if the current user is authorized to access to this project
                            const unsafePUID = (httpVerb==="get"? req.query._puid : req.body._puid);
                            if(unsafePUID!=null){

                                // is user is not authorize, it throws an exception
                                self.srv.context.getProjectManager().isAuthorized(
                                    (req.user as UserAccount),
                                    unsafePUID
                                );

                                /*
                                  check engine node mode :
                                   - STANDALONE / SLAVE : process request
                                   - MASTER : forward to free SLAVE node
                                 */
                                switch (self.srv.context.getEngineMode()){
                                    case DexcaliburEngineMode.MASTER:
                                        let targetNode:Nullable<EngineNode> = null;
                                        try{
                                            nodes = self.srv.context
                                                .nodeManager
                                                .getNodeByProject(
                                                    unsafePUID,
                                                    NodePurpose.REVIEW
                                                );

                                            if(nodes.length>0){
                                                //targetNode = nodes[0];
                                                self.srv.context
                                                    .nodeManager
                                                    .forwardWebRequest(nodes[0], self.srv, req, res)
                                                    .then(()=>{

                                                    })
                                            }else{

                                                throw ProjectManagerException.PROJECT_NOT_LOADED(unsafePUID,"middleware-auth(master)");
                                                // create
                                                /*self.srv.context
                                                    .nodeManager.createNode(unsafePUID, NodePurpose.REVIEW).then((targetNode2)=>{

                                                        targetNode2.spawn(
                                                            "Request cannot be forwarded, because this project is not linked to a node",
                                                            false
                                                        ).then(()=>{
                                                            nodes.push(targetNode);
                                                            self.srv.context
                                                                .nodeManager
                                                                .forwardWebRequest(targetNode, self.srv, req, res)
                                                                .then(()=>{

                                                                })
                                                        })
                                                    })*/

                                                /*
                                                targetNode.spawn(
                                                    "Request cannot be forwarded, because this project is not linked to a node",
                                                    false
                                                ).then(()=>{
                                                    nodes.push(targetNode);
                                                    self.srv.context
                                                        .nodeManager
                                                        .forwardWebRequest(targetNode, self.srv, req, res)
                                                        .then(()=>{

                                                        })
                                                })*/
                                            }


                                        }catch (e){
                                            Logger.error(e.msg);
                                            throw new Error(e.msg);
                                        }
                                        break;
                                    case DexcaliburEngineMode.STANDALONE:
                                    case DexcaliburEngineMode.SLAVE:
                                        // load project and inject it into request
                                        self.srv.context.getProjectManager().getProject(req.user, unsafePUID)
                                            .then((authorizedProj)=>{

                                           if(authorizedProj==null){
                                                // open project
                                                // (req as any).project = await self.srv.context.getProjectManager().getProject(req.user, unsafePUID);
                                                throw ProjectManagerException.PROJECT_NOT_FOUND(unsafePUID);
                                            }

                                            // get corresponsing active instance
                                            req.project = (self.srv.context.getActiveProjects())[authorizedProj.getUID()];

                                            if(req.project==null){
                                                throw ProjectManagerException.PROJECT_NOT_LOADED(unsafePUID);
                                            }
                                            // TODO : remove later
                                            req.dxc.project = req.project;
                                            pHandlers[httpVerb](req, res);
                                        })
                                        break;
                                }

                            }else {
                                Logger.debug("[AUTH ROUTE | SYNC] Process request");
                                pHandlers[httpVerb](req, res);
                            }

                            /*
                            if(req.session?.passport?.user?.dxc != null){
                                req.dxc = (req.session as any).passport.user.dxc;
                                req.dxc.$ = self.srv;
                            }else{
                                console.log("SSO : Request is not authenticated. Exit");
                                throw new Error("SSO Error");
                            }
                            //}*/
                            /*
                            Logger.debug("[AUTH ROUTE | SYNC] Process request : verify session ");
                            if(self.srv.context.getUserService().verifySession(req.dxc.sess,'syncAuthenticatedRoute')){

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
                                    //return;
                                }else{
                                    pHandlers[httpVerb](req, res);
                                }
                            }else{
                                req.dxc.$.sendError( res, "[AUTH ROUTE | SYNC] Authentication is required. Incident has been saved.");
                            }*/
                        }catch(err){
                            Logger.error("[AUTH ROUTE | ASYNC] Authentication failed : " + err.message)
                            req.dxc.$.sendError( res, "[AUTH ROUTE | SYNC] Authentication failed : "+err.message);
                        }
                    }
                });
            }
        }
    }
}