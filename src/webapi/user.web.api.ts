import {DelegateRequest, DelegateResponse, DelegateWebApi, HTTP_VERB} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";
import {UserSession} from "../user/session/UserSession.js";
import {UserAccount} from "../user/UserAccount.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import AssuranceReport from "../audit/common/AssuranceReport.js";
import DexcaliburProject from "../DexcaliburProject.js";

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
    '/account/prefs',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if((req as any).user!=null){
                    const prefs = await $.context.getUserService().getUserPrefs(req.user)
                    $.sendSuccess(res, prefs !=null ? prefs.toJsonObject() : null );
                }else{
                    $.sendError(res, "User preferences not found.");
                }
            }catch(err){
                Logger.error("[API][USER] User preferences not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "User preferences not found.");
            }
        },
        'put': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if((req as any).user!=null){

                    const prefs = await $.context.getUserService()
                        .addUserPrefs(req.user, req.body.project, req.body.type, req.body.value);

                    $.sendSuccess(res, prefs !=null ? prefs.toJsonObject() : null );
                }else{
                    $.sendError(res, "User preferences not found.");
                }
            }catch(err){
                Logger.error("[API][USER] User preferences not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "User preferences not found.");
            }
        }
    },{
        mcp: {
            [HTTP_VERB.GET]: {
                name:'user-get-preferences',
                uri: '/account/prefs',
                summary: `Return the preferences of the current user. `,
                parameters: [{
                    name: 'applicationUUID',
                    required: true,
                    description: ApplicationUnit.TYPE.getPrimaryKey()._dscr,
                    schema: ApplicationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: "The latest Assurance Report (an assurance_report object) for the specified application unit. It is a scan report",
                    schemaDoc: AssuranceReport.TYPE.toJSONSchemaDoc()
                }]
            },
            [HTTP_VERB.PUT]: {
                name:'user-set-preference',
                uri: '/account/prefs',
                summary: `Set a preference for the specified project and the current user. `,
                parameters: [{
                    name: 'value',
                    required: true,
                    description: "The value of the preference",
                    schema: ApplicationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'type',
                    required: true,
                    description: "The name of the preference to set",
                    schema: ApplicationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'project',
                    required: true,
                    description: DexcaliburProject.TYPE.getPrimaryKey()._dscr,
                    schema: DexcaliburProject.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: "The latest Assurance Report (an assurance_report object) for the specified application unit. It is a scan report",
                    schemaDoc: AssuranceReport.TYPE.toJSONSchemaDoc()
                }]
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

USER_WEB_API.addAsyncAuthenticatedRoute(
    '/account/uid/:uuid/apikeys',
    {
        'get': async (req: DelegateRequest, res: DelegateResponse): Promise<void> => {
            const $: WebServer = req.dxc.$;

            try {
                if (req.params.uuid == null || (typeof req.params.uuid !== 'string') || !UserAccount.VALIDATE._uid.test(req.params.uuid)) {
                    throw new Error("Invalid UUID format");
                }

                const user = await $.context.getUserService().getAccount(req.user, req.params.uuid);

                if (user != null) {
                    $.sendSuccess(res, user.getApiKeys().map(k => k.toJsonObject(SecurityZone.PUBLIC)));
                } else {
                    $.sendError(res, "User account not found.");
                }
            } catch (err) {
                Logger.error("[API][USER] Ac account cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "User account cannot be retrieved. Cause : " + err.message);
            }
        },
        'post': async (req:DelegateRequest, res:DelegateResponse):Promise<void> => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.params.uuid==null || (typeof req.params.uuid !== 'string') || !UserAccount.VALIDATE._uid.test(req.params.uuid)){
                    throw new Error("Invalid UUID format");
                }

                const user = await $.context.getUserService().getAccount(req.user, req.params.uuid);

                //ApiKey
                if(user!=null){
                    $.sendSuccess(res,  await $.context.getUserService().createApiKey(user, {
                            name: req.body.opts.name,
                            description: req.body.opts.description,
                            lifetime: req.body.opts.lifetime,
                            scope: req.body.opts.scope
                        })
                    );
                }else{
                    $.sendError(res, "User account not found.");
                }
            }catch(err){
                Logger.error("[API][USER] Ac account cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "User account cannot be retrieved. Cause : " + err.message);
            }
        },
    });

USER_WEB_API.addAsyncAuthenticatedRoute(
    '/account/uid/:uuid/apikey/:key',
    {
        'delete': async (req:DelegateRequest, res:DelegateResponse):Promise<void> => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.params.uuid==null || (typeof req.params.uuid !== 'string') || !UserAccount.VALIDATE._uid.test(req.params.uuid)){
                    throw new Error("Invalid UUID format");
                }

                const user = await $.context.getUserService().getAccount(req.user, req.params.uuid);

                //ApiKey
                if(user!=null){
                    $.sendSuccess(res,  await $.context.getUserService().dropApiKey(user, req.params.key));
                }else{
                    $.sendError(res, "User account not found.");
                }
            }catch(err){
                Logger.error("[API][USER] Ac account cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "User account cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);

