import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const HEALTH_WEB_API: DelegateWebApi = new DelegateWebApi("HEALTH");


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


HEALTH_WEB_API.addAsyncAuthenticatedRoute(
    '/started',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {

            try{
                res.send(1);
            }catch(err){
                res.send(0);
            }
        }
    },{
        lazyProject: true
    }
);


HEALTH_WEB_API.addAsyncAuthenticatedRoute(
    '/ready',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(await $.context.getOrgManager().listOrganizations($.context.getInternalAcc())){
                    res.send(1);
                }else{
                    res.send(0);
                }
            }catch(err){
                console.log(" Health check failed. Server is not ready.", err);
                res.send(0);
            }
        }
    },{
        lazyProject: true
    }
);
