import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import {Device} from "../Device.js";
import WebServer from "../WebServer.js";
import DeviceManager from "../DeviceManager.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import {UserSession} from "../user/session/UserSession.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {UserAccount} from "../user/UserAccount.js";
import Platform from "../Platform.js";
import {Workflow} from "../Workflow.js";
import StatusMessage from "../StatusMessage.js";
import PlatformManager from "../PlatformManager.js";
import Downloader from "../Downloader.js";
import * as _fs_ from "fs";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import AccessControl from "../user/acl/AccessControl.js";
import {AccessZone} from "../user/acl/Zones.js";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol.js";
import {ConnectionHandler} from "../remote/ConnectionHandler.js";
import {Settings} from "../Settings.js";
import {DexcaliburConnectionException} from "../errors/DexcaliburConnectionException.js";
import {DexcaliburEngineMode} from "../DexcaliburEngine.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PROJECT_MGT_WEB_API: DelegateWebApi = new DelegateWebApi();

PROJECT_MGT_WEB_API.addAuthenticatedRoute(
    '/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse)=>{

            let $:WebServer = req.dxc.$;
            let user:UserAccount;

            try {

                    user = (req.dxc.sess as UserSession).getUserAccount();

                    $.sendSuccess( res, {
                        projects: user.listProjects($.context)
                    });

            }catch(err){
                Logger.error("[API][PROJECT MGT] Unable to list projects : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message);
            }
        }
    }
);


PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/new',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse)=>{


            const PLATFORM_MODE = ['dev','min','max'];

            let $:WebServer = req.dxc.$;

            let project:DexcaliburProject = null;
            let dm:DeviceManager = null;
            let device:Device = null;
            let path:string = null;
            let user:UserAccount = null;
            let platform:Platform = null;
            let success:boolean = true;
            let wf:Workflow = null;
            let anal:any = null;


            try{

                dm = DeviceManager.getInstance();
                await dm.scan();


                user = (req.dxc.sess as UserSession).getUserAccount();

                console.log("USER from sessions : ",user);

                if(req.body['dev'] != null){
                    device = dm.getDevice( req.body['dev']);
                    if(device == null || !device.isEnrolled()){
                        throw DexcaliburProjectException.TARGET_DEVICE_NOT_ENROLLED();
                    }
                }

                if(req.body['name'] == null){
                    throw DexcaliburProjectException.INVALID_NAME();
                }


                if(req.body['cfg'] != null){
               //     throw DexcaliburProjectException.INVALID_NAME();
               // }else{
                    anal = req.body['cfg'];
                }

                // init workflow
                wf = $.context.newWorkflow(req.body['name']).changeOwner(user);

                // TODO : retrieve platform from special value of req.body['platform'] : target, from target device, target API version from manifest , ...

                // first download remote application
                // on error : ne‹ project will not create.
                switch(req.body['type'])
                {
                    case 'select':
                        if(device == null){
                            throw DexcaliburProjectException.TARGET_DEVICE_NOT_FOUND();
                        }
                        wf.pushStatus(new StatusMessage(5, "Get target platform"));
                        platform = device.getPlatform();
                        wf.pushStatus(new StatusMessage(10, "Pull application from device"));
                        path = device.pullTemp( req.body['path'] );
                        break;
                    case 'download':
                        if(PLATFORM_MODE.indexOf(req.body['platform'])==-1){
                            wf.pushStatus(new StatusMessage(5, "Set target platform"));
                            platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                        }
                        wf.pushStatus(new StatusMessage(10, "Download target application from remote location"));
                        path = await Downloader.downloadTemp(req.body['url'], { mode:0o666, encoding:'binary', force:true });
                        break;
                    case 'upload':
                        wf.pushStatus(new StatusMessage(5, "Set target platform"));
                        platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                        wf.pushStatus(new StatusMessage(10, "Select previously uploaded application"));
//                        path = $.uploader.getPathOf(req.body['uploadid']);
                        if(req.body['file']!=null){
                            path = $.uploader.getPathOf(req.body['file']);
                        }else{
                            path = $.uploader.getPathOf((req.dxc.sess as UserSession).getData('proj_upload_id'));
                        }
                        break;
                    case 'fromfs':
                        wf.pushStatus(new StatusMessage(5, "Set target platform"));
                        platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                        path = req.body['path'];
                        break;
                    default:
                        throw new Error("Project type is invalid")
                        break;
                }

                // chcek if file exists an it is not empty
                if( (!_fs_.existsSync(path)) || (false)){
                    throw DexcaliburProjectException.APP_FILE_OT_FOUND();
                }

                if(device==null && req.body['targetOS']!=null){
                    // try to find compatible device already enrolled
                    device = dm.searchCompatibleDevice(req.body['targetOS']);
                    if(device!=null && platform==null){
                        platform = device.getPlatform();
                        console.log("Compatible device found :",device.uid);
                    }else{

                        console.log("Compatiblme device NOT found ");
                    }
                }

/*
                if(['min','max','dev'].indexOf(req.body['platform'])>-1){
                    platform = null;
                }*/


                Logger.info(
                    '[PROJECT][STEP 2] Detecting device  ... ',
                    device!==null?'[OK]':'[KO]',
                    ' Platform ... ',
                    platform!==null? '[OK]':'[KO]');

                // create project : UID , APK [, Device]
                Logger.info('[PROJECT][STEP 2] Creating new project ...');

                wf.stepUp(15);

                project = await $.context.newProject(req.body['name'], path, device, user);

                if(project == null){
                    throw DexcaliburProjectException.STEP2_FAILURE();
                }

                project.setWorkflow(wf);

                // to set connector
                Logger.info('[PROJECT][STEP 3] Setting connectors ...');

                if(req.body['connector'] != null && req.body['connector'].length > 0){
                    project.setConnector(req.body['connector']);
                }else
                    project.setConnector($.context.getWorkspace().getSettings().getDefaultConnector());


                if(project != null){
                    Logger.info('[PROJECT][STEP 3.1] Configuring platform ...');
                    wf.pushStatus(new StatusMessage(10, "Synchronizing target platform with project"));
                    //platform = PlatformManager.getInstance().getDefaultPlatformFor();
                    // sync project platform with target platform or APK


                    success = await project.synchronizePlatform( platform.getUID());
                }

                if(anal != null){

                    Logger.info('[PROJECT][STEP 3.2] Configuring Analyzers ...');
                    // wf.pushStatus(new StatusMessage(11, "Configuring Analyzers"));
                    const analCfg = project.getAnalyzerConfiguration(); // platform.getUID());
                    analCfg.setFileAnalysisMode(anal.fa_mode);
                    analCfg.setNativeAnalysisMode(anal.na_mode);

                    /*if(anal.ssa_auto != null){
                        analCfg.setAndroid(anal.na_mode);
                    }*/
                }

                Logger.info('[PROJECT][STEP 4] Analyzing application ...');
                if(success){
                    wf.stepUp(15);
                    project = await project.fullscan();
                    success = project.isReady();
                    wf.pushStatus(StatusMessage.newSuccess("Project has been created successfully."))
                }

                if(!success){
                    throw DexcaliburProjectException.NEW_PROJECT_FAIL();
                }


                $.sendSuccess( res, {
                    uid: (project != null ? project.getUID() : null)
                });
            }catch(err){

                if(wf!=null){
                    wf.pushStatus(StatusMessage.newError(err.message))
                }

                Logger.error("[API][PROJECT MGT] "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }

            return ;

        }
    }
);

/*
 * ROUTE
 * Upload a file into target workspace
 *
 */
PROJECT_MGT_WEB_API.addAuthenticatedRoute(
    '/upload',
    {
        'post':  (req:DelegateRequest, res:DelegateResponse)=>{


            let $:WebServer = req.dxc.$;
            let user:UserAccount;
            try {
                $.uploader.newUpload( req, res,function( vId:string):any {
                    // save upload UID into user session
                    req.dxc.sess.addData('proj_upload_id', vId);

                    $.sendSuccess( res, { upload:vId });
                    res.end();
                });

            }catch(err){
                Logger.error("[API][PROJECT MGT] Project upload failed : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message)
            }


        }
    }
)


PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/open',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse)=>{


            let $:WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            let wf:Workflow;
            let user:UserAccount;

            try {


                user = req.dxc.sess.getUserAccount();

                // refresh connected device
                await DeviceManager.getInstance().scan();


                // get project info
                project = $.context.getProject( req.query.uid as string);

                if($.context.engine_type==DexcaliburEngineMode.MASTER){
                    // create node
                    const node = $.context.nodeManager.createNode(project.getUID(), project.getDevice().getProfile().os);
                    await node.spawn();
                    $.sendSuccess( res, { node: node.UUID });
                    return;
                }else if($.context.engine_type==DexcaliburEngineMode.SLAVE){
                    // else slave mode (sess / auth)
                }

                // standalone mode

                AccessControl.check(
                    AccessZone.PROJECT,
                    ProjectAccessControl.access.PROJ_OPEN_OWN,
                    project,
                    req.dxc.sess.getUserAccount()
                );

                if(project != null){

                    // if the project is already opened, it is set as active (foregrounf) project
                    (req.dxc.sess as UserSession).setDefaultActiveProject(project);

                    /*
                    if($.project == null){
                        $.setProject( project);
                    }
                    else if($.project != null && $.project.getUID()!==req.query.uid){
                        $.setProject( project);
                    }*/

                    if(project.isReady()){
                        $.sendSuccess( res, {});
                    }else{
                        $.sendError( res, "Project is open but not ready");
                    }
                    return ;
                }


                // init workflow
                wf = $.context.newWorkflow( req.query.uid  as string ).changeOwner(user);


                wf.pushStatus(new StatusMessage(5, "Opening project"));

                project = await $.context.openProject( user, req.query.uid as string);

                if(project!=null && project.isReady()){
                    req.dxc.sess.setDefaultActiveProject(project);

                    $.sendSuccess( res, {})
                }else{
                    throw DexcaliburProjectException.OPEN_PROJECT_FAILURE(req.query.uid);
                }

            }catch(err){
                Logger.error("[API][PROJECT MGT] Opening project failed : "+err.message+"\n"+err.stack);
                $.sendError( res, "Project ["+req.query.uid+"] cannot be opened : "+err.message);
            }


        }
    }
)

PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/delete',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse)=>{

            let $:WebServer = req.dxc.$;
            let user:UserAccount;
            let unsafeProjectUID:string;

            try {

                Logger.raw(">>> "+req.body['uid'] );
                // close the project if it is opened
                if(req.body['uid'] == null){
                        if(req.dxc.project == null){
                            throw DexcaliburProjectException.DELETE_PROJ_FAILURE_NOTFOUND();
                        }

                        unsafeProjectUID = (req.dxc.project as DexcaliburProject).getUID();

                }else{
                    unsafeProjectUID = req.body['uid'];
                }

                if(unsafeProjectUID == null){
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }



                $.sendSuccess( res, {
                    remove: $.context.deleteProject( req.dxc.sess.getUserAccount(),  unsafeProjectUID)
                });


            }catch(err){
                Logger.error("[API][PROJECT MGT] Unable to delete project : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message);
            }
        }
    }
);


PROJECT_MGT_WEB_API.addAuthenticatedRoute(
    '/availability',
    {
        'get':  (req:DelegateRequest, res:DelegateResponse)=>{

            let $:WebServer = req.dxc.$;
            let availability:boolean = true;

            try {
                if(req.query.conn != null && req.query.conn != Settings.ConnectionSettings.LOCAL){
                    throw DexcaliburConnectionException.REMOTE_OPERATION_NOT_SUPPORTED();
                }

                switch( req.query.field)
                {
                    case "project.uid":
                        const proj = $.context.workspace.listProjects();
                        proj.map((vProject)=>{
                            if(vProject == req.query.value)
                                availability = false;
                        })
                        break;
                }


                $.sendSuccess(res, { availability: availability });
            }catch(err){
                Logger.error("[API][PROJECT MGT] Unable to verify availability of the value: "+err.message+"\n"+err.stack);
                $.sendError( res, err.message);
            }
        }
    }
);



