import {Indicator} from "../common/Indicator.js";
import {DashBoard} from "../common/DashBoard.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {AssuranceScanner} from "../common/AssuranceScanner.js";
import AssuranceReport from "../common/AssuranceReport.js";
import {MerlinSearchRequest} from "../../search/MerlinSearchRequest.js";
import Control from "./Control.js";
import ControlAssessment from "./ControlAssessment.js";
import {Merlin, MerlinPrimitive} from "../../search/Merlin.js";
import {MerlinSearchAPI} from "../../search/MerlinSearchAPI.js";
import {TestPlan, TestStep, TestType} from "./TestPlan.js";
import {CANONICALIZED_ROOT, ControlNode} from "./AssuranceModel.js";
import * as Log from "../../Logger.js";
import {IControl} from "./IControl.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {AuditManager} from "../AuditManager.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

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
    rule: MerlinPrimitive
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


    private _searchContext:MerlinSearchAPI|null = null;

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


    /**
     *
     * @param pReport
     * @param pControl
     * @private
     */
    private executeRules(pReport:AssuranceReport, pControl:Control):void {


        if(pControl.hasChildren()){
            pControl.children.map( vCtrl => {
                this.executeRules(pReport, vCtrl);
            })
        }else{
            pControl.assessments.map( (vAssess,vIndex) => {
               vAssess.rules.map( (vRule,vRuleOffset) => {
                   if(!vRule.hasBusSubscriber()){
                       (async ()=>{
                           let res:any;
                           if(Merlin.isRule(vRule)){
                               res = await vRule.executeSync(this.project);
                               if(res.count()>0){
                                   console.log("[SCAN][FOUND] : "+res.count()+"  "+vRule.toSearchString());
                                   res.getData().map((x:any) => {
                                       /*pReport.addMatch(
                                           pControl.id,
                                           vAssess,
                                           vRuleOffset,
                                           x
                                       )
                                       /*
                                       vAssess.addMatches({
                                           ctrl: pControl.id,
                                           assess: vIndex,
                                           rule: vRule,
                                           match: x
                                       });*/
                                   });
                               }
                           }else{
                               (vRule as MerlinSearchRequest).setContext(this._searchContext);
                               res = await vRule.execute(this.project);
                               if(res.count()>0){
                                   console.log("[SCAN][FOUND] : "+res.count()+"  "+vRule.toSearchString());
                                   res.getData().map(x => {
                                       vAssess.addMatches(x);
                                   });
                               }
                           }

                       })();
                   }
               })
            });
        }

        return ;
    }


    /**
     *
     * @param pReport
     * @param pCtrlNode
     */
    doAssessment(pReport:AssuranceReport, pCtrlNode:ControlNode):void {

        if(!pCtrlNode.ctrl.isControlAssessment()){
            Logger.info("[SCANNER][GENERIC][doAssessment] skip control node (cause= control node is not a set of rules) : "+pCtrlNode.canonicalID);
            return;
        }

        (pCtrlNode.ctrl as ControlAssessment).rules.map( (vRule,vRuleOffset) => {
            if(!vRule.hasBusSubscriber()){
                (async ()=>{
                    let res:any;
                    if(Merlin.isRule(vRule)){
                        res = await vRule.executeSync(this.project);
                        if(res.count()>0){
                            console.log("[SCAN][FOUND](rule) : "+res.count()+"  "+vRule.toSearchString());
                            res.getData().map((x:any) => {
                                pReport.addMatch(
                                    pCtrlNode,
                                    vRuleOffset,
                                    x
                                );
                            });
                        }
                    }else{
                        (vRule as MerlinSearchRequest).setContext(this._searchContext);
                        res = await vRule.execute(this.project);
                        if(res.count()>0){
                            console.log("[SCAN][FOUND](request) : "+res.count()+"  "+vRule.toSearchString());
                            res.getData().map(x => {
                                pReport.addMatch(
                                    pCtrlNode,
                                    vRuleOffset,
                                    x
                                );
                            });
                        }
                    }

                })();
            }
        });


        return ;
    }

    generateReport():AssuranceReport {
        const report = new AssuranceReport({
            model: this.model
        });

        return report;
    }

    /**
     * To build the list of control point listening on main Bus
     *
     * @param {Control} pControl
     * @return {BusBasedControl[]}
     * @private
     */
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
     * To prepare test plan :
     *  - browse model to gather transversal action : bus subscriber, hooks, VT, ..
     *  - Verification Testing
     *  - Penetration testing
     *  - Dynamic Analysis scheduling
     *  - Taint analysis scheduling
     *
     * @private
     */
    public _prepareTestPlan():TestPlan{
        // TODO : browse the assurance model quickly by using AssuranceModel.ControlTree
        // TODO : add steps attached to app lifecycle step
        const plan = new TestPlan();
        const tests:any = {
            [TestType.VT]: [],
            [TestType.PT]: [],
            [TestType.STATIC_SCAN]: [],
            [TestType.DYN_SCAN]: [],
            [TestType.IAST]: [],
            [TestType.TAINT]: [],
            [TestType.SYMEXEC]: []
        };

        const leafs = this.model.getControlLeafsFrom(CANONICALIZED_ROOT);
        leafs.map((vNode)=>{
            if(vNode.ctrl.isControlAssessment()){
                const assesst = (vNode.ctrl as ControlAssessment);
                tests[assesst.testType].push(vNode);
            }
        });

        if(tests[TestType.VT].length>0) plan.addStep(TestType.VT, tests[TestType.VT]);

        if(tests[TestType.IAST].length>0) plan.addStep(TestType.IAST, tests[TestType.IAST]);
        if(tests[TestType.STATIC_SCAN].length>0) plan.addStep(TestType.STATIC_SCAN, tests[TestType.STATIC_SCAN]);
        // add coverage measurement + loop
        if(tests[TestType.TAINT].length>0) plan.addStep(TestType.TAINT, tests[TestType.TAINT]);
        if(tests[TestType.DYN_SCAN].length>0) plan.addStep(TestType.DYN_SCAN, tests[TestType.DYN_SCAN]);
        // add coverage measurement + loop
        if((tests[TestType.TAINT].length+tests[TestType.DYN_SCAN].length)>0){
            if(tests[TestType.STATIC_SCAN].length>0) plan.addStep(TestType.STATIC_SCAN, tests[TestType.STATIC_SCAN]);
        }

        // add coverage measurement + loop
        if(tests[TestType.SYMEXEC].length>0) plan.addStep(TestType.SYMEXEC, tests[TestType.SYMEXEC]);
        if(tests[TestType.PT].length>0) plan.addStep(TestType.PT, tests[TestType.PT]);

        return plan;
    }

    /**
     * To perform full scan
     *
     * @private
     */
    private _firstScan(pContext:DexcaliburProject, pOptions:GenericScanOptions):void{
        // 0. Create dashboard
        this.createMainDashboard(pOptions.dashboard);


        // TODO : prepare test plan by gathering, categorizing and prioritizing tests

        // 0.b prepare test plan
        const plan = this._prepareTestPlan();

        // 1. configure main Bus
        this._registerOnBusEvents(pOptions);

        // TODO : execute TestPlan + attach matches to TestPlan step

        // 2. perform basis static scan
        this.report = new AssuranceReport({
            time:(new Date()).getTime(),
            project: pContext,
            model: this.model
        });

        plan.execute((vStep:TestStep)=>{
            Logger.info("[SCANNER]["+this.name+"] Execute Test Step : "+vStep.type)
            let next = true;
            switch (vStep.type){
                case TestType.STATIC_SCAN:
                    this._staticScan( this.report, vStep.controls, pOptions);
                    break;
                case TestType.IAST:
                    this._iastScan( this.report, vStep.controls, pOptions);
                    break;
                default:
                    Logger.info("[SCAN][NOT SUPPORTED][STEP="+vStep.type+"] model="+this.model.getID());
                    break;
            }
            return next;
        });



        // 3. generate instruction

        // 4. run app (several time)

        // 5. taint analysis

        // 6. result
        this.reports.push(this.report);

        // 7. Save
        AuditManager.getInstance().saveReport(pContext, this.report);


    }

    /**
     * To scan existing data
     *
     * @private
     */
    private _staticScan( pReport:AssuranceReport, pControlNodes:ControlNode[], pOptions:GenericScanOptions) {
        pControlNodes.map( vCtrl => {
            this.doAssessment(pReport, vCtrl);
        });
    }

    private _iastScan( pReport:AssuranceReport, pControlNodes:ControlNode[], pOptions:GenericScanOptions) {
        pControlNodes.map( vCtrl => {
            this.doAssessment(pReport, vCtrl);
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

        // TODO : prepare test plan by gathering, categorizing and prioritizing tests
    }

    override run( pContext:DexcaliburProject, pOptions:any = {}){

        if(this._searchContext==null){
            this._searchContext = new MerlinSearchAPI(pContext.getSearchEngine().getDatabase());
        }

        if(this.reports.length==0){
            this._firstScan( this.project, pOptions);
        }else{

            this.report = new AssuranceReport({
                time:(new Date()).getTime(),
                project: pContext,
                model: this.model
            });

            //this._reScan( this.report, pOptions);

            //this.reports.push(this.report);
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

        CoreDebug.checkJsonSerialize(o, "GenericScanner");

        return o;
    }
}