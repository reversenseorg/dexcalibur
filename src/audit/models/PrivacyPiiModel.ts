import AssuranceModel from "../common/AssuranceModel.js";
import Control from "../common/Control.js";
import ControlAssessment, {AnalysisType, TestType} from "../common/ControlAssessment.js";
import {PII_Data} from "../privacy/assets/pii_schema.js";
import {PiiClass} from "../privacy/pii/PiiClass.js";
import {MerlinSearchRequest} from "../../search/MerlinSearchRequest.js";


const model = new AssuranceModel({
    id: "privacy.pii",
    scannerID:"scanner.generic",
    name: "Personal Identifiable Information",
    description: "N/A",
    links: [],
    controls:[]
});


let ctrl:Control, ctrl2:Control, ctrl3:Control, assess:ControlAssessment;
let piiCls:PiiClass;

for(let piiClassName in PII_Data){

    piiCls = PII_Data[piiClassName];

    ctrl = new Control({
        id: piiClassName,
        name: piiCls.name,
        description: piiCls.description,
        children:[]
    });

    piiCls.categories.map( piiCat => {

        ctrl2 = new Control({
            id: piiCat.name,
            name: piiCls.name,
            description: piiCls.description,
            children:[]
        });

        piiCat.types.map( piiType => {

            if(piiType.fields.length > 0){

                ctrl3 = new Control({
                    id: piiType.name,
                    name: piiType.name,
                    description: piiType.description,
                    children:[]
                });

                piiType.fields.map( piiField => {
                    assess = new ControlAssessment({
                        id: piiField.name,
                        name: piiField.name,
                        description: piiField.description,
                        testType: TestType.VT,
                        analType: AnalysisType.SAST,
                        rules:[]
                    });

                    piiField.rules.map( rule => {
                        assess.rules.push(rule as MerlinSearchRequest);
                    });

                    ctrl3.assessments.push(assess);
                });
            }else{
                assess = new ControlAssessment({
                    id: piiType.name,
                    name: piiType.name,
                    description: piiType.description,
                    testType: TestType.VT,
                    analType: AnalysisType.SAST,
                    rules:[]
                });

                piiType.rules.map( rule => {
                    assess.rules.push(rule as MerlinSearchRequest);
                });

                ctrl2.assessments.push(assess);
            }
        })
    });
}

export const PrivacyPiiModel = model;