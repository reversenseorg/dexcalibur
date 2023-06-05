import {Indicator} from "../common/Indicator.js";
import {DashBoard} from "../common/DashBoard.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {ProjectState} from "../../ProjectState.js";
import {AssuranceScanner} from "../common/AssuranceScanner.js";
import AssuranceReport from "../common/AssuranceReport.js";
import {MerlinSearchRequest} from "../../search/MerlinSearchRequest.js";
import Control from "./Control.js";
import ControlAssessment from "./ControlAssessment.js";


export interface PrivacyScanOptions {
    trackersLib:boolean,
    trackersNet:boolean,
    perm:boolean,
    piiTypes:boolean,
    piiFlows:boolean,
    save?:boolean
}

interface BusBasedControl {
    ctrl: ControlAssessment,
    rule: MerlinSearchRequest
}

export interface GenericScanOptions {
    dashboard?:DashBoardOpts
}

export interface DashBoardOpts {
    indicators: {[name:string] :Indicator }
}

export interface PrivacyScannerOpts {
    project:DexcaliburProject;
}

/**
 * Main API to perform privacy scan
 *
 * @class
 */
export class GenericScanner extends AssuranceScanner {

    private _mainDB = 'global';

    constructor(pConfig:PrivacyScannerOpts) {
        super({
            name: "scanner.generic",
            __pCode:'GEN_CLD_SSCAN',
            __pVersion: '1.0',
            __pSerial: pConfig.project.getLicenseNo(),
            __pKey: pConfig.project.getLicenseKey()
        });

        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }


    /**
     * To create the initial main dahboard
     *
     * @private
     */
    public createMainDashboard(pOpts:DashBoardOpts):void {
        this.dashboards[this._mainDB] = new DashBoard({
            name: this._mainDB,
            ... pOpts
        });
    }


    private executeRules(pReport:AssuranceReport, pControl:Control):void {


        if(pControl.hasChildren()){
            pControl.children.map( vCtrl => {
                this.executeRules(pReport, vCtrl);
            })
        }else{
            pControl.assessments.map( vAssess => {
               vAssess.rules.map( vRule => {
                   if(!vRule.hasBusSubscriber()){
                       (async ()=>{
                           let res = await vRule.execute(this.project);
                           if(res.count()>0){
                               console.log("[SCAN][FOUND] : "+res.count()+"  "+vRule.toSearchString());
                               res.getData().map(x => {
                                   vAssess.addMatches(x);
                               });
                           }
                       })();
                   }
               })
            });
        }

        return ;
    }

    generateReport():AssuranceReport {
        const report = new AssuranceReport({
            model: this.model
        });

        return report;
    }



    private _subscribeControls(pControl:Control):BusBasedControl[] {

        let reqs:BusBasedControl[] = [];

        if(pControl.hasChildren()){
            pControl.children.map( vCtrl => {
                reqs = reqs.concat(this._subscribeControls(vCtrl));
            })
        }else{
            pControl.assessments.map( vAssess => {
                vAssess.rules.map( (vRule, vIndex) => {
                    if(vRule.hasBusSubscriber()){
                        reqs.push({
                            ctrl: vAssess,
                            rule: vRule
                        });
                        vRule.getSubscribeList().map( x => {
                            this.project.getBus().subscribe(x, vRule.toBusSubscriber(vAssess));
                        });
                    }
                });
            });
        }

        return reqs;
    }


    /**
     * To browse model and search Merlin request scanning Bus events,
     * in order to subscribe to bus events
     *
     * @param {DexcaliburProject} pContext
     * @param pOptions
     * @private
     */
    private _registerOnBusEvents(pOptions:GenericScanOptions):void {

        let busBasedRules:BusBasedControl[] = [];
        this.model.controls.map( x => {
            busBasedRules = busBasedRules.concat( this._subscribeControls(x));
        });
    }

    /**
     * To perform full scan
     *
     * @private
     */
    private _firstScan(pContext:DexcaliburProject, pOptions:GenericScanOptions):void{
        // 0. Create dashboard
        this.createMainDashboard(pOptions.dashboard);

        // 1. configure main Bus
        this._registerOnBusEvents(pOptions);

        // 2. perform basis static scan
        this.report = new AssuranceReport({ });

        if(this.project.getState()!=ProjectState.READY){
            // analysis
            this.project.fullscan();
        }

        this._staticScan(this.report, pOptions);



        // 3. generate instruction

        // 4. run app (several time)

        // 5. taint analysis

        // 6. result
        this.reports.push(this.report);

        // 7. Save
        //AuditManager.getInstance().saveReport(pContext, this.lastReport);


    }

    /**
     * To scan existing data
     *
     * @private
     */
    private _staticScan( pReport:AssuranceReport, pOptions:GenericScanOptions) {
        this.model.controls.map( vCtrl => {
            this.executeRules(pReport, vCtrl);
        });
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

    run( pContext:DexcaliburProject, pOptions:any = {}){
        if(this.reports.length==0){
            this._firstScan( this.project, pOptions);
        }else{
            this.report = new AssuranceReport({ });
            this._staticScan( this.report, pOptions);
        }
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