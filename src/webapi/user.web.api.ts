import {DelegateWebApi} from "./DelegateWebApi.js";
import {Device} from "../Device.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import DeviceManager from "../DeviceManager.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import DataScope from "../DataScope.js";
import * as _path_ from "path";
import {IDbCollection, IDbIndex} from "../persist/orm/DbAbstraction.js";
import ModelFile from "../ModelFile.js";
import DexcaliburProject from "../DexcaliburProject.js";
import * as path from "path";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import Util from "../Utils.js";
import {CODE_WEB_API} from "./code.web.api.js";
import {FinderResult} from "../FinderResult.js";
import {UserSession} from "../user/session/UserSession.js";
import {UserAccount} from "../user/UserAccount.js";

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



