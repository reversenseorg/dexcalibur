import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";
import {UserSession} from "../user/session/UserSession.js";
import {UserAccount} from "../user/UserAccount.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {AUTH_WEB_API} from "./auth.web.api.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const USER_WEB_API: DelegateWebApi = new DelegateWebApi();



USER_WEB_API.addAsyncAuthenticatedRoute(
    '/account/current',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if((req as any).user!=null){
                    $.sendSuccess(res, req.user.toJsonObject({}, SecurityZone.PUBLIC));
                }else{
                    $.sendSuccess(res, null);
                }
            }catch(err){
                Logger.error("[API][USER] Ac account cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "User account cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);

USER_WEB_API.addAsyncAuthenticatedRoute(
    '/account/uid/:uuid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse):Promise<void> => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.params.uuid==null || (typeof req.params.uuid !== 'string') || !UserAccount.VALIDATE._uid.test(req.params.uuid)){
                   throw new Error("Invalid UUID format");
                }

                const user = await $.context.getUserService().getAccount(req.user, req.params.uuid);

                if(req.user.getUID()===req.params.uuid){
                    $.sendSuccess(res, req.user.toJsonObject({}, SecurityZone.PUBLIC));
                }else{

                    if(user!=null){
                        $.sendSuccess(res, user.toJsonObject({}, SecurityZone.PUBLIC));
                    }else{
                        $.sendError(res, "User account not found.");
                    }
                }
            }catch(err){
                Logger.error("[API][USER] Ac account cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "User account cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);

USER_WEB_API.addAsyncAuthenticatedRoute(
    '/account/profile/:uuid',
    {
        'put': async (req:DelegateRequest, res:DelegateResponse):Promise<void> => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.params.uuid==null || (typeof req.params.uuid !== 'string') || !UserAccount.VALIDATE._uid.test(req.params.uuid)){
                    throw new Error("Invalid UUID format");
                }

                $.sendSuccess( res,
                    (await $.context.getUserService().updateAccountWithUnsafe(req.user, req.params.uuid, req.body))
                        .toJsonObject()
                );

            }catch(err){
                Logger.error("[API][USER] Ac account cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "User account cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);



USER_WEB_API.addAsyncAuthenticatedRoute(
    '/account',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{


                // ========== LOGIC

                    const user:UserAccount = (req.dxc.sess as UserSession).getUserAccount();

                    const _DATA:any = {
                        username: user.username,
                        uid: user.getUID(),
                        roles: user.getRoles()
                    };

                    $.sendSuccess(res, _DATA);


            }catch(err){
                Logger.error("[API][USER] User account cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "User account cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);


USER_WEB_API.addAsyncAuthenticatedRoute(
    '/account/passwd',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{

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


USER_WEB_API.addAsyncAuthenticatedRoute(
    '/account/wsticket',
    {
        'post': async  (req:DelegateRequest, res:DelegateResponse):Promise<any> => {

            let $:WebServer = req.dxc.$;

            try{
                console.log(req.user.getUID(), req.ip);
                const authTicket = await $.context.getUserService()
                    .getAuthenticationService()
                    .generateWsAuthTicket(req.user, req.ip);

                $.sendSuccess(res, authTicket);
            }catch(err){
                Logger.error("[API][AUTHENTICATION] An error occured : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message)
            }

        }
    }
);
