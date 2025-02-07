import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import {Device, DeviceUUID} from "../Device.js";
import * as Log from "../Logger.js";
import WebServer from "../WebServer.js";
import DeviceManager from "../DeviceManager.js";
import StatusMessage from "../StatusMessage.js";
import AppPackage from "../AppPackage.js";
import {DeviceManagerException} from "../errors/DeviceManagerException.js";
import {BridgeInstallOptions, DeviceProfilingOptions, IBridge} from "../Bridge.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {MonitoredError} from "../errors/MonitoredError.js";
import {OperatingSystem} from "../platform/OperatingSystem.js";
import {DeviceFactory} from "../device/DeviceFactory.js";
import PlatformManager from "../platform/PlatformManager.js";
import AdbWrapperFactory from "../AdbWrapperFactory.js";
import {PrivilegedExecutionStrategy} from "../PrivilegedExecutionStrategy.js";
import {InputSetPurpose} from "../analyzer/IPackageAnalyzer.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import {DeviceTemplate} from "../device/template/DeviceTemplate.js";
import {UserAccount} from "../user/UserAccount.js";
import {VdevEventType} from "../device/maker/VdevEvent.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {VirtualDeviceFactoryException} from "../device/error/VirtualDeviceFactoryException.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export const DEVICE_WEB_API: DelegateWebApi = new DelegateWebApi("DEV");

DEVICE_WEB_API.addAsyncPublicRoute(
    '/fs/list',
    {
        'get': async (req, res)=>{
            let baseDir = "";
            let privileged = false;
            let dev:Device = null;
            const $:WebServer = req.dxc.$;

            try{

                if( req.query.uid!=null ){
                    dev = $.context.getDeviceManager().getDevice(req.query.uid);
                }
                else{
                    dev = req.dxc.project.getDevice();
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
                console.log(err,err.stack);
                //res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg: err.message }));
                $.sendError(res, err.message);
            }
        }
    }
)


DEVICE_WEB_API.addAsyncPublicRoute(
    '/fs/content',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse): Promise<any> {
            let baseDir = "";
            let privileged = false;
            let dev: Device = null;
            const $: WebServer = req.dxc.$;

            try {
                if (req.query.uid != null) {
                    dev = $.context.getDeviceManager().getDevice(req.query.uid as string);
                } else {
                    //req.dxc.project = DEVICE_WEB_API.doProjectSecurityChecks(req, $, {readProject:true, readProjectStrict:true });
                    dev = req.project.getDevice();
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
                    baseDir = dev.getDataPathOf(req.query.app as string) + "/";
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
        'get': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            let dev:Device = null;
            const $:WebServer = req.dxc.$;

            try{
                if (req.query.uid != null) {
                    dev = $.context.getDeviceManager().getDevice(req.query.uid as string);
                } else if ($.project != null){
                    dev = $.project.getDevice();
                } else{
                    throw new Error("Target device not found");
                }

                if(dev != null) {
                    switch (req.params.type){
                        case 'network':
                            $.sendSuccess(res, dev.getProfile().getNetworkProfile().toJsonObject());
                            break;
                        case 'build':
                            $.sendSuccess(res, dev.getProfile().getBuildProfile().toJsonObject());
                            break;
                        case 'trust':
                            $.sendSuccess(res, dev.getProfile().getTrustProfile().toJsonObject());
                            break;
                        case 'system':
                            $.sendSuccess(res, dev.getProfile().getSystemProfile().toJsonObject());
                            break;
                        case 'all':
                        default:
                            $.sendSuccess(res, dev.getProfile().toJsonObject());
                            break;
                    }
                }else
                    $.sendError( res, 'Cannot remove all devices');
            }catch(err){
                $.sendError( res, err.message);
            }
        },
        'post': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            let dev:Device = null;
            const $:WebServer = req.dxc.$;

            try{
                if (req.body.uid != null) {
                    dev = $.context.getDeviceManager().getDevice(req.body.uid);
                } else if ($.project != null){
                    dev = $.project.getDevice();
                } else{
                    throw new Error("Target device not found");
                }

                const opts:DeviceProfilingOptions = (req.body.hasOwnProperty('opts')? req.body.opts : {} );
                // @ts-ignore
                opts.type = req.params.type as string;
                opts.profile = dev.getProfile();
                opts.refresh = true;
                opts.unprivileged = !dev.isEnrolled();
                await dev.performProfiling(opts);

                if(dev != null){
                    $.context.getDeviceManager().save();
                    switch (req.params.type){
                        case 'network':
                            $.sendSuccess(res, dev.getProfile().getNetworkProfile().toJsonObject());
                            break;
                        case 'build':
                            $.sendSuccess(res, dev.getProfile().getBuildProfile().toJsonObject());
                            break;
                        case 'trust':
                            $.sendSuccess(res, dev.getProfile().getTrustProfile().toJsonObject());
                            break;
                        case 'system':
                            $.sendSuccess(res, dev.getProfile().getSystemProfile().toJsonObject());
                            break;
                        case 'all':
                        default:
                            $.sendSuccess(res, dev.getProfile().toJsonObject());
                            break;
                    }
                }
                else
                    $.sendError( res, 'Profiling error : device not found');
            }catch(err){
                $.sendError( res, err.message);
            }
        }
    });



