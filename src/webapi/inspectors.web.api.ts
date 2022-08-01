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
import Inspector from "../Inspector";
import InspectorManager, {InspectorMap} from "../InspectorManager";
import {AuthenticationException} from "../errors/AuthenticationException";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException";
import FridaHelper from "../FridaHelper";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const INSPECTOR_WEB_API: DelegateWebApi = new DelegateWebApi();


/**
 * /api/application/cmp?type=[dex|ks|libs|strings] ...
 */
INSPECTOR_WEB_API.addAuthenticatedRoute(
    '/inspectors/:inspectorID',
    {
        'get': function (req:Request, res:Response):any {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // ========== LOGIC
                const insp:Inspector = InspectorManager.getInstance().getEnabledInspector(
                    project,
                    req.params.inspectorID
                );

                if (insp == null) {
                    throw new Error("Inspector cannot be retrieved");
                    return false;
                }

                insp.performGet(req, res);
            }catch(err){
                Logger.error("[API][PLUGINS] Request cannot be forwarded to inspector. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Request cannot be forwarded to inspector. Cause : " + err.message);
            }


        },
        'post': function (req:Request, res:Response):any {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // ========== LOGIC
                const insp:Inspector = InspectorManager.getInstance().getEnabledInspector(
                    project,
                    req.params.inspectorID
                );

                if (insp == null) {
                    throw new Error("Inspector cannot be retrieved");
                    return false;
                }

                insp.performPost(req, res);
            }catch(err){
                Logger.error("[API][PLUGINS] Request cannot be forwarded to inspector. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Request cannot be forwarded to inspector. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }

);


INSPECTOR_WEB_API.addAuthenticatedRoute(
    '/inspector/list',
    {
        'get': function (req:Request, res:Response):any {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // ========== LOGIC
                const insp:InspectorMap = project.getInspectors()
                const data = [];

                for(const uid in insp){
                    data.push( insp[uid].toJsonObject());
                }


                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][PLUGINS] Request cannot be forwarded to inspector. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Request cannot be forwarded to inspector. Cause : " + err.message);
            }


        }
    },{
        readProject: true
    }
);

