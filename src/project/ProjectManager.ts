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

import DexcaliburEngine from "../DexcaliburEngine.js";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import AccessControl from "../user/acl/AccessControl.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import DeviceManager from "../DeviceManager.js";
import {Device, DeviceUUID} from "../Device.js";
import Platform from "../platform/Platform.js";
import {Workflow, WorkflowUUID} from "../Workflow.js";
import {ProjectInput, ProjectInputLocation, ProjectInputPurpose, ProjectInputType} from "../analyzer/ProjectInput.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import StatusMessage from "../StatusMessage.js";
import PlatformManager from "../platform/PlatformManager.js";
import Downloader from "../Downloader.js";
import {AnalyzerConfiguration} from "../AnalyzerConfiguration.js";
import {NodeInternalType, Nullable, OperatingSystem} from "@reversense/dxc-core-api";
import * as Log from "../Logger.js";
import {EngineNode, EngineNodeUUID, NodePurpose, OperationType} from "../core/EngineNode.js";
import {ProjectOrder, ProjectOrderUUID} from "./ProjectOrder.js";
import {ProjectState} from "../ProjectState.js";
import {MongodbDbCollection} from "@reversense/dexcalibur-orm-mongodb";
import {ProjectManagerException} from "../errors/ProjectManagerException.js";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol.js";
import {UserServiceException} from "../errors/UserServiceException.js";
import {DXC_LIFECYCLE_EVENT} from "../CoreConst.js";
import {EngineNodeManager, NodeState} from "../core/EngineNodeManager.js";
import {EngineNodeException} from "../errors/EngineNodeException.js";
import {AndroidPackageAnalyzer} from "../android/analyzer/AndroidPackageAnalyzer.js";
import {IPackageAnalyzer} from "../analyzer/IPackageAnalyzer.js";
import {ScanOrder} from "../audit/common/ScanOrder.js";
import {DexcaliburEngineMode} from "../DexcaliburEngineMode.js";
import * as _fs_ from "node:fs";
import {IosPackageAnalyzer} from "../ios/analyzer/IosPackageAnalyzer.js";
import {Page} from "../core/commons.js";

