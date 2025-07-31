import {NewProjectWorkflowOptions} from "./ProjectManager.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {ACTION_DATE, ActionDates} from "../common/ActionDates.js";
import {Workflow} from "../Workflow.js";
import {ProjectState} from "../ProjectState.js";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty, NodePropertyState,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {ApplicationUnitUUID} from "../organization/ApplicationUnit.js";
import {OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {EngineNodeUUID} from "../core/EngineNode.js";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {CustomCode} from "../actionnable/CustomCode.js";
import {EventListenersCode} from "../InspectorFactory.js";
import {DeviceUUID} from "../Device.js";
import {ProjectInput} from "../analyzer/ProjectInput.js";


export interface ProjectOrderSettings {
    projectUID?: string;
    options?:NewProjectWorkflowOptions
}





export interface ProjectOrderOptions {
    _id?:string;
    uuid?:ProjectOrderUUID;
    slaveUID?:Nullable<EngineNodeUUID>;
    webhook?:Nullable<string>;
    settings?:ProjectOrderSettings;

    appUnit?:Nullable<ApplicationUnitUUID>;
    orgUnit?:Nullable<OrganizationUnitUUID>;
    owner?:Nullable<UserAccountUUID>;

    signatures?:Nullable<string>;

    options?:any;
    state?:Nullable<ProjectState>;
    tags?:number[];
    dates?: ActionDates;
    stateDates?: Record<string,number>;
    wf?:Workflow;

    inputs?:ProjectInput[];
}

export type ProjectOrderUUID = string;

/**
 * Represent an order to load/analyse a package (create a new project) with a specified
 * configuration.
 *
 * 1/ The cost of ProjectOrder is validated by extracting the Package Identifier and
 * checking if :
 * - current organization has a subscription plan and
 *      - An application unit already exists with this package identifier
 *      - The subscription allow the organization to create new application
 * - current organization has a scan plan and
 *      - enough credit to scan a new package
 *
 * The LicenseManager validates such request, sign it and emit AuthorizationToken
 *
 * 2/ ProjectOrder are pushed into global scan queue of the master server (queue is backed up)

 * 3/ If there is not slave node engine already up for the target project,
 * the project scheduler generate an unique webhook and spawn the slave node
 * with project order and webhook URL as parameters.
 *
 * 4/ The master receive WorkflowUUID to follow ProjectState
 *
 *
 * @class
 */
export class ProjectOrder implements INode {

    static TYPE:NodeType = new NodeType(
        "project_order",
        NodeInternalType.PROJECT_ORDER,
        [
            (new NodeProperty("_id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("slaveUID")).type(DbDataType.STRING),
            (new NodeProperty("webhook")).type(DbDataType.STRING),
            (new NodeProperty("settings")).type(DbDataType.STRING),

            (new NodeProperty("orgUnit")).type(DbDataType.STRING),
            (new NodeProperty("appUnit")).type(DbDataType.STRING),
            (new NodeProperty("owner")).type(DbDataType.STRING),

            (new NodeProperty("signatures")).type(DbDataType.STRING),

            (new NodeProperty("options")).type(DbDataType.STRING).def({}),
            (new NodeProperty("dates")).type(DbDataType.STRING).def({ }),
            (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
            (new NodeProperty("state")).type(DbDataType.STRING).def(ProjectState.NONE),
            (new NodeProperty("stateDates")).type(DbDataType.STRING).def({ }),
            (new NodeProperty("wf"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{
                    if(x.p!=null){
                        return (x.p as Workflow).toJsonObject(SecurityZone.PRIVATE);
                    }else{
                        return null;
                    }
                })
                .wakeUp( (x:NodePropertyState)=>{
                    if(x.p!=null){
                        const wf =  new Workflow(x.p);
                        wf.setParent(x.self);
                        return wf;
                    }else{
                        return null;
                    }
                })
                .def(null),
            (new NodeProperty("inputs"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{
                    if(x.p!=null){
                        const o:any[] = [];
                        (x.p as ProjectInput[]).map(x => {
                            o.push(x.toJsonObject());
                        });
                        return o;
                    }else{
                        return [];
                    }
                })
                .wakeUp( (x:NodePropertyState)=>{
                    if(x.p!=null){
                        const o:ProjectInput[] = [];
                        x.p.map(x => {
                            o.push(new ProjectInput(x));
                        });
                        return o;
                    }else{
                        return [];
                    }
                })
                .def([])
        ]);

    __:NodeInternalType = NodeInternalType.PROJECT_ORDER;

    /**
     * Internal MongoDB UID
     * ! important
     * @field
     */
    _id:string = null;

    /**
     * Scan order UUID (per Infra Node)
     * @field
     */
    uuid:ProjectOrderUUID = null;

    /**
     * UUID of the instance of DexcaliburEngine running the scan
     * @type {Nullable<string>}
     * @field
     */
    slaveUID:Nullable<EngineNodeUUID> = null;

    webhook:Nullable<string> = null;

    settings:ProjectOrderSettings;

    signatures:Nullable<string> = null;


    options:any = {};

    private state:ProjectState = ProjectState.NONE;


    appUnit?:Nullable<ApplicationUnitUUID>;

    orgUnit?:Nullable<OrganizationUnitUUID>;

    owner:Nullable<UserAccountUUID> = null;

    /**
     * To store dates state switch
     * @field
     */
    stateDates:Record<string,number> = {};

    wf:Nullable<Workflow> = null;

    tags:TagUUID[] = [];

    dates: ActionDates = {
        start: -1,
        stop: -1
    };

    inputs:ProjectInput[] = [];

    constructor(pOptions:ProjectOrderOptions) {
        if(pOptions!=null){
            for(let i in pOptions) this[i] = pOptions[i];
        }

        if(this.dates[ACTION_DATE.START]==-1){
            this.setDate( ACTION_DATE.ORDER);
        }

    }

    setDate( pType:ACTION_DATE, pDate:Nullable<number> = null){
        this.dates[pType] = (pDate===null ? (new Date()).getTime() : pDate);
    }

    setSlave(pEngineNode:EngineNodeUUID){
        this.slaveUID = pEngineNode;
    }


    getUID(): string {
        return this.uuid;
    }

    getUUID():ProjectOrderUUID {
        return this.uuid;
    }

    setSlaveNode(pUID:string):void {
        this.slaveUID = pUID;
    }

    hasSlaveNode():boolean {
        return (this.slaveUID!=null);
    }

    getProjectUID():DexcaliburProjectUUID {
        return this.settings.projectUID;
    }

    getProjectOptions():NewProjectWorkflowOptions {
        return this.settings.options;
    }

    /**
     * To add an extra options to the project order
     *
     * @param {string} pKey
     * @param {any} pValue
     * @since 1.8.0
     */
    addOption(pKey:string, pValue:any):void {
        this.options[pKey] = pValue;
    }

    /**
     * To retrieve an extra options froml the project order
     * @param {string} pKey
     * @since 1.8.0
     */
    getOption(pKey:string):any {
        return this.options[pKey];
    }

    getState():ProjectState {
        return this.state;
    }

    getWorflow():Workflow {
        return this.wf;
    }

    getDeviceUID():Nullable<DeviceUUID> {
        return this.settings.options.deviceUID;
    }

    setWebHook(pURI:string):void {
        this.webhook = pURI;
    }

    /**
     * To change the state of the project order
     *
     * When state changes, the date of change is saved in `this.stateDates`
     *
     * @param {ScanState} pState State of the order
     * @method
     */
    setState(pState:ProjectState):void {
        this.state = pState;
        this.stateDates[pState] = (new Date()).getTime();
    }

    setInputs(pInputs:ProjectInput[]):void {
        this.inputs = pInputs;
    }

    getInputs():ProjectInput[] {
        return this.inputs;
    }

    getOrganizationUnit():OrganizationUnitUUID {
        return this.orgUnit;
    }

    getApplicationUnit():ApplicationUnitUUID {
        return this.appUnit;
    }

    toJsonObject(pOptions?:SerializeOptions, pZone = SecurityZone.PUBLIC):any {

        const obj = {
            uuid: this.getUID(),
            slaveUID: this.slaveUID,
            webhook: this.webhook,
            settings: this.settings,

            appUnit: this.appUnit,
            orgUnit: this.orgUnit,
            owner: this.owner,
            signatures: this.signatures,
            options: {},
            state: this.state,
            tags: this.tags,
            dates: this.dates,
            stateDates: this.stateDates,
            wf: (this.wf!=null? this.wf.toJsonObject(pZone):null),
            inputs:[]
        }

        this.inputs.map(vIn => {
            obj.inputs.push(vIn.toJsonObject());
        });

        for(let o in this.options){
            if(o!='extra'){ // skip extra
                obj.options[o]=this.options[o];
            }
        }

        CoreDebug.checkJsonSerialize(obj, "ProjectOrder");
        return obj;
    }
}
ProjectOrder.TYPE.builder(ProjectOrder);