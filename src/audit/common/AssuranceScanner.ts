import {Product, ProductOptions} from "../../credit/Product.js";
import AssuranceModel from "./AssuranceModel.js";
import {DashBoard} from "./DashBoard.js";
import AssuranceReport from "./AssuranceReport.js";
import CodeThreat, {CodeConstraintMap} from "./CodeThreat.js";
import {NodeInternalType, NodeInternalTypeName}
from "@dexcalibur/dxc-core-api";;
import DexcaliburProject from "../../DexcaliburProject.js";
import ModelMethod from "../../ModelMethod.js";
import CodeConstraint from "./CodeConstraint.js";
import {TestPlan} from "./TestPlan.js";
import { ReversenseProductUUID} from "../../billing/ReversenseProduct.js";
import ModelStringValue from "../../ModelStringValue.js";

export interface AssuranceScannerOptions extends ProductOptions {

    name?:string;

    model?: AssuranceModel;

    dashboards?:{[name:string] :DashBoard};


}


export type AssuranceScannerUID = string | ReversenseProductUUID;


/**
 * Generic scanner for any assurance model instance
 */
export class AssuranceScanner extends /* ReversenseProduct */ Product {


    static DEFAULT_NAME = "scanner.base";

    /**
     * Unique ID for Scanners
     */
    name:AssuranceScannerUID

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

    getUID():AssuranceScannerUID {
        return this.name;
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
            started:(new Date()).getTime(),
            project: pContext.getUID(),
            _proj: pContext
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
                        .map((vIndex, vData:ModelStringValue)=>{
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


    free():void{
        // nothing to do
    }

    computeKPI():void {

    }

    public _prepareTestPlan(pContext:DexcaliburProject):TestPlan {
        return new TestPlan();
    }

    runModel(pContext:DexcaliburProject):any{

    }
}