import WebServer from "../WebServer";
import {Router, Request, Response} from "express";
import {Device} from "../Device";
import {Access} from "../user/acl/Access";
import { UserSession } from "../user/session/UserSession";
import AccessControl from "../user/acl/AccessControl";
import {AccessZone} from "../user/acl/Zones";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol";

import * as Log from "../Logger";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export enum HTTP_VERB {
    GET="get",
    POST="post",
    DEL="del",
    PUT="put"
}

interface RequestHandlers {
    [type: string] :Function
}

export class DelegateWebApi
{
    srv: WebServer;
    router: Router;
    private _l:any = null;

    constructor() {
        this.router = new Router();
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


    addAsyncPublicRoute( pRoute:string, pHandlers:any ):void{
        this.addPublicRoute( pRoute, pHandlers, true);
    }

    addPublicRoute( pRoute:string, pHandlers:any, pAsync = false ):void {
        let self = this;
        for(let httpVerb in pHandlers){

            if(pAsync){
                this.router[httpVerb](pRoute, async function(req:Request, res:Response):Promise<any> {
                    req.dxc.$ = self.srv;
                    return  await pHandlers[httpVerb](req, res);
                });
            }else{
                this.router[httpVerb](pRoute, function(req:Request, res:Response):any {
                    req.dxc.$ = self.srv;
                    return pHandlers[httpVerb](req, res);
                });
            }

        }
    }

    addAsyncAuthenticatedRoute( pRoute:string, pHandlers:any ):void{
        this.addAuthenticatedRoute( pRoute, pHandlers, true);
    }

    addAuthenticatedRoute( pRoute:string, pHandlers:any, pAsync = false  ):void {
        const self = this;
        for(let httpVerb in pHandlers){
            if(pAsync){
                this.router[httpVerb](pRoute, async function(req:Request, res:Response):Promise<any> {
                    req.dxc.$ = self.srv;
                    try{
                        if(self.srv.context.getUserService().verifySession(req.dxc.sess)){
                            pHandlers[httpVerb](req, res);
                        }else{
                            self.srv.sendError( res, "Authentication is required. Incident has been saved.");
                        }
                    }catch(err){
                        self.srv.sendError( res, "Authentication failed : "+err.message);
                    }
                });
            }else{
                this.router[httpVerb](pRoute, function(req:Request, res:Response):any {
                    req.dxc.$ = self.srv;
                    try{
                        if(self.srv.context.getUserService().verifySession(req.dxc.sess)){
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
            this.router[httpVerb](async function(req:Request, res:Response):Promise<any> {
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