import * as _fs_ from "fs";
import * as _path_ from "path";


import {Indicator} from "../common/Indicator.js";
import {DashBoard} from "../common/DashBoard.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {BusSubscriber} from "../../Bus.js";
import {ProjectState} from "../../ProjectState.js";
import Util from "../../Utils.js";
import {NetworkSignature} from "./NetworkSignature.js";
import {CodeSignature} from "./CodeSignature.js";
import ModelString from "../../ModelString.js";
import {TrackerInfo} from "./TrackerInfo.js";
import {PrivacyReport} from "./PrivacyReport.js";
import ModelClass from "../../ModelClass.js";
import {PrivacyFinding, PrivacyFindingType} from "./PrivacyFinding.js";
import {Product, ProductOptions} from "../../credit/Product.js";
import {PiiClass} from "./pii/PiiClass.js";
import {PII_Data} from "./assets/pii_schema.js";
import { PrivacyModel } from "./PrivacyModel.js";
import {AssuranceScanner, AssuranceScannerOptions} from "../common/AssuranceScanner.js";
import AssuranceReport from "../common/AssuranceReport.js";
import {AuditManager} from "../AuditManager.js";


export interface PrivacyScanOptions {
    trackersLib:boolean,
    trackersNet:boolean,
    perm:boolean,
    piiTypes:boolean,
    piiFlows:boolean,
    save?:boolean
}

interface TrackerSignature<T> {
    sig: T,
    tracker: TrackerInfo
}

export interface PrivacySignatures {
    code:TrackerSignature<CodeSignature>[],
    domains:TrackerSignature<NetworkSignature>[],
    perm?:any,
    piiTypes?:any,
    piiFlows?:any,
}

export interface PrivacyScannerOpts {
    project:DexcaliburProject;
}

/**
 * Main API to perform privacy scan
 * @deprecated
 * @class
 */
export class PrivacyScanner extends AssuranceScanner {

    private _mainDB = 'global';

    model:PrivacyModel;

    schema:{ [piiCls:string] :PiiClass} = PII_Data;

    project:DexcaliburProject;

    signatures:PrivacySignatures;

    trackers:TrackerInfo[] = [];

    findings:any = {};

    categories:any = {};

    /**
     * All existing dashboards
     * @type {{[name:string] :DashBoard}} A map of dashboard
     * @field
     */
    dashboards:{[name:string] :DashBoard} = {};


    lastScan:number = -1;

    /**
     * List of privacy scan report
     * @type {PrivacyReport[]}
     * @field
     */
    reports:any[] = [];

    lastReport:PrivacyReport = null;

    constructor(pConfig:PrivacyScannerOpts) {
        super({
            name: "scanner.privacy",
            __pCode:'PRI_CLD_SSCAN',
            __pVersion: '1.0',
            __pSerial: pConfig.project.getLicenseNo(),
            __pKey: pConfig.project.getLicenseKey()
        });

        for(const i in pConfig){
            this[i] = pConfig[i];
        }

        this.signatures = {
            code: [],
            domains: []
        };

        this._loadModel();
    }

    /**
     * To load signatures from DB
     *
     * @private
     */
    private _loadModel():void {

        // import trackers list
        const rawData = JSON.parse(
            _fs_.readFileSync(
                _path_.join(
                    Util.__dirname(import.meta.url),
                    '..',
                    '..',
                    '..',
                   'assets',
                   'exodus.dump.json'
                ), {encoding:'utf8'}
            ).toString()
        );


        rawData.trackers.map((vRaw)=>{
            // import
            const sig = TrackerInfo.importFromExodus(vRaw);

            if(sig.networkSignature.length>0){
                sig.networkSignature.map((x)=>{
                    this.signatures.domains.push({
                        sig: x,
                        tracker: sig
                    })
                });
            }

            if(sig.codeSignature.length>0){
                sig.codeSignature.map((x)=>{
                    this.signatures.code.push({
                        sig: x,
                        tracker: sig
                    })
                });
            }
        });

        this.model = new PrivacyModel();
        this.model.load();
    }

    /**
     * To create the initial main dahboard
     *
     * @private
     */
    private _createMainDashboard(pOpts:PrivacyScanOptions):void {
        this.dashboards[this._mainDB] = new DashBoard({
            name: this._mainDB,
            indicators: {
                trackersLib: new Indicator({
                    name: "Trackers Libraries",
                    events: [],
                    enable: pOpts.trackersLib
                }),
                trackersDomain: new Indicator({
                    name: "Trackers Domains",
                    events: [],
                    enable: pOpts.trackersNet
                }),
                permissions: new Indicator({
                    name: "Permissions Usages",
                    events: [],
                    enable: pOpts.perm
                }),
                piiType: new Indicator({
                    name: "Personal Information Types",
                    events: [],
                    enable: pOpts.piiTypes
                }),
                piiFlow: new Indicator({
                    name: "Personal Information Flows",
                    events: [],
                    enable: pOpts.piiFlows
                }),
            }
        })
    }


    /**
     *
     * @param pContext
     * @param pOptions
     * @private
     */
    private _registerOnBusEvents(pContext:DexcaliburProject,  pOptions:PrivacyScanOptions):void {

        const mainBus = pContext.getBus();

        if(pOptions.trackersNet){
            mainBus.subscribe("data.uri.index", BusSubscriber.from((vEvent)=>{
                let sig:TrackerSignature<NetworkSignature>;
                let detect = false;
                for(let i=0; i<this.signatures.domains.length; i++){
                    sig = this.signatures.domains[i];
                    if(vEvent.getData().match(sig)){
                        // add to detection
                        detect = true;
                        break;
                    }
                }
            }));
        }
    }

