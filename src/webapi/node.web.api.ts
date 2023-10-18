import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import {LicenceManager, ProductInfo} from "../credit/LicenceManager.js";
import {AuditManager} from "../audit/AuditManager.js";
import {AssuranceScanner} from "../audit/common/AssuranceScanner.js";
import AssuranceReport from "../audit/common/AssuranceReport.js";
import AssuranceModel from "../audit/common/AssuranceModel.js";
import Control from "../audit/common/Control.js";
import {ErrorCode} from "../errors/MonitoredError.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import {ScanFlow} from "../audit/common/ScanFlow.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Nullable} from "../core/IStringIndex.js";
import {ScanOrder} from "../audit/common/ScanOrder.js";
import {IncomingValue} from "../security/SanitizedValue.js";
import {NodeState} from "../core/EngineNodeManager.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const NODE_MGR_WEB_API: DelegateWebApi = new DelegateWebApi();


NODE_MGR_WEB_API.addPublicRoute(
    '/state/:node_uuid/:state',
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
