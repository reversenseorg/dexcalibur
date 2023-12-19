import {Nullable} from "../../core/IStringIndex.js";
import {ScanState} from "../../core/EngineNode.js";
import {ACTION_DATE, ActionDates} from "../../common/ActionDates.js";
import {
    DbDataType,
    DbKeyType,
    INode, IStringIndex,
    NodeProperty,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "../../NodeInternalType.js";
import {randomUUID} from "crypto";
import {ModelVariable} from "../../ModelVariable.js";
import {ModelNativeRef} from "../../ModelNativeRef.js";
import {AbstractHook} from "../../hook/AbstractHook.js";
import {CoreDebug} from "../../core/CoreDebug.js";

export interface ScanOrderSettings {
    modelUID?: string;
    targetDevice?: string;
    targetOS?: string;
    projectUID?: string;
    fileUploadID?:string;
}




export interface ScanOrderOptions {
    _id?:string;
    uuid?:string;
    slaveUID?:Nullable<string>;
    webhook?:Nullable<string>;
    settings?:ScanOrderSettings;
    signatures?:Nullable<string>;
    appPath?:Nullable<string>;
    options?:any;
    state?:Nullable<ScanState>;
    tags?:number[];
    dates?: ActionDates;
    stateDates?: IStringIndex<number>;
    report?:any;
}

/**
 * Represent an order to scan a project with a specified
 * configuration.
 *
 * 1/ The cost of ScanOrder is estimated and validated by LicenseManager,
 * the LicenseManager should sign it.
 *
 * 2/ Signed scan are push into global scan queue of the master server.

 * 3/ If there is not slave node engine already up for the target project,
 * the scan scheduler generate an unique webhook and spawn the salve node
 * with scan order, target project, and webhook URL as parameters.
 *
 * 4/ The master receive scan report. The scan report includes :
 *  -  findings
 *  -  assurance model
 *  -  metrics
 *  -  slave node UID
 *  -  signature from slave node
 *
 *
 * @class
 */
export class ScanOrder implements INode {

    static TYPE:NodeType = new NodeType(
        "scans",
        NodeInternalType.ANAL_STATE,
        [
            (new NodeProperty("_id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("slaveUID")).type(DbDataType.STRING),
            (new NodeProperty("webhook")).type(DbDataType.STRING),
            (new NodeProperty("settings")).type(DbDataType.STRING),
            (new NodeProperty("signatures")).type(DbDataType.STRING),
            (new NodeProperty("appPath")).type(DbDataType.STRING),
            (new NodeProperty("options")).type(DbDataType.STRING).def({}),
            (new NodeProperty("dates")).type(DbDataType.STRING).def({ }),
            (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
            (new NodeProperty("state")).type(DbDataType.STRING).def(ScanState.NONE),
            (new NodeProperty("stateDates")).type(DbDataType.STRING).def({ }),
            (new NodeProperty("report")).type(DbDataType.STRING).def(null),
        ]);

    __:NodeInternalType = NodeInternalType.SCAN_ORDER;

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
    uuid:string = null;

    /**
     * UUID of the instance of DexcaliburEngine running the scan
     * @type {Nullable<string>}
     * @field
     */
    slaveUID:Nullable<string> = null;

    webhook:Nullable<string> = null;

    settings:ScanOrderSettings;

    signatures:Nullable<string> = null;

    appPath:Nullable<string>;

    options:any = {};

    private state:ScanState = ScanState.NONE;

    /**
     * To store dates state switch
     * @field
     */
    stateDates:IStringIndex<number> = {};

    report:Nullable<any> = null;

    tags:TagUUID[] = [];

    dates: ActionDates = {
        start: -1,
        stop: -1
    };


    constructor(pOptions:Nullable<ScanOrderOptions> = null) {
        if(pOptions!=null){
            for(let i in pOptions) this[i] = pOptions[i];
        }

        if(this.uuid==null){
            this.uuid = randomUUID();
        }
        if(this.dates[ACTION_DATE.START]==-1){
            this.setDate( ACTION_DATE.ORDER);
        }
    }

    static fromScanOptions(pSettings:ScanOrderSettings):ScanOrder {
        const order = new ScanOrder();
        order.settings = pSettings;

        return order;
    }

    setDate( pType:ACTION_DATE, pDate:Nullable<number> = null){
        this.dates[pType] = (pDate===null ? (new Date()).getTime() : pDate);
    }



    getUID(): string {
        return this._id;
    }

    getUUID():string {
        return this.uuid;
    }

    setSlaveNode(pUID:string):void {
        this.slaveUID = pUID;
    }

    hasSlaveNode():boolean {
        return (this.slaveUID!=null);
    }

    getProjectUID():string {
        return this.settings.projectUID;
    }

    /**
     * To set the path to the file to analyze
     *
     * @param {string} pPath
     */
    setTargetFile(pPath:string){
        this.appPath = pPath;
    }

    getTargetFile():Nullable<string> {
        return this.appPath;
    }

    getModelUID():string {
        return this.settings.modelUID;
    }

    getState():ScanState {
        return this.state;
    }

    /**
     * To change the state of the scan order
     *
     * When state changes, the date of change is saved in `this.stateDates`
     *
     * @param {ScanState} pState State of the order
     * @method
     */
    setState(pState:ScanState):void {
        this.state = pState;
        this.stateDates[pState] = (new Date()).getTime();
    }

    toJsonObject(pOptions?:SerializeOptions):any {
        const obj:any = {};
        const fields = (pOptions!=null ? pOptions.include : null);
        const exclude = (pOptions!=null && Array.isArray(pOptions.exclude))? pOptions.exclude : [];

        if(fields != null && fields.length>0){
            for(let i:number=0; i<fields.length; i++){
                if(this[fields[i]] != null && this[fields[i]].toJsonObject != null){
                    obj[fields[i]] = this[fields[i]].toJsonObject();
                }else{
                    obj[fields[i]] = this[fields[i]];
                }
            }
        }else{
            for(let i in this){

                if(exclude.indexOf(i)>-1) continue;

                switch(i){
                    default:
                        obj[i] = this[i]
                        break;
                }
            }

        }
        CoreDebug.checkJsonSerialize(obj, "ScanOrder");
        return obj;
    }
}
ScanOrder.TYPE.builder(ScanOrder);