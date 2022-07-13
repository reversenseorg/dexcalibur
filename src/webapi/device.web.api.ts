import {DelegateWebApi} from "./DelegateWebApi";
import {Device} from "../Device";
import * as Log from "../Logger";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer";
import DeviceManager from "../DeviceManager";
import StatusMessage from "../StatusMessage";
import AppPackage from "../AppPackage";
import {DeviceManagerException} from "../errors/DeviceManagerException";
import {BridgeInstallOptions, IBridge} from "../Bridge";
import {Router, Request, Response} from "express";
import DexcaliburProject from "../DexcaliburProject";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export const DEVICE_WEB_API: DelegateWebApi = new DelegateWebApi();

DEVICE_WEB_API.addAsyncPublicRoute(
    '/fs/list',
    {
        'get': async (req, res)=>{
            let data:any[] = [];
            let target:string ="";
            let baseDir:string = "";
            let privileged:boolean = false;
            let dev:Device = null;
            let $:WebServer = req.dxc.$;

            try{

                if( req.query.uid!=null ){
                    dev = $.context.getDeviceManager().getDevice(req.query.uid);
                }
                else if($.project !== null){
                    dev = $.project.getDevice();
                }
                else{
                    throw new Error('No active project');
                }


                if(dev==null){
                    throw new Error("Target device not found");
                }

                if(!dev.isConnected()){
                    throw  new Error("Device is offline");
                }

                switch(req.query.type){
                    case 'privileged':
                        privileged = true;
                        break;
                    case 'user':
                    case 'shell':
                    default:
                        privileged = false;
                        break;
                }

                if(req.query.app!=null){
                    baseDir = dev.getDataPathOf(decodeURIComponent(req.query.app))+"/";
                }

                if(req.query.path!=null){
                    baseDir += decodeURIComponent(req.query.path);
                }

                if(baseDir==""){
                    baseDir = "/";
                }

                $.sendSuccess( res, await dev.getDefaultBridge().listFiles(baseDir, {
                    privileged: privileged
                }));
            }catch(err){
                //res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg: err.message }));
                $.sendError(res, err.message);
            }
        }
    }
)


DEVICE_WEB_API.addAsyncPublicRoute(
    '/fs/content',
    {
        'get': async function (req: Request, res: Response): Promise<any> {
            let data: any[] = [];
            let target: string = "";
            let baseDir: string = "";
            let privileged: boolean = false;
            let dev: Device = null;
            let $: WebServer = req.dxc.$;

            try {
                if (req.query.uid != null) {
                    dev = $.context.getDeviceManager().getDevice(req.query.uid);
                } else {
                    dev = $.project.getDevice();
                }

                switch (req.query.type) {
                    case 'privileged':
                        privileged = true;
                        break;
                    case 'user':
                    case 'shell':
                    default:
                        privileged = false;
                        break;
                }

                if (dev == null) {
                    throw new Error("Target device not found");
                }

                if (!dev.isConnected()) {
                    throw  new Error("Device is offline");
                }


                if (req.query.app != null) {
                    baseDir = dev.getDataPathOf(req.query.app) + "/";
                }


                if (req.query.path != null) {
                    baseDir += req.query.path;
                }

                if (baseDir == "") {
                    throw new Error("Path is empty");
                }

                $.sendSuccess( res, await dev.getDefaultBridge().readFile(baseDir, {
                    privileged: privileged
                }));
/*
                res.status(200).send(JSON.stringify({
                    success: true,
                    data: dev.getDefaultBridge().readFile(baseDir, {
                        privileged: privileged
                    })
                }));*/
            } catch (err) {
                $.sendError( res, err.message);
            }
        }
    });



DEVICE_WEB_API.addAsyncPublicRoute(
    '/profile/:type',
    {
        'get': (req:Request, res:Response):any => {
            let dev:Device = null;
            let $:WebServer = req.dxc.$;

            try{
                if (req.query.uid != null) {
                    dev = $.context.getDeviceManager().getDevice(req.query.uid);
                } else if ($.project != null){
                    dev = $.project.getDevice();
                } else{
                    throw new Error("Target device not found");
                }

                if(dev != null)
                    $.sendSuccess(res, dev.getProfile().toJsonObject());
                else
                    $.sendError( res, 'Cannot remove all devices');
            }catch(err){
                $.sendError( res, err.message);
            }
        }
    });