DEVICE_WEB_API.addAsyncPublicRoute(
    '/frida/settings',
    {
        'post': (req:DelegateRequest, res:DelegateResponse):any => {
            let dev:Device = null;
            const $:WebServer = req.dxc.$;

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
        'get': async function (req:DelegateRequest, res:DelegateResponse): Promise<any> {
            let privileged = false;
            let dev: Device = null;
            const $: WebServer = req.dxc.$;

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
                    dev = $.context.getDeviceManager().getDevice(req.query.uid as string);
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
        'post': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            const dm:DeviceManager = DeviceManager.getInstance();
            const ip:string = req.body['ip'];
            const port:string = req.body['port'];
            let device:Device = null;
            let data:any = null;
            const $:WebServer = req.dxc.$;

            try{
                if(req.body['dev'] !== null){
                    device = dm.getDevice(req.body['dev']);

                    if(device != null)
                        Logger.debug('[WEBSERVER][/api/device/connect] Device selected : ',device.getUID());
                    else
                        Logger.debug('[WEBSERVER][/api/device/connect] Device not found.');


                }

                if(ip=="" && port==""){
                    const b = device.getBridge('adb+tcp');
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
        'post': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            const dm:DeviceManager = DeviceManager.getInstance();
            const deviceid:string = req.params['deviceid'];
            const $:WebServer = req.dxc.$;

            try{
                //dev = { success:  };
                //res.status(200);
                const suc = await dm.clear(deviceid);
                if(suc)
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
        'post': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            const dm = DeviceManager.getInstance();
            const $:WebServer = req.dxc.$;

            try{
                if(await dm.clear( null))
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
        'post': async  (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            const dm:DeviceManager = DeviceManager.getInstance();
            let dev:IBridge;
            const $:WebServer = req.dxc.$;

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
        'post': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            const dm:DeviceManager = DeviceManager.getInstance();
            const $:WebServer = req.dxc.$;

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
        'get':  (req:DelegateRequest, res:DelegateResponse):any => {
            const dm:DeviceManager = DeviceManager.getInstance();
            //let uid:string = req.body['uid'];
            let status:StatusMessage;
            const $:WebServer = req.dxc.$;

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
    'get': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any> => {
        // scan connected devices
        let dm:DeviceManager;
        const $: WebServer = pReq.dxc.$;

        try {


            dm = DeviceManager.getInstance();
            await dm.scan();
            dm.save();

            let devs:DeviceUUID[] = [];

            if(pReq.query.puid!=null){
                // to do
            }else if(ApplicationUnit.VALIDATE.uuid.test(pReq.query.aid)){
                const app = await $.context.getOrgManager().getApplicationUnit(
                    (pReq as any).user,
                    pReq.query.aid as string
                );

                console.log(pReq.query.aid, app);
                console.log(app.getTargetDevices());
                console.log(dm.getDevices(app.getTargetDevices()));
                $.sendSuccess(pRes,
                    {devices:dm.getDevices(app.getTargetDevices())
                        .map(d => d.toJsonObject({
                            exclude:{
                                profile: false,
                                frida: true,
                                bridge: {
                                    path: false
                                }
                            }}))}
                );

            }else if(ApplicationUnit.VALIDATE.uuid.test(pReq.query.oid)){
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.query.oid as string
                );


                $.sendSuccess(pRes,
                    {devices: dm.getDevices(org.getDevices())
                        .map(d => d.toJsonObject({
                            exclude:{
                                profile: false,
                                frida: true,
                                bridge: {
                                    path: false
                                }
                            }}))}
                );
            }else{
                $.sendSuccess(pRes, {
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
            }


        } catch (err) {

            $.sendErrorAfterException(
                pRes, DEVICE_WEB_API.name,
                "Devices cannot be listed.",
                err, {cause: err.message});
        }

        /*
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
        }*/
    }
});

//
DEVICE_WEB_API.addAsyncPublicRoute(
    '/syscalls',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            // scan connected devices
            let dev:Device, dm:DeviceManager;
            const $:WebServer = req.dxc.$;

            try{

                dm = DeviceManager.getInstance();
                dev = dm.getDevice( req.query.uid  as string);


                $.sendSuccess( res, dev.getSyscallList());
            }catch(err){
                Logger.error("[API][DEVICE] List of system calls cannot be retrieved for the specified device : "+err.message+"\n"+err.stack);
                $.sendError( res, "[API][DEVICE] List of system calls cannot be retrieved for the specified device : "+err.message);
            }
        }
    });
DEVICE_WEB_API.addAsyncPublicRoute(
    '/syscalls',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            // scan connected devices
            let dev:Device, dm:DeviceManager;
            const $:WebServer = req.dxc.$;

            try{

                dm = DeviceManager.getInstance();
                dev = dm.getDevice( req.query.uid  as string);


                $.sendSuccess( res, dev.getSyscallList());
            }catch(err){
                Logger.error("[API][DEVICE] List of system calls cannot be retrieved for the specified device : "+err.message+"\n"+err.stack);
                $.sendError( res, "[API][DEVICE] List of system calls cannot be retrieved for the specified device : "+err.message);
            }
        }
    });

DEVICE_WEB_API.addAsyncPublicRoute(
    '/eop/change',
    {
    'post': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
        // scan connected devices
        let dev:Device, bridge:IBridge, dm:DeviceManager, pkgs:AppPackage[], rep:any;
        const $:WebServer = req.dxc.$;

        try{

            dm = DeviceManager.getInstance();
            dev = dm.getDevice( req.body['uid']  as string);
            bridge = dev.getBridge( req.body['bridge']  as string);

            const unsafeStrat = req.body['strategy'];
            const strats = PrivilegedExecutionStrategy.fromJsonObject(unsafeStrat)

            bridge.addPrivilegedStrategy(strats);

            dm.save();

            $.sendSuccess( res, rep);
        }catch(err){
            Logger.error("[API][DEVICE] Privileges shell user cannot be changed : "+err.message+"\n"+err.stack);
            $.sendError( res, err.message)
        }
    }
});


DEVICE_WEB_API.addPublicRoute(
    '/application/pull',
    {
        'post': (req:DelegateRequest, res:DelegateResponse):any => {
            const dm = DeviceManager.getInstance();
            let dev:Device = null, success = false, app:AppPackage = null;
            const $:WebServer = req.dxc.$;


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
        'post': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            let dev:Device;
            const $:WebServer = req.dxc.$;
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
                    throw new Error("Invalid install options.")
                }

                let installOpts:BridgeInstallOptions = {
                    multiple: false,
                    opts: []
                };


                if(req.body.hasOwnProperty('opts')){
                    installOpts = dev.prepareInstallOptions(req.body.opts);
                }

                let success:boolean;
                if(project.packageAnalyzer!=null){
                    //project.getPac
                    //success =  await dev.installApp([project.getWorkspace().getAppPath()], installOpts);
                    success =  await dev.installProject(
                        project.getPackageAnalyzer()
                            .getInputsFor(InputSetPurpose.INSTALL),
                    installOpts);
                }else{
                    if(project.hasMultipleInputs()){
                        success =  await dev.installProject(project.inputs, installOpts);
                    }else{
                        success =  await dev.installApp([project.getWorkspace().getAppPath()], installOpts);
                    }

                }


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
    '/setDefault',
    {
        'post': (req:DelegateRequest, res:DelegateResponse):any => {
            // collect
            const uid:string = req.body["uid"];
            const dm:DeviceManager = DeviceManager.getInstance();
            let dev:Device = null;
            const $:WebServer = req.dxc.$;

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
                    $.sendSuccess( res, { msg: "Device <b>"+uid+"</b> is the new default device." })
                }else{
                    throw new Error("[API][DEVICE][DEPRECATED] A device cannot be defined globally as default device.");
                    // TODO : change > defaultDevice => project
                    // dm.setDefault(uid);
                }



                $.sendSuccess( res, { msg: "Device <b>"+uid+"</b> is the new default device." })

            }catch(err){
                Logger.error("[API][DEVICE] Set default device for project: "+err.message+"\n"+err.stack);
                //_DATA = { success:false, error:err.message, errcode:errcode };
                $.sendError( res, err.message, { error:err.message, errcode:(err as MonitoredError).getCode() })
            }
        }
    });



DEVICE_WEB_API.addPublicRoute(
    '/acquire',
    {
        'post': (req:DelegateRequest, res:DelegateResponse):any => {
            const dm = DeviceManager.getInstance();
            let dev:Device = null, success = false, app:AppPackage = null;
            const $:WebServer = req.dxc.$;


            try{
                dev =dm.getDevice(req.body['uid']);
                dev.updateInstalledApp();

                if(dev == null) throw new Error("Unknown device");
                if(!dev.isConnected()) throw new Error("Target device is offline");
                if(req.body['opts'] == null) throw new Error("Acquisition options are not specified");


                if(req.body['opts'].type=="single"){
                    dm.acquire(dev, {
                        type: "single"
                    });
                }else{
                    dm.acquire(dev, {
                        type: "all"
                    });
                }


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

/**
 * Create device endpoints
 *
 */
DEVICE_WEB_API.addPublicRoute(
    '/create',
    {
        'post': (req:DelegateRequest, res:DelegateResponse):any => {
            // collect
            const uid:string = req.body["uid"];
            const dm:DeviceManager = DeviceManager.getInstance();
            const $:WebServer = req.dxc.$;
            const pm = PlatformManager.getInstance();
            try{
                res.set('Content-Type', 'text/json');

                let dev:Device = null;
                switch(req.body["os"]){
                    case OperatingSystem.ANDROID:
                        dev = DeviceFactory.newAndroidDevice({
                            arch: req.body["arch"],
                            platform: pm.getPlatform(req.body["platform"]),
                            device: req.body["name"],
                            model: "VDev-1.0",
                            product: "DxcVirtualDevice",
                            offline: false,
                            enrolled: false,
                            bridge: AdbWrapperFactory.getInstance().newVirtualWrapper(),
                            apps:[],
                            syscalls:[]
                        });
                        break;
                }
                //Device.newAndroidDevice()
                dm.addDevice(dev);
                if(dev==null)
                    throw DeviceManagerException.DEVICE_NOT_FOUND();

                dm.save();

                $.sendSuccess( res, { msg: "Device <b>"+uid+"</b> has been created." })
            }catch(err){
                Logger.error("[API][DEVICE] Cannot create device : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message, { error:err.message, errcode:(err as MonitoredError).getCode() })
            }
        }
    });


DEVICE_WEB_API.addAsyncPublicRoute(
    '/:uid/bridge',
    {
        'put': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            // scan connected devices
            let dev:Device=null, bridge:IBridge=null, dm:DeviceManager=null;
            const $:WebServer = req.dxc.$;

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


DEVICE_WEB_API.addAsyncPublicRoute(
    '/models/search',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const models = await $.context.getSignatureServer().searchDeviceModels(
                    decodeURIComponent(req.query.ppt as string),
                    decodeURIComponent(req.query.pattern as string),
                    req.query.contains=="1"? true : false
                );
                const all = [];

                models.map(x => {
                    all.push(x.toJsonObject());
                })

                $.sendSuccess(res, all);
            }catch(err){
                Logger.error("[API][DEVICE] Device models cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Device models cannot be listed. Cause : " + err.message);
            }
        }
    }
);

DEVICE_WEB_API.addAsyncPublicRoute(
    '/models/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const models = await $.context.getSignatureServer().getDeviceModels();
                const all = [];

                models.map(x => {
                    all.push(x.toJsonObject());
                })

                $.sendSuccess(res, all);
            }catch(err){
                Logger.error("[API][DEVICE] Device models cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Device models cannot be listed. Cause : " + err.message);
            }
        }
    }
);

DEVICE_WEB_API.addAsyncPublicRoute(
    '/brands/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const brands = await $.context.getSignatureServer().getBrands();
                const all = [];

                brands.map(x => {
                    all.push(x.toJsonObject());
                })

                $.sendSuccess(res, all);
            }catch(err){
                Logger.error("[API][DEVICE] Brands cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Brands cannot be listed. Cause : " + err.message);
            }
        }
    }
);


DEVICE_WEB_API.addAsyncPublicRoute(
    '/applications/:uid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const dm = DeviceManager.getInstance();
            let dev:Device = null, success = false, app:AppPackage = null;
            const $:WebServer = req.dxc.$;


            try{
                dev =dm.getDevice(req.params.uid);

                if(dev == null) throw new Error("Unknown device");
                if(!dev.isConnected()) throw new Error("Target device is offline");

                let apps = dev.getInstalledApp(true);
                /*if(apps.length==0){
                    apps = dev.getInstalledApp(true);
                }*/

                const data  = [];
                apps.map(x => {
                    data.push(x.toJsonObject());
                })

                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][DEVICE] Installed package cannot be listed : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message);
            }
        }
    }
);


