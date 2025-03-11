import DexcaliburEngine, {DexcaliburEngineMode} from "../DexcaliburEngine.js";
import {UserAccount} from "../user/UserAccount.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import AccessControl from "../user/acl/AccessControl.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import DeviceManager from "../DeviceManager.js";
import {Device, DeviceUUID} from "../Device.js";
import Platform from "../platform/Platform.js";
import {Workflow} from "../Workflow.js";
import {ProjectInput, ProjectInputLocation, ProjectInputPurpose, ProjectInputType} from "../analyzer/ProjectInput.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import StatusMessage from "../StatusMessage.js";
import PlatformManager from "../platform/PlatformManager.js";
import Downloader from "../Downloader.js";
import {AnalyzerConfiguration} from "../AnalyzerConfiguration.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import * as Log from "../Logger.js";
import {EngineNode, NodePurpose, OperationType} from "../core/EngineNode.js";
import {ProjectOrder, ProjectOrderUUID} from "./ProjectOrder.js";
import {ProjectState} from "../ProjectState.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {ProjectManagerException} from "../errors/ProjectManagerException.js";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol.js";
import {UserServiceException} from "../errors/UserServiceException.js";
import {DXC_LIFECYCLE_EVENT} from "../CoreConst.js";
import {EngineNodeManager, NodeState} from "../core/EngineNodeManager.js";
import {EngineNodeException} from "../errors/EngineNodeException.js";
import {AndroidPackageAnalyzer} from "../android/analyzer/AndroidPackageAnalyzer.js";
import {AndroidPackageAnalyzerConfig} from "../android/analyzer/AndroidPackageAnalyzerConfig.js";
import {IPackageAnalyzer} from "../analyzer/IPackageAnalyzer.js";
import {OperatingSystem} from "../platform/OperatingSystem.js";


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

export interface InputTemplate {
    uploadID: string,
    purpose: ProjectInputPurpose
}

export interface NewProjectUploadWfOptions extends NewProjectCommonWfOpts{
    flowType: NewProjectFlowType.UPLOAD,
    uploadUID: string[],
    inputTpls: InputTemplate[]
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

    /**
     * To list all project from DB
     *
     * @private
     */
    private async _listAllProjects():Promise<DexcaliburProject[]> {
        return await this._ctx.getEngineDB()
            .getCollectionOf(DexcaliburProject.TYPE.getType())
            .getAsList();
    }

    /**
     * To retrieve the list of project accessible to specified user account.
     *
     * The result is an union of :
     * - Project directly owned or tested by the user
     * - Project defined as a Release from an AppUnit where user is authorized to access
     *
     * @param {UserAccount} pAccount
     * @returns {Promise<DexcaliburProject[]>} List of projects
     * @method
     */
    async listProjectByUser( pAccount:UserAccount):Promise<DexcaliburProject[]> {

        try{
            AccessControl.isAuthorized(
                AccessControl.access.SRV_INSTANCE_MGT,
                pAccount
            );

            return await this._listAllProjects();
        }catch (e){
            AccessControl.isAuthorized(
                AccessControl.access.PROJ_META_READ,
                pAccount
            );
        }

        // retrieve every membships
        const mss = pAccount.getMemberships();
        let projects:DexcaliburProject[] = [];
        let org:OrganizationUnit;

        for(let oid in mss){
            org = await this._ctx.getOrgManager().getOrganization(pAccount, oid);
            projects = projects.concat( await this.listProjectByOrgUnit(pAccount, org));
        }

        // if the user as admin role, he can open all projects
        /*

        const all:DexcaliburProject[] = await this._ctx.getEngineDB()
            .getCollectionOf(DexcaliburProject.TYPE.getType())
            .getAsList();

        const authorizedApps = await this._ctx.getOrgManager().listApplicationsByUser(pAccount);

        let authorizedPUID: DexcaliburProjectUUID[] = [];
        authorizedApps.map(x =>{
            authorizedPUID = authorizedPUID.concat(x.getReleases())
        });

        const filtered:DexcaliburProject[] = [];

        // direct search by attributes
        all.map(vProj => {
            try{
                if(authorizedPUID.indexOf(vProj.getUID())>-1){
                    filtered.push(vProj);
                    return;
                }

                AccessControl.isAuthorized(
                    AccessControl.access.PROJ_META_READ,
                    pAccount,
                    vProj,
                    [
                        ProjectAccessControl.attr.OWNER,
                        ProjectAccessControl.attr.TESTER
                    ]
                );

                filtered.push(vProj);
            }catch (e){  }
        });*/

        return projects;
    }

