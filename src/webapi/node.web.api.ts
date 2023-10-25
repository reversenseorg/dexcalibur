import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import {EngineNodeManager, NodeState} from "../core/EngineNodeManager.js";
import {EngineNodeException} from "../errors/EngineNodeException.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const NODE_MGR_WEB_API: DelegateWebApi = new DelegateWebApi();


NODE_MGR_WEB_API.addAsyncAuthenticatedRoute(
    '/scheduler/info',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                const o = $.context.nodeManager.toJsonObject();
                console.log(o);
                $.sendSuccess(res, o);
            }catch(err){
                Logger.error("[API][NODE] Cannot retrieve scheduler info. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Cannot retrieve scheduler info");
            }
        }
    }
);

NODE_MGR_WEB_API.addAsyncPublicRoute(
    '/webhook/state/:state',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                const unsafeUuidHeader = req.headers[EngineNodeManager.HEADER_NODE_UUID];
                console.log(unsafeUuidHeader)
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
                console.log(req.headers);
                $.sendError(res, "");
            }
        }
    }
);

/*

NODE_MGR_WEB_API.addPublicRoute(
    '/scan/:node_uuid/:state',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                let safeState:NodeState
                if([NodeState.IDDLE,NodeState.BUSY,NodeState.STOPPED].indexOf(req.params['state'] as NodeState)==-1){
                    throw new Error("Status not supported");
                }else{
                    safeState = req.params['state'] as NodeState;
                }

                $.context.nodeManager.updateState(req.params['node_uuid'],safeState);
                $.sendSuccess(res, {});
            }catch(err){
                Logger.error("[API][NODE] Node state cannot updated. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "");
            }
        },
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                let safeState:NodeState
                if([NodeState.IDDLE,NodeState.BUSY,NodeState.STOPPED].indexOf(req.params['state'] as NodeState)==-1){
                    throw new Error("Status not supported");
                }else{
                    safeState = req.params['state'] as NodeState;
                }

                $.context.nodeManager.updateState(req.params['node_uuid'],safeState);
                $.sendSuccess(res, {});
            }catch(err){
                Logger.error("[API][NODE] Node state cannot updated. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "");
            }
        }
    }
);*/
