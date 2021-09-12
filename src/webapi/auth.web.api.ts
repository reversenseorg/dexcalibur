import {DelegateWebApi} from "./DelegateWebApi";
import {Device} from "../Device";
import WebServer from "../WebServer";
import {Request, Response } from "express";
import * as Log from "../Logger";
import {DexcaliburConnectionParams} from "../remote/DexcaliburConnectionParams";
import {ConnectionHandler} from "../remote/ConnectionHandler";
import {DexcaliburConnectionException} from "../errors/DexcaliburConnectionException";
import {ConnectionCredentials} from "../remote/ConnectionCredentials";
import {ConnectionManagerException} from "../errors/ConnectionManagerException";
import {Settings} from "../Settings";
import ConnectionSettings = Settings.ConnectionSettings;

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export const AUTH_WEB_API: DelegateWebApi = new DelegateWebApi();

AUTH_WEB_API.addPublicRoute(
    '/logout',
    {
        'get': async (req:Request, res:Response):Promise<any> => {

            let $:WebServer = req.dxc.$;

            try {
                if ($.context.getUserService().verifySession(req.dxc.sess)) {
                    $.context.getUserService().closeSession(req.dxc.sess);

                    $.sendSuccess(res, {msg:"Session destroyed"});
                }else{
                    $.sendSuccess(res, "Session not found");
                }
            }catch(err){
                Logger.error("[API][REMOTE CONNECTION LOGOUT] Session logout : "+err.message+"\n"+err.stack);
                $.sendError( res, "Session not found : "+err.message );
            }

        }
    }
);


AUTH_WEB_API.addPublicRoute(
    '/connections',
    {
        'get': async (req:Request, res:Response):Promise<any> => {

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

AUTH_WEB_API.addPublicRoute(
    '/auth',
    {
        'post': async  (req:Request, res:Response):Promise<any> => {

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
                        req.dxc.sess = $.context.getUserService().do1StepPasswordAuthentication(
                            req.body['login'],
                            req.body['pwd']
                        );

                        req.dxc.sess.addConnection( param.getName(), new ConnectionHandler(param) );

                        res.cookie(
                            $.context.getUserService().getCookieName(),
                            req.dxc.sess.getSessUID(),
                            { maxAge: 7*24*60, expires: 0  }
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