DEVICE_WEB_API.addAsyncPublicRoute(
    '/frida/settings',
    {
        'post': (req:Request, res:Response):any => {
            let dev:Device = null;
            let $:WebServer = req.dxc.$;

            try{
                if (req.body.uid != null) {
                    dev = $.context.getDeviceManager().getDevice(req.body.uid);
                } else if ($.project != null){
                    dev = $.project.getDevice();
                } else{
                    throw DeviceManagerException.DEVICE_NOT_FOUND();
                }

                if(!req.body.hasOwnProperty('opts')){
                    throw new Error("Invalid frida options.")
                }

                const unsafeOptions = req.body.opts;

                dev.setFridaServerOptions(unsafeOptions);
                $.context.getDeviceManager().save();

                $.sendSuccess(res, dev.getProfile().toJsonObject());
            }catch(err){
                $.sendError( res, err.message);
            }
        }
    });

DEVICE_WEB_API.addAsyncPublicRoute(
    '/processes',
    {
        'get': async function (req: Request, res: Response): Promise<any> {
            let privileged: boolean = false;
            let dev: Device = null;
            let $: WebServer = req.dxc.$;

            try {
                switch (req.query.type) {
                    case 'privileged':
                        privileged = true;
                        break;
                    case 'user':
                    case 'shell':
                    default:
                        privileged = false;
                        break;
                }

                if (req.query.uid != null) {
                    dev = $.context.getDeviceManager().getDevice(req.query.uid);
                } if ($.project !== null) {
                    dev = $.project.getDevice();
                }

                if (dev == null) {
                    throw new Error("Target device not found");
                }

                if (!dev.isConnected()) {
                    throw  new Error("Device is offline");
                }


                $.sendSuccess( res, await dev.getDefaultBridge().listProcesses({
                    privileged: privileged
                }));
                /*
                                res.status(200).send(JSON.stringify({
                                    success: true,
                                    data: dev.getDefaultBridge().readFile(baseDir, {
                                        privileged: privileged
                                    })
                                }));*/
            } catch (err) {
                $.sendError( res, err.message);
            }
        }
    });


DEVICE_WEB_API.addAsyncPublicRoute(
    '/connect',
    {
        'post': async (req:Request, res:Response):Promise<any> => {
            let dm:DeviceManager = DeviceManager.getInstance();
            let ip:string = req.body['ip'];
            let port:string = req.body['port'];
            let device:Device = null;
            let data:any = null;
            let $:WebServer = req.dxc.$;

            try{
                if(req.body['dev'] !== null){
                    device = dm.getDevice(req.body['dev']);

                    if(device != null)
                        Logger.debug('[WEBSERVER][/api/device/connect] Device selected : ',device.getUID());
                    else
                        Logger.debug('[WEBSERVER][/api/device/connect] Device not found.');


                }

                if(ip=="" && port==""){
                    let b = device.getBridge('adb+tcp');
                    if( b!= null ){
                        data = await dm.connect( b.ip, b.port, device);
                    }
                }else
                    data = await dm.connect(ip, port, device);


                if(data){
                    dm.save();
                }

                //data = { success: data };
                if(data == false){
                    //data.msg = 'An unknow error happened. See Dexcalibur logs/output for more details.';
                    //res.status(500);
                    $.sendError( res, 'An unknow error happened. See Dexcalibur logs/output for more details.');
                }else{
                    //res.status(200);
                    $.sendSuccess(res,{})
                }
            }catch(err){
                //data = { success:false, msg:err.message };
                //res.status(500)
                $.sendError( res, err.message);
            }

            //res.send(JSON.stringify(data));
        }
    });


DEVICE_WEB_API.addAsyncPublicRoute(
    '/clear/:deviceid',
    {
        'post': (req:Request, res:Response):any => {
            let dm:DeviceManager = DeviceManager.getInstance();
            let deviceid:string = req.params['deviceid'];
            let dev:any;
            let $:WebServer = req.dxc.$;

            try{
                //dev = { success:  };
                //res.status(200);
                if(dm.clear(deviceid))
                    $.sendSuccess( res, {} );
                else
                    $.sendError( res, 'Device cannot be removed');
            }catch(err){
                //dev = { success:false, msg:err.message };
                //res.status(500);
                $.sendError( res, err.message);
            }

            //res.send(JSON.stringify(dev));
        }
    });



DEVICE_WEB_API.addAsyncPublicRoute(
    '/clear',
    {
        'post': (req:Request, res:Response):any => {
            let dm = DeviceManager.getInstance();
            let $:WebServer = req.dxc.$;

            try{
                if(dm.clear( null))
                    $.sendSuccess(res, {});
                else
                    $.sendError( res, 'Cannot remove all devices');
            }catch(err){
                $.sendError( res, err.message);
            }
        }
    });




