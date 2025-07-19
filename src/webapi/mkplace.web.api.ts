import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import * as Log from "../Logger.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const MARKETPLACE_WEB_API: DelegateWebApi = new DelegateWebApi("MKP");


MARKETPLACE_WEB_API.addAsyncAuthenticatedRoute(
    '/product/:pid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC

                $.sendSuccess(res, (await $.context.mkpManager.getProduct(req.params.pid))?.toJsonObject());
            }catch(err){

                $.sendErrorAfterException(
                    res, MARKETPLACE_WEB_API.name,
                    "Cannot list available products in Marketplace ",
                    err,{cause:err.message});
            }
        }
    },{
        readProject: false
    }
);

MARKETPLACE_WEB_API.addAsyncAuthenticatedRoute(
    '/list/:oid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                $.sendSuccess(res, $.context.mkpManager.listLocallyAvailableProducts());
            }catch(err){

                $.sendErrorAfterException(
                    res, MARKETPLACE_WEB_API.name,
                    "Cannot list available products in Marketplace ",
                    err,{cause:err.message});
            }
        }
    },{
        readProject: false
    }
);


MARKETPLACE_WEB_API.addAsyncAuthenticatedRoute(
    '/owned/:oid',
    {
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse) =>{
            const $: WebServer = pReq.dxc.$;

            try{
                // ========== LOGIC
                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                $.sendSuccess(pRes, $.context.mkpManager.listProductsOwnedBy(org)); // org.getBusinessPlan().wallet)

            }catch(err){

                $.sendErrorAfterException(
                    pRes, MARKETPLACE_WEB_API.name,
                    "Cannot list available products in Marketplace ",
                    err,{cause:err.message});
            }
        }
    },{
        readProject: false
    }
);



MARKETPLACE_WEB_API.addAsyncAuthenticatedRoute(
    '/buy',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse) =>{
            const $: WebServer = pReq.dxc.$;

            try{
                // ========== LOGIC

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.body.oid
                );

                $.sendSuccess(pRes, (await $.context.mkpManager.buyProduct(pReq.user, org, pReq.body.pid, pReq.body.plan, pReq.body.qtity)) );
            }catch(err){
                $.sendErrorAfterException(
                    pRes, MARKETPLACE_WEB_API.name,
                    "Cannot buy the product in Marketplace ",
                    err,{cause:err.message});
            }
        }
    },{
        readProject: false
    }
);