    async listProjectByOrgUnit( pAccount:UserAccount, pOrg:OrganizationUnit):Promise<DexcaliburProject[]> {

        let projUIDs:DexcaliburProjectUUID[] = [];

        // get authorized app units
        const apps = await this._ctx.getOrgManager().listApplications(pAccount, pOrg);

        for(let i=0; i<apps.length; i++) {
            projUIDs = projUIDs.concat(apps[i].getReleases());
        }

        return await this._ctx.getEngineDB()
            .getCollectionOf(DexcaliburProject.TYPE.getType())
            .search(
                { filter:{ uid: { $in: projUIDs } }},
                { merlinRequest:false, raw:true });
    }

    /**
     * To get project by app unit
     *
     * @param pAccount
     * @param pApp
     */
    async listProjectByAppUnit( pAccount:UserAccount, pApp:ApplicationUnit):Promise<DexcaliburProject[]> {

       return await (this._ctx.getEngineDB().getCollectionOf(DexcaliburProject.TYPE.getType()))
            .search({ filter: { uid: { $in: pApp.getReleases() } } }, {raw:true});
    }

    /**
     * To create and push a new project order and return associated WF
     *
     * @param {UserAccount} pAccount User issueing order
     * @param pAppUnit
     * @param pOptions
     */
    async newProjectOrder(pAccount:UserAccount, pOrg:OrganizationUnit,
                          pAppUnit:ApplicationUnit, pOptions:NewProjectWorkflowOptions, pExtraOwnerOpts:any = null):Promise<Workflow> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_NEW_PROJ,
            pAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        let existingNodes:EngineNode[];

        // create empty placeholder project
        let proj = new DexcaliburProject({
            uid: await this._ctx.getEngineDB().generateFreeUuid(
                DexcaliburProject.TYPE.getType(),
                'uid'
            ),
            engine: this._ctx
        });
        proj.state = ProjectState.ORDERED;

        // save project in DB
        proj = await this._ctx.getEngineDB().createProject(proj);

        // search slave ready
        let node:EngineNode = this._ctx.nodeManager.getReadySlave(
            proj.getUID(),
            NodePurpose.NEW_PRJ
        );

        // start a new node
        if(node == null){
            // check ressources quotas
            node = await this._ctx.nodeManager.createNode(proj.getUID(), NodePurpose.NEW_PRJ, pOrg.getUID()); //, pOrder.settings.targetOS);
            node.start("New project created");
        }

        // create workflow
        const wf = new Workflow({
            uid: pOrg.getUID()+":exec"
        });
        wf.start();

        // build project order
        let newPrjOrder= new ProjectOrder({
            uuid: await this._ctx.getEngineDB().generateFreeUuid(
                ProjectOrder.TYPE.getType(),
                'uuid'
            ),
            // org unit, app unit
            orgUnit: pOrg.getUID(),
            appUnit: pAppUnit.getUID(),
            owner: pAccount.getUID(),
            slaveUID: node.getUID(),
            settings: {
                projectUID: proj.getUID(),
                options: pOptions
            },
            wf: wf
        });


        // save (create) project
        newPrjOrder = (await this._ctx.getEngineDB().save(newPrjOrder) as ProjectOrder);

        if(!await node.isBusy()){
            // send a request to order a scan to the node
            node.startProject(pAccount,newPrjOrder,pExtraOwnerOpts);
        }else{
            // add scan to queue
            node.appendToQueue(newPrjOrder, OperationType.NEW_PROJ, pAccount,pExtraOwnerOpts);
        }

