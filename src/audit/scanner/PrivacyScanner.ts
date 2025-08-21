import {Indicator} from "../common/Indicator.js";
import {DashBoard} from "../common/DashBoard.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {AssuranceScanner} from "../common/AssuranceScanner.js";
import AssuranceReport, {Match} from "../common/AssuranceReport.js";
import {MerlinSearchRequest} from "../../search/MerlinSearchRequest.js";
import {Merlin} from "../../search/Merlin.js";
import {MerlinSearchAPI} from "../../search/MerlinSearchAPI.js";
import * as Log from "../../Logger.js";
import {AuditManager} from "../AuditManager.js";
import {MerlinPrimitive} from "../../search/MerlinPrimitive.js";
import {MerlinRule} from "../../search/MerlinRule.js";
import {FinderResult} from "../../search/FinderResult.js";
import {BusSubscriber} from "../../Bus.js";
import AssuranceModel, {AssuranceModelUUID, CANONICALIZED_ROOT, ControlNode, ControlTree} from "../common/AssuranceModel.js";
import ControlAssessment, {MetadataTopic} from "../common/ControlAssessment.js";
import {TestPlan, TestStep, TestType} from "../common/TestPlan.js";
import Control from "../common/Control.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import ModelStringValue from "../../ModelStringValue.js";
import {INode, NodeType, NodeUtils, Tag} from "@dexcalibur/dexcalibur-orm";
import {Metadata, MetadataType} from "../common/Metadata.js";
import {PolicyRule} from "../PolicyRule.js";
import {ApplicationUnit} from "../../organization/ApplicationUnit.js";
import {OrganizationUnit} from "../../organization/OrganizationUnit.js";
import chalk from "chalk";
import {Device} from "../../Device.js";
import {INodeRef} from "../../INode.js";
import {IControl} from "../common/IControl.js";
import {MatchOccurence} from "../common/Match.js";
import {IndicatorBuilder} from "../kpi/IndicatorBuilder.js";
import ModelCall from "../../ModelCall.js";
import {AssuranceScannerException} from "../errors/AssuranceScannerException.js";
import AnalyzerDatabase from "../../AnalyzerDatabase.js";
import {ProductRelease} from "../../billing/ProductRelease.js";
import {LicenceManager} from "../../credit/LicenceManager.js";
import {ReversenseProduct} from "../../billing/ReversenseProduct.js";
import {SearchAPI} from "../../SearchAPI.js";
import {CoreDebug} from "../../core/CoreDebug.js";

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
    dashboard?:DashBoardOpts;
    extraScan?:boolean;
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
    async doAssessment(pReport:AssuranceReport, pCtrlNode:ControlNode, vIndex:number =-1):Promise<void> {

        if(!pCtrlNode.ctrl.isControlAssessment()){
            Logger.info(`[SCANNER][${PrivacyScanner.DEFAULT_NAME}][doAssessment] skip control node (cause= control node is not a set of rules) : `+pCtrlNode.canonicalID);
            return;
        }

        const rules:MerlinPrimitive[] = (pCtrlNode.ctrl as ControlAssessment).rules;
        let vRule:MerlinPrimitive;
        let vRuleOffset:number;
        let res:FinderResult;
        let startTime:number;

        for(let vRuleOffset=0; vRuleOffset<rules.length; vRuleOffset++){
            vRule = rules[vRuleOffset];

            if(!vRule.hasBusSubscriber()){

                if(Merlin.isRule(vRule)){
                    try{
                        if(vRule.hasErrors()){
                            Logger.error(`Rule [uid=${pCtrlNode.canonicalID}#${vRuleOffset}] has errors (${vRule.getErrors().length}`);
                            continue;
                        }


                        startTime = (new Date()).getTime();
                        Logger.info(` Execute [${vIndex}][${vRuleOffset}]...`);
                        res = await vRule.execute(this.project);
                        Logger.info(` Execute [${vIndex}][${vRuleOffset}] : (ms) ${Math.floor((new Date()).getTime()-startTime)} : ${res.count()}`);

                        if(pCtrlNode.canonicalID.startsWith("*.4091cae9-")){
                            console.log("AFTER EXEC >",pCtrlNode.canonicalID, vRuleOffset, vRule.toSearchString(), res.count());
                        }

                        if(res.count()>0){
                            console.log("[SCAN][FOUND](rule) : "+res.count()+"  "+(vRule as MerlinRule).getRequest().toSearchString());
                            res.foreach((offset:number,vDetectedNode:any) => {
                                // console.log('^ addMatch',  vRuleOffset, offset, x );

                                // x => matching node

                                pReport.addMatch(
                                    pCtrlNode,
                                    vRuleOffset,
                                    vDetectedNode
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
                        //res = await vRule.execute(this.project);

                        startTime = (new Date()).getTime();
                        res = await vRule.execute(this.project);
                        Logger.info(` Execute [${vIndex}][${vRuleOffset}] : (ms) ${Math.floor((new Date()).getTime()-startTime)} : ${res.count()}`);

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


    private async _getNodeByRef(pProject:DexcaliburProject, pRef:INodeRef):Promise<Nullable<INode>> {

        let node = pProject.getAnalyzer().searchNode(pRef.__, pRef._uid);
        if(node!=null) return node;

        console.log(`[SCANNER][MATCH NOT FOUND IN MEMORY. TRY MERLIN IN MEM] ${pRef.__} ${pRef._uid}`);
        let res:FinderResult = await (MerlinSearchRequest.getByRef(pRef,pProject.getMerlinEngine() )).execute(pProject);



        if(res.count()===0){
            console.log(`[SCANNER][MATCH NOT FOUND IN MEMORY. TRY MERLIN IN PDB] ${pRef.__} ${pRef._uid}`);
            res = await (MerlinSearchRequest.getByRef(pRef,pProject.getMerlinEngine() )).executePDB(pProject);
            if(res.count() === 0){
                console.log(`[SCANNER][MATCH NOT FOUND IN DB] ${pRef.__} ${pRef._uid}`);
                return null;
            }
        }


        return (res.count()>0 ? res.get(0) : null);
    }
    /**
     * To filter matches to remove
     *
     * @private
     */
    private async _filterMatches(pProject:DexcaliburProject, pPre:MatchOccurence<INode>[]):Promise<MatchOccurence<(INode|INodeRef)>[]> {
        const post:MatchOccurence<(INode|INodeRef)>[] = [];
        let occ:MatchOccurence<(INode|INodeRef)>;
        let n:any;
        let search:FinderResult;
        let meta:Metadata[] = [];

        const intern:Tag = pProject.getTagManager().getTag("discover.internal");

        for(let i=0; i<pPre.length; i++){

            occ = pPre[i];

            if(occ.node==null) /* skip */ continue;



            switch (occ.node.__){
                case NodeInternalType.STRING:
                    if((occ.node as ModelStringValue).src!=null){

                        if((occ.node as any).src!=null && !Array.isArray((occ.node as any).src)){
                            throw Error(`Strings src not an array : ${occ.node.__} ${occ.node._uid}`);
                        }

                        if((occ.node as INode).tags!=null
                            && (occ.node as INode).tags.indexOf(intern.getUUID())>-1
                            && (occ.node as any).tags.length===1){
                            // exclude internal strings
                            continue;
                        }

                        // replace original ModelStringValue match by related sources where the strings appears

                        for(let k=0; k<(occ.node as ModelStringValue).src.length;k++){
                            n = (occ.node as ModelStringValue).src[k];

                            if(n.__==NodeInternalType.STRING) return /* avoid infinite loop */;


                            if((n as INode).tags!=null
                                && (n as INode).tags.length==1
                                && (n as INode).tags.indexOf(intern.getUUID())>-1){
                                // skip
                                continue;
                            }

                            if(n.getUID==null){
                                n = await this._getNodeByRef( pProject, n);
                                if(n == null) n = (occ.node as ModelStringValue).src[k];
                            }

                            if(occ.meta!=null){
                                occ.meta.map( (vMeta)=>{
                                    meta.push(vMeta);
                                });
                            }

                            post.push({
                                node: n,
                                ruleIdx: occ.ruleIdx,
                                meta: meta/*{
                                    type: MetadataType.ANY,
                                    key: MetadataTopic.EXTRACT,
                                    value: {
                                        __:NodeInternalType.STRING,
                                        _uid: (occ.node as ModelStringValue).src[k].getUID()
                                    }
                                }*/
                            });
                        }

                        continue;
                    }else{
                        throw Error("Strings src null ");
                    }
                    break;
                case NodeInternalType.CLASS:
                case NodeInternalType.PACKAGE:
                case NodeInternalType.METHOD:
                case NodeInternalType.FIELD:
                default:

                    if((occ.node as INode).tags!=null
                        && (occ.node as any).tags.length==1
                        && (occ.node as INode).tags[0]===intern.getUUID()){
                        // skip match in device code
                        continue;
                    }
                    break;
            }

            post.push(occ);
        }

        return post;
    }


    private _deduplicateNode( pMatches:MatchOccurence<(INode|INodeRef)>[] ):MatchOccurence<(INode|INodeRef)>[] {



        let singles:Record<number,Record<string, MatchOccurence<(INode|INodeRef)>>> = {};
        let cleaned:MatchOccurence<(INode|INodeRef)>[] = [];
        let occ:MatchOccurence<(INode|INodeRef)>;
        let uid:string;

        for(let i=0; i<pMatches.length;i++){
            occ = pMatches[i];

            if(singles[occ.node.__]==null) singles[occ.node.__]={};

            if((occ.node as any).getUID != null){
                uid = (occ.node as INode).getUID();
            }else{
                uid = (occ.node as INodeRef)._uid;
            }

            if(singles[occ.node.__][uid]==null){
                singles[occ.node.__][uid]= occ;
                if(occ.meta==null) occ.meta=[];
            }

            // 5'''. Update metadata (merge)
            if(occ.meta !=null && occ.meta.length>0){
                singles[occ.node.__][uid].meta = singles[occ.node.__][uid].meta.concat(occ.meta);

                /*
                singles[occ.node.__][uid].meta.push({
                    type: MetadataType.TEXT,
                    key: MetadataTopic.EXTRACT,
                    value: { tags: occ.node.tags }
                });*/
            }
        }

        Object.values(singles).map(x => cleaned = cleaned.concat(Object.values(x)));

        return cleaned;
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


        Logger.info(chalk.yellow(`ACTIVATED POLICIES : ${Object.values(policies).map(x => x.id).join(" , ")}`));

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
                    //await this._iastScan( this.report, vStep.controls, pOptions);
                    break;
                default:
                    Logger.info("[SCAN][NOT SUPPORTED][STEP="+vStep.type+"] model="+this.model.getID());
                    break;
            }
            return next;
        });

        const matchUIDs = this.report.getRawMatchUIDs();
        let m:Match;
        let filteredOcc:MatchOccurence<any>[];


        // 4. Deduplicate matching node, potentially resulting from different rules in same ctrl
        // (merge matching ctrl ID / rule in metadata)

        for(let i=0; i<matchUIDs.length; i++){
            m =  this.report.getRawMatch(matchUIDs[i]);
            this.report.setRawMatchOccurences(
                matchUIDs[i],
                this._deduplicateNode( m.match )
            );
        }


        // 6. post process : cross results
        if(pOptions.extraScan!==true && (policies["analyze_tp_sdk"]!=null || policies["analyze_pii"]!=null)){
            try{
                this.report = await this._crossReportConsolidating(this.report,true);
            }catch (e){
                console.error(e.stack);
            }
        }


        // 3 : Filter / transform results
       //if(pOptions.extraScan!==true){
            for(let i=0; i<matchUIDs.length; i++){
                m =  this.report.getRawMatch(matchUIDs[i]);
                filteredOcc = await this._filterMatches( pContext, m.match);
                if(filteredOcc.length>0){
                    this.report.setRawMatchOccurences(
                        matchUIDs[i],
                        filteredOcc
                    );
                }else{
                    this.report.removeRawMatch(matchUIDs[i]);
                }
            }
        //}


        // 5. Explain report (explain results with model)
        if(pOptions.extraScan!==true){
            this.report.build({
                sampling: true,
                samplingSize: 100,
                groupSampleByNode: true,
                embedKpis: true,
                clean: true
            });
        }else{
            this.report.build({
                sampling: false,
                //samplingSize: 100,
                //groupSampleByNode: true,
                //embedKpis: false,
                clean: true
            });
        }


        // 6. post process : cross results
        /*if(policies["analyze_tp_sdk"]!=null || policies["analyze_pii"]!=null){
            try{
                this.report = await this._crossReportConsolidating(this.report);
            }catch (e){
                console.error(e.stack);
            }
        }*/


        // 7. Apply policies
        if(policies["require_consent"]!=null){
            if(policies["require_consent"].thresholds.length>0){
               await this._verifyConsent(this.report, policies["require_consent"]);
            }
        }

        // 8. Compute KPIs
        if(pOptions.extraScan!==true){
            const kpiBuilder = new IndicatorBuilder({});
            for(let i=0; i<this.model.indicators.length;i++){
                this.report.addIndicator(
                    await kpiBuilder.process( this.report, this.model.indicators[i])
                );
            }
        }


        // 8. result
        this.report.terminated = (new Date()).getTime();

        // 9. Save
        if(pOptions.extraScan!==true){
            this.reports.push(this.report);
            AuditManager.getInstance().saveReport(pContext, this.report);
        }
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

                        tree[n.node.__][n.node.uid][ecuid].push(n.ruleIdx);
                    }
                })
            }
        }

        return tree;
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
    private _buildControlTreeNodeFromMatches(pCtrls:ControlNode[]) : NodeMatchTree {

        // sort extra matches by noderef
        let tree:NodeMatchTree = {};
        let n:ControlNode;
        let ns:ControlNode[];

        function walk(pNode:ControlTree){
            for(let uid in pNode.children){
                n = pNode.children[uid];
                ns = Object.values(n.children);

                if(ns.length>0){
                    walk(n.children);
                }

                if(n.ctrl !=null && n.ctrl.matches.length>0){
                    n.ctrl.matches.map( occ => {
                        if(occ.node!=null){
                            if(tree[occ.node.__]==null){
                                tree[occ.node.__] = {};
                            }

                            const node_uid = (occ.node.getUID!=null ? occ.node.getUID() : occ.node._uid);
                            if(tree[occ.node.__][node_uid]==null){
                                tree[occ.node.__][node_uid] = {};
                            }
                            if(tree[occ.node.__][node_uid][n.canonicalID]==null){
                                tree[occ.node.__][node_uid][n.canonicalID] = []
                            }

                            tree[occ.node.__][node_uid][n.canonicalID].push(occ.ruleIdx);
                        }
                    })
                }
            }
        }

        const root:ControlTree = {};


        pCtrls.map(x => {
            walk(x);
        });

        //dump tree
        let m = 0;
        for(let c in tree){
            console.log(c);
            for(let u in tree[c]){
                console.log("\t"+u);
                for(let ecuid in tree[c][u]){
                    m += tree[c][u][ecuid].length;
                    console.log("\t\t"+ecuid+"\t\t"+tree[c][u][ecuid].length);
                }
            }
        }
        console.log("total extra match :"+m);

        return tree;
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
    private _buildControlTreeNodeFromRawMatches(pRaw:Record<string, Match>) : NodeMatchTree {

        let tree:NodeMatchTree = {};

        for(let uid in pRaw){
            pRaw[uid].match.map( occ => {
                if(occ.node!=null){
                    if(tree[occ.node.__]==null){
                        tree[occ.node.__] = {};
                    }
                    if(tree[occ.node.__][occ.node._uid]==null){
                        tree[occ.node.__][occ.node._uid] = {};
                    }
                    if(tree[occ.node.__][occ.node._uid][uid]==null){
                        tree[occ.node.__][occ.node._uid][uid] = []
                    }

                    tree[occ.node.__][occ.node._uid][uid].push(occ.ruleIdx);
                }
            })
        }


        //dump tree
        let m = 0;
        for(let c in tree){
            console.log(c);
            for(let u in tree[c]){
                console.log("\t"+u);
                for(let ecuid in tree[c][u]){
                    m += tree[c][u][ecuid].length;
                    console.log("\t\t"+ecuid+"\t\t"+tree[c][u][ecuid].length);
                }
            }
        }
        console.log("total extra match (raw) :"+m);

        return tree;
    }

    private async _consolidateOnJoin( pModel:AssuranceModelUUID, pExtraTree:NodeMatchTree,
                                      pUpdatedReport:AssuranceReport):Promise<AssuranceReport> {
        let n:any[];
        let m:IControl;
        let c:ControlNode;

        for(let i=0; i<pUpdatedReport.matches.length; i++){

            c = pUpdatedReport.searchControlNode(pUpdatedReport.matches[i]);

            if(c==null) continue;

            c.ctrl.matches.map( occ => {
                if(occ.node==null) /* skip */ return;

                let ref = (occ.node.getUID!=null ? NodeUtils.asNodeRef(occ.node) : occ.node);

                let xref:any = pExtraTree[ref.__];
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

        return pUpdatedReport;
    }

    private async _consolidateOnRawJoin( pModel:AssuranceModelUUID, pExtraTree:NodeMatchTree,
                                      pUpdatedReport:AssuranceReport):Promise<AssuranceReport> {

        const raw = pUpdatedReport.getRawMatches();

        for(let uid in raw){
            raw[uid].match.map( occ => {

                if(occ.node==null) /* skip */ return;

                let ref = (occ.node.getUID!=null ? NodeUtils.asNodeRef(occ.node) : occ.node);

                let xref:any = pExtraTree[ref.__];
                if(xref==null) return;
                xref = xref[ref._uid];
                if(xref==null) return;

                // a match in privacy.trackers.shared also exists in pii3
                if(occ.meta==null) occ.meta = [];


                for(let ecuid in xref){
                    console.log(`[On Raw join] ${uid} => ${ref.__} ${ref._uid} => ${ecuid}`);
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
            })
        }

        return pUpdatedReport;
    }

    private async _consolidateOnXref( pModel:AssuranceModelUUID, pExtraTree:NodeMatchTree,
                                         pUpdatedReport:AssuranceReport):Promise<AssuranceReport> {

        const raw = pUpdatedReport.getRawMatches();

        // create node tree from matches on ModelCall
        if(pExtraTree[NodeInternalType.CALL]==null) return pUpdatedReport;

        const tree:NodeMatchTree = {};
        let c:ModelCall, n:INode;
        for(let k in pExtraTree[NodeInternalType.CALL]){
            n = await this._getNodeByRef( this.project, {
                __: NodeInternalType.CALL,
                _uid: k
            });

            if(n!=null) {
                c = (n as ModelCall);
                ['_called','_caller'].map(x => {
                    if(c[x]!=null){
                        if(tree[c[x]]==null)
                            tree[c[x]] = {};

                        if(tree[c[x]][c._uid]==null)
                            tree[c[x]][c._uid] = pExtraTree[NodeInternalType.CALL][k];
                    }
                });
            }
        }

        for(let uid in raw){
            raw[uid].match.map( occ => {

                if(occ.node==null) /* skip */ return;

                let ref = (occ.node.getUID!=null ? NodeUtils.asNodeRef(occ.node) : occ.node);

                let xref:any = tree[ref.__];
                if(xref==null) return;
                xref = xref[ref._uid];
                if(xref==null) return;

                // a match in privacy.trackers.shared also exists in pii3
                if(occ.meta==null) occ.meta = [];


                for(let ecuid in xref){
                    console.log(`[On Xref] ${uid} => ${ref.__} ${ref._uid} => ${ecuid}`);
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
            })
        }

        return pUpdatedReport;
    }

    /**
     * To search linked occurrences over 2 reports
     * Link is established if:
     * - a node in occurrence 1 from report A, exists also in occurrence 2 from report B
     *
     * @param {AssuranceReport} pReport Report to update
     * @private
     */
    private async _crossReportConsolidating(pReport:AssuranceReport, pOnRaw = false):Promise<AssuranceReport> {

        Logger.info(chalk.yellow("Cross analysis policy enabled"));

        const cross:any = {
            "privacy.pii3":"privacy.trackers.shared",
            "privacy.trackers.shared":"privacy.pii3",
        }

        if(cross[this.model.getID()]==null) return pReport;

        const extraModelUID = cross[this.model.getID()];
        const extraModel = await this.project.getContext().getAuditManager().getModelByUID(
            this.project.getContext().getInternalAcc(),
            cross[this.model.getID()]
        )

        // instead of getting existing report, perform scan and get unfiltered report
        const crossReport:AssuranceReport = await this._extraRun(
            this.project, extraModel
        );

        // await this._getExtraReport(extraModel);
        let extraTreeNode:NodeMatchTree = {};
        let m:any;

        if(crossReport!=null && crossReport.controls!=null){

            // sort extra matches by noderef
            extraTreeNode = this._buildControlTreeNodeFromMatches(crossReport.controls);

            // search directly
            if(pOnRaw){
                pReport = await  this._consolidateOnRawJoin(extraModelUID, extraTreeNode, pReport);
            }else{
                pReport = await this._consolidateOnJoin(extraModelUID, extraTreeNode, pReport);
            }

            // 1st level intersection (search in both parts of ModelCall)
            if(pOnRaw){
                pReport = await  this._consolidateOnXref(extraModelUID, extraTreeNode, pReport);
            }


            // Parent intersection (class or package)

        }

        return pReport;
    }

    /**a
     * To scan existing data
     *
     * @private
     */
    private async _staticScan( pReport:AssuranceReport, pControlNodes:ControlNode[], pOptions:GenericScanOptions):Promise<void[]> {
        const max = pControlNodes.length;
        let passed = 0;
        return await Promise.all(pControlNodes.map(async (vCtrl, vI) => {

            Logger.info(`Start SAST Assessment : ${vI} / ${max}`);
            await this.doAssessment(pReport, vCtrl, vI);
            passed++;
            Logger.info(`${passed} / ${max}`);
        }));
    }

    private async _iastScan( pReport:AssuranceReport, pControlNodes:ControlNode[], pOptions:GenericScanOptions):Promise<void[]> {
        const max = pControlNodes.length;
        let passed = 0;
        return await Promise.all(pControlNodes.map(async (vCtrl, vI) => {

            Logger.info(`Start IAST Assessment : ${vI} / ${max}`);
            await this.doAssessment(pReport, vCtrl, vI);
            passed++;
            Logger.info(`${passed} / ${max}`);
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
        if(pOptions.extraScan==null) pOptions.extraScan = false;

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

    /**
     * To perform a scan of the same DexcaliburProject with the same scanner type but
     * versus a different model.
     *
     * @param {DexcaliburProject} pContext
     * @param {AssuranceModel} pModel
     * @async
     * @private
     */
    private async _extraRun( pContext:DexcaliburProject, pModel:AssuranceModel):Promise<AssuranceReport>{

        const extScanner = new PrivacyScanner({ project:pContext });
        extScanner.setModel(pModel);

        if(extScanner.model==null){
            throw AssuranceScannerException.MODEL_UNDEFINED(extScanner.name, pContext.getUID());
        }

        if(extScanner._searchContext==null){
            extScanner._searchContext = new MerlinSearchAPI<AnalyzerDatabase>(pContext.getSearchEngine().getDatabase());
        }

        Logger.info(`[SCANNER][${extScanner.name}] Start extra scan of model [model=${extScanner.model.getUID()}]`);

        await extScanner._firstScan( this.project, {
            extraScan: true
        });
        Logger.info(`[SCANNER][${extScanner.name}] Extra scan [model=${extScanner.model.getUID()}] is done.` );

        return extScanner.getReport();
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

        CoreDebug.checkJsonSerialize(o, "PrivacyScanner");

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
        let c:Nullable<ControlNode> = null;

        if(purps==null || purps.length==0) return;

       /* if(pReport.modelInfo.uid=="privacy.pii3"){

            const trackerModel = await this.project.engine.getAuditManager()
                .getModelByUID(
                    this.project.engine.getInternalAcc(),
                "privacy.trackers.shared"
                );

            for(let i=0; i<pReport.matches.length; i++){

                c = pReport.searchControlNode(pReport.matches[i]);

                if(c==null) continue;

                c.ctrl.matches.map( occ => {

                    if(occ.meta!=null && Array.isArray(occ.meta)){
                        const ctrls = occ.meta.filter(x => (x.key===MetadataTopic.CTRL && x.value.model==="privacy.trackers.shared"));

                        if(ctrls.length>0){
                            const ectrl = trackerModel.getControlNode(ctrls[0].value.ctrl);
                            if(ectrl==null){ return;  }

                            const req = ectrl.metadata.filter(x =>{
                                return ((x.key===MetadataTopic.PURPOSE) && (purps.indexOf(x.value)>-1));
                            });

                            if(req.length>0){
                                occ.meta.push({
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
                });

                // m.assessment =>W ControlAssessment
                // m.match => [ { node: <INode>, ruleIdx: <offset> }, ... ]
            }

        }else{*/
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
        // }
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