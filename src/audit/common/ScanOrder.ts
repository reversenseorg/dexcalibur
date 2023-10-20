import {Nullable} from "../../core/IStringIndex.js";

export interface ScanOrderOptions {
    modelUID: string;
    targetDevice?: string;
    targetOS?: string;
    projectUID: string;
    fileUploadID?:string;
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
export class ScanOrder {

    slaveUID:Nullable<string> = null;

    callbackUri:Nullable<string> = null;

    settings:ScanOrderOptions;

    signatures:Nullable<string> = null;

    appPath:Nullable<string>;

    options:any = {};

    constructor(pSettings:ScanOrderOptions) {
        this.settings = pSettings;
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

    toJsonObject():any {
        return {
            settings: {
                modelUID: this.settings.modelUID,
                targetDevice: this.settings.targetDevice,
                targetOS: this.settings.targetOS,
                projectUID: this.settings.projectUID,
            },
            callbackUri: this.callbackUri,
            signatures: this.signatures,
            slaveUID: this.slaveUID
        }
    }
}