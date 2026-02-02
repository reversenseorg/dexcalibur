import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_SUCCESS} from "../WebServer.js";
import * as Log from "../Logger.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const HEALTH_WEB_API: DelegateWebApi = new DelegateWebApi("HEALTH");


/* ================ IMPORTANT ================
 PRIVATE API :
 - This API contains Public (not authenticated) endpoints, it must be not exposed to outside
 - TODO : deny external access by configuration of reverse proxy
 ============================================= */
HEALTH_WEB_API.addAsyncAuthenticatedRoute(
    '/uuid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                res.send($.context.getNodeUUID());
            }catch(err){
                res.send("");
            }
        }
    },{
        lazyProject: true
    }
);


HEALTH_WEB_API.addAsyncPublicRoute(
    '/started',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {

            try{
                res.sendStatus(200);
            }catch(err){
                res.sendStatus(500);
            }
        }
    },{
        lazyProject: true
    }
);


HEALTH_WEB_API.addAsyncPublicRoute(
    '/ready',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(await $.context.getOrgManager().listOrganizations($.context.getInternalAcc())){
                    $.sendSuccess(res, 'OK', {raw:true});
                }else{
                    $.sendSuccess(res, 'NOK', {raw:true});
                }
            }catch(err){
                console.log(" Health check failed. Server is not ready.", err);
                //res.sendStatus(500)
                $.sendSuccess(res, 'NOK', {raw:true});
            }
        }
    },{
        lazyProject: true
    }
);
