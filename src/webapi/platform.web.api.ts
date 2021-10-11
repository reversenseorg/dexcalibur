import {DelegateWebApi} from "./DelegateWebApi";
import {Device} from "../Device";
import WebServer from "../WebServer";
import DeviceManager from "../DeviceManager";
import FridaHelper from "../FridaHelper";
import {Router, Request, Response} from "express";
import * as Log from "../Logger";
import PlatformManager from "../PlatformManager";
import Platform from "../Platform";
import {PlatformManagerException} from "../errors/PlatformManagerException";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PLATFORM_WEB_API: DelegateWebApi = new DelegateWebApi();

PLATFORM_WEB_API.addPublicRoute(
    '/list',
    {
        'get': async (req:Request, res:Response)=>{

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
        'post': async (req:Request, res:Response)=>{

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