    /**
     * To perform full scan
     *
     * @private
     */
    private _firstScan(pContext:DexcaliburProject, pOptions:PrivacyScanOptions):void{
        // 0. Create dashboard
        this._createMainDashboard(pOptions);

        // 1. configure main Bus
        this._registerOnBusEvents(pContext, pOptions);

        // TODO : prepare test plan by gathering, categorizing and prioritizing tests

        // 2. perform basis static scan
        this.lastReport = new PrivacyReport({ });

        if(pContext.getState()!=ProjectState.READY){
            // analysis
            pContext.fullscan();
        }

        this._staticScan(pContext, this.lastReport, pOptions);

        // 3. generate instruction

        // 4. run app (several time)

        // 5. taint analysis

        // 6. result
        this.reports.push(this.lastReport);

        // 7. Save
        //AuditManager.getInstance().saveReport(pContext, this.lastReport);


    }

    /**
     * To scan existing data
     *
     * @private
     */
    private _staticScan(pContext:DexcaliburProject, pReport:PrivacyReport, pOptions:PrivacyScanOptions) {

        const searchAPI = pContext.getSearchEngine();
        const tagMgr = pContext.getTagManager();

        // search URI
        if(pOptions.trackersLib){
            console.log("Scanning tracker libs ...")
            this.signatures.code.map((vSign)=>{

                //console.log("[PRIVACY][TRACKER] ",vSign.tracker," ("+vSign.sig.pattern+")");
                // search class where FQCN match tracker pattern
                searchAPI
                    .class("name:"+Util.escapeRE(vSign.sig.pattern))
                    .foreach((vIndex, vMatchingNode)=>{
                        console.log(vMatchingNode.name);
                        //console.log("[PRIVACY][TRACKER+CODE] "+vSign.tracker.name+" ("+vSign.sig.pattern+") found in : "+vMatchingNode.name);
                        pReport.addThreat(
                            new PrivacyFinding<TrackerInfo>({
                                type: PrivacyFindingType.TRACKER,
                                trust: 10,
                                signature: vSign.sig,
                                source: vSign.tracker,
                                node: (vMatchingNode as ModelClass)
                            })
                        );
                    });
            })
        }

        if(pOptions.trackersNet){
            const tag_URI = tagMgr.getTag("string.pattern.URI");

            this.signatures.domains.map((vSign)=>{

                //console.log("[PRIVACY][TRACKER+URI] "+vSign.tracker.name+" ("+vSign.sig.pattern+")");
                // search class where FQCN match tracker pattern
                searchAPI
                    .strings("value:"+Util.escapeRE(vSign.sig.pattern))
                    .foreach((vIndex, vMatchingNode)=>{
                        console.log("[PRIVACY][TRACKER+URI] "+vSign.tracker.name+" ("+vSign.sig.pattern+") found in : "+vMatchingNode.name);
                        pReport.addThreat(
                            new PrivacyFinding<TrackerInfo>({
                                type: PrivacyFindingType.TRACKER,
                                trust: 10,
                                source: vSign.tracker,
                                signature: vSign.sig,
                                node: (vMatchingNode as ModelClass)
                            })
                        );
                    });
            })

        }


        if(pOptions.perm){
            console.log("Scanning permissions  ...")
            this.signatures.perm.map((vSign)=>{

                //console.log("[PRIVACY][TRACKER] ",vSign.tracker," ("+vSign.sig.pattern+")");
                // search class where FQCN match tracker pattern
                searchAPI
                    .class("name:"+Util.escapeRE(vSign.sig.pattern))
                    .foreach((vIndex, vMatchingNode)=>{
                        console.log(vMatchingNode.name);
                        //console.log("[PRIVACY][TRACKER+CODE] "+vSign.tracker.name+" ("+vSign.sig.pattern+") found in : "+vMatchingNode.name);
                        pReport.addThreat(
                            new PrivacyFinding<TrackerInfo>({
                                type: PrivacyFindingType.TRACKER,
                                trust: 10,
                                signature: vSign.sig,
                                source: vSign.tracker,
                                node: (vMatchingNode as ModelClass)
                            })
                        );
                    });
            });
        }



    }

    /**
     * To Re-Scan
     *
     * It is quickier
     * - Perform delta-analysis
     * - Update previous results
     *
     * @private
     */
    private _reScan(pContext:DexcaliburProject, pOptions:PrivacyScanOptions):void{

    }
    /**
     * To start to scan
     *
     * @method
     */
    scan(pOptions:PrivacyScanOptions):void {

        //if(this.reports.length===0){
            // first scan
            return this._firstScan(this.project,pOptions);
        //}

        //return this._reScan(pContext,pOptions);
    }

    runModel(pContext:DexcaliburProject):AssuranceReport{
        this.run(pContext, {});

        return this.report;
    }

    /**
     * To get the list of all dashboard
     *
     * @return {string[]} The list of dashboards names
     * @method
     */
    listDashboards():string[] {
        return Object.keys(this.dashboards);
    }

    /**
     * To get a dashboard by its name
     *
     * @param {string} pName Dashboard name (not internal UID)
     * @return {DashBoard}
     * @method
     */
    getDashboard(pName:string):DashBoard {
        return this.dashboards[pName];
    }

    /**
     * To prepare a PrivacyScanner to be serialized
     *
     * @return {any} Poor object
     * @method
     */
    toJsonObject():any {
        const o:any = {};

        o.dashboards = {};
        for(const name in this.dashboards){
            o.dashboards[name] = this.dashboards[name].toJsonObject();
        }
        return o;
    }
}