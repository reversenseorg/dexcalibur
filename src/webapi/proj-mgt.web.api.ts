/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {DelegateRequest, DelegateResponse, DelegateWebApi, HTTP_VERB} from "./DelegateWebApi.js";
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
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {Settings} from "../Settings.js";
import {DexcaliburConnectionException} from "../errors/DexcaliburConnectionException.js";
import {ProjectInput, ProjectInputLocation, ProjectInputPurpose, ProjectInputType} from "../analyzer/ProjectInput.js";
import {NodeUtils, ValidationRule} from "@reversense/dexcalibur-orm";
import {InputTemplate, NewProjectFlowType} from "../project/ProjectManager.js";
import {UploadedResource} from "../common/UploadedResource.js";
import {EngineNode, NodePurpose} from "../core/EngineNode.js";
import {EngineNodeException} from "../errors/EngineNodeException.js";
import {NodeState} from "../core/EngineNodeManager.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import {FileAnalysisType, NativeAnalysisMode} from "../AnalyzerConfiguration.js";
import ts from "typescript";
import {ProjectOrder} from "../project/ProjectOrder.js";
import {AuthModuleType} from "../user/auth/AuthModule.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PROJECT_MGT_WEB_API: DelegateWebApi = new DelegateWebApi('PROJ-MGT');

PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse)=>{

            let $:WebServer = req.dxc.$;
            let user:UserAccount;

            try {
                    $.sendSuccess( res, {
                        projects: (await $.context
                                        .getProjectManager()
                                        .listProjectByUser(req.user))
                                            .map(x => x.toJsonObject())
                    });

            }catch(err){
                Logger.error("[API][PROJECT MGT] Unable to list projects : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message);
            }
        }
    },{
        mcp:{
            [HTTP_VERB.GET]: {
                name:'project-list',
                uri: '/list',
                summary: `To list all projects owned by the organization of the current user and for which the current user has the right to read. The current user is deducted from session data, that means it is bound to the session cookie of the request or to the API key used to authenticate the request.`,
                parameters: [],
                responses: [{
                    description: "Return a list of **project** resources.  The list of **installed** platforms and the list of **remote** platforms available in store" ,
                    schema: DexcaliburProject.TYPE.toJSONSchemaPart(true)
                }]
            }
        }
    }
);


PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/info/:uid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse)=>{

            let $:WebServer = req.dxc.$;

            try {
                if(!DexcaliburProject.VALIDATE.uid.test(req.params.uid)){
                    throw DexcaliburProjectException.INVALID_UUID_FMT(req.params.uid as string);
                }

                const unsafeUUID = req.params.uid as string;
                const prj = await $.context.getProjectManager().getProject(
                    req.user, unsafeUUID
                );

                $.sendSuccess( res, {
                    projects: prj.toJsonObject(),
                    loaded: await $.context.getProjectManager().isLoaded(
                        req.user, unsafeUUID
                    )
                });

            }catch(err){
                Logger.error("[API][PROJECT MGT] Unable to get project info : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message);
            }
        }
    },{
        mcp:{
            [HTTP_VERB.GET]: {
                name:'project-info',
                uri: '/list',
                summary: `To get basic information about a project identified by its unique identifier. `,
                parameters: [],
                responses: [{
                    description: "Return an object with two data. Basic data about the **project** resource in the property **projects**, and a flag named **loaded** to say if the project is currently loaded or not." ,
                    schema: {
                        type: 'object',
                        properties: {
                            projects: DexcaliburProject.TYPE.toJSONSchemaPart(false),
                            loaded: {type:'boolean'}
                        }
                    }
                }]
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
                wf = (await $.context.newWorkflow(
                    req.user,
                    projectUID,
                    $.context.getNodeUUID(),
                    false,
                    "new"
                ));

                // to track and save changes in workflow
                //$.context.registerWorkflow(wf);

                wf.start();

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

                project = await $.context.newProject(projectUID, projInputs, device,  (req as any).user , platform, anal, null, wf);

                if(project == null){
                    throw DexcaliburProjectException.STEP2_FAILURE();
                }

                //project.setWorkflow(wf);

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
    }/*,{
        mcp:{
            [HTTP_VERB.POST]: {
                name:'projects-upload-file',
                uri: '/upload',
                summary: `To get basic information about a project identified by its unique identifier. `,
                parameters: [{
                    name: 'file',
                }],
                responses: [{
                    description: "Return an object with two data. Basic data about the **project** resource in the property **projects**, and a flag named **loaded** to say if the project is currently loaded or not." ,
                    schema: {
                        type: 'object',
                        properties: {
                            projects: DexcaliburProject.TYPE.toJSONSchemaPart(false),
                            loaded: {type:'boolean'}
                        }
                    }
                }]
            }
        }
    }*/
)


PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/open',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse, pNext:any)=>{

            let $:WebServer = req.dxc.$;

            try {

                if(req.query.purpose!=null && !EngineNode.VALIDATE.purpose.test(req.query.purpose)){
                    throw EngineNodeException.INVALID_PURPOSE(req.query.purpose);
                }

                if(!DexcaliburProject.VALIDATE.uid.test(req.query.uid)){
                    throw DexcaliburProjectException.INVALID_UUID_FMT(req.query.uid as string);
                }


                const unsafeUUID = req.query.uid as string;
                const unsafePurpose = (req.query.purpose!=null ? req.query.purpose as NodePurpose : NodePurpose.ANY);

                // TODO check is user is authorized to access project
                const prj = await $.context.getProjectManager().getProject(req.user, unsafeUUID);

                console.log($.context.getUserService().getAuthenticationService().readApiKeyHeaders(req));



                if($.context.isStandaloneMode()){
                    const selfNode = await $.context.getProjectManager().open(
                        req.user,
                        unsafeUUID,
                        (req.query.purpose!=null ? req.query.purpose as NodePurpose : NodePurpose.ANY),
                        {
                            cookie: req.cookies,
                            headers: $.context.getUserService().getAuthenticationService().readApiKeyHeaders(req)
                        }
                    );

                    $.sendSuccess(res, {
                        ready: true,
                        node: $.context.getNodeUUID()
                    });
                    return;
                }

                let candidate = await $.context.getNodeManager()
                    .getReadySlave( unsafeUUID, unsafePurpose, prj.getOrgUID());


                Logger.info(`[Ready Slave] [pro-mgt API /open] [project=${unsafeUUID}] [org=${prj.getOrgUID()}] [purpose=${unsafePurpose}]  : ${candidate!=null? candidate.getUID() : 'KO'}`);

                if(candidate!=null){
                    // a slave is ready for this project
                    const freshNode = await $.context.getNodeManager()
                        .allocateNode([candidate], req.user);

                    if(freshNode != null){
                        $.sendSuccess( res, {
                            ready: true,
                            node: freshNode.getUID()
                        });
                        return;
                    }
                }
                let nodeReady = false;
                // else : allocate a node , start it and open the project
                const targetNode = await $.context.getProjectManager().open(
                    req.user,
                    unsafeUUID,
                    (req.query.purpose!=null ? req.query.purpose as NodePurpose : NodePurpose.ANY),
                    {
                        cookie: req.cookies,
                        headers: $.context.getUserService().getAuthenticationService().readApiKeyHeaders(req)
                    },
                    (pNodeBefore)=>{
                       /*
                        (vNode)=>{
                        const subscription = vNode.nodeState$.subscribe((vChange)=>{
                            if(vChange.new==NodeState.IDLE && vChange.before==NodeState.BUSY){
                                subscription.unsubscribe();
                                nodeReady = true;
                                $.sendSuccess(res, {
                                    ready: true,
                                    node: vChange.nodeUUID
                                });
                            }else{
                                subscription.unsubscribe();
                                nodeReady = true;
                                $.sendSuccess(res, {
                                    ready: false,
                                    node: vChange.nodeUUID
                                });
                            }
                        });
                    }

                       let subscription:Subscription;
                        subscription = pNodeBefore.nodeState$.subscribe((vChange)=>{
                            if(subscription!=null){
                                subscription.unsubscribe();
                            }

                            if(vChange.new==NodeState.IDLE && vChange.before==NodeState.BUSY){
                                //nodeReady = true;
                                $.sendSuccess(res, {
                                    ready: true,
                                    node: vChange.nodeUUID
                                });
                            }else{
                                //subscription.unsubscribe();
                                //nodeReady = true;

                                let wfuid:Nullable<WorkflowUUID> = null;
                                if(pNodeBefore.activeOpe!=null){
                                    wfuid = pNodeBefore.activeOpe.order.wf;
                                }else if(pNodeBefore.waitingQueue.length>0){
                                    wfuid = pNodeBefore.waitingQueue[0].order.wf;
                                }

                                $.sendSuccess(res, {
                                    ready: false,
                                    wf: wfuid,
                                    state: vChange.new,
                                    node: vChange.nodeUUID
                                });
                            }
                        });*/
                    }
                );

            /*   let wf:Nullable<WorkflowUUID> = null;
                if(targetNode.activeOpe!=null){
                    wf = targetNode.activeOpe.order.wf;
                }else if(targetNode.waitingQueue.length>0){
                    wf = targetNode.waitingQueue[0].order.wf;
                } */


                //if(wf!=null){

                    let sub = setInterval(()=>{
                        $.context.getNodeManager().getNodeByUUID(targetNode.getUID()).then((vNode)=>{
                            if(vNode==null){
                                sub.close();
                                $.sendSuccess(res, {
                                    ready: false,
                                    createErr: true,
                                    msg: "Cannot retrieve node state",
                                    node: vNode.getUID()
                                });
                            }else if([NodeState.NEW, NodeState.QUEUED, NodeState.REGISTERED, NodeState.BUSY].indexOf(vNode.state)==-1){
                                sub.close();
                                $.sendSuccess(res, {
                                    ready: true,
                                    wf: null,
                                    node: vNode.getUID()
                                });
                            }
                        })
                    },1000)
                /*}else{
                    $.sendSuccess(res, {
                        ready: false,
                        createErr: true,
                        msg: "Cannot retrieve workflow",
                        node: targetNode.getUID()
                    });
                }*/


            }catch(err){
                Logger.error("[API][PROJECT MGT] Opening project failed : "+err.message+"\n"+err.stack);
                $.sendError( res, "Project ["+req.query.uid+"] cannot be opened : "+err.message);
            }
        }
    },{
        mcp: {
            [HTTP_VERB.GET]: {
                name:'projmgt-open-project',
                uri: '/open?uid={projectUUID}&purpose={purpose}',
                summary: `To open a project from its UUID`,
                parameters: [{
                    name: 'projectUUID',
                    required: true,
                    description: "Required, it is the UUID of the project. "+DexcaliburProject.TYPE.getPrimaryKey()._dscr,
                    schema: DexcaliburProject.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'purpose',
                    required: false,
                    description: `The purpose of the opening operation. Project can be opened automatically in order 
                    to be scanned, or manually by a user to explore or execute the application or binary files from the project.
                    
                    A project contains any data about the architecture or structure of the application or binary reverse engineered by Reversense platform.
                    To execute search inside application binary code or to execute hook, the projet must be opened.
                    
                    Possible values are : ${Object.values(NodePurpose).join(',')}.`,
                    schema: { type:"string", enum: Object.values(NodePurpose) as NodePurpose[] }
                }],
                responses: [{
                    description:`Returns the status of the project opening operation with various options.
                    Response have following properties :
                    - **ready** : TRUE if the project has been opened successfully, false otherwise.
                    - **node** : the UUID of the engine node used to open the project.
                    - **wf** : the UUID of the workflow used to open the project. Workflow is null if the project has been opened successfully.
                    - **createErr** : true if an error occurred during the project opening process, false otherwise.
                    - **msg** : Optional, a message describing the error.`,
                    schema: {
                        type: 'object',
                        properties: {
                            ready: {type:'boolean'},
                            node: {type:'string'},
                            wf: {type:'string'},
                            createErr: {type:'string'},
                            msg: {type:'string'}
                        },
                        required: ['ready','node']
                    }
                }]
            }
        }
    }
)


PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/open_slave',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse, pNext:any)=>{

            let $:WebServer = req.dxc.$;

            try {

                if(req.query.purpose!=null && !EngineNode.VALIDATE.purpose.test(req.query.purpose)){
                    throw EngineNodeException.INVALID_PURPOSE(req.query.purpose);
                }

                if(!DexcaliburProject.VALIDATE.uid.test(req.query.uid)){
                    throw DexcaliburProjectException.INVALID_UUID_FMT(req.query.uid as string);
                }


                const unsafeUUID = req.query.uid as string;
                const unsafePurpose = (req.query.purpose!=null ? req.query.purpose as NodePurpose : NodePurpose.ANY);

                // TODO check is user is authorized to access project
                // search a running node for this project


                let nodeReady = false;
                let sent = false;

                Logger.info("[API][PROJECT MGT] Open project from slave : start ");


                // else : allocate a node , start it and open the project
                const targetNode = await $.context.getProjectManager().open(
                    req.user,
                    unsafeUUID,
                    unsafePurpose,
                    null,
                    (vNode)=>{

                        const subscription = vNode.nodeState$.subscribe(async(vChange)=>{

                            Logger.info(`[API][PROJECT MGT] Open project from slave : state of local node changed ${vChange.before} to ${vChange.new}`);
                            if(vChange.new==NodeState.IDLE && vChange.before==NodeState.BUSY){

                                nodeReady = true;
                                Logger.info(`[API][PROJECT MGT] Open project from slave : Terminated`);


                                // remove "project order" from waiting queue
                                await vNode.refreshWaitingQueue();

                                if(await vNode.isWaitingQueueEmpty()){
                                    console.log("WAITING QUEUE IS EMPTY ",vNode.getUID());
                                    if(!sent){
                                        subscription.unsubscribe();
                                        sent = true;

                                        Logger.info(`[API][PROJECT MGT] Open project from slave : send state checnged response ...`);
                                        $.sendSuccess(res, {
                                            ready: true,
                                            node: vNode.getUID()
                                        });
                                    }
                                }else{
                                    console.log("WAITING QUEUE IS NOT EMPTY ",vNode.getUID(),", waiting queue = ",vNode.waitingQueue.length);

                                    // execute next operation in queue
                                    vNode.operation$.next(null);
                                }
                            }
                        });

                    }
                );

                /*
                $.sendSuccess( res, {
                    ready: false,

                    node: targetNode.getUID()
                });

                /*
                $.sendSuccess( res, {
                    wfuid: targetNode
                    node: targetNode.getUID()
                });

                Logger.info(`[API][PROJECT MGT] Open project from slave : waiting ...`);
                if(!sent){
                    sent = true;
                    Logger.info(`[API][PROJECT MGT] Open project from slave : send default response ...`);
                    $.sendSuccess( res, {
                        ready: nodeReady,
                        node: targetNode.getUID()
                    });
                }*/

            }catch(err){
                Logger.error("[API][PROJECT MGT] Opening project on slave node failed : "+err.message+"\n"+err.stack);
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

                if(req.body['aid'] != null){
                    const app = await $.context.getOrgManager().getDirectApplication(req.user, req.body['aid']);

                    $.sendSuccess( res, {
                        remove: await $.context.getOrgManager().dropAppRelease(req.user, app, unsafeProjectUID)
                    });
                }else{
                    $.sendSuccess( res, {
                        remove: await $.context.deleteProject( req.dxc.sess.getUserAccount(),  unsafeProjectUID)
                    });
                }
            }catch(err){
                Logger.error("[API][PROJECT MGT] Unable to delete project : "+err.message+"\n"+err.stack);
                $.sendError( res, err.message);
            }
        }
    }
);


PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/availability',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse)=>{

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


PROJECT_MGT_WEB_API.addAsyncAuthenticatedRoute(
    '/logs/:oid/:aid/:prj',
    {
        'get':  async (pReq:DelegateRequest, pRes:DelegateResponse)=>{

            let $:WebServer = pReq.dxc.$;
            try {
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                let aid = pReq.params.aid;
                let pid = pReq.params.prj;
                let size=1000;
                if(pReq.query.size!=null){
                    size = parseInt(pReq.query.size as string, 10);
                }

                if(aid=='-'){
                    $.sendSuccess(pRes, NodeUtils.serialize(
                        await $.context.getOrgManager().getOrganizationLogs(pReq.user, org)
                    ));
                    return;
                }

                aid = ApplicationUnit.TYPE.getPrimaryKey().sanitize(aid).getValue();
                const app = await $.context.getOrgManager()
                                                        .getApplicationUnit(pReq.user,aid);

                if(pid=='-'){
                    $.sendSuccess(pRes, NodeUtils.serialize(
                        await $.context.getOrgManager().getApplicationLogs(pReq.user, app)
                    ));
                    return;
                }

                pid = DexcaliburProject.TYPE.getPrimaryKey().sanitize(pReq.params.prj).getValue();
                if(app.hasRelease(pid)){
                    $.sendSuccess(pRes, NodeUtils.serialize(
                        await $.context.getEngineDB().getGlobalLogs(
                            (!Number.isNaN(size)) ? size : 1000,
                            0, {
                                projects: [pid],
                                sort: 'desc'
                            })
                    ));
                    return;
                }else{
                    throw new Error("Cannot satisfy options.");
                }
            }catch(err){
                Logger.error("[API][PROJECT MGT] Cannot retrieve logs :\n"+err.stack);
                $.sendErrorAfterException(
                    pRes, PROJECT_MGT_WEB_API.name,
                    "Cannot retrieve logs.",
                    err, {cause: err.message});
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

                const res = (await $.context.getProjectManager().newProjectOrder(
                    (pReq as any).user,
                    org,
                    app,
                    {
                        projectName: pReq.body['name'],
                        analyzerOpts: pReq.body['cfg'],
                        platformUID: pReq.body['platform'] as string,
                        deviceUID: pReq.body['dev'] as DeviceUUID,
                        targetOS: pReq.body['targetOS'],

                        flowType: NewProjectFlowType.SELECT,
                        remotePath: pReq.body['path'] as string,
                    }));

                $.sendSuccess(pRes, {
                    //... res.wf.toJsonObject(null, SecurityZone.PUBLIC),
                    wf: res.wf,
                    __puid:  res.puid
                });

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
                    uid: UploadedResource.VALIDATE.uuid,
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

                const res = (await $.context.getProjectManager().newProjectOrder(
                    (pReq as any).user,
                    org,
                    app,
                    {
                        projectName: pReq.body['name'],
                        analyzerOpts: pReq.body['cfg'],
                        platformUID: pReq.body['platform'] as string,
                        deviceUID: pReq.body['dev'] as DeviceUUID,
                        targetOS: pReq.body['targetOS'],

                        flowType: NewProjectFlowType.UPLOAD,

                        uploadUID: [pReq.body['file'] as string],
                        inputTpls: checkedTpl
                    },{
                        cookie: pReq.cookies
                    }));


                $.sendSuccess(pRes, {
                    //... res.wf.toJsonObject(null, SecurityZone.PUBLIC),
                    wf: res.wf,
                    __puid:  res.puid
                });

            } catch (err) {

                $.sendErrorAfterException(
                    pRes, PROJECT_MGT_WEB_API.name,
                    "Project has not been created and attached to application unit. (upload type)",
                    err, {cause: err.message});
            }
        }
    },{
        mcp: {
            [HTTP_VERB.POST]: {
                name:'projmgt-new-project-upload-flow',
                uri: '/new/{applicationUUID}/flow/upload',
                summary: `To create a new project from from uploaded file or app downloaded from store. 
                Prior to create the project, the user must ensure that the application unit exists for the specified package and is the license is valid. 
                
                It is performed by calling "organization-application-wizard-appcheck" tool with package identifier, OS and organization UUID.
                Once the project is craeted successfully, the user can must verify if a license is activated for application unit and expected purpose by calling the tool "".`,
                parameters: [{
                    name: 'applicationUUID',
                    required: true,
                    description: ApplicationUnit.TYPE.getPrimaryKey()._dscr,
                    schema: ApplicationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'name',
                    required: true,
                    description: "The name of the project.",
                    schema: { type:"string" }
                },{
                    name: 'dev',
                    required: true,
                    description: "The device UUID to use for the project.",
                    schema: Device.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'targetOS',
                    required: true,
                    description: "The target operating system for the project.",
                    schema: DexcaliburProject.TYPE.getProperty("os").toJSONSchemaPart()
                },{
                    name: 'platform',
                    required: true,
                    description: "The UID of the platform to use",
                    schema: Platform.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'cfg',
                    required: false,
                    description:`Settings to use for the project analyzer.  Several optional properties are supported. Following properties are common:
                    - **fa_mode**: File analysis mode can be 'deep', 'magic', 'smart'.
                    - **na_mode**: Native analysis mode can be 'auto' or 'manual'.
                    
                    Additional properties are available for each target operating system.
                    For Android:
                    - **msa_auto**: Boolean to enable/disable the merging of multiple "split" APKs into a single APK.
                    - **ssa_auto**: Boolean to enable/disable the search of multiple "split" APKs into a device.
                    
                    `,
                    schema: {
                        type: "object",
                        properties: {
                            fa_mode: { type:"string", enum: Object.values(FileAnalysisType) },
                            na_mode: { type:"string", enum: Object.values(NativeAnalysisMode) },
                            msa_auto: { type:"boolean" },
                            ssa_auto: { type:"boolean" },
                        },
                        required: []
                    }
                },{
                    name: 'inputs',
                    required: false,
                    description: "The list of uploaded files to use as inputs for the project.",
                    schema: {type:"array", items: { type:"object", properties: {
                        uid: { type:"string" },
                        purpose: { type:"string" }
                    }}}
                }
                /*
                inputs
                analyzerOpts: pReq.body['cfg'],
                uploadUID: [pReq.body['file'] as string],
                inputTpls: checkedTpl
                 */
                ],
                responses: [{
                    description: "The status of the project opening operation." ,
                    schema: {
                        type: 'object',
                        properties: {
                            ready: {type:'boolean'},
                            node: {type:'string'},
                            wf: {type:'string'},
                            createErr: {type:'string'},
                            msg: {type:'string'}
                        },
                        required: ['ready','node']
                    }
                }]
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

                const res = (await $.context.getProjectManager().newProjectOrder(
                    (pReq as any).user,
                    org,
                    app,
                    {
                        projectName: pReq.body['name'],
                        analyzerOpts: pReq.body['cfg'],
                        platformUID: pReq.body['platform'] as string,
                        deviceUID: pReq.body['dev'] as DeviceUUID,
                        targetOS: pReq.body['targetOS'],

                        flowType: NewProjectFlowType.DOWNLOAD,
                        url: pReq.body['url'] as string,
                    },{
                        cookie: pReq.cookies
                    }
                ));

                $.sendSuccess(pRes, {
                    //... res.wf.toJsonObject(null, SecurityZone.PUBLIC),
                    wf: res.wf,
                    __puid:  res.puid
                });

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

                let sent = false;
                // target org
                const po = await $.context.getProjectManager().getProjectOrder(
                    (pReq as any).user,
                    pReq.params.pid
                );

                const res = await $.context.getProjectManager().executeProjectOrder(
                    (pReq as any).user,
                    po,
                    (vNode)=>{

                        const subscription = vNode.nodeState$.subscribe((vChange)=>{

                            Logger.info(`[API][PROJECT MGT] New project from slave : state of local node changed ${vChange.before} to ${vChange.new}`);
                            if(vChange.new==NodeState.IDLE && vChange.before==NodeState.BUSY){
                                subscription.unsubscribe();
                                Logger.info(`[API][PROJECT MGT] Nex project from slave : Terminated`);
                                if(!sent){
                                    sent = true;
                                    $.sendSuccess(pRes, {
                                        ready: true,
                                        node: vNode.getUID()
                                    });
                                }
                            }
                        })
                    }
                );



                if(!sent){
                    const node = await $.context.getNodeManager().getNodeByUUID(
                        $.context.getNodeUUID()
                    );
                    console.log(node);
                    node.setPurpose(NodePurpose.ANY);
                    node.setState(NodeState.IDLE);
                    sent = true;
                    $.sendSuccess(pRes, res.toJsonObject());
                }

            } catch (err) {

                $.sendErrorAfterException(
                    pRes, PROJECT_MGT_WEB_API.name,
                    "failed to execute project order",
                    err, {cause: err.message});
            }
        }
    },{
        mcp: {
            [HTTP_VERB.POST]: {
                name:'projmgt-start-project-order',
                uri: '/order/{projectUUID}/start',
                summary: `To start a new project from a project order.`,
                parameters: [{
                    name: 'projectUUID',
                    required: true,
                    description: ProjectOrder.TYPE.getPrimaryKey()._dscr,
                    schema: ProjectOrder.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: "The project object after execution." ,
                    schema: DexcaliburProject.TYPE.toJSONSchemaPart()
                }]
            }
        }
    }
);