DEVICE_WEB_API.addAsyncPublicRoute(
    '/dev/:uid/org/:oid',
    {
        'get': async function (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any> {

            const $:WebServer = pReq.dxc.$;

            try{
                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                let dev = ( await $.context.getOrgManager().getDevice((pReq as any).user, org, pReq.params.uid));


                $.sendSuccess(
                    pRes,
                    dev.toJsonObject({})
                );
            }catch(err){

                $.sendErrorAfterException(
                    pRes, DEVICE_WEB_API.name,
                    "Device data cannot be retrieved.",
                    err,{cause:err.message});
            }
        }
    }
);





DEVICE_WEB_API.addAsyncPublicRoute(
    '/vdev/tpl/org/:oid',
    {
        'get': async function (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any> {

            const $:WebServer = pReq.dxc.$;

            try{
                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );


                $.sendSuccess(
                    pRes,
                    ( await $.context
                            .getDeviceManager()
                            .getDeviceTemplateAPI()
                            .listTemplates((pReq as any).user, org)
                    ).map(x => x.toJsonObject())
                );
            }catch(err){

                $.sendErrorAfterException(
                    pRes, DEVICE_WEB_API.name,
                    "List of device templates cannot be retrieved.",
                    err,{cause:err.message});
            }
        }
    }
);


DEVICE_WEB_API.addAsyncPublicRoute(
    '/vdev/tpl/org/:oid/create/:tpl',
    {
        'post': async function (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any> {

            const $:WebServer = pReq.dxc.$;

            try{
                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                if(!DeviceTemplate.VALIDATE.uuid.test(pReq.params.tpl as string)){
                    throw new Error("Invalid template uuid");
                }

                let dev = (await $.context
                    .getDeviceManager()
                    .allocateVirtualDevice(
                        (pReq as any).user as UserAccount,
                        pReq.params.tpl as string,
                        (pReq.body.extra!=null? pReq.body.extra : {})
                    )).subscribe(async (vEvent)=>{
                        if(vEvent.type===VdevEventType.READY){

                            try{
                                await $.context.getOrgManager().attachDevice(
                                    (pReq as any).user,
                                    org,
                                    vEvent.data.device.getUID()
                                );
                                $.sendSuccess(
                                    pRes,
                                    { dev:vEvent.data.device.getUID() }
                                );
                            }catch (err2){
                                $.sendErrorAfterException(
                                    pRes, DEVICE_WEB_API.name,
                                    "Device cannot be allocated. (2)",
                                    err2,{cause:err2.message});
                            }
                        }
                    })




            }catch(err){

                $.sendErrorAfterException(
                    pRes, DEVICE_WEB_API.name,
                    "Device cannot be allocated.",
                    err,{cause:err.message});
            }
        }
    }
);


DEVICE_WEB_API.addAsyncPublicRoute(
    '/vdev/start/:did/:oid',
    {
        'post': async function (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any> {

            const $:WebServer = pReq.dxc.$;

            try{

                if(!OrganizationUnit.VALIDATE.uuid.test(pReq.params.oid)){
                    throw OrganizationManagerException.INVALID_ORG_UUID_FMT(pReq.params.oid)
                }

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                if(!Device.VALIDATE.uuid.test(pReq.params.did as string)){
                    throw VirtualDeviceFactoryException.INVALID_DEVICE_UUID_FMT(pReq.params.did as string);
                }

                (await $.context.getOrgManager().startDevice(
                    (pReq as any).user,
                    org,
                    pReq.params.did
                )).subscribe((vEvent)=>{
                    if(vEvent.type==VdevEventType.READY){
                        $.sendSuccess(
                            pRes,
                            true
                        );
                    }
                });

            }catch(err){

                $.sendErrorAfterException(
                    pRes, DEVICE_WEB_API.name,
                    "Device cannot be started.",
                    err,{cause:err.message});
            }
        }
    }
);




DEVICE_WEB_API.addAsyncPublicRoute(
    '/vdev/stop/:did/:oid',
    {
        'post': async function (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any> {

            const $:WebServer = pReq.dxc.$;

            try{

                if(!OrganizationUnit.VALIDATE.uuid.test(pReq.params.oid)){
                    throw OrganizationManagerException.INVALID_ORG_UUID_FMT(pReq.params.oid)
                }

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                if(!Device.VALIDATE.uuid.test(pReq.params.did as string)){
                    throw VirtualDeviceFactoryException.INVALID_DEVICE_UUID_FMT(pReq.params.did as string);
                }

                await $.context.getOrgManager().stopDevice(
                    (pReq as any).user,
                    org,
                    pReq.params.did
                );

                $.sendSuccess(
                    pRes,
                    true
                );

            }catch(err){

                $.sendErrorAfterException(
                    pRes, DEVICE_WEB_API.name,
                    "Device cannot be stopped.",
                    err,{cause:err.message});
            }
        }
    }
);


DEVICE_WEB_API.addAsyncPublicRoute(
    '/action/:uid/:action',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse):Promise<any> => {
            // scan connected devices
            let dev:Device=null, bridge:IBridge=null, dm:DeviceManager=null, action:string=null, data:any;
            const $:WebServer = req.dxc.$;

            try{
                dm = DeviceManager.getInstance();
                dev = dm.getDevice(req.params.uid);
                action = req.params.action;
                if (req.body['bridgeName'] != null) {
                    bridge = dev.getBridge(req.body['bridgeName']);
                } else {
                    bridge = dev.getDefaultBridge()
                }
                if (bridge == null) throw new Error("Unable to get Bridge");
                switch (action) {
                    case 'screen.screenshot':
                        data = bridge.performScreenshot(/*req.body['options']*/).toJsonObject();
                        break;
                    default :
                        data = null;
                        break;
                }
                $.sendSuccess(res, data);
            }catch(err){
                //res.status(500).send({ success: false, msg:err.message });
                $.sendError( res, err.message);
            }
        }
    });