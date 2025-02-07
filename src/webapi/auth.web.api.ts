import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import {Application, Request, Response} from "express";
import * as Log from "../Logger.js";
import {DexcaliburConnectionParams} from "../remote/DexcaliburConnectionParams.js";
import {ConnectionHandler} from "../remote/ConnectionHandler.js";
import {DexcaliburConnectionException} from "../errors/DexcaliburConnectionException.js";
import {ConnectionCredentials} from "../remote/ConnectionCredentials.js";
import {ConnectionManagerException} from "../errors/ConnectionManagerException.js";
import {Settings} from "../Settings.js";
import ConnectionSettings = Settings.ConnectionSettings;
import {Nullable} from "../core/IStringIndex.js";
import {UserSession} from "../user/session/UserSession.js";
import {UserAccount} from "../user/UserAccount.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export const AUTH_WEB_API: DelegateWebApi = new DelegateWebApi();

AUTH_WEB_API.addAsyncAuthenticatedRoute(
    '/logout',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {

            let $:WebServer = req.dxc.$;

            try {


                if ($.context.getUserService().verifySession(req.dxc.sess,'logout')) {


                        //console.log("SSO : logout requested")
                        //console.log((req as any).session);
                        //console.log((req as any).session?.passport?.user);

                        // server-side revoke token (only if authorization is enabled)
                        /*
                        if((req as any).session?.passport?.user?.rToken){
                            this.revokeToken(
                                this._oidClientCfg.issuer.end_session_endpoint,
                                this._oidClientCfg.settings.client_id,
                                (req as any).session.passport.user.rToken
                            ).then(()=>{
                                console.log("Revoke success")
                            }).catch((err)=>{

                                console.log("Revoke error",err)
                            })
                        }*/

                    // destroy dxc session
                    $.context.getUserService().closeSession(req.dxc.sess);

                    // destroy passport (global) session
                    if((req as any).session!=null){

                        //destroy passport session and redirect
                        (req as any).session.destroy(function (err) {
                            console.log("Destroy err:  ",err);
                            res.clearCookie('connect.sid');
                            $.sendSuccess(res, {success:true});
                        });
                    }else{
                        console.log("Passport session not destroyed because not found");
                        $.sendSuccess(res, {success:true});
                    }
                }else{
                    console.log("Session not destroyed because not found");
                    $.sendSuccess(res, {success:true});
                }
            }catch(err){
                Logger.error("[API][REMOTE CONNECTION LOGOUT] Session logout : "+err.message+"\n"+err.stack);
                $.sendError( res, "Session not found : "+err.message );
            }

        }
    }
);


AUTH_WEB_API.addAsyncAuthenticatedRoute(
    '/logout/:oid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {

            let $:WebServer = req.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(
                    (req.user as UserAccount),
                    req.params.oid
                );

                // redirect to login page of organization associated to users
                // $.context.getUserService().closeSession(req.dxc.sess);
                (req.session as UserSession).destroy((vErr:any)=>{
                    res.status(200).redirect(`/login/${org.name}`);
                });



            }catch(err){
                try{
                    Logger.error("[API][LOGOUT] Session logout failed : "+err.message+"\n"+err.stack);
                    const o = (req.session as UserSession).getData('org');
                    if(o!=null){
                        res.status(200).redirect(`/home/?org=${o}`);
                    }else{
                        res.status(200).redirect('https://www.reversense.com');
                    }
                }catch(err2){
                    Logger.error("[API][LOGOUT] Session logout : "+err2.message+"\n"+err2.stack);
                    res.status(200).redirect('https://www.reversense.com');
                }
            }

        }
    }
);


AUTH_WEB_API.addPublicRoute(
    '/connections',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {

            let conn:any,  _DATA:any;
            let $:WebServer = req.dxc.$;

            try{
                conn = $.context.getSettings().getConnectionSettings();
                if(conn == null){
                    _DATA = { conn:null};
                }else{
                    _DATA = { conn:conn.toObject() };
                }

                $.sendSuccess(res, _DATA);
            }catch(err){
                Logger.error("[API][GET CONN] An error occured : "+err.message+"\n"+err.stack);
                $.sendError(res, "Connections not found : "+err.message);
            }

        }
    }
);

/*
 deprecated
 */
AUTH_WEB_API.addPublicRoute(
    '/auth',
    {
        'post': async  (req:DelegateRequest, res:DelegateResponse):Promise<any> => {

            let conn:ConnectionSettings, param:DexcaliburConnectionParams, _DATA:any;
            let handler:ConnectionHandler;
            let $:WebServer = req.dxc.$;

            try{
                conn = $.context.getSettings().getConnectionSettings();

                if(req.body['conn']==null)
                    throw new DexcaliburConnectionException("Connection name is required",0);

                param = conn.getConnectionParamsFor(req.body['conn']);


                // TODO replace by better check
                if(param.getName()=="local"){
                    if(req.dxc == null || req.dxc.sess == null){
                        if(req.dxc == null) req.dxc = {};
                        req.dxc.sess = await $.context.getUserService().do1StepPasswordAuthentication(
                            req.body['login'],
                            req.body['pwd']
                        );

                        req.dxc.sess.addConnection( param.getName(), new ConnectionHandler(param) );

                        res.cookie(
                            $.context.getUserService().getCookieName(),
                            req.dxc.sess.getSessUID(),
                            { maxAge: 7*24*60 } //, expires: new Date().  }
                        );
                        _DATA= { token:req.dxc.sess.getSessUID() };
                    }else{
                        // todo : flush + recreate sessions
                        _DATA= { token:"none", msg:"Already authenticated" };
                    }
                }else{
                    handler = await $.context.getConnectionManager().open(
                        param,
                        (new ConnectionCredentials())
                            .setUsername(req.body['login'])
                            .setCredential(req.body['pwd'])
                    );

                    if(req.dxc.sess != null){
                        req.dxc.sess.addConnection( param.getName(), handler );

                        _DATA= { token:req.dxc.sess.getSessUID() };
                    }else{
                        throw new ConnectionManagerException("Unable to link a connection to a user : user not connected");
                    }
                }


                $.sendSuccess(res, _DATA);
            }catch(err){
                Logger.error("[API][AUTHENTICATION] An error occured : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message)
            }

        }
    }
);