DEVICE_WEB_API.addAsyncPublicRoute(
    '/bridge/:name/kill',
    {
        'post': async  (req:Request, res:Response):Promise<any> => {
            let dm:DeviceManager = DeviceManager.getInstance();
            let dev:any;
            let $:WebServer = req.dxc.$;

            try{
                dev = dm.getBridgeFactory(req.params['name'].toLowerCase()).newGenericWrapper();

                if(await dev.kill())
                    $.sendSuccess(res, {});
                else
                    $.sendError( res, 'Cannot kill bridge');
            }catch(err){
                $.sendError( res, err.message);
            }
        }
    });

DEVICE_WEB_API.addAsyncPublicRoute(
    '/enroll',
    {
        'post': async (req:Request, res:Response):Promise<any> => {
            let dm:DeviceManager = DeviceManager.getInstance();
            let $:WebServer = req.dxc.$;

            try{
                if(await dm.enroll(req.body['uid'], req.body['opts']))
                    $.sendSuccess( res, {});
                else
                    $.sendError( res, 'Enrollment fails without error');

            }catch(err){
                $.sendError( res, err.message);
            }
        }
    });


DEVICE_WEB_API.addAsyncPublicRoute(
    '/enroll/status',
    {
        'get':  (req:Request, res:Response):any => {
            let dm:DeviceManager = DeviceManager.getInstance();
            //let uid:string = req.body['uid'];
            let status:StatusMessage;
            let $:WebServer = req.dxc.$;

            try{
                // TODO : dm.getEnrollStatus(uid);
                status = dm.getEnrollStatus();

                if(status == null){
                    $.sendSuccess( res, {
                        msg: null,
                        progress: null,
                        extra: null
                    });
                }else{
                    $.sendSuccess( res, {
                        msg: status.getMessage(),
                        progress: status.getProgress(),
                        extra: status.getExtra()
                    });
                }
            }catch(err){
                $.sendError( res, err.message);
            }


        }
    });


DEVICE_WEB_API.addAsyncPublicRoute(
    '',
    {
    'get': async (req:Request, res:Response):Promise<any> => {
        // scan connected devices
        let dm:DeviceManager;
        let $:WebServer = req.dxc.$;

        try{
            dm = DeviceManager.getInstance();
            await dm.scan();
            dm.save();

            $.sendSuccess(res, {
                devices: dm.toJsonObject(  {
                    device: {
                        profile: false,
                        frida: true,
                        bridge: {
                            path: false
                        }
                    }
                })
            });

        }catch(err){
            Logger.error("[API][DEVICE] List device : "+err.message+"\n"+err.stack);
            $.sendError( res, "Devices cannot be listed.")
        }
    }
});

//


DEVICE_WEB_API.addAsyncPublicRoute(
    '/applications',
    {
    'get': async (req:Request, res:Response):Promise<any> => {
        // scan connected devices
        let dev:Device, dm:DeviceManager, pkgs:AppPackage[], rep:any;
        let _HTTP_CODE:number, _DATA:any;
        let $:WebServer = req.dxc.$;

        try{

            dm = DeviceManager.getInstance();
            dev = dm.getDevice( req.query.uid );

            if(dev.isEnrolled() == false){
                throw new Error('Device is not enrolled');
            }

            dev.updateInstalledApp();
            //pkgs = dev.getDefaultBridge().listPackages('-f');
            pkgs = dev.getInstalledApp();
            dm.save();
            //dev.updateCache('package',pkgs);

            rep = {
                device: req.query.uid,
                apps:[]
            };

            pkgs.map( (x:AppPackage)=>{
                rep.apps.push(x.toJsonObject())
            });

            $.sendSuccess( res, rep);
        }catch(err){
            Logger.error("[API][DEVICE] List apps from device : "+err.message+"\n"+err.stack);
            $.sendError( res, err.message)
        }
    }
});


