import DexcaliburEngine from "../DexcaliburEngine.js";
import {UserAccount} from "../user/UserAccount.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import AccessControl from "../user/acl/AccessControl.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import WebServer from "../WebServer.js";
import DeviceManager from "../DeviceManager.js";
import {Device, DeviceUUID} from "../Device.js";
import Platform from "../platform/Platform.js";
import {Workflow} from "../Workflow.js";
import {ProjectInput, ProjectInputLocation, ProjectInputPurpose, ProjectInputType} from "../analyzer/ProjectInput.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import StatusMessage from "../StatusMessage.js";
import PlatformManager from "../platform/PlatformManager.js";
import Downloader from "../Downloader.js";
import {UserSession} from "../user/session/UserSession.js";
import {AnalyzerConfiguration} from "../AnalyzerConfiguration.js";
import {Nullable, OperatingSystem} from "@dexcalibur/dxc-core-api";
import * as Log from "../Logger.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export enum NewProjectFlowType {
    SELECT='select',
    UPLOAD='upload',
    DOWNLOAD='download',
    FROMFS='fromfs'
}

export interface NewProjectCommonWfOpts {
    uid?:string,
    inputs?: ProjectInput[],
    projectName?: string,
    deviceUID?: DeviceUUID,
    platformUID?: string,
    analyzerOpts?: AnalyzerConfiguration,
    targetOS?:OperatingSystem
}

export interface NewProjectSelectWfOptions extends NewProjectCommonWfOpts{
    flowType: NewProjectFlowType.SELECT,
    remotePath: string
}

export interface NewProjectUploadWfOptions extends NewProjectCommonWfOpts{
    flowType: NewProjectFlowType.UPLOAD,
    uploadUID: string[]
}

export interface NewProjectDownloadWfOptions extends NewProjectCommonWfOpts{
    flowType: NewProjectFlowType.DOWNLOAD,
    url: string
}

export interface NewProjectFromfsWfOptions extends NewProjectCommonWfOpts{
    flowType: NewProjectFlowType.FROMFS,
    localPath: string
}


export type NewProjectWorkflowOptions = NewProjectFromfsWfOptions
        | NewProjectDownloadWfOptions
        | NewProjectUploadWfOptions
        | NewProjectSelectWfOptions;


/**
 * @class
 */
export class ProjectManager {

    private _ctx:DexcaliburEngine;

    constructor(pCtx:DexcaliburEngine) {
        this._ctx = pCtx;
    }

    async listProjectByUser( pAccount:UserAccount):Promise<DexcaliburProject[]> {
        const all = this._ctx.getEngineDB().getCollectionOf(DexcaliburProject.TYPE.getType()).getAsList();

        return [];
    }

    async listProjectByOrgUnit( pAccount:UserAccount, pOrg:OrganizationUnit):Promise<DexcaliburProject[]> {
        return [];
    }



