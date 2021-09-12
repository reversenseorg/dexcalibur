import {DelegateWebApi} from "./DelegateWebApi";
import {Device} from "../Device";
import WebServer from "../WebServer";
import DeviceManager from "../DeviceManager";
import FridaHelper from "../FridaHelper";
import {Router, Request, Response} from "express";
import * as Log from "../Logger";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PROBE_SERVER_WEB_API: DelegateWebApi = new DelegateWebApi();

PROBE_SERVER_WEB_API.addAsyncPublicRoute(
    '/start',
    {
        'post': async (req:Request, res:Response)=>{

            let device:Device = null;
            let $:WebServer = req.dxc.$;

            try{
                if(req.body['dev']){
                    device = DeviceManager.getInstance().getDevice(req.body['dev']);
                }else{
                    device = $.project.getDevice();
                }
                // TODO : detect if frida connection works
                if(await FridaHelper.startServer( device, {
                    path: req.body['path'],
                    privileged: (req.body['privileged']=="true"? true: false)
                })){
                    $.sendSuccess(res, {});
                }else{
                    $.sendError(res, "Hook server cannot start");
                }
            }catch(err){
                Logger.error("[API][HOOK SERVER] Server cannot start : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "Hook server cannot start");
            }
        }
    }
)

PROBE_SERVER_WEB_API.addAsyncPublicRoute(
    '/stop',
    {
        'post': async (req:Request, res:Response)=>{

            let device:Device = null;
            let $:WebServer = req.dxc.$;

            try{
                if(req.body['dev']){
                    device = DeviceManager.getInstance().getDevice(req.body['dev']);
                }else{
                    device = $.project.getDevice();
                }
                // TODO : detect if frida connection works
                if(await FridaHelper.stopServer( device )){
                    $.sendSuccess(res, {});
                }else{
                    $.sendError(res, "Hook server cannot be stopped");
                }
            }catch(err){
                Logger.error("[API][HOOK SERVER] Server cannot be stopped : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "Hook server cannot be stopped");
            }
        }
    }
)


PROBE_SERVER_WEB_API.addAsyncPublicRoute(
    '/status',
    {
        'get': async  (req:Request, res:Response):Promise<any> => {

            let device: Device = null;
            let $: WebServer = req.dxc.$;

            try {
                if (req.param.dev) {
                    device = DeviceManager.getInstance().getDevice(req.param.dev);
                } else {
                    device = $.project.getDevice();
                }

                if(await FridaHelper.getServerStatus(device))
                    $.sendSuccess(res,{});
                else
                    $.sendError(res, 'Frida server not started')

            } catch (err) {
                Logger.error("[API][HOOK SERVER] Status cannot be retrieved : "+err.message+"\n\t"+err.stack);
                $.sendError( res, 'Frida server status cannot be retrieved : '+err.message);
            }
        }
    }
);

