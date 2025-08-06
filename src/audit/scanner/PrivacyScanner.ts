import {Indicator} from "../common/Indicator.js";
import {DashBoard} from "../common/DashBoard.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {AssuranceScanner} from "../common/AssuranceScanner.js";
import AssuranceReport, {Match} from "../common/AssuranceReport.js";
import {MerlinSearchRequest} from "../../search/MerlinSearchRequest.js";
import {Merlin} from "../../search/Merlin.js";
import {MerlinSearchAPI} from "../../search/MerlinSearchAPI.js";
import * as Log from "../../Logger.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {AuditManager} from "../AuditManager.js";
import {MerlinPrimitive} from "../../search/MerlinPrimitive.js";
import {MerlinRule} from "../../search/MerlinRule.js";
import {FinderResult} from "../../search/FinderResult.js";
import {BusSubscriber} from "../../Bus.js";
import {AssuranceScannerException} from "../errors/AssuranceScannerException.js";
import AnalyzerDatabase from "../../AnalyzerDatabase.js";
import AssuranceModel, {AssuranceModelUUID, CANONICALIZED_ROOT, ControlNode} from "../common/AssuranceModel.js";
import ControlAssessment, {MetadataTopic} from "../common/ControlAssessment.js";
import {TestPlan, TestStep, TestType} from "../common/TestPlan.js";
import Control from "../common/Control.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import ModelStringValue from "../../ModelStringValue.js";
import {SearchAPI} from "../../SearchAPI.js";
import {INode, NodeType, NodeUtils, Tag} from "@dexcalibur/dexcalibur-orm";
import {LicenceManager} from "../../credit/LicenceManager.js";
import {ReversenseProduct} from "../../billing/ReversenseProduct.js";
import {ProductRelease} from "../../billing/ProductRelease.js";
import {MetadataType} from "../common/Metadata.js";
import {PolicyRule} from "../PolicyRule.js";
import {ApplicationUnit} from "../../organization/ApplicationUnit.js";
import {OrganizationUnit} from "../../organization/OrganizationUnit.js";
import chalk from "chalk";
import {Device} from "../../Device.js";
import {INodeRef} from "../../INode.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

//type MatchCtrlAss = { ctrl:string, idx:number };
type NodeMatchTree = Record<number, Record<string, Record<string, number[]>>>;

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
 * Scanner instance
 *
 * Every scan has own instance of a scanner. Scanners can have several
 * behaviours.
 *
 * GenericScanner offers all what most of referentials required to be assessed
 *
 *
 * @class
 */
export class PrivacyScanner extends AssuranceScanner {

    static DEFAULT_NAME = "scanner.privacy";
    static HUMAN_NAME = "Privacy Scanner";
    static PRODUCT_CODE = "PRIV_CLD_SSCAN";
    static DESCR = "Scanner for privacy assessment";
    static VERSION = "1.0.1";

    private _mainDB = 'global';

    private _searchContext:MerlinSearchAPI<any>|null = null;

    private _device: Nullable<Device> = null;