    async newProjectWorkflow(pAccount:UserAccount, pAppUnit:ApplicationUnit, pOptions:NewProjectWorkflowOptions):Promise<DexcaliburProject>  {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_NEW_PROJ,
            pAccount,
            pAppUnit,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
            ]
        );

        const PLATFORM_MODE = ['dev','min','max'];
        let dm:DeviceManager = null;
        let device:Nullable<Device> = null;


        let project:DexcaliburProject = null;
        let path:string = null;
        let user:UserAccount = null;
        let platform:Platform = null;
        let success:boolean = true;
        let wf:Workflow = null;
        let anal:any = {};
        let filetype:string;
        let projInputs:ProjectInput[] = [];

        try{

            // refresh device list and select target device
            dm = DeviceManager.getInstance();
            await dm.scan();

            if(pOptions.deviceUID != null){
                device = dm.getDevice( pOptions.deviceUID );
            }

            // set project name
            let projectUID:string;
            if(pOptions.projectName == null){
                throw DexcaliburProjectException.INVALID_NAME();
            }else{
                projectUID = DexcaliburProject.sanitizeUID(pOptions.projectName);
            }

            if(pOptions.analyzerOpts != null){
                anal = pOptions.analyzerOpts;
            }

            if(anal==null){
                anal = {};
            }

            // create and init workflow object to get feedback from progression
            // attach workflow to the user or the app unit
            // replace changeOwner(UserAccount) by changeOwner(UserGroup|ApplicationUnit)
            wf = this._ctx.newWorkflow(projectUID).changeOwner(pAccount);

            // TODO : retrieve platform from special value of req.body['platform'] : target, from target device, target API version from manifest , ...

            // first download remote application
            // on error : ne‹ project will not create.
            switch(pOptions.flowType)
            {
                /**
                 * Create a project by pulling a file from a device
                 */
                case NewProjectFlowType.SELECT:
                    if(device == null){
                        throw DexcaliburProjectException.TARGET_DEVICE_NOT_FOUND();
                    }
                    wf.pushStatus(new StatusMessage(5, "Get target platform"));
                    platform = device.getPlatform();

                    wf.pushStatus(new StatusMessage(10, "Pull application from device"));

                    projInputs.push(new ProjectInput({
                        data: pOptions.remotePath,
                        location: ProjectInputLocation.DEVICE,
                        type: ProjectInputType.REGULAR_FILE,
                        extractOpts: {type:'bin'},
                        purpose: ProjectInputPurpose.MAIN
                    }));

                    break;
                case NewProjectFlowType.DOWNLOAD:
                    if(PLATFORM_MODE.indexOf(pOptions.platformUID)==-1){
                        wf.pushStatus(new StatusMessage(5, "Set target platform"));
                        platform = PlatformManager.getInstance().getPlatform(pOptions.platformUID);
                    }
                    wf.pushStatus(new StatusMessage(10, "Download target application from remote location"));
                    path = await Downloader.downloadTemp( pOptions.url , { mode:0o666, encoding:'binary', force:true });

                    projInputs.push(new ProjectInput({
                        data: path,
                        location: ProjectInputLocation.LOCAL,
                        type: ProjectInputType.REGULAR_FILE,
                        extractOpts: {type:'bin'},
                        purpose: ProjectInputPurpose.MAIN
                    }));
                    break;
                case NewProjectFlowType.UPLOAD:
                    wf.pushStatus(new StatusMessage(5, "Set target platform"));
                    platform = PlatformManager.getInstance().getPlatform( pOptions.platformUID);
                    wf.pushStatus(new StatusMessage(10, "Select previously uploaded application"));


                    if(pOptions.uploadUID!=null && pOptions.uploadUID.length>0){

                        let i=0;
                        do{
                            try{
                                projInputs.push(new ProjectInput({
                                    data: this._ctx.getWebserver().uploader.getPathOf(pOptions.uploadUID[i]),
                                    location: ProjectInputLocation.LOCAL,
                                    type: ProjectInputType.REGULAR_FILE,
                                    extractOpts: {type:'bin'},
                                    purpose: ProjectInputPurpose.MAIN
                                }));
                            }catch (err){
                                console.log(err);
                            }finally {
                                i++;
                            }
                        }while(i<pOptions.uploadUID.length);
                    }else{
                        throw new Error("uploadUIDs cannot be retrieved from user session.")

                        /*path = this._ctx.getWebserver().uploader.getPathOf((pOptions.dxc.sess as UserSession).getData('proj_upload_id'));
                        projInputs.push(new ProjectInput({
                            data: path,
                            location: ProjectInputLocation.LOCAL,
                            type: ProjectInputType.REGULAR_FILE,
                            extractOpts: {type:'bin'},
                            purpose: ProjectInputPurpose.MAIN
                        }));*/
                    }


                    break;
                case NewProjectFlowType.FROMFS:

                    AccessControl.isAuthorized(
                        AccessControl.access.PROJ_NEW_FROMFS,
                        pAccount,
                        pAppUnit,
                        [
                            OrganizationAccessControl.attr.OWNER,
                            OrganizationAccessControl.attr.APP_MEMBER,
                        ]
                    )

                    wf.pushStatus(new StatusMessage(5, "Set target platform"));
                    platform = PlatformManager.getInstance().getPlatform(pOptions.platformUID);

                    projInputs.push(new ProjectInput({
                        data: pOptions.localPath,
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

            if(device==null && pOptions.targetOS!=null){
                // try to find compatible device already enrolled
                const compDevs = dm.searchCompatibleDevice(pOptions.targetOS, pAppUnit);
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

            Logger.info('[PROJECT][STEP 2] Input file : '+(projInputs[0].data as string));

            /*if(anal != null){

                Logger.info('[PROJECT][STEP 3.2] Configuring Analyzers ...');
                // wf.pushStatus(new StatusMessage(11, "Configuring Analyzers"));
                const analCfg = project.getAnalyzerConfiguration(); // platform.getUID());
                analCfg.setFileAnalysisMode(anal.fa_mode);
                analCfg.setNativeAnalysisMode(anal.na_mode);

            }*/


            project = await this._ctx.newProject(
                projectUID,
                projInputs,
                device,
                pAccount,
                platform,
                anal,
                pAppUnit
            );

            if(project == null){
                throw DexcaliburProjectException.STEP2_FAILURE();
            }

            project.setWorkflow(wf);

            // to set connector
            Logger.info('[PROJECT][STEP 3] Setting connectors ...');

            /*if(req.body['connector'] != null && req.body['connector'].length > 0){
                project.setConnector(req.body['connector']);
            }else*/

            project.setConnector(this._ctx.getWorkspace().getSettings().getDefaultConnector());


            if(project != null){
                Logger.info('[PROJECT][STEP 3.1] Configuring platform ...');
                wf.pushStatus(new StatusMessage(10, "Synchronizing target platform with project"));
                //platform = PlatformManager.getInstance().getDefaultPlatformFor();
                // sync project platform with target platform or APK

                if(platform!=null){
                    success = await project.synchronizePlatform( platform.getUID());
                }else{
                    throw  new Error("Project cannot be updated with selected platform : platform is not defined");
                }

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


            return project;
        }catch(err){

            if(wf!=null){
                wf.pushStatus(StatusMessage.newError(err.message))
            }

            //$.context.clean()
            Logger.error("[API][PROJECT MGT] "+err.message+"\n\t"+err.stack);
        }

        return ;

    }
}