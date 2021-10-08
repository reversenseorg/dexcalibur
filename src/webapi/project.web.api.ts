import {DelegateWebApi} from "./DelegateWebApi";
import {Device} from "../Device";
import WebServer from "../WebServer";
import DeviceManager from "../DeviceManager";
import FridaHelper from "../FridaHelper";
import {Router, Request, Response} from "express";
import * as Log from "../Logger";
import DataScope from "../DataScope";
import * as _path_ from "path";
import {IDbIndex} from "../ConnectorFactory";
import ModelFile from "../ModelFile";
import {UserSession} from "../user/session/UserSession";
import DexcaliburProject from "../DexcaliburProject";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PROJECT_WEB_API: DelegateWebApi = new DelegateWebApi();

PROJECT_WEB_API.addAsyncPublicRoute(
    '/info/:project',
    {
        'get': async (req:Request, res:Response)=>{

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
