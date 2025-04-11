import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import {EngineNodeManager, NodeState} from "../core/EngineNodeManager.js";
import {EngineNodeException} from "../errors/EngineNodeException.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const NODE_MGR_WEB_API: DelegateWebApi = new DelegateWebApi();

/* ================ IMPORTANT ================
 PRIVATE API :
 - This API contains Public (not authenticated) endpoints, it must be not exposed to outside
 - TODO : deny external access by configuration of reverse proxy
 ============================================= */
NODE_MGR_WEB_API.addAsyncAuthenticatedRoute(
    '/scheduler/info',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const o = $.context.nodeManager.toJsonObject();
                //console.log(o);
                $.sendSuccess(res, o);
            }catch(err){
                Logger.error("[API][NODE] Cannot retrieve scheduler info. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Cannot retrieve scheduler info");
            }
        }
    }
);

NODE_MGR_WEB_API.addAsyncAuthenticatedRoute(
    '/monitor/nodes',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            // TODO : check if user as PlateformAdministrator role

            try{
                const o = $.context.nodeManager.toJsonObject();
                //console.log(o);
                $.sendSuccess(res, o);
            }catch(err){
                Logger.error("[API][NODE] Cannot retrieve scheduler info. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Cannot retrieve scheduler info");
            }
        }
    }
);


/**
 * A webhook used by slave nodes to send state/health checks to master node
 *
 */
NODE_MGR_WEB_API.addAsyncPublicRoute(
    '/webhook/state/:state',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const unsafeUuidHeader = req.headers[EngineNodeManager.HEADER_NODE_UUID];
                //console.log(unsafeUuidHeader)
                if((unsafeUuidHeader==null) || (typeof unsafeUuidHeader!=='string')){
                    throw EngineNodeException.MISSING_UUID_HEADER();
                }

                if(!EngineNodeManager.isValidState(req.params.state)){
                    throw EngineNodeException.INVALID_STATE();
                }

                $.context.nodeManager.updateState(unsafeUuidHeader, req.params.state as NodeState);

                $.sendSuccess(res, {});
            }catch(err){
                Logger.error("[API][NODE] Node state cannot updated. Cause : UUID Header is missing : ",err.stack,err.message);
                //console.log(req.headers);
                $.sendError(res, "");
            }
        }
    }
);


/**
 * A webhook used by slave nodes to send state/health checks to master node
 *
 */
NODE_MGR_WEB_API.addAsyncPublicRoute(
    '/webhook/register',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // retireve registration key
                let unsafeKey = req.headers['x-dxc-'+$.context.nodeManager.getRegistrationKeyName()];

                if(Array.isArray(unsafeKey) && unsafeKey.length>0){
                    unsafeKey = unsafeKey[0];
                }

                const unsafeHost = req.headers[EngineNodeManager.HEADER_NODE_HOST];

                // validate
                const nodeUUID = await $.context.nodeManager.registerNode(
                    Buffer.from(unsafeKey as string),
                    unsafeHost as string,
                    {
                        http: req.body.http,
                        https: req.body.https,
                    }
                );

                $.sendSuccess(res, {
                    uuid: nodeUUID
                });
            }catch(err){
                Logger.error("[API][NODE] Node cannot be registered.",err.stack);
                //console.log(req.headers);
                $.sendErrorAfterException(
                    res,
                    NODE_MGR_WEB_API.name,
                    "Node cannot be registered",
                    err);
            }
        }
    }
);
