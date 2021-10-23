import {DelegateWebApi} from "./DelegateWebApi";
import {Device} from "../Device";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer";
import DeviceManager from "../DeviceManager";
import {Request, Response} from "express";
import * as Log from "../Logger";
import DataScope from "../DataScope";
import * as _path_ from "path";
import {IDbCollection, IDbIndex} from "../persist/orm/DbAbstraction";
import ModelFile from "../ModelFile";
import DexcaliburProject from "../DexcaliburProject";
import * as path from "path";
import {AuthenticationException} from "../errors/AuthenticationException";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException";
import Util from "../Utils";
import {CODE_WEB_API} from "./code.web.api";
import {FinderResult} from "../FinderResult";
import {UserSession} from "../user/session/UserSession";
import {UserAccount} from "../user/UserAccount";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const USER_WEB_API: DelegateWebApi = new DelegateWebApi();



USER_WEB_API.addAuthenticatedRoute(
    '/account',
    {
        'get': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                // ========== LOGIC

                if ($.context.getUserService().verifySession(req.dxc.sess)) {

                    const user:UserAccount = (req.dxc.sess as UserSession).getUserAccount();

                    const _DATA:any = {
                            username: user.username,
                            uid: user.getUID(),
                            role: {
                                name: user.getUserRole().name,
                                uid: user.getUserRole().uid
                            }
                        };

                    $.sendSuccess(res, _DATA);
                }else{
                    $.sendError(res, "Authentication required");
                }

            }catch(err){
                Logger.error("[API][USER] User account cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "User account cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);


USER_WEB_API.addAuthenticatedRoute(
    '/account',
    {
        'get': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                // ========== LOGIC

                if ($.context.getUserService().verifySession(req.dxc.sess)) {

                    const user:UserAccount = (req.dxc.sess as UserSession).getUserAccount();

                    const _DATA:any = {
                        username: user.username,
                        uid: user.getUID(),
                        role: {
                            name: user.getUserRole().name,
                            uid: user.getUserRole().uid
                        }
                    };

                    $.sendSuccess(res, _DATA);
                }else{
                    $.sendError(res, "Authentication required");
                }

            }catch(err){
                Logger.error("[API][USER] User account cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "User account cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);


USER_WEB_API.addAuthenticatedRoute(
    '/account/passwd',
    {
        'post': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                // ========== LOGIC

                const old_pwd:string = req.body['old_pwd'];
                const new_pwd:string = req.body['new_pwd'];
                const user:UserAccount = (req.dxc.sess as UserSession).getUserAccount();

                $.sendError(res, "Operation not supported");
            }catch(err){
                Logger.error("[API][USER] Account password cannot be changed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Account password cannot be changed. Cause : " + err.message);
            }
        }
    }
);



