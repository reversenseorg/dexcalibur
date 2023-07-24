import {Product, ProductOptions} from "../../credit/Product.js";
import AssuranceModel from "./AssuranceModel.js";
import {DashBoard} from "./DashBoard.js";
import AssuranceReport from "./AssuranceReport.js";
import Asset from "./Asset.js";
import CodeThreat, {CodeConstraintMap} from "./CodeThreat.js";
import {NodeInternalType, NodeInternalTypeName} from "../../NodeInternalType.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import Util from "../../Utils.js";
import {PrivacyFinding, PrivacyFindingType} from "../privacy/PrivacyFinding.js";
import {TrackerInfo} from "../privacy/TrackerInfo.js";
import ModelClass from "../../ModelClass.js";
import ModelMethod from "../../ModelMethod.js";
import CodeConstraint from "./CodeConstraint.js";
import Threat from "./Threat.js";
import { ConstraintMatch } from "./ConstraintMatch.js";
import ModelString from "../../ModelString.js";
import {MerlinSearchAPI} from "../../search/MerlinSearchAPI.js";
import {TestPlan} from "./TestPlan.js";

export interface AssuranceScannerOptions extends ProductOptions {

    name?:string;

    model?: AssuranceModel;

    dashboards?:{[name:string] :DashBoard};


}




/**
 * Generic scanner for any assurance model instance
 */
export class AssuranceScanner extends Product {

    /**
     * Unique ID for Scanners
     */
    name:string;

    project:DexcaliburProject|null;

    model:AssuranceModel;

    report:AssuranceReport|null = null;

    reports:AssuranceReport[] = [];


    dashboards:{[name:string] :DashBoard} = {};

    private _prepareFlag = false;

    private _codeConstr:CodeConstraintMap = {};



    constructor(pConfig:AssuranceScannerOptions) {
        super(pConfig);

        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

    setModel(pModel:AssuranceModel):void {
        this.model = pModel;
        this.dashboards = {};
        this._prepareFlag = false;
    }

    /**
     * Browse Assurance model
     *
     * @param pContext
     * @param pOptions
     */
    run( pContext:DexcaliburProject, pOptions:any){
        this.staticScan(pContext, pOptions);
    }

    staticScan(pContext:DexcaliburProject, pOptions:any):void {
        this.report = new AssuranceReport({
            time:(new Date()).getTime(),
            project: pContext
        });

        const plan:CodeConstraintMap = {};

        // optimize code constraints
        if(!this._prepareFlag){
            this._mergeCodeConstraints();
            this._prepareFlag = true;
        }

        // scan
        const searchAPI = pContext.getSearchEngine();
        const tagMgr = pContext.getTagManager();

        Object.keys(this._codeConstr).map((vNodeType)=>{

            console.log("CodeConstraintMap ["+NodeInternalTypeName[parseInt(vNodeType)]+"] entries= "+this._codeConstr[vNodeType].length);
            switch (parseInt(vNodeType)){
                case NodeInternalType.METHOD:
                    searchAPI
                        .getDatabase()
                        .methods
                        .map((vIndex, vData:ModelMethod)=>{
                            this._codeConstr[vNodeType].map( (vConstraint:CodeConstraint) => {
                                if((new RegExp(vConstraint.pattern)).test(vData.getUID())){
                                    console.log(`Constraint Match [method=${vConstraint.pattern}] > ${vData.getUID()}`); //`"vMatchingNode.name);
                                    this.report.addCodeMatch(vConstraint, vData);
                                }
                            });
                        });

                    /*
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
                        });*/
                    break;
                case NodeInternalType.CLASS:
                    searchAPI
                        .getDatabase()
                        .classes
                        .map((vIndex, vData:ModelMethod)=>{
                            this._codeConstr[vNodeType].map( (vConstraint:CodeConstraint) => {
                                if((new RegExp(vConstraint.pattern)).test(vData.getUID())){
                                    console.log(`Constraint Match [class=${vConstraint.pattern}] > ${vData.getUID()}`); //`"vMatchingNode.name);
                                    this.report.addCodeMatch(vConstraint, vData);
                                }
                            });
                        });

                    break;
                case NodeInternalType.STRING:
                    searchAPI
                        .getDatabase()
                        .strings
                        .map((vIndex, vData:ModelString)=>{
                            this._codeConstr[vNodeType].map( (vConstraint:CodeConstraint) => {
                                if((new RegExp(vConstraint.pattern)).test(vData.value)){
                                    console.log(`Constraint Match [string=${vConstraint.pattern}] > ${vData.value}`); //`"vMatchingNode.name);
                                    this.report.addCodeMatch(vConstraint, vData);
                                }
                            });
                        });

                    break;
            }
        })
    }

    merlinScan(pContext:DexcaliburProject, pOptions:any):void {}

    getReport():AssuranceReport|null {
        return this.report;
    }


    getReports():AssuranceReport[] {
        return this.reports;
    }




    private _mergeCodeConstraints():void {

        const codeThreats = this.model.getCodeThreats();
        this._prepareThreats(codeThreats);

        // const codePii = this.model.getPrimaryAssets();
        // this._scanPii(codePii);

    }

    private _prepareThreats(  pThreats:CodeThreat[]):void {
        if(pThreats.length==0) return;

        pThreats.map((vThreat)=>{
            const node = vThreat.listPerNodeType();
            for(let nType in node){
                if(this._codeConstr[nType]==null) this._codeConstr[nType] = [];
                this._codeConstr[nType] = this._codeConstr[nType].concat(node[nType]);
            }
        });
    }


    validateOptions( pUnsafeOptions:any):any {
        return {};
    }


    public _prepareTestPlan():TestPlan {
        return new TestPlan();
    }
}