        return newPrjOrder.getWorflow();
    }


    async listProjectOrders(pAccount:UserAccount, pAppUnit:ApplicationUnit, pState:Nullable<ProjectState> = null ):Promise<ProjectOrder[]> {

        const ordersColl = await (this._ctx.getEngineDB().getCollectionOf(ProjectOrder.TYPE.getType()));

        if(pState==null)
            return ordersColl.search({ appUnit: pAppUnit.getUID(), state:pState });
        else
            return ordersColl.search({ appUnit: pAppUnit.getUID() });
    }


    /**
     * To execute a  project order
     *
     * In Master/Slave mode, this method should be always called by SLAVE nodes
     *
     * @param {UserAccount} pAccount User account
     * @param {ProjectOrder} pOrder The project order
     * @method
     */
    async executeProjectOrder(pAccount:UserAccount, pOrder:ProjectOrder):Promise<DexcaliburProject>  {

        // retrieve app from order
        const app = await this._ctx.getOrgManager()
            .getDirectApplication(pAccount,pOrder.getApplicationUnit());

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_NEW_PROJ,
            pAccount,
            app,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
            ]
        );

        const orderOpts = pOrder.settings.options;
        const PLATFORM_MODE = ['dev','min','max'];
        let dm:DeviceManager = null;
        let device:Nullable<Device> = null;


        let project:DexcaliburProject = null;
        let path:string = null;
        let platform:Platform = null;
        let success:boolean = true;
        let workflow:Workflow = null;
        let anal:any = {};
        let projInputs:ProjectInput[] = [];

        try{

            // retrieve workflow from order (WF has been created on master node)
            workflow = pOrder.getWorflow();
            if(!workflow.isStarted()){
                workflow.start();
            }

            // register workflow on current instance (probably a slave node)
            this._ctx.registerWorkflow(workflow);

            // refresh device list and select target device
            dm = DeviceManager.getInstance();
            await dm.scan();

            if(orderOpts.deviceUID != null){
                device = dm.getDevice( orderOpts.deviceUID );
            }

            // set project name
            let projectUID:string;
            if(orderOpts.projectName == null){
                projectUID = orderOpts.projectName = pOrder.getUID();
            }else{
                projectUID = DexcaliburProject.sanitizeUID(orderOpts.projectName);
            }

            if(orderOpts.analyzerOpts != null){
                anal = orderOpts.analyzerOpts;
            }

            if(anal==null){
                anal = {};
            }

            // guess device and platform from app unit
            if(device==null){
                let compatDev = dm.searchCompatibleDevice(app.os, app, null,false);
                if(compatDev.length>0){
                    device = compatDev[0];
                }
            }

            // TODO : retrieve platform from special value of req.body['platform'] : target, from target device, target API version from manifest , ...

            // first download remote application
            // on error : ne‹ project will not create.
            switch(orderOpts.flowType)
            {
                /**
                 * Create a project by pulling a file from a device
                 */
                case NewProjectFlowType.SELECT:
                    if(device == null){
                        throw DexcaliburProjectException.TARGET_DEVICE_NOT_FOUND();
                    }
                    workflow.pushStatus(new StatusMessage(5, "Get target platform"));
                    platform = device.getPlatform();

                    workflow.pushStatus(new StatusMessage(10, "Pull application from device"));

                    projInputs.push(new ProjectInput({
                        data: orderOpts.remotePath,
                        location: ProjectInputLocation.DEVICE,
                        type: ProjectInputType.REGULAR_FILE,
                        extractOpts: {type:'bin'},
                        purpose: ProjectInputPurpose.MAIN
                    }));

                    break;
                case NewProjectFlowType.DOWNLOAD:
                    if(PLATFORM_MODE.indexOf(orderOpts.platformUID)==-1){
                        workflow.pushStatus(new StatusMessage(5, "Set target platform"));
                        platform = PlatformManager.getInstance().getPlatform(orderOpts.platformUID);
                    }
                    workflow.pushStatus(new StatusMessage(10, "Download target application from remote location"));
                    path = await Downloader.downloadTemp( orderOpts.url , { mode:0o666, encoding:'binary', force:true });

                    projInputs.push(new ProjectInput({
                        data: path,
                        location: ProjectInputLocation.LOCAL,
                        type: ProjectInputType.REGULAR_FILE,
                        extractOpts: {type:'bin'},
                        purpose: ProjectInputPurpose.MAIN
                    }));
                    break;
                case NewProjectFlowType.UPLOAD:
                    workflow.pushStatus(new StatusMessage(5, "Set target platform"));

                    if(orderOpts.platformUID!=null){
                        platform = PlatformManager.getInstance().getPlatform( orderOpts.platformUID);
                    }

                    if(platform==null && device!=null){
                        platform = device.getPlatform();
                    }
                    workflow.pushStatus(new StatusMessage(10, "Select previously uploaded application"));

                    if(orderOpts.inputTpls!=null){
                        // ignore uploadUID
                        let i=0;
                        do{
                            try{
                                projInputs.push(new ProjectInput({
                                    data: await this._ctx.getWebserver().uploader.getPathOf(orderOpts.inputTpls[i].uploadID),
                                    location: ProjectInputLocation.LOCAL,
                                    type: ProjectInputType.REGULAR_FILE,
                                    extractOpts: {type:'bin'},
                                    purpose: orderOpts.inputTpls[i].purpose
                                }));
                            }catch (err){
                                workflow.pushStatus(StatusMessage.newError(err.message));
                                Logger.error(err.stack);
                            }finally {
                                i++;
                            }
                        }while(i<orderOpts.inputTpls.length);
                    }else{
                        throw ProjectManagerException.INPUTS_ARE_MANDATORY(pOrder.getUID());
                    }

                    if(platform==null){
                        // finally, try to extract target platform from binary and target OS
                        let bin:ProjectInput = null;
                        if(projInputs.length>0){
                            bin = projInputs.find(x => x.purpose===ProjectInputPurpose.MAIN);
                            if(bin==null){
                                bin = projInputs[0];
                            }
                            platform = await  this._extractPlatformFromBin(bin, orderOpts.targetOS, workflow);
                        }
                    }


                    break;
                case NewProjectFlowType.FROMFS:

                    AccessControl.isAuthorized(
                        AccessControl.access.PROJ_NEW_FROMFS,
                        pAccount,
                        app,
                        [
                            OrganizationAccessControl.attr.OWNER,
                            OrganizationAccessControl.attr.APP_MEMBER,
                        ]
                    )

                    workflow.pushStatus(new StatusMessage(5, "Set target platform"));
                    platform = PlatformManager.getInstance().getPlatform(orderOpts.platformUID);

                    projInputs.push(new ProjectInput({
                        data: orderOpts.localPath,
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

            if(device==null && orderOpts.targetOS!=null){
                // try to find compatible device already enrolled
                try{
                    const compDevs = dm.searchCompatibleDevice(orderOpts.targetOS, app, platform);
                    if(compDevs.length>0){
                        device = compDevs[0];
                    }
                    if(device!=null && platform==null){
                        platform = device.getPlatform();
                    }
                }catch (e){  }
            }

            Logger.info(
                '[PROJECT][STEP 2] Detecting device  ... ',
                device!==null?'[OK]':'[KO]',
                ' Platform ... ',
                platform!==null? '[OK]':'[KO]');

            workflow.stepUp(15);

            Logger.info('[PROJECT][STEP 2] Input file : '+(projInputs[0].data as string));

            // save project inputs in PO
            pOrder.setInputs(projInputs);

            this._ctx.getEngineDB().updateOrder(pOrder, ['inputs']);



            // start to init the project
            project = await this._ctx.newProject(
                pOrder.settings.projectUID,
                projInputs,
                device,
                pAccount,
                platform,
                anal,
                app,
                pOrder.getWorflow()//.getUID()
            );

            if(project == null){
                throw DexcaliburProjectException.STEP2_FAILURE();
            }

            project.setWorkflow(workflow);

            // to set connector
            Logger.info('[PROJECT][STEP 3] Setting connectors ...');

            /*if(req.body['connector'] != null && req.body['connector'].length > 0){
                project.setConnector(req.body['connector']);
            }else*/

            project.setConnector(this._ctx.getWorkspace().getSettings().getDefaultConnector());


            if(project != null){
                Logger.info('[PROJECT][STEP 3.1] Configuring platform ...');
                workflow.pushStatus(new StatusMessage(10, "Synchronizing target platform with project"));
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
                workflow.stepUp(15);
                project = await project.fullscan();
                success = project.isReady();
                workflow.pushStatus(StatusMessage.newSuccess("Project has been created successfully."))
            }

            if(!success){
                throw DexcaliburProjectException.NEW_PROJECT_FAIL();
            }


            return project;
        }catch(err){

            if(workflow!=null){
                workflow.pushStatus(StatusMessage.newError(err.message))
            }

            Logger.error("[API][PROJECT MGT] "+err.message+"\n\t"+err.stack);

            throw ProjectManagerException.ORDER_EXEC_FAILED(pOrder.getUID())
        }
    }


    /**
     * To retrieve project order from database
     *
     * @param {UserAccount} pAccount Account
     * @param {ProjectOrderUUID} pOrderID Order UUID
     */
    async getProjectOrder(pAccount:UserAccount, pOrderID:ProjectOrderUUID):Promise<ProjectOrder>{
        AccessControl.isAuthorized(
            AccessControl.access.PROJ_ORDER_MGT,
            pAccount
        );

        try{
            return await (this._ctx.getEngineDB()
                .getCollectionOf(ProjectOrder.TYPE.getType()) as MongodbDbCollection)
                .asyncGetEntry({ uuid: pOrderID });
        }catch (err){
            console.log(err);
            throw ProjectManagerException.ORDER_NOT_FOUND(pOrderID);
        }

    }


    /**
     * To retrieve project order from database
     *
     * @param {UserAccount} pAccount Account
     * @param {ProjectOrderUUID} pOrderID Order UUID
     */
    async getProject(pAccount:UserAccount, pProjectUID:DexcaliburProjectUUID):Promise<DexcaliburProject>{
        AccessControl.isAuthorized(
            AccessControl.access.PROJ_OPEN_ANY,
            pAccount
        );

        try{
            return await (this._ctx.getEngineDB()
                .getCollectionOf(DexcaliburProject.TYPE.getType()) as MongodbDbCollection)
                .asyncGetEntry({ uid: pProjectUID });
        }catch (err){
            throw ProjectManagerException.PROJECT_NOT_FOUND(pProjectUID);
        }

    }

    /**
     * To retrieve project order from database
     *
     * @param {UserAccount} pAccount Account
     * @param {ProjectOrderUUID} pOrderID Order UUID
     */
    async isLoaded(pAccount:UserAccount, pProjectUID:DexcaliburProjectUUID,
                   pPurpose:NodePurpose = NodePurpose.ANY):Promise<boolean>{
        AccessControl.isAuthorized(
            AccessControl.access.PROJ_OPEN_ANY,
            pAccount
        );

        let nodes = (this._ctx.getNodeManager().getNodeByProject(pProjectUID));
        if(pPurpose!=NodePurpose.ANY){
            nodes = EngineNodeManager.filterNodesByPurpose(nodes, pPurpose);
        }
        return (nodes.length>0);
    }


    /**
     * To check if the user is authorized to access to specified project
     *
     * @param pAccount
     * @param pProjectUID
     */
    async isAuthorized(pAccount:UserAccount, pProjectUID:DexcaliburProjectUUID):Promise<void>{
        if(pAccount==null){
            throw UserServiceException.USER_NOT_FOUND();
        }

        if(!DexcaliburProject.VALIDATE.uid.test(pProjectUID)){
            throw DexcaliburProjectException.INVALID_UUID_FMT(pProjectUID);
        }

        const proj = await this.getProject(this._ctx.getInternalAcc(), pProjectUID);

        console.log("IS AUTHORIZED ", pProjectUID, proj);
        let authorized = false;
        try{
            AccessControl.isAuthorizedByAttr(
                ProjectAccessControl.attr.OWNER,
                proj,
                pAccount
            );
            authorized = true;
        }catch(e1){
            try{
                AccessControl.isAuthorizedByAttr(
                    ProjectAccessControl.attr.TESTER,
                    proj,
                    pAccount
                );

                authorized = true;
            }catch (e2){
                // check if authorized by app

                if(proj.appUnit!=null && ApplicationUnit.VALIDATE.uuid.test(proj.appUnit)){
                    // check if current user can access to this app unit
                    await this._ctx.getOrgManager()
                        .getApplicationUnit(pAccount,proj.appUnit);

                    authorized = true;
                }
            }
        }

        if(!authorized){
            throw DexcaliburProjectException.NOT_AUTHORIZED(pProjectUID,pAccount.getUID());
        }
    }

    /**
     * To open a project locally or remotely on slave nodes
     *
     * @param pUser
     * @param pProjectUID
     */
    async open( pUser:UserAccount, pProjectUID:DexcaliburProjectUUID, pPurpose:NodePurpose = NodePurpose.HOOK):Promise<EngineNode> {
        // validate project UID format
        if(!DexcaliburProject.VALIDATE.uid.test(pProjectUID)){
            throw DexcaliburProjectException.INVALID_UUID_FMT(pProjectUID);
        }

        // check (assert) if the user is authorized to access to project
        await this.isAuthorized(pUser,pProjectUID);

        // detect current engine node mode
        if(this._ctx.getEngineMode()===DexcaliburEngineMode.MASTER){
            // search free node or node for REVIEW / HOOK
            const remoteNode = await this._openRemotely(pUser,pProjectUID,pPurpose);
            /*const res = await remoteNode.startScan(ScanOrder.fromScanOptions({
                modelUID: null,
                projectUID: pProjectUID,
            }));*/
            // to start the node
            remoteNode.nodeState$.subscribe((vChange  )=>{
                // the sequence NodeState.STARTING -> NodeState.IDLE happens only a single time per node
                if(vChange.new==NodeState.IDLE && vChange.before==NodeState.STARTING){
                    // to open associated project
                    remoteNode.open().then((r)=>{
                        //remoteNode.nodeState$
                        remoteNode.setState(NodeState.IDLE);
                    })
                }
            });

            await remoteNode.start("New project created");

            return remoteNode;
        }

        // else if current node is STANDALONE or SLAVE
        // then check if node has already loaded the project
        let project = this._ctx.getProject(pProjectUID);
        const currNode = await this._ctx.getNodeManager().getEngineNodeByUUID(this._ctx.getNodeUUID());

        // if project is loaded, return it
        if(project!=null && project.isReady()){
            return currNode;
        }

        // create a new workflow for this opening
        this._ctx.newWorkflow(pProjectUID).changeOwner(pUser);

        // if project not loaded, open it locally
        project = await this._openLocally(pUser, pProjectUID);

        return currNode;
    }

    /**
     *
     * @param pUser
     * @param pProjectUID
     * @param pPurpose
     * @private
     */
    private async _openRemotely(pUser:UserAccount, pProjectUID:DexcaliburProjectUUID,
                                pPurpose:NodePurpose):Promise<EngineNode> {

        // search nodes already assigned to this project
        let assignedNodes = this._ctx.getNodeManager().getNodeByProject(pProjectUID);

        if(assignedNodes.length>0){
            // filter by purpose
            assignedNodes = EngineNodeManager.filterNodesByPurpose(assignedNodes, pPurpose);

            if(assignedNodes.length>0){
                // filter by state
                assignedNodes = EngineNodeManager.filterNodesByState(assignedNodes, NodeState.IDLE);

                if(assignedNodes.length>0){
                    // open it
                    return assignedNodes[0];
                }
            }
        }

        // no assigned nodes => allocate a new one
        // if project is assigned to an application unit, check organization quotas
        const prj = await this.getProject(pUser, pProjectUID);
        if(prj.getAppUnit()!=null){
            // check org unit quota
            const app = await this._ctx.getOrgManager()
                .getDirectApplication(pUser, prj.getAppUnit());
            const oid = app.getParentOrganization();

            if( await this._ctx.getNodeManager().canCreateNode(oid)){
                return await this._ctx.getNodeManager().createNode(pProjectUID, pPurpose, oid);
            }else{
                throw ProjectManagerException.NO_MORE_RESOURCES(pProjectUID);
            }
        }


        return await this._ctx.getNodeManager().createNode(pProjectUID,pPurpose);
    }

    /**
     * INTERNAL API
     * To open a project
     *
     * [SECURITY] : Important : this method doesn't check user permissions and attribiutes,
     * please call this method only from secure context.
     *
     * @param {UserAccount} pUserAccount User account requesting to open project
     * @param {DexcaliburProjectUUID} pUID The UID of local project to open
     * @return {Promise<DexcaliburProject>} The project instance
     * @async
     * @method
     */
     private async _openLocally( pUserAccount:UserAccount, pUID:DexcaliburProjectUUID):Promise<DexcaliburProject>{
        let project:DexcaliburProject = null, success:any = false;
        let currNode:EngineNode;
        //const currNode = this._ctx.getNodeManager().getNodeByUUID(this._ctx.getNodeUUID());
        if(this._ctx.getEngineMode()==DexcaliburEngineMode.SLAVE){
            currNode = await this._ctx.getNodeManager().getEngineNodeByUUID(this._ctx.getNodeUUID());

            if(currNode==null){
                throw EngineNodeException.MISSING_NODE(this._ctx.getNodeUUID(),"_openLocally");
            }

            currNode.setState(NodeState.BUSY);
        }


        // retrieve workflow associated to project
        // TODO : retrieve WF from EngineNode (stateless) instead of DexcaliburEngine (stateful)
        const wf:Workflow = this._ctx.getWorkflow( pUID);

        Logger.info("ENGINE : openProject : workflow : "+(wf!=null? wf.getUID() : '<null>'));

        try{
            wf.pushStatus(new StatusMessage(5, "Scanning connected devices"));
            await DeviceManager.getInstance().scan();


            Logger.success("[ENGINE] [OPEN PROJECT] Device manager refreshed");

            wf.pushStatus(new StatusMessage(7, "Loading project data"));

            project = await DexcaliburProject.load(this._ctx, pUID, pUserAccount, null);

            Logger.success("[ENGINE] [OPEN PROJECT] Project loaded");

            // enable auto-update of project in DB when some specifics events
            // of the project happen
            await this._ctx.getEngineDB().attachProject(project);

            // update or create
            project.state = ProjectState.OPEN_START;

            // project = await this.getEngineDB().save(project) as DexcaliburProject;
            DexcaliburEngine.printBanner();

            Logger.debug("[ENGINE] Before project open :");

            wf.stepUp(0.1);

            Logger.debug("[ENGINE] [OPEN PROJECT] Project attached to global DB");
            success = await project.open();

            Logger.debug("[ENGINE] [OPEN PROJECT] Project opened");

            wf.pushStatus(StatusMessage.newSuccess("Project is ready."));
            this._ctx.active[pUID] = project;
            this._ctx.updater.run( DXC_LIFECYCLE_EVENT.OPEN_PROJECT, project);

            project.state = ProjectState.OPEN;
            this._ctx.log("Project loaded", project);

            if(this._ctx.getEngineMode()==DexcaliburEngineMode.SLAVE) {
                currNode.setState(NodeState.IDLE);
            }

            // update db
            //this.getEngineDB().saveProject(project);

            //this.webserver.setProject(project);
        }catch(err){
            Logger.error("ENGINE"," openProject() failed : "+err.message+"\n"+err.stack);
            this._ctx.log("Project cannot be opened. See error message.", project, err.code);
            wf.pushStatus(StatusMessage.newError("Project cannot be loaded. See logs for more details : "+err.message));
            project = null;
            throw err;
        }

        return project;
    }

    private async _extractPlatformFromBin(
                pInput: ProjectInput, pTargetOS: OperatingSystem,
                pWorkflow: Workflow):Promise<Platform> {

         let platform:Platform;
         let anal:IPackageAnalyzer;
         switch (pTargetOS){
             case OperatingSystem.ANDROID:
                 let anal = new AndroidPackageAnalyzer(
                     new AndroidPackageAnalyzerConfig(
                         { msa_auto: false, ssa_auto:false }));
                 // add input to analyzer
                 anal.attachInput(pInput);

                 let min:any = await anal.getMinPlatform();
                 let minplt = DexcaliburEngine.getInstance()
                     .getPlatformManager()
                     .getFromAndroidApiVersion(min);

                 if(minplt!=null){
                    return minplt;
                 }

                 let target:any = await anal.getTargetPlatform();
                 let targetplt = DexcaliburEngine.getInstance()
                     .getPlatformManager()
                     .getFromAndroidApiVersion(target);

                 if(targetplt!=null){
                     return targetplt;
                 }

                 let plts = DexcaliburEngine.getInstance()
                     .getPlatformManager()
                     .enumerateLocal();

                 min = parseInt(min);
                 target = parseInt(target);

                 platform = Object.values(plts)
                     .filter(p => (p.os===OperatingSystem.ANDROID))
                     .sort((a,b)=>{
                         if(parseInt(a.getApiVersion())>parseInt(b.getApiVersion())){
                             return 1;
                         }else{
                             return -1;
                         }
                     })
                     .find(p => {
                         const curr = parseInt(p.getApiVersion());
                         if(curr >= min && curr <= target){
                             return p;
                         }
                     });

                 if(platform==null){
                     throw new Error("There is not eligible platform provisionned");
                 }

                 break;
         }

        return undefined;
    }
}