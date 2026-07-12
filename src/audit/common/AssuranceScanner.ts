/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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