DEVICE_WEB_API.addPublicRoute(
    '/application/pull',
    {
        'post': (req:Request, res:Response):any => {
            let dm = DeviceManager.getInstance();
            let dev:Device = null, success:boolean = false, app:AppPackage = null;
            let rep:any =  {};
            let $:WebServer = req.dxc.$;

            let _HTTP_CODE:number, _DATA:any;

            try{
                dev =dm.getDevice(req.body['uid']);

                if(dev == null) throw new Error("Unknown device");
                if(!dev.isConnected()) throw new Error("Target device is offline");
                if(req.body['package'] == null) throw new Error("Package identifier not specified");

                if(req.body['path']!=null) {
                    success = dev.pullPackage(req.body['package'], req.body['path']);
                    if(success)
                        $.sendSuccess( res, { });
                    else
                        $.sendError( res, 'Package not found or invalid destination path');
                }else{
                    app = dev.getApplicationByID(req.body['package']);
                    if(app==null) throw new Error("Package not found");
                    $.sendSuccess( res, { tmp: dev.pullTemp(app.packagePath) });
                }

            }catch(err){
                Logger.error("[API][DEVICE] Pull app from device : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message);
            }
        }
    });

DEVICE_WEB_API.addAsyncAuthenticatedRoute(
    '/application/install/project',
    {
        'post': async (req:Request, res:Response):Promise<any> => {
            let dev:Device;
            let $:WebServer = req.dxc.$;
            let project:DexcaliburProject;

            try{
                project = req.dxc.project;

                if (req.body.uid != null) {
                    dev = $.context.getDeviceManager().getDevice(req.body.uid);
                } else if (project != null){
                    dev = project.getDevice();
                } else{
                    throw DeviceManagerException.DEVICE_ID_NULL();
                }

                if(dev == null) {
                    throw DeviceManagerException.DEVICE_NOT_FOUND();
                }


                if(!req.body.hasOwnProperty('opts')){
                    throw new Error("Invalid frida options.")
                }

                let installOpts:BridgeInstallOptions = {
                    multiple: false,
                    opts: []
                };

                if(req.body.hasOwnProperty('opts'))
                    installOpts = dev.prepareInstallOptions(req.body.opts);

                const success =  await dev.installApp([project.getWorkspace().getApkPath()], installOpts);

                if(success)
                    $.sendSuccess(res, {});
                else
                    throw new Error('An unknown error occurred at install');
            }catch(err){
                Logger.error("[API][DEVICE] Install project app failed : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message);
            }
        }
    },{
        readProject: true
    });

DEVICE_WEB_API.addPublicRoute(
    '/api/device/setDefault',
    {
        'post': (req:Request, res:Response):any => {
            // collect
            let uid:string = req.body["uid"];
            let puid:string = req.body["pid"]; // project uid
            let dm:DeviceManager = DeviceManager.getInstance();
            let dev:Device = null, errcode:string = null;
            let $:WebServer = req.dxc.$;

            try{
                res.set('Content-Type', 'text/json');
                if(uid == null)
                    throw DeviceManagerException.DEVICE_ID_NULL();


                dev = dm.getDevice(uid);
                if(dev==null)
                    throw DeviceManagerException.DEVICE_NOT_FOUND();


                if($.project != null){
                    $.project.setDevice(dm.getDevice(uid));
                    $.project.save();
                }
                // TODO : change > defaultDevice => project
                dm.setDefault(uid);


                $.sendSuccess( res, { msg: "Device <b>"+uid+"</b> is the new default device." })

            }catch(err){
                Logger.error("[API][DEVICE] Set default device for project: "+err.message+"\n"+err.stack);
                //_DATA = { success:false, error:err.message, errcode:errcode };
                $.sendError( res, err.message, { error:err.message, errcode:errcode })
            }
        }
    });


DEVICE_WEB_API.addAsyncPublicRoute(
    '/:uid/bridge',
    {
        'put': async (req:Request, res:Response):Promise<any> => {
            // scan connected devices
            let dev:Device=null, bridge:IBridge=null, dm:DeviceManager=null, result:boolean=false;
            let $:WebServer = req.dxc.$;

            try{
                dm = DeviceManager.getInstance();
                dev = dm.getDevice(req.params.uid);
                bridge = dev.getBridge(req.body['name']);


                if(bridge.up==false){
                    if(bridge.isNetworkTransport()){
                        //result = await dm.connect( bridge.ip, bridge.port, dev);
                        if(await dm.connect( bridge.ip, bridge.port, dev)){
                            dev.setDefaultBridge(req.body['name']);
                            dm.save();
                            //res.status(200).send({ success: true });
                            $.sendSuccess(res, {});
                            return ;
                        }else{
                            //res.status(500).send({ success: false, msg:'Connection over TCP failed.' });
                            $.sendError(res, 'Connection over TCP failed.' )
                            return ;
                        }
                    }else{
                        //res.status(500).send({ success: false, msg:'Please connect the device through USB and retry.' });
                        $.sendError(res, 'Please connect the device through USB and retry.'  )
                        return ;
                    }
                }else{
                    dev.setDefaultBridge(req.body['name']);
                    dm.save();
                    $.sendSuccess(res, {});
                    return;
                }

            }catch(err){
                //res.status(500).send({ success: false, msg:err.message });
                $.sendError( res, err.message);
            }
        }
    });