    constructor(pConfig:PrivacyScannerOpts) {
        super({
            name: PrivacyScanner.DEFAULT_NAME,
            __pCode: PrivacyScanner.PRODUCT_CODE,
            __pVersion: PrivacyScanner.VERSION,
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
    private _createMainDashboard(pOpts:DashBoardOpts):void {
        this.dashboards[this._mainDB] = new DashBoard({
            name: this._mainDB,
            ... pOpts
        });
    }


    /**
     *
     * @param pReport
     * @param pCtrlNode
     */
    async doAssessment(pReport:AssuranceReport, pCtrlNode:ControlNode):Promise<void> {

        if(!pCtrlNode.ctrl.isControlAssessment()){
            Logger.info(`[SCANNER][${PrivacyScanner.DEFAULT_NAME}][doAssessment] skip control node (cause= control node is not a set of rules) : `+pCtrlNode.canonicalID);
            return;
        }

        const rules:MerlinPrimitive[] = (pCtrlNode.ctrl as ControlAssessment).rules;
        let vRule:MerlinPrimitive;
        let vRuleOffset:number;
        let res:FinderResult;

        for(let vRuleOffset=0; vRuleOffset<rules.length; vRuleOffset++){
            vRule = rules[vRuleOffset];
            if(!vRule.hasBusSubscriber()){

                if(Merlin.isRule(vRule)){
                    try{
                        if(vRule.hasErrors()){
                            Logger.error(`Rule [uid=${pCtrlNode.canonicalID}#${vRuleOffset}] has errors (${vRule.getErrors().length}`);
                            continue;
                        }

                        if(pCtrlNode.canonicalID.startsWith("*.4091cae9-")){
                            console.log("BEFORE EXEC >",pCtrlNode.canonicalID, vRuleOffset, vRule.toSearchString());
                        }

                        res = await vRule.execute(this.project);

                        if(pCtrlNode.canonicalID.startsWith("*.4091cae9-")){
                            console.log("AFTER EXEC >",pCtrlNode.canonicalID, vRuleOffset, res.count());
                        }

                        if(res.count()>0){
                            console.log("[SCAN][FOUND](rule) : "+res.count()+"  "+(vRule as MerlinRule).getRequest().toSearchString());
                            res.foreach((offset:number,x:any) => {
                                // console.log('^ addMatch',  vRuleOffset, offset, x );

                                // x => matching node

                                pReport.addMatch(
                                    pCtrlNode,
                                    vRuleOffset,
                                    x
                                );
                            });
                        }
                    }catch(err){
                        Logger.error(`[SCANNER][${PrivacyScanner.DEFAULT_NAME}][doAssessment] Rule : ${pCtrlNode.canonicalID} ${vRuleOffset} `,err.stack);
                        Logger.error(vRule.toSearchString());
                        // add error
                        /*pReport.addError(
                            pCtrlNode,
                            vRuleOffset,
                            x
                        );*/
                    }

                }else{

                    try{

                        if(vRule.hasErrors()){
                            Logger.error(`Request [uid=${pCtrlNode.ctrl.id}#${vRuleOffset}] has errors (${vRule.getErrors().length}`);
                            continue;
                        }

                        (vRule as MerlinSearchRequest).setContext(this._searchContext);
                        res = await vRule.execute(this.project);
                        if(res.count()>0){
                            console.log("[SCAN][FOUND](request) : "+res.count()+"  "+vRule.toSearchString());
                            res.foreach((offset:number,x) => {
                                pReport.addMatch(
                                    pCtrlNode,
                                    vRuleOffset,
                                    x
                                );
                            });
                        }
                    }catch(err){
                        Logger.error(`[SCANNER][${PrivacyScanner.DEFAULT_NAME}][doAssessment] Search Request : `,err.stack);

                    }

                }
            }
        }

        return ;
    }

    generateReport():AssuranceReport {
        const report = new AssuranceReport({
            model: this.model.getID()
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
        let subscribers:BusSubscriber[] = [];

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
                            // we gather individual bus subscriber to be able to unsubscribe them later
                            const bsub = vRule.toBusSubscriber(vAssess);
                            this.project.getBus().subscribe(x, bsub);
                            subscribers.push(bsub);
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
            // VT : Verification Test => goal is to detect mechanisms
            [TestType.VT]: [],
            // PT : Penetration Test => goal is to bypass/attack mechanisms
            // Some evaluations can have only VT, such as privacy, and so ...
            [TestType.PT]: [],

            // TODO : test type below are deprecated, and moved to "analysis type" (analType)
            [TestType.STATIC_SCAN]: [],
            [TestType.DYN_SCAN]: [],
            [TestType.IAST]: [],
            [TestType.TAINT]: [],
            [TestType.SYMEXEC]: []
        };

        // get atomic assessments
        const leafs = this.model.getControlLeafsFrom(CANONICALIZED_ROOT);


        // build
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
    private async _firstScan(pContext:DexcaliburProject, pOptions:GenericScanOptions):Promise<void>{

        // retrieve org and app policies :
        const engine = pContext.getContext();
        const policies:Record<string, PolicyRule> = {};
        let app:Nullable<ApplicationUnit> = null;
        let org:Nullable<OrganizationUnit> = null;


        // gather policies and device
        if(pContext.getAppUnit()!=null){
            app = await engine.getOrgManager().getDirectApplication(
                engine.getInternalAcc(),
                pContext.getAppUnit()
            );

            if(app.getParentOrganization()!=null){
                org = await engine.getOrgManager().getOrganization(
                    engine.getInternalAcc(),
                    app.getParentOrganization()
                );

                org.policies.map(x => {
                    console.log(x.model,this.model.getID());
                    if(x.model===this.model.getID()){
                        x.rules.map( r => {
                            if(r.enabled){
                                policies[r.id] = r;
                            }
                        })
                    }
                });
            }

            if(app.getTargetDevices().length>0){
                this._device = await engine.getDeviceManager().getDevices(app.getTargetDevices()).find(x => {
                    return (x.connected);
                });
            }

            if(app.policies!=null){
                app.policies.map(x => {
                    if(x.model===this.model.getID()){
                        x.rules.map( r => {
                            if(r.enabled){
                                policies[r.id] = r;
                            }
                        })
                    }
                })
            }
        }


        Logger.info(chalk.yellow("ACTIVATED POLICIES : "));
        console.log(policies);


        // 0. Create dashboard
        this._createMainDashboard(pOptions.dashboard);

        // TODO : prepare test plan by gathering, categorizing and prioritizing tests

        // 0.b prepare test planx
        const plan = this._prepareTestPlan();

        // 1. configure main Bus
        this._registerOnBusEvents(pOptions);

        // TODO : execute TestPlan + attach matches to TestPlan step

        // 1'. prepare report
        this.report = new AssuranceReport({
            time:(new Date()).getTime(),
            started:(new Date()).getTime()
        });

        this.report.setProject(pContext);
        this.report.setModel(this.model);
        if(app!=null) this.report.setAppUnit(app);
        if(this._device!=null) this.report.setDevice(this._device);

        // 2. perform scans
        await plan.executeAsync(async (vStep:TestStep)=>{
            Logger.info("[SCANNER]["+this.name+"] Execute Test Step : "+vStep.type)
            let next = true;
            switch (vStep.type){
                case TestType.STATIC_SCAN:
                    console.log("SAST : "+vStep.controls.length);
                    await this._staticScan( this.report, vStep.controls, pOptions);
                    break;
                case TestType.IAST:
                    console.log("IAST : "+vStep.controls.length); // TODO : add device
                    await this._iastScan( this.report, vStep.controls, pOptions);
                    break;
                default:
                    Logger.info("[SCAN][NOT SUPPORTED][STEP="+vStep.type+"] model="+this.model.getID());
                    break;
            }
            return next;
        });

        let crossReport:Nullable<AssuranceReport> = null;

        const intern:Tag = pContext.getTagManager().getTag("discover.internal");

        // 3 : Filter / transform results
        let m:Match;
        for(let sdkID in this.report.matches){
            m = this.report.matches[sdkID];

            m.match = m.match.filter( occ => {
                if(occ.node==null) /* skip */ return;

                if((occ.node as INode).tags!=null && (occ.node as INode).tags.indexOf(intern.getUUID())>0){
                    return false;
                }

                switch (occ.node.__){
                    case NodeInternalType.STRING:
                        if((occ.node as ModelStringValue).src!=null){
                            if(Array.isArray(occ.node.src)){
                                occ.node.src.map((n,i)=>{
                                    if(n.__==NodeInternalType.STRING) return /* avoid infinite loop */;
                                    if((n as INode).tags!=null && (n as INode).tags.indexOf(intern.getUUID())>0){
                                        return false;
                                    }

                                    if(i!=0){
                                        m.match.push({
                                            node: n,
                                            ruleIdx: occ.ruleIdx,
                                            meta:[{
                                                type: MetadataType.ANY,
                                                key: MetadataTopic.EXTRACT,
                                                value: occ.node.value
                                            }]
                                        });
                                        return;
                                    }
                                    occ.node = n;
                                });
                            }else{
                                occ.node = occ.node.src;
                                if(occ.meta==null) occ.meta = [];
                                occ.meta.push({
                                    type: MetadataType.ANY,
                                    key: MetadataTopic.EXTRACT,
                                    value: occ.node.value
                                });
                            }
                        }
                        return true;
                        break;
                    case NodeInternalType.METHOD:
                        // remove internal match (tagged 'discover.internal')
                        if((occ.node as INode).tags!=null && (occ.node as INode).tags.indexOf(intern.getUUID())>0){
                            return false;
                        }else{
                            return true;
                        }
                        // search xref to remove dead code
                        break;
                    default:
                        return true;
                }
            });


            // m.assessment =>W ControlAssessment
            // m.match => [ { node: <INode>, ruleIdx: <offset> }, ... ]
        }

        // 4. Deduplicate matching node (merge matching ctrl ID in metadata)
        let singles:Record<number,Record<string, any>> = {};
        let cleaned:Match[] = [];
        for(let k in this.report.matches){

            singles = {};
            cleaned = [];
            this.report.matches[k].match.map( occ => {
                if(singles[occ.node.__]==null) singles[occ.node.__]={};

                let uid:string;
                if(occ.node.getUID != null){
                     uid = (occ.node as INode).getUID();
                }else{
                     uid = (occ.node as INodeRef)._uid;
                }

                if(singles[occ.node.__][uid]==null){
                    singles[occ.node.__][uid]={
                        ... occ,
                        meta: []
                    };
                }

                // 5'''. Update metadata (merge)
                if(occ.node.value!=null){
                    singles[occ.node.__][uid].meta.push({
                        type: MetadataType.TEXT,
                        key: MetadataTopic.EXTRACT,
                        value: occ.node.value
                    });
                }
            });
            Object.values(singles).map(x => cleaned = cleaned.concat(Object.values(x)));
            this.report.matches[k].match = cleaned;
        }

        // 5. Explain report (explain results with model)
        this.report.build({
            sampling: true,
            samplingSize: 100,
            groupSampleByNode: true,
            embedKpis: true,
            clean: false
        });

        // 6. post process : cross results
        if(policies["analyze_tp_sdk"]!=null || policies["analyze_pii"]!=null){
            try{
                this.report = await this._crossReportConsolidating(this.report);
            }catch (e){
                console.error(e.stack);
            }
        }


        // 7. Apply policies
        if(policies["require_consent"]!=null){
            if(policies["require_consent"].thresholds.length>0){
                await this._verifyConsent(this.report, policies["require_consent"]);
            }
        }

        // 8. result
        this.report.terminated = (new Date()).getTime();
        this.reports.push(this.report);

        // 9. Save
        AuditManager.getInstance().saveReport(pContext, this.report);
    }

    /**
     * To build 2lvl-depth tree where node are NodeTypeInternal and NodeUID, and leafs are matches
     *
     *                    [NodeInternalType]
     *        [NodeUuid]-----|          |-------[NodeUuid]
     *         |      |                          |      |
     *(ctrl,rule)[]   (ctrl,rule)[]   (ctrl,rule)[]   (ctrl,rule)[]
     *
     * @param pMatches
     * @private
     */
    private _buildControlTreeFromMatches(pMatches:Record<string, Match>) : NodeMatchTree {

        // sort extra matches by noderef
        let m:Match;
        let tree:NodeMatchTree = {};

        for(let ecuid in pMatches){
            m = pMatches[ecuid];
            if(m.match!=null){
                m.match.map(n => {
                    if(n.node!=null){
                        if(tree[n.node.__]==null){
                            tree[n.node.__] = {};
                        }
                        if(tree[n.node.__][n.node.uid]==null){
                            tree[n.node.__][n.node.uid] = {};
                        }
                        if(tree[n.node.__][n.node.uid][ecuid]==null){
                            tree[n.node.__][n.node.uid][ecuid] = []
                        }

                        //console.log(`${n.node.__} - ${n.node.uid} - ${ecuid} => ${n.ruleIdx}`);
                        tree[n.node.__][n.node.uid][ecuid].push(n.ruleIdx);
                    }
                })
            }
        }

        return tree;
    }

    private async _consolidateOnJoin( pModel:AssuranceModelUUID, pTree:NodeMatchTree,
                                      pReport:AssuranceReport):Promise<AssuranceReport> {
        let n:any[];
        let m:Match;

        for(let piiID in pReport.matches){
            m = pReport.matches[piiID];

            m.match.map( occ => {
                if(occ.node==null) /* skip */ return;

                let ref = NodeUtils.asNodeRef(occ.node);

                let xref:any = pTree[ref.__];
                if(xref==null) return;
                xref = xref[ref._uid];
                if(xref==null) return;

                // a match in privacy.trackers.shared also exists in pii3
                if(occ.meta==null) occ.meta = [];

                for(let ecuid in xref){
                    occ.meta.push({
                        type: MetadataType.ANY,
                        key: MetadataTopic.CTRL,
                        value: {
                            model: pModel,
                            ctrl: ecuid,
                            idx: xref[ecuid]
                        }
                    });
                }
            });

            // m.assessment =>W ControlAssessment
            // m.match => [ { node: <INode>, ruleIdx: <offset> }, ... ]
        }

        return pReport;
    }


    private async _consolidateOnParent( pModel:AssuranceModelUUID, pTree:NodeMatchTree,
                                      pReport:AssuranceReport):Promise<AssuranceReport> {
        let n:any[];
        let m:Match;

        for(let piiID in pReport.matches){
            m = pReport.matches[piiID];

            m.match.map( occ => {
                if(occ.node==null) /* skip */ return;

                let ref = NodeUtils.asNodeRef(occ.node);


                let xref:any = pTree[ref.__];
                if(xref==null) return;
                xref = xref[ref._uid];
                if(xref==null) return;

                // a match in privacy.trackers.shared also exists in pii3
                if(occ.meta==null) occ.meta = [];

                occ.meta.push({
                    type: MetadataType.ANY,
                    key: MetadataTopic.CTRL,
                    value: {
                        model: pModel,
                        ctrl: xref.ctrl
                    }
                });
            });

            // m.assessment =>W ControlAssessment
            // m.match => [ { node: <INode>, ruleIdx: <offset> }, ... ]
        }

        return pReport;
    }

    private async _crossReportConsolidating(pReport:AssuranceReport):Promise<AssuranceReport> {

        Logger.info(chalk.yellow("Cross analysis policy enabled"));

        const cross:any = {
            "privacy.pii3":"privacy.trackers.shared",
            "privacy.trackers.shared":"privacy.pii3",
        }

        if(cross[this.model.getID()]==null) return pReport;

        const extraModel = cross[this.model.getID()];
        const crossReport = await this._getExtraReport(extraModel);
        let extraNode:NodeMatchTree = {};
        let m:any;

        if(crossReport!=null && crossReport.matches!=null){
            // sort extra matches by noderef
            extraNode = this._buildControlTreeFromMatches(crossReport.matches);

            // 1st level intersection

            // Parent intersection (class or package)

            // search directly
            pReport = await this._consolidateOnJoin(extraModel, extraNode, pReport);
        }

        return pReport;
    }

    /**
     * To scan existing data
     *
     * @private
     */
    private async _staticScan( pReport:AssuranceReport, pControlNodes:ControlNode[], pOptions:GenericScanOptions):Promise<void[]> {
        const max = pControlNodes.length;
        let passed = 0;
        return await Promise.all(pControlNodes.map(async (vCtrl) => {
            await this.doAssessment(pReport, vCtrl);
            passed++;
            Logger.info(`${passed} / ${max}`);
        }));
    }

    private async _iastScan( pReport:AssuranceReport, pControlNodes:ControlNode[], pOptions:GenericScanOptions):Promise<void[]> {
        return await Promise.all(pControlNodes.map(async (vCtrl) => {
            await this.doAssessment(pReport, vCtrl);
        }));
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

    override async run( pContext:DexcaliburProject, pOptions:any = {}):Promise<void>{

        if(this.model==null){
            throw AssuranceScannerException.MODEL_UNDEFINED(this.name, pContext.getUID());
        }

        if(this._searchContext==null){
            this._searchContext = new MerlinSearchAPI<AnalyzerDatabase>(pContext.getSearchEngine().getDatabase());
        }

        if(this.project == null){
            this.project = pContext
        }

        Logger.info(`[SCANNER][${this.name}] Start scan of model [model=${this.model.getUID()}][existingReports=${this.reports.length}]`);


        //if(this.reports.length==0){
            await this._firstScan( this.project, pOptions);
        /*}else{

            this.report = new AssuranceReport({
                time:(new Date()).getTime(),
                project: pContext,
                model: this.model.getUID()
            });

            //this._reScan( this.report, pOptions);

            //this.reports.push(this.report);
        }*/

    }

    async runModel(pContext:DexcaliburProject):Promise<AssuranceReport>{
        await this.run(pContext, {});

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


    /**
     * To retrieve the report form another assessment of the same version
     *
     * @param {AssuranceModelUUID} pModel
     * @private
     */
    private async _getExtraReport(pModel: AssuranceModelUUID):Promise<Nullable<AssuranceReport>> {

        //
        if(this.project.appUnit == null) return null;

        const eng =  this.project.getContext();
        const orgMgt = eng.getOrgManager();
        const app = await orgMgt.getDirectApplication(
            eng.getInternalAcc(),
            this.project.appUnit
        );

        // search report for the same project in app unit
        let reports = await eng.getAuditManager().getReportsByAppRelease(
            eng.getInternalAcc(), app, this.project.getUID()
        );

        // filter to keep only terminated, sort from newest to oldest
        reports = reports
            .filter(r => {
                return (r.terminated>-1) && (r.getModel()===pModel);
            })
            .sort((r1,r2)=>{
                if(r1.started>r2.started){
                    return -1;
                }else{
                    return 1;
                }
            });


        if(reports.length>0){
            return reports[0];
        }else{
            return null;
        }
    }

    private _updatePiiWithExternalSDK(pSdkReport: Nullable<AssuranceReport>) {
        // for each type of PII / state replace the matches by the list of SDK matches
        for(let ctrlUID in this.report.matches){
            this.report.matches[ctrlUID]
        }
    }

    private _updateSdkWithPii(pPiiReport: Nullable<AssuranceReport>) {

        // list all matching nodes and link it to a list of PII,
        pPiiReport.getModel()

        // next verify if matching node is a part of one of detected SDK

        // for each SDK add the list of pii and proof
        for(let ctrlUID in this.report.matches){
            // gather SDK proof and search match in
            this.report.matches[ctrlUID]
        }
    }

    private _generateCrossReport(pSdkReport: AssuranceReport, pPiiReport: AssuranceReport) {
        // generate both explained reports
        for(let cuid in pSdkReport.matches){
            //pSdkReport.matches
        }
    }

    /**
     * To retrieve Out-Of-Scope (OOS) caller
     * TODO : use INodeRef
     * @param n
     * @private
     */
    private async _retrieveOosCaller(pNodeRefs: any[]):Promise<any[]> {

        const search = this.project.getSearchEngine();
        let node:any, ref:any;

        let filtered:any[] = [], n:any, nt:NodeType, res:FinderResult;
        for(let i=0; i<pNodeRefs.length; i++){
            nt = NodeType.getByID(pNodeRefs[i].__);

            res = await (MerlinSearchRequest.fromCondition(
                this.project.merlin, nt,
                {
                    [nt.getPrimaryKey().getName()]: pNodeRefs[i]._uid,
                }, {
                    strict: true,
                    not: false
                }
            )).executePDB(this.project);

            if(res==null || res.count()==0) break;
            n = res.getData()[0];

            // node type not referenced as target of a ModelCall
            // must be linked to a callable node.
            if(n.__ === NodeInternalType.STRING){
                if(SearchAPI.isNodeRef(n as ModelStringValue)){
                    res = (await (MerlinSearchRequest.getByRef( n.src,this.project.merlin)).executePDB(this.project));
                    if(res==null || res.count()==0) break;
                    n = res.getData()[0];
                }
            }

            switch (n.__){
                case NodeInternalType.CLASS:

                    break;
                case NodeInternalType.FUNC:
                case NodeInternalType.METHOD:
                case NodeInternalType.FIELD:
                    res = await (Merlin.static().call({
                        _calleed: {
                            __: n.__,
                            _uid: (n as INode).getUID()
                           // [NodeType.getByID(n.__).getPrimaryKey().getName()] : (n as INode).getUID()
                        }
                    },{ not:false })).executePDB(this.project);
                    break;
                default:
                    break;
            }
        }

        return filtered;
    }

    private async _verifyConsent(pReport: AssuranceReport, pRule: PolicyRule) {

        const purps = pRule.thresholds[0]['in'];

        if(purps==null || purps.length==0) return;

        if(pReport.modelInfo.uid=="privacy.pii3"){

            const trackerModel = await this.project.engine.getAuditManager()
                .getModelByUID(
                    this.project.engine.getInternalAcc(),
                "privacy.trackers.shared"
                );

            for(let k in pReport.matches){
                pReport.matches[k].match.map((m)=>{
                    if(m.meta!=null && Array.isArray(m.meta)){
                        const ctrls = m.meta.filter(x => (x.key===MetadataTopic.CTRL && x.value.model==="privacy.trackers.shared"));
                        if(ctrls.length>0){
                            const ectrl = trackerModel.getControlNode(ctrls[0].ctrl);
                            if(ectrl==null){ return;  }

                            const req = ectrl.metadata.filter(x =>{
                                return ((x.key===MetadataTopic.PURPOSE) && (purps.indexOf(x.value)>-1));
                            });

                            if(req.length>0){
                                m.meta.push({
                                    type: MetadataType.PARAM,
                                    key: MetadataTopic.ADVISORY,
                                    value: {
                                        id:"pii_consent",
                                        style: "warning",
                                        match: req
                                    }
                                })
                            }
                        }


                    }
                })
            }
        }else{
            pReport.controls.map((vCtrl)=>{
                const req = vCtrl.ctrl.metadata.filter(x =>{
                    return ((x.key===MetadataTopic.PURPOSE) && (purps.indexOf(x.value)>-1));
                });

                if(req.length>0){
                    vCtrl.ctrl.metadata.push({
                        type: MetadataType.PARAM,
                        key: MetadataTopic.ADVISORY,
                        value: {
                            id:"pii_consent",
                            style: "warning",
                            match: req
                        }
                    })
                }

            });
        }


    }
}

LicenceManager.registerNewProduct(new ReversenseProduct({
    code: PrivacyScanner.DEFAULT_NAME,
    name: PrivacyScanner.HUMAN_NAME,
    description: PrivacyScanner.DESCR,
    version: PrivacyScanner.VERSION,
    author: {
        name: "Reversense",
        contact: "contact@reversense.com",
        official: true
    },
    type: NodeInternalType.ASSURANCE_SCANNER,
    price: 6000,
    releases: [
        new ProductRelease({
            version: PrivacyScanner.VERSION,
            description: PrivacyScanner.DESCR
        })
    ]
}), PrivacyScanner);