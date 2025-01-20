import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import {Device, DeviceUUID} from "../Device.js";
import WebServer from "../WebServer.js";
import DeviceManager from "../DeviceManager.js";
import * as Log from "../Logger.js";
import {UserSession} from "../user/session/UserSession.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {UserAccount} from "../user/UserAccount.js";
import Platform from "../platform/Platform.js";
import {Workflow} from "../Workflow.js";
import StatusMessage from "../StatusMessage.js";
import PlatformManager from "../platform/PlatformManager.js";
import Downloader from "../Downloader.js";
import * as _fs_ from "fs";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import AccessControl from "../user/acl/AccessControl.js";
import {AccessZone} from "../user/acl/Zones.js";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol.js";
import {Settings} from "../Settings.js";
import {DexcaliburConnectionException} from "../errors/DexcaliburConnectionException.js";
import {DexcaliburEngineMode} from "../DexcaliburEngine.js";
import {ProjectInput, ProjectInputLocation, ProjectInputPurpose, ProjectInputType} from "../analyzer/ProjectInput.js";
import {NodeUtils} from "@dexcalibur/dexcalibur-orm";
import {Connection} from "../organization/conn/Connection.js";
import {ORG_WEB_API} from "./organization.web.api.js";
import {InputTemplate, NewProjectFlowType} from "../project/ProjectManager.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {ValidationRule} from "../Validator.js";
import Uploader from "../Uploader.js";
import {UploadedResource} from "../common/UploadedResource.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PROJECT_MGT_WEB_API: DelegateWebApi = new DelegateWebApi('PROJ-MGT');

PROJECT_MGT_WEB_API.addAuthenticatedRoute(
    '/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse)=>{

            let $:WebServer = req.dxc.$;
            let user:UserAccount;

            try {
                    user = (req.dxc.sess as UserSession).getUserAccount();

                    $.sendSuccess( res, {
                        projects: await user.listProjects($.context)
                    });

            }catch(err){
                Logger.error("[API][PROJECT MGT] Unable to list projects : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message);
            }
        }
    }
);

// deprecated
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
            let anal:any = {};
            let filetype:string;
            let projInputs:ProjectInput[] = [];

            try{



                dm = DeviceManager.getInstance();
                await dm.scan();


                console.log("USER from sessions : ",((req as any).user as UserAccount).getUID());

                if(req.body['dev'] != null){
                    device = dm.getDevice( req.body['dev']);
                    /*if(device == null || !device.isEnrolled()){
                        throw DexcaliburProjectException.TARGET_DEVICE_NOT_ENROLLED();
                    }*/
                }

                let projectUID:string;
                if(req.body['name'] == null){
                    throw DexcaliburProjectException.INVALID_NAME();
                }else{
                    projectUID = DexcaliburProject.sanitizeUID(req.body['name']);
                }

                if(req.body['cfg'] != null){
                    anal = req.body['cfg'];
                }

                if(anal==null){
                    anal = {};
                }

                // init workflow
                wf = $.context.newWorkflow(projectUID).changeOwner(((req as any).user as UserAccount));

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

                        projInputs.push(new ProjectInput({
                            data: req.body['path'],
                            location: ProjectInputLocation.DEVICE,
                            type: ProjectInputType.REGULAR_FILE,
                            extractOpts: {type:'bin'},
                            purpose: ProjectInputPurpose.MAIN
                        }));

                        // Merge Splitted APK (MSA)
                        /*
                        if(req.body['cfg'].msa_auto===true){

                            if(device.isAndroid()){
                                path = device.pullTemp( req.body['path'], { merge:true });
                                // extraData = device.pullExtraData(req.body['path'], { merge:true });
                            }else {
                                Logger.error("[PROJECT] Merge Splitted APK is only supported for Android-based devices.'")
                                path = device.pullTemp( req.body['path']  );
                            }
                        }else{
                            path = device.pullTemp( req.body['path'] );
                        }*/

                        break;
                    case 'download':
                        if(PLATFORM_MODE.indexOf(req.body['platform'])==-1){
                            wf.pushStatus(new StatusMessage(5, "Set target platform"));
                            platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                        }
                        wf.pushStatus(new StatusMessage(10, "Download target application from remote location"));
                        path = await Downloader.downloadTemp(req.body['url'], { mode:0o666, encoding:'binary', force:true });

                        projInputs.push(new ProjectInput({
                            data: path,
                            location: ProjectInputLocation.LOCAL,
                            type: ProjectInputType.REGULAR_FILE,
                            extractOpts: {type:'bin'},
                            purpose: ProjectInputPurpose.MAIN
                        }));
                        break;
                    case 'upload':
                        wf.pushStatus(new StatusMessage(5, "Set target platform"));
                        platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                        wf.pushStatus(new StatusMessage(10, "Select previously uploaded application"));

                        if(req.body['file']!=null){
                            path = await $.uploader.getPathOf(req.body['file']);
                        }else{
                            path = await $.uploader.getPathOf((req.dxc.sess as UserSession).getData('proj_upload_id'));
                        }

                        projInputs.push(new ProjectInput({
                            data: path,
                            location: ProjectInputLocation.LOCAL,
                            type: ProjectInputType.REGULAR_FILE,
                            extractOpts: {type:'bin'},
                            purpose: ProjectInputPurpose.MAIN
                        }));
                        break;
                    case 'fromfs':
                        wf.pushStatus(new StatusMessage(5, "Set target platform"));
                        platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                        path = req.body['path'];

                        projInputs.push(new ProjectInput({
                            data: path,
                            location: ProjectInputLocation.LOCAL,
                            type: ProjectInputType.REGULAR_FILE,
                            extractOpts: {type:'bin'},
                            purpose: ProjectInputPurpose.MAIN
                        }));
                        break;
                    default:
                        throw new Error("Project type is invalid")
                        break;
                }

                // chcek if file exists an it is not empty
                /*if( (!_fs_.existsSync(path)) || (false)){
                    throw DexcaliburProjectException.APP_FILE_OT_FOUND();
                }*/

                if(device==null && req.body['targetOS']!=null){
                    // try to find compatible device already enrolled
                    const compDevs =  dm.searchCompatibleDevice(req.body['targetOS']);

                    if(compDevs.length>0 && platform==null){
                        device = compDevs[0];
                        platform = device.getPlatform();
                        console.log("Compatible device found :",device.uid);
                    }else{

                        console.log("Compatible device NOT found ");
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

                /*
                let filetype:string = "apk";
                if(req.body['filetype'] == null){
                    if(platform!=null){
                        filetype = platform.getDefaultFileType();
                    }
                }else if( Platform.SUPPORTED_FILE_FMT.indexOf(req.body['filetype'])>-1){
                    filetype = req.body['filetype'];
                }

                Logger.info('[PROJECT][STEP 2] Filetype : '+filetype+', File : '+path);*/
                Logger.info('[PROJECT][STEP 2] Input file : '+(projInputs[0].data as string));

                /*if(anal != null){

                    Logger.info('[PROJECT][STEP 3.2] Configuring Analyzers ...');
                    // wf.pushStatus(new StatusMessage(11, "Configuring Analyzers"));
                    const analCfg = project.getAnalyzerConfiguration(); // platform.getUID());
                    analCfg.setFileAnalysisMode(anal.fa_mode);
                    analCfg.setNativeAnalysisMode(anal.na_mode);

                }*/

                //console.log(projInputs);

                project = await $.context.newProject(projectUID, projInputs, device,  (req as any).user , platform, anal);

                if(project == null){
                    throw DexcaliburProjectException.STEP2_FAILURE();
                }

                project.setWorkflow(wf);

                //if(req.body['msa_auto']){

                //}
                    // Detect, pull and merge splitted APK

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

                //$.context.clean()
                Logger.error("[API][PROJECT MGT] "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }

            return ;

        }
    }
);

// deprecated
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
            let anal:any = {};
            let filetype:string;
            let projInputs:ProjectInput[] = [];

            try{



                dm = DeviceManager.getInstance();
                await dm.scan();


                console.log("USER from sessions : ",((req as any).user as UserAccount).getUID());

                if(req.body['dev'] != null){
                    device = dm.getDevice( req.body['dev']);
                    /*if(device == null || !device.isEnrolled()){
                        throw DexcaliburProjectException.TARGET_DEVICE_NOT_ENROLLED();
                    }*/
                }

                let projectUID:string;
                if(req.body['name'] == null){
                    throw DexcaliburProjectException.INVALID_NAME();
                }else{
                    projectUID = DexcaliburProject.sanitizeUID(req.body['name']);
                }

                if(req.body['cfg'] != null){
                    anal = req.body['cfg'];
                }

                if(anal==null){
                    anal = {};
                }

                // init workflow
                wf = $.context.newWorkflow(projectUID).changeOwner(((req as any).user as UserAccount));

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

                        projInputs.push(new ProjectInput({
                            data: req.body['path'],
                            location: ProjectInputLocation.DEVICE,
                            type: ProjectInputType.REGULAR_FILE,
                            extractOpts: {type:'bin'},
                            purpose: ProjectInputPurpose.MAIN
                        }));

                        // Merge Splitted APK (MSA)
                        /*
                        if(req.body['cfg'].msa_auto===true){

                            if(device.isAndroid()){
                                path = device.pullTemp( req.body['path'], { merge:true });
                                // extraData = device.pullExtraData(req.body['path'], { merge:true });
                            }else {
                                Logger.error("[PROJECT] Merge Splitted APK is only supported for Android-based devices.'")
                                path = device.pullTemp( req.body['path']  );
                            }
                        }else{
                            path = device.pullTemp( req.body['path'] );
                        }*/

                        break;
                    case 'download':
                        if(PLATFORM_MODE.indexOf(req.body['platform'])==-1){
                            wf.pushStatus(new StatusMessage(5, "Set target platform"));
                            platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                        }
                        wf.pushStatus(new StatusMessage(10, "Download target application from remote location"));
                        path = await Downloader.downloadTemp(req.body['url'], { mode:0o666, encoding:'binary', force:true });

                        projInputs.push(new ProjectInput({
                            data: path,
                            location: ProjectInputLocation.LOCAL,
                            type: ProjectInputType.REGULAR_FILE,
                            extractOpts: {type:'bin'},
                            purpose: ProjectInputPurpose.MAIN
                        }));
                        break;
                    case 'upload':
                        wf.pushStatus(new StatusMessage(5, "Set target platform"));
                        platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                        wf.pushStatus(new StatusMessage(10, "Select previously uploaded application"));
//                        path = $.uploader.getPathOf(req.body['uploadid']);
                        if(req.body['file']!=null){
                            path = await $.uploader.getPathOf(req.body['file']);
                        }else{
                            path = await $.uploader.getPathOf((req.dxc.sess as UserSession).getData('proj_upload_id'));
                        }

                        projInputs.push(new ProjectInput({
                            data: path,
                            location: ProjectInputLocation.LOCAL,
                            type: ProjectInputType.REGULAR_FILE,
                            extractOpts: {type:'bin'},
                            purpose: ProjectInputPurpose.MAIN
                        }));
                        break;
                    case 'fromfs':
                        wf.pushStatus(new StatusMessage(5, "Set target platform"));
                        platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                        path = req.body['path'];

                        projInputs.push(new ProjectInput({
                            data: path,
                            location: ProjectInputLocation.LOCAL,
                            type: ProjectInputType.REGULAR_FILE,
                            extractOpts: {type:'bin'},
                            purpose: ProjectInputPurpose.MAIN
                        }));
                        break;
                    default:
                        throw new Error("Project type is invalid")
                        break;
                }

                // chcek if file exists an it is not empty
                /*if( (!_fs_.existsSync(path)) || (false)){
                    throw DexcaliburProjectException.APP_FILE_OT_FOUND();
                }*/

                if(device==null && req.body['targetOS']!=null){
                    // try to find compatible device already enrolled
                    const compDevs =  dm.searchCompatibleDevice(req.body['targetOS']);

                    if(compDevs.length>0 && platform==null){
                        device = compDevs[0];
                        platform = device.getPlatform();
                        console.log("Compatible device found :",device.uid);
                    }else{

                        console.log("Compatible device NOT found ");
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

                /*
                let filetype:string = "apk";
                if(req.body['filetype'] == null){
                    if(platform!=null){
                        filetype = platform.getDefaultFileType();
                    }
                }else if( Platform.SUPPORTED_FILE_FMT.indexOf(req.body['filetype'])>-1){
                    filetype = req.body['filetype'];
                }

                Logger.info('[PROJECT][STEP 2] Filetype : '+filetype+', File : '+path);*/
                Logger.info('[PROJECT][STEP 2] Input file : '+(projInputs[0].data as string));

                /*if(anal != null){

                    Logger.info('[PROJECT][STEP 3.2] Configuring Analyzers ...');
                    // wf.pushStatus(new StatusMessage(11, "Configuring Analyzers"));
                    const analCfg = project.getAnalyzerConfiguration(); // platform.getUID());
                    analCfg.setFileAnalysisMode(anal.fa_mode);
                    analCfg.setNativeAnalysisMode(anal.na_mode);

                }*/

                //console.log(projInputs);

                project = await $.context.newProject(projectUID, projInputs, device,  (req as any).user , platform, anal);

                if(project == null){
                    throw DexcaliburProjectException.STEP2_FAILURE();
                }

                project.setWorkflow(wf);

                //if(req.body['msa_auto']){

                //}
                // Detect, pull and merge splitted APK

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

                //$.context.clean()
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
PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/upload',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse):Promise<void> =>{


            let $:WebServer = req.dxc.$;
            let user:UserAccount;
            try {
                await $.uploader.newUpload(
                    (req.user as UserAccount),
                    req,
                    res,
                    function( vUpl:UploadedResource):any {
                        // save upload UID into user session
                        req.dxc.sess.addData('proj_upload_id', vUpl.getUID());

                        $.sendSuccess( res, { upload:vUpl.getUID() });
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



                // standalone mode
                /*
                AccessControl.check(
                    AccessZone.PROJECT,
                    AccessControl.access.PROJ_OPEN_OWN,
                    project,
                    req.dxc.sess.getUserAccount()
                );

                 */

                if(project != null){

                    AccessControl.check(
                        AccessZone.PROJECT,
                        AccessControl.access.PROJ_OPEN_OWN,
                        project,
                        req.dxc.sess.getUserAccount()
                    );

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



                Logger.debug("["+$.context.nodeManager.uuid+"]Project OPEN request > ",$.context.engine_type,DexcaliburEngineMode.MASTER);
                // todo : move into DexcaliburEngine class

                if($.context.engine_type==DexcaliburEngineMode.MASTER){

                    // list existing nodes mapped to project UID
                    const nodes = $.context.nodeManager.getNodeByProject(req.query.uid as string);

                    if(nodes.length==0){
                        // create node
                        const node = $.context.nodeManager.createNode(req.query.uid as string);//, project.getDevice().getProfile().os);
                        node.appendRequestToQueue($, req, res);
                        await node.spawn("The user request to open an  existing project.",true);

                    }else{
                        nodes[0].appendRequestToQueue($, req, res);
                    }
                     //await node.forwardWebRequest(req, res);

                    // END ----
                    //$.sendSuccess( res, { node: node.UUID });
                    //return;

                }else{


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

                // close the active project if it is opened
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
                    remove: await $.context.deleteProject( req.dxc.sess.getUserAccount(),  unsafeProjectUID)
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


PROJECT_MGT_WEB_API.addAuthenticatedRoute(
    '/logs',
    {
        'get':  async (req:DelegateRequest, res:DelegateResponse)=>{

            let $:WebServer = req.dxc.$;

            try {
                let size=1000;
                if(req.query.size!=null){
                    size = parseInt(req.query.size as string, 10);
                }
                /*$.sendSuccess(res, NodeUtils.toJsonObject(
                    await $.context.getEngineDB().getGlobalLogs((!Number.isNaN(size)) ? size : 1000)
                ));*/
                $.sendSuccess(res, NodeUtils.serialize(
                    await $.context.getEngineDB().getGlobalLogs((!Number.isNaN(size)) ? size : 1000)
                ));
            }catch(err){
                Logger.error("[API][PROJECT MGT] Unable to verify availability of the value: "+err.message+"\n"+err.stack);
                $.sendError( res, err.message);
            }
        }
    }
);


// NEW

PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/new/:aid/flow/select',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse)=> {

            const $: WebServer = pReq.dxc.$;

            try {

                // target org
                const app = await $.context.getOrgManager().getApplicationUnit(
                    (pReq as any).user,
                    pReq.params.aid
                );

                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    app.orgUnit
                );

                $.sendSuccess(pRes, (await $.context.getProjectManager().newProjectOrder(
                    (pReq as any).user,
                    org,
                    app,
                    {
                        projectName: pReq.body['name'],
                        analyzerOpts: pReq.body['cfg'],
                        platformUID: pReq.body['platform'] as string,
                        deviceUID: pReq.body['dev'] as DeviceUUID,

                        flowType: NewProjectFlowType.SELECT,
                        remotePath: pReq.body['path'] as string,
                    }
                )).toJsonObject(SecurityZone.PUBLIC));

            } catch (err) {

                $.sendErrorAfterException(
                    pRes, PROJECT_MGT_WEB_API.name,
                    "Project has not been created and attached to application unit. (select type)",
                    err, {cause: err.message});
            }
        }
    }
);

PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/new/:aid/flow/upload',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse)=> {

            const $: WebServer = pReq.dxc.$;

            try {

                // target org
                const app = await $.context.getOrgManager().getApplicationUnit(
                    (pReq as any).user,
                    pReq.params.aid
                );

                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    app.orgUnit
                );

                const inputTplRule = ValidationRule.structure({
                    uploadID: UploadedResource.VALIDATE.uuid,
                    purpose: ProjectInput.VALIDATE.purpose
                });


                let checkedTpl:InputTemplate[];
                if(pReq.body['inputs']!=null){
                    if(ValidationRule.asArrayOf([inputTplRule]).test(pReq.body['inputs'])){
                        checkedTpl = pReq.body['inputs'];
                    }else{
                        throw new Error("Project inputs have not a valid format.");
                    }
                }

                $.sendSuccess(pRes, (await $.context.getProjectManager().newProjectOrder(
                    (pReq as any).user,
                    org,
                    app,
                    {
                        projectName: pReq.body['name'],
                        analyzerOpts: pReq.body['cfg'],
                        platformUID: pReq.body['platform'] as string,
                        deviceUID: pReq.body['dev'] as DeviceUUID,

                        flowType: NewProjectFlowType.UPLOAD,
                        uploadUID: [pReq.body['file'] as string],
                        inputTpls: checkedTpl
                    },{
                        cookie: pReq.cookies
                    })).toJsonObject(SecurityZone.PUBLIC));


            } catch (err) {

                $.sendErrorAfterException(
                    pRes, PROJECT_MGT_WEB_API.name,
                    "Project has not been created and attached to application unit. (upload type)",
                    err, {cause: err.message});
            }
        }
    }
);


PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/new/:aid/flow/download',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse)=> {

            const $: WebServer = pReq.dxc.$;

            try {

                // target org
                const app = await $.context.getOrgManager().getApplicationUnit(
                    (pReq as any).user,
                    pReq.params.aid
                );

                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    app.orgUnit
                );

                $.sendSuccess(pRes, (await $.context.getProjectManager().newProjectOrder(
                    (pReq as any).user,
                    org,
                    app,
                    {
                        projectName: pReq.body['name'],
                        analyzerOpts: pReq.body['cfg'],
                        platformUID: pReq.body['platform'] as string,
                        deviceUID: pReq.body['dev'] as DeviceUUID,

                        flowType: NewProjectFlowType.DOWNLOAD,
                        url: pReq.body['url'] as string,
                    },{
                        cookie: pReq.cookies
                    }
                )).toJsonObject(SecurityZone.PUBLIC));

            } catch (err) {

                $.sendErrorAfterException(
                    pRes, PROJECT_MGT_WEB_API.name,
                    "Project has not been created and attached to application unit. (upload type)",
                    err, {cause: err.message});
            }
        }
    }
);


PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/order/:pid/start',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse)=> {

            const $: WebServer = pReq.dxc.$;

            try {

                // target org
                const po = await $.context.getProjectManager().getProjectOrder(
                    (pReq as any).user,
                    pReq.params.pid
                );

                $.sendSuccess(pRes, (await $.context.getProjectManager().executeProjectOrder(
                    (pReq as any).user,
                    po
                )).toJsonObject());

            } catch (err) {

                $.sendErrorAfterException(
                    pRes, PROJECT_MGT_WEB_API.name,
                    "failed to execute project order",
                    err, {cause: err.message});
            }
        }
    }
);