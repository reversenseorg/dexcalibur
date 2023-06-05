import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import {Device} from "../Device.js";
import WebServer from "../WebServer.js";
import DeviceManager from "../DeviceManager.js";
import FridaHelper from "../FridaHelper.js";
import {Router, Request, Response} from "express";
import * as Log from "../Logger.js";
import PlatformManager from "../PlatformManager.js";
import Platform from "../Platform.js";
import {PlatformManagerException} from "../errors/PlatformManagerException.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PLATFORM_WEB_API: DelegateWebApi = new DelegateWebApi();

PLATFORM_WEB_API.addPublicRoute(
    '/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse)=>{

            let $:WebServer = req.dxc.$;

            try{
                $.sendSuccess( res, {
                    platforms: PlatformManager.getInstance().getRemote()
                });
            }catch(err){
                Logger.error("[API][PLATFORM MGT] Server cannot start : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "[PLATFORM MGT] Platforms cannot be listed : "+err.message);
            }
        }
    }
)


PLATFORM_WEB_API.addAsyncPublicRoute(
    '/install',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse)=>{

            let $:WebServer = req.dxc.$;

            try{

                const mgr:PlatformManager = PlatformManager.getInstance();
                const platform:Platform = mgr.getRemotePlatform(req.body['uid']);

                if(platform == null){
                    throw PlatformManagerException.PLATFORM_NOT_FOUND();
                }

                $.sendSuccess( res, {
                    status: await mgr.install(platform)
                });
            }catch(err){
                Logger.error("[API][PLATFORM MGT] Platforms cannot be installed : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "[PLATFORM MGT] Platforms cannot be installed : "+err.message);
            }
        }
    }
)
