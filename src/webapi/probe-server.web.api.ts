import {DelegateWebApi} from "./DelegateWebApi";
import {Device} from "../Device";
import WebServer from "../WebServer";
import DeviceManager from "../DeviceManager";
import FridaHelper from "../FridaHelper";
import {Router, Request, Response} from "express";
import * as Log from "../Logger";
import {AuthenticationException} from "../errors/AuthenticationException";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException";
import DexcaliburProject from "../DexcaliburProject";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PROBE_SERVER_WEB_API: DelegateWebApi = new DelegateWebApi();

PROBE_SERVER_WEB_API.addAsyncAuthenticatedRoute(
    '/start',
    {
        'post': async (req:Request, res:Response)=>{

            let device:Device = null;
            let project:DexcaliburProject = null;
            let $:WebServer = req.dxc.$;

            try{
                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ==== LOGIC
                if(req.body['dev']){
                    device = DeviceManager.getInstance().getDevice(req.body['dev']);
                }else{
                    device = project.getDevice();
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

PROBE_SERVER_WEB_API.addAsyncAuthenticatedRoute(
    '/stop',
    {
        'post': async (req:Request, res:Response)=>{

            let device:Device = null;
            let project:DexcaliburProject = null;
            let $:WebServer = req.dxc.$;

            try{
                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ==== lOGIC

                if(req.body['dev']){
                    device = DeviceManager.getInstance().getDevice(req.body['dev']);
                }else{
                    device = project.getDevice();
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


PROBE_SERVER_WEB_API.addAsyncAuthenticatedRoute(
    '/status',
    {
        'get': async  (req:Request, res:Response):Promise<any> => {

            let device: Device = null;
            let project:DexcaliburProject = null;
            let $: WebServer = req.dxc.$;

            try {
                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ==== lOGIC

                if (req.param.dev) {
                    device = DeviceManager.getInstance().getDevice(req.param.dev);
                } else {
                    device = project.getDevice();
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