const API_NAME = "PROJ_MGT";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
//Logger.push(` [${API_NAME}] `);

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
    uid: string,
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

    static API_NAME = API_NAME;

    private _ctx:DexcaliburEngine;
    private _preload: Record<DexcaliburProjectUUID, DexcaliburProject> = {};
    private _waitingPreload: Record<DexcaliburProjectUUID, boolean> = {};

    constructor(pCtx:DexcaliburEngine) {
        this._ctx = pCtx;
    }

    /**
     * To list all project from DB
     *
     * @private
     */
    private async _listAllProjects(pPage:Nullable<Page>=null):Promise<DexcaliburProject[]> {
        const projects = await this._ctx.getEngineDB()
            .getCollectionOf(DexcaliburProject.TYPE.getType())
            .getAsList();

        return projects.map(x => { x.setEngine(this._ctx);  return x; });
    }

    /**
     * FIX ROUTINE
     *
     * To repair project inputs with wrong path located into temporaru folder
     * instead of project workspace. This routine updates every project created before 1.2.0
     *
     * @private
     */
    async _fix_projectInput_less_1_2():Promise<any> {
        // read all projects
        const projects = await this._listAllProjects();
        let base:string;
        let inputs:ProjectInput[];
        let proj:DexcaliburProject;

        for(let i=0; i<projects.length; i++){
            proj = projects[i];
            base = proj.getWorkspace().getInputDir();
            inputs = proj.inputs.filter(x => {
                return (x.type===ProjectInputType.REGULAR_FILE)
                    && (x.location===ProjectInputLocation.LOCAL)
                    && (x.data!=null)
                    && (x.data.indexOf(base)!=0);
            });

            if(inputs.length>0){
                Logger.error(`Project [${proj.getUID()}] has ${inputs.length} misconfigured project inputs. Start to repair ... (${inputs.map(x =>x.data).join(',')})`);
                inputs.map( inp => {
                    try{
                        // copy file
                        // Input file is not located into project workspace
                        const inputPath = proj.getWorkspace().getValidInputPath(inp);
                        _fs_.copyFileSync(inp.data, inputPath);

                        // update and save project input
                        inp.setPath(inputPath);
                    }catch (e){
                        Logger.error(e.stack);
                    }
                });
                // save modifying
                await this._ctx.getEngineDB().saveProject(proj, ['inputs']);
                Logger.success(`Repaired [${proj.getUID()}]`);
            }
        }
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
    async listProjectByUser( pAccount:UserAccount, pPurpose:NodePurpose = NodePurpose.ANY, pPage:Nullable<Page>=null):Promise<DexcaliburProject[]> {

        let projects:DexcaliburProject[] = [];
        try{
            AccessControl.isAuthorized(
                AccessControl.access.SRV_INSTANCE_MGT,
                pAccount
            );

            projects = await this._listAllProjects(pPage);
        }catch (e){
            AccessControl.isAuthorized(
                AccessControl.access.PROJ_META_READ,
                pAccount
            );

            // retrieve every membships
            const mss = pAccount.getMemberships();
            let org:OrganizationUnit;

            for(let oid in mss){
                org = await this._ctx.getOrgManager().getOrganization(pAccount, oid);
                projects = projects.concat( await this.listProjectByOrgUnit(pAccount, org, pPage));
            }
        }

        let nodes:EngineNode[] = [];
        // refresh projects status
        for(let i=0; i<projects.length; i++){
            nodes = await this._ctx.getNodeManager().getNodeByProject(projects[i].getUID(), pPurpose, true);
            if(nodes.length > 0){
                projects[i].ready = true;
            }
        }

        return projects;
    }

    /**
     *
     * @param pAccount
     * @param pOrg
     */
    async listProjectByOrgUnit( pAccount:UserAccount, pOrg:OrganizationUnit, pPage:Nullable<Page>=null):Promise<DexcaliburProject[]> {

        let projUIDs:DexcaliburProjectUUID[] = [];

        // get authorized app units
        const apps = await this._ctx.getOrgManager().listApplications(pAccount, pOrg);

        for(let i=0; i<apps.length; i++) {
            projUIDs = projUIDs.concat(apps[i].getReleases());
        }

        const projects = await this._ctx.getEngineDB()
            .getCollectionOf(DexcaliburProject.TYPE.getType())
            .search(
                { filter:{ uid: { $in: projUIDs } }},
                { merlinRequest:false, raw:true });

        return projects.map(x => { x.setEngine(this._ctx);  return x; });
    }

    /**
     * To get project by app unit
     *
     * @param pAccount
     * @param pApp
     */
    async listProjectByAppUnit( pAccount:UserAccount, pApp:ApplicationUnit, pPage:Nullable<Page>=null):Promise<DexcaliburProject[]> {

       const projects = await (this._ctx.getEngineDB().getCollectionOf(DexcaliburProject.TYPE.getType()))
            .search({ filter: { uid: { $in: pApp.getReleases() } } }, {
                raw:true,
                page: pPage
            });

        return projects.map(x => { x.setEngine(this._ctx);  return x; });
    }

    /**
     * To create and push a new project order and return associated WF
     *
     * @param {UserAccount} pAccount User issueing order
     * @param pAppUnit
     * @param pOptions
     */
    async newProjectOrder(pAccount:UserAccount, pOrg:OrganizationUnit,
                          pAppUnit:ApplicationUnit, pOptions:NewProjectWorkflowOptions,
                          pExtraOwnerOpts:any = null):Promise<{ puid:DexcaliburProjectUUID, wf:WorkflowUUID}> {

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
            engine: this._ctx,
            os: pOptions.targetOS
        });
        proj.state = ProjectState.ORDERED;

        // save project in DB
        proj = await this._ctx.getEngineDB().createProject(proj);

        // search slave ready
        let node:Nullable<EngineNode> = await this._ctx.nodeManager.getReadySlave(
            proj.getUID(),
            NodePurpose.ANY,
            pOrg.getUID()
        );

        if(node!=null){
            node.setPurpose(NodePurpose.NEW_PRJ);
            await node.save(['purpose']);
        }

        Logger.info(`[Ready Slave] [newProjectOrder] [project=${proj.getUID()}] [org=${pOrg.getUID()}] [purpose=${NodePurpose.NEW_PRJ}]  : ${node!=null? node.getUID() : 'KO'}`);

        if(node==null){
            // search free node assigned to org
            node = await this._ctx.getNodeManager().getFreeSlave(NodePurpose.ANY, pOrg.getUID());
            Logger.info(`[Free Slave] [newProjectOrder] [org=${pOrg.getUID()}] [purpose=${NodePurpose.NEW_PRJ}]  : ${node!=null? node.getUID() : 'KO'}`);

            if(node!=null){
                node.setProject(proj.getUID());
                node.setPurpose(NodePurpose.NEW_PRJ);
                await node.save(['purpose','_projectUID']);
            }
        }

        if(node==null){
            // search free node not assigned to an org
            node = await this._ctx.getNodeManager().getFreeSlave(NodePurpose.ANY, null);
            Logger.info(`[Free Slave] [newProjectOrder] [no org] [purpose=${NodePurpose.NEW_PRJ}]  : ${node!=null? node.getUID() : 'KO'}`);

            if(node!=null){
                node.setProject(proj.getUID());
                node.setPurpose(NodePurpose.NEW_PRJ);
                await node.attachToOrg(pOrg.getUID(), false);
                await node.save(['purpose','_projectUID','_orgUUID']);
            }
        }

        // create workflow

        const wf = await this._ctx.getProjectManager().createWorkflow(
            pAccount.getUID(),
            (node!=null? node.getUID() : null),
            proj.getUID(),
            "exec",
            true
        );

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
            slaveUID: (node!=null? node.getUID() : null),
            settings: {
                projectUID: proj.getUID(),
                options: pOptions
            },
            wf: wf.getUID()
        });

        newPrjOrder.addOption('extra', {
            owner: pAccount.getUID(),
            ...pExtraOwnerOpts
        });

        newPrjOrder = (await this._ctx.getEngineDB().save(newPrjOrder) as ProjectOrder);

        // start a new node
        if(node == null){
            // check ressources quotas
            node = await this._ctx.nodeManager.createNode(proj.getUID(), NodePurpose.NEW_PRJ, pOrg.getUID()); //, pOrder.settings.targetOS)

            newPrjOrder.slaveUID = node.getUID();
            // update project order
            await this._ctx.getEngineDB().updateOrder(newPrjOrder, ['slaveUID']);

            // add scan to queue
            node.appendToQueue(newPrjOrder, OperationType.NEW_PROJ, pAccount,pExtraOwnerOpts);
            node.start("New project created");
        }else{

            await node.saveAll();

            // add scan to queue
            node.appendToQueue(newPrjOrder, OperationType.NEW_PROJ, pAccount,pExtraOwnerOpts);
        }

        return {
            puid: newPrjOrder.settings.projectUID,
            wf: newPrjOrder.getWorkflow()
        };
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
    async executeProjectOrder(pAccount:UserAccount, pOrder:ProjectOrder,pOnBefore:(vNode:EngineNode)=>void = null):Promise<DexcaliburProject>  {


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
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        // get current node
        const currNode = await this._ctx.getNodeManager().getNodeByUUID(this._ctx.getNodeUUID());
        Logger.info("NODE >>> ",this._ctx.getNodeUUID());

        currNode.setState(NodeState.BUSY);
        await currNode.save(["state"]);

        if(pOnBefore!=null){
            (pOnBefore)(currNode);
        }

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


            workflow = await this.getWorkflow(pOrder.getWorkflow())


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

            projectUID = pOrder.getUID();

            /*
            if(orderOpts.projectName == null){
                projectUID = orderOpts.projectName = pOrder.getUID();
            }else{
                projectUID = DexcaliburProject.sanitizeUID(orderOpts.projectName);
            }*/

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
                        let i=0;
                        do{
                            try{
                                projInputs.push(new ProjectInput({
                                    data:  orderOpts.inputTpls[i].uid, //uploadID, // await this._ctx.getWebserver().uploader.getPathOf(orderOpts.inputTpls[i].uploadID),
                                    location: ProjectInputLocation.DB_UPL,// ProjectInputLocation.LOCAL,
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


            const wf = await this.getWorkflow(pOrder.getWorkflow());

            // start to init the project
            project = await this._ctx.newProject(
                pOrder.settings.projectUID,
                projInputs,
                device,
                pAccount,
                platform,
                anal,
                app,
                wf//.getUID()
            );

            if(orderOpts.projectName!=null){
                project.meta.tag = orderOpts.projectName;
            }

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


            if(currNode.purpose===NodePurpose.NEW_PRJ){
                currNode.purpose = NodePurpose.ANY;
            }

            if(!success){
                throw DexcaliburProjectException.NEW_PROJECT_FAIL();
            }


            currNode.setState(NodeState.IDLE);

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
            const proj = await (this._ctx.getEngineDB()
                .getCollectionOf(DexcaliburProject.TYPE.getType()) as MongodbDbCollection)
                .asyncGetEntry({ uid: pProjectUID }) as DexcaliburProject;

            proj.setEngine(this._ctx)
            return proj;
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

        let nodes = await (this._ctx.getNodeManager().getNodeByProject(pProjectUID));

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
    async open( pUser:UserAccount, pProjectUID:DexcaliburProjectUUID,
                pPurpose:NodePurpose = NodePurpose.HOOK, pExtraOpts:any = {},
                pOnBefore:(vNode:EngineNode)=>void = null):Promise<EngineNode> {

        Logger.debug(`[mode=${this._ctx.getEngineMode()}][open] Opening a project... `);

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


            // attach callback on node init
            if(pOnBefore!=null){
                (pOnBefore)(remoteNode);
            }

            // prepare scan orders (queues) attached to this node
            let scanOrders:ScanOrder[] = (pExtraOpts!=null ? pExtraOpts.scanOrders : []);

            if(scanOrders==null || !Array.isArray(scanOrders)){
                scanOrders = [];
            }

            // create a project order with optionnaly attached scan order (in queue)
            let openOrder = new ProjectOrder({
                slaveUID: remoteNode.getUID(),
                settings: {
                    projectUID: pProjectUID
                },
                options: {
                    type: OperationType.OPEN_PROJ
                }
            });

            const openOpts = {
                owner: pUser.getUID()
            };

            if(pExtraOpts.cookie!=null){ openOpts['cookie'] = pExtraOpts.cookie; }
            if(pExtraOpts.headers!=null){ openOpts['headers'] = pExtraOpts.headers; }

            openOrder.addOption('extra',openOpts);

            // save order
            openOrder = await this.saveProjectOrder(openOrder);

            remoteNode.suspendQueue(true);

            // TODO : append operation to remote node
            // append project order to queue, project order should inject scan order into node waiting queue
            // later
            await remoteNode.appendToQueue(openOrder, OperationType.OPEN_PROJ, pUser);

            // if scan orders are passed in args
            if(scanOrders.length>0){
                for(let i=0;i<scanOrders.length; i++){
                    scanOrders[i].slaveUID=remoteNode.getUID();
                    scanOrders[i] = await (this._ctx.getScanScheduler().saveOrder(scanOrders[i]) as Promise<ScanOrder>);
                    await remoteNode.appendToQueue(scanOrders[i], OperationType.SCAN_ORDER, pUser);
                }
            }

            remoteNode.suspendQueue(false);
            remoteNode.resumeQueue();

            if(!remoteNode.isRunning()){
                await remoteNode.start("Opening project");
            }

            return remoteNode;
        }

        // else if current node is STANDALONE or SLAVE
        // then check if node has already loaded the project
        let project = this._ctx.getProject(pProjectUID);
        const currNode = await this._ctx.getNodeManager().getEngineNodeByUUID(this._ctx.getNodeUUID());

        console.log("PROJ OPEN currNode ",currNode.getUID(),project!=null, project!=null && project.isReady());

        // if project is loaded, return it
        if(project!=null && project.isReady()){
            return currNode;
        }

        if(pOnBefore!=null){
            (pOnBefore)(currNode);
        }


        // if project not loaded, open it locally
        project = await this._openLocally(pUser, pProjectUID, currNode);

        if(project!=null && project.appUnit!=null){
            try{
                const appu = await this._ctx.getOrgManager().getDirectApplication(
                    this._ctx.getInternalAcc(),
                    project.appUnit,
                )

                const icn = project.getIcon();
                if(icn !=null){
                    appu.setIcon( icn.format, icn.data);
                    await this._ctx.getEngineDB()
                        .getCollectionOf(ApplicationUnit.TYPE.getType())
                        .asyncUpdateEntry(appu, {replace:false, $set:['icon']}) as boolean;
                }
            }catch(ee){
                console.error(ee.stack);
            }

        }



        console.log("PROJ OPEN done, changing state ");

        // change Node purpose if it was "new_project"
        if(currNode.purpose===NodePurpose.NEW_PRJ){
            currNode.purpose = NodePurpose.ANY;
        }

        // change and save state, start to consume waiting queue locally
        if(!this._ctx.isStandaloneMode()){
            currNode.setState(NodeState.IDLE);
        }


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

        Logger.debug(`[proj=${pProjectUID}][openRemotely] Opening a project remotely ... `);

        const assignedNode = await this._ctx.getNodeManager().getReadySlave(pProjectUID,pPurpose);


        Logger.info(`[Ready Slave] [_openRemotely] [project=${pProjectUID}] [org=null] [purpose=${pPurpose}]  : ${assignedNode!=null? assignedNode.getUID() : 'KO'}`);

        // if a node is already assigned to project for specific purpose, and is ready (idle state), return it
        if(assignedNode!=null){
            Logger.debug(`[proj=${pProjectUID}][openRemotely] A slave is ready for this project, return it `);
            return assignedNode;
        }

        // search free slave
        let freeNode:Nullable<EngineNode> = null;


        // if there is no ready node (not assigned or not free) nodes => allocate a new one
        // TODO : if a node is already opening the project, return it

        // if project is assigned to an application unit, check organization quotas
        const prj = await this.getProject(pUser, pProjectUID);

        if(prj.getAppUnit()!=null){
            // check org unit quota
            const app = await this._ctx.getOrgManager()
                .getDirectApplication(pUser, prj.getAppUnit());
            const oid = app.getParentOrganization();

            // search a free slave authorized for this org
            freeNode = await this._ctx.getNodeManager().getFreeSlave(pPurpose, oid);
            Logger.info(`[Free Slave] [_openRemotely]  [org=${oid}] [purpose=${pPurpose}]  : ${freeNode!=null? freeNode.getUID() : 'KO'}`);

            if(freeNode != null){
                freeNode.attachToOrg(oid);
                freeNode.setProject(pProjectUID);
                await freeNode.saveAll();
                Logger.debug(`[proj=${pProjectUID}][org=${oid}][openRemotely] A free slave has been assigned to proj+org, return it `);
                return freeNode;
            }else if( await this._ctx.getNodeManager().canCreateNode(oid)){
                Logger.debug(`[proj=${pProjectUID}][org=${oid}][openRemotely] No free slave ready for proj+org, create a new slave node `);
                return await this._ctx.getNodeManager().createNode(pProjectUID, pPurpose, oid);
            }else{
                throw ProjectManagerException.NO_MORE_RESOURCES(pProjectUID);
            }
        }


        freeNode = await this._ctx.getNodeManager().getFreeSlave(pPurpose);
        Logger.info(`[Free Slave] [_openRemotely]  [no org] [purpose=${pPurpose}]  : ${freeNode!=null? freeNode.getUID() : 'KO'}`);
        const orgUUID = prj.getOrgUID();

        if(freeNode!=null){
            if(orgUUID!=null) freeNode.attachToOrg(orgUUID,false);
            freeNode.setProject(pProjectUID);
            await freeNode.saveAll();

            Logger.debug(`[proj=${pProjectUID}][openRemotely] A free slave has been assigned to proj, return it `);
            return freeNode;
        }else{
            Logger.debug(`[proj=${pProjectUID}][openRemotely] No free slave ready for proj, create a new slave node `);
            // if the project is not attached to aan app unit, then there is no quota
            return await this._ctx.getNodeManager().createNode(pProjectUID,pPurpose, orgUUID);
        }


    }

    /**
     *
     * @param pUser
     * @param pUID
     */
    async preloadForDirect(pUser:UserAccount, pUID:DexcaliburProjectUUID):Promise<DexcaliburProject> {

        //console.log(this._preload, this._waitingPreload, pUID);
        if(this._preload[pUID]!=null){
            return this._preload[pUID];
        }else if(this._waitingPreload[pUID]==null){

            this._waitingPreload[pUID] = true;
            
            const wf:Workflow = await this._ctx.newWorkflow(
                pUser,
                pUID,
                this._ctx.getNodeUUID(),
                true,
                "preload"
            );

            const prj =  await DexcaliburProject.load(this._ctx, pUID, pUser, null,wf);
            this._preload[pUID] = prj;
            return prj;
        }else {
            throw new Error("Project preload not ready");
        }
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
     async _openLocally( pUserAccount:UserAccount, pUID:DexcaliburProjectUUID,
                                 pNode:Nullable<EngineNode>=null):Promise<DexcaliburProject>{
        let project:DexcaliburProject = null, success:any = false;
        let currNode:EngineNode;

        // retrieve workflow associated to project + node
        // TODO : retrieve WF from EngineNode (stateless) instead of DexcaliburEngine (stateful)
        // try to retrieve workflow of create new one
        let wf:Nullable<Workflow> = await this.retrieveWorkflow(pUID, pNode);

        if(wf==null){
            // create a new workflow for this opening
            wf = (await this._ctx.newWorkflow(
                pUserAccount,
                pUID,
                (pNode!=null ? pNode.getUID() : null),
                true,
                'de'));

        }

        //const currNode = this._ctx.getNodeManager().getNodeByUUID(this._ctx.getNodeUUID());
        if(this._ctx.getEngineMode()==DexcaliburEngineMode.SLAVE){
            currNode = pNode;

            if(currNode==null){
                throw EngineNodeException.MISSING_NODE(this._ctx.getNodeUUID(),"_openLocally");
            }

            currNode.setState(NodeState.BUSY);
            await currNode.save(['state','idleSince']);
        }



        Logger.info("ENGINE : openProject : workflow : "+(wf!=null? wf.getUID() : '<null>'));

        try{
            wf.pushStatus(new StatusMessage(5, "Scanning connected devices"));
            await DeviceManager.getInstance().scan();


            Logger.success("[ENGINE] [OPEN PROJECT] Device manager refreshed");

            wf.pushStatus(new StatusMessage(7, "Loading project data"));

            project = await DexcaliburProject.load(this._ctx, pUID, pUserAccount, null, wf);

            Logger.success("[ENGINE] [OPEN PROJECT] Project loaded");


            // [K8S] detect missing input in local workspace, and import
            await project.reattachWorkspace();

            // enable auto-update of project in DB when some specifics events
            // of the project happen
            await this._ctx.getEngineDB().attachProject(project);

            // update or create
            project.state = ProjectState.OPEN_START;

            // project = await this.getEngineDB().save(project) as DexcaliburProject;
            DexcaliburEngine.printBanner();

            Logger.debug("[ENGINE] Before project open :");

            wf.stepUp(0.1);

            Logger.info("[ENGINE] [OPEN PROJECT] Project attached to global DB");
            success = await project.open();

            Logger.info("[ENGINE] [OPEN PROJECT] Project opened");

            wf.pushStatus(StatusMessage.newSuccess("Project is ready."));
            this._ctx.active[pUID] = project;
            this._ctx.updater.run( DXC_LIFECYCLE_EVENT.OPEN_PROJECT, project);

            project.state = ProjectState.OPEN;
            this._ctx.log("Project loaded", project);
            Logger.info("[ENGINE] [OPEN PROJECT] Project loaded, state of node changed ");

            if(currNode!=null) {
                currNode.setState(NodeState.IDLE);
                await currNode.save(['state','idleSince']);
            }

            // update db
            //this.getEngineDB().saveProject(project);

            //this.webserver.setProject(project);
        }catch(err){
            Logger.error("ENGINE"," openProject() failed : "+err.message+"\n"+err.stack);
            this._ctx.log("Project cannot be opened. See error message.", project, err.code);
            wf.pushStatus(StatusMessage.newError("Project cannot be loaded. See logs for more details : "+err.message));
            project = null;

            // stop
            /*if(this._ctx.isSlaveNode()){
                await this._ctx.exit();
            }*/

            throw err;
        }

        return project;
    }

    private async _createTempLocalInput(pInput:ProjectInput):Promise<ProjectInput> {
         const path = this._ctx.getWorkspace().createTempFile( "tmp_extr");

         if(pInput.location==ProjectInputLocation.DB_UPL){
             await this._ctx.getEngineDB().getFileManager().readFileTo('uploads', pInput.data as string, path);
         }else{
             throw new Error("Canot create tmp project iunput")
         } /*if(pInput.location==ProjectInputLocation.LOCAL){
             _fs_.copyFileSync(
                 pInput.data as string,
                 path
             )
         }*/


         return new ProjectInput({
             data: path,
             location: ProjectInputLocation.LOCAL,
             type: ProjectInputType.REGULAR_FILE,
             extractOpts: {type:'bin'},
             purpose: pInput.purpose
         });
    }

    private async _extractPlatformFromBin(
                pInput: ProjectInput, pTargetOS: OperatingSystem,
                pWorkflow: Workflow):Promise<Platform> {

         let platform:Platform;
         let anal:IPackageAnalyzer;
         let minplt:Nullable<Platform> = null;
         let tmpInput = pInput;
         if(pInput.location==ProjectInputLocation.DB_UPL){
             // create temp input
             tmpInput = await this._createTempLocalInput(pInput);
             console.log('modificed',tmpInput);
         }else{
             console.log('not temp', tmpInput);

         }


        let plts = DexcaliburEngine.getInstance()
            .getPlatformManager()
            .enumerateLocal();



        switch (pTargetOS){
             case OperatingSystem.ANDROID:
                 anal = new AndroidPackageAnalyzer({ msa_auto: false, ssa_auto:false });


                 // add input to analyzer
                 await anal.attachInput(tmpInput);

                 let min:any = await anal.getMinPlatform();
                 minplt = DexcaliburEngine.getInstance()
                     .getPlatformManager().findByOsVersion(OperatingSystem.ANDROID, min);
//                     .getFromAndroidApiVersion(min);

                 if(minplt!=null){
                    return minplt;
                 }

                 let target:any = await anal.getTargetPlatform();
                 let targetplt = DexcaliburEngine.getInstance()
                     .getPlatformManager().findByOsVersion(OperatingSystem.ANDROID, target);
                     //.getFromAndroidApiVersion(target);

                 if(targetplt!=null){
                     return targetplt;
                 }

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

                 break
             case OperatingSystem.IOS:
                 anal = new IosPackageAnalyzer();

                 // add input to analyzer
                 await anal.attachInput(tmpInput);

                 minplt = DexcaliburEngine.getInstance()
                     .getPlatformManager()
                     .findByOsVersion( OperatingSystem.IOS, await anal.getMinPlatform());

                 if(minplt!=null){
                     return minplt
                 }

                 break;
         }

        return undefined;
    }


    /**
     *
     * @param pUser
     * @param pProject
     */
    getLocalActiveProject(pUser:UserAccount, pProject:DexcaliburProjectUUID):DexcaliburProject {
         // check  acl
        const local = this._ctx.getProject(pProject);
        if(local==null){
            throw DexcaliburProjectException.PROJECT_NOT_READY(pProject);
        }
        return local;
    }

    /**
     * To save (create or uopdat) a project order
     *
     * @param {ProjectOrder} pOrder
     * @param {string[]} pUpdated Updated fields
     * @method
     * @async
     * @since 1.8.0
     */
    async saveProjectOrder(pOrder:ProjectOrder, pUpdated:string[] = []):Promise<ProjectOrder>{
        let exists = true;
        if(pOrder.getUID()==null){
            pOrder.uuid = await this._ctx.getEngineDB()
                .generateFreeUuid(ProjectOrder.TYPE.getType());

            exists = false;
        }

        let order = pOrder;
        if(exists){
            await this._ctx.getEngineDB().updateOrder(pOrder,pUpdated);
        }else{
            order = await (this._ctx.getEngineDB().save(pOrder) as Promise<ProjectOrder>);
        }

        return order;
    }


    async deleteProject( pAccount:UserAccount, pProjectUUID:DexcaliburProjectUUID){
        // check role only
        AccessControl.isAuthorized(
            AccessControl.access.PROJ_DELETE_ANY,
            pAccount
        );

        // retrieve project and check user
        const prj = await this.getProject(pAccount, pProjectUUID);

        return await this._ctx.getEngineDB().deleteProjectByUID(pProjectUUID);

    }

    async createWorkflow(pUser:UserAccountUUID,
                            pNode:EngineNodeUUID,
                            pProjectUUID:DexcaliburProjectUUID,
                         pPurpose:string, pStart = false ):Promise<Workflow> {

       let wf = new Workflow({
            _uid: await this._ctx.getEngineDB().generateFreeUuid(
               Workflow.TYPE.getType(),
               '_uid'
            ),
            node: pNode,
            project: pProjectUUID,
            purpose: pPurpose
        });


       if(pStart){
           wf.start();
       }

       if(pUser!=null){
           wf.changeOwner(pUser);
       }

       wf = await this._ctx.getEngineDB().save(wf) as Workflow;

       return wf;

    }

    /**
     * To retrieve a workflow from current instance
     * or from DB.
     *
     * If retrieved from DB, rehydrate it
     *
     * @param pUID
     * @param pNode
     * @private
     */
    private async retrieveWorkflow(pUID: DexcaliburProjectUUID, pNode: Nullable<EngineNode>) {

        let wf:Nullable<Workflow> = null;
        try{
            // search exising workflow in instance
            wf = this._ctx.getWorkflow( pUID);

            if(wf==null){
                const wfs = await this._ctx.getEngineDB().search({
                    project: pUID,
                    node: pNode
                },NodeInternalType.WORKFLOW);

                if(wfs!=null && wfs.length>0){
                    wf = wfs[0];
                    this._ctx.registerWorkflow(wf);
                }else{
                    return null;
                }
            }

        }catch(e){
            console.log("CANNOT RETRIEVE WF > ",e);
            return null;
        }finally {
            return wf;
        }
    }

    /**
     * To retrieve a workflow from current instance
     * or from DB.
     *
     * If retrieved from DB, rehydrate it
     *
     * @param pUID
     * @param pNode
     * @private
     */
    private async getWorkflow(pUID: WorkflowUUID):Promise<Workflow> {

        let wf:Nullable<Workflow> = null;
        try{
            // search exising workflow in instance
            wf = this._ctx.getWorkflow( pUID);

            if(wf==null){
                const wf = await this._ctx.getEngineDB().getWorkflow(pUID);
                if(wf){
                    this._ctx.registerWorkflow(wf);
                    return wf;
                }else{
                    return null;
                }
            }

            return wf;
        }catch(e){
            console.log("CANNOT RETRIEVE WF > ",e);
            return null;
        }
    }
}