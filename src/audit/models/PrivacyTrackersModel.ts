import AssuranceModel from "../common/AssuranceModel.js";
import Control from "../common/Control.js";
import {Merlin} from "../../search/Merlin.js";
import ControlAssessment, {AnalysisType} from "../common/ControlAssessment.js";
import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../../Utils.js";
import {TrackerInfo} from "../privacy/TrackerInfo.js";
import {TestType} from "../common/TestPlan.js";


const model = new AssuranceModel({
    id: "privacy.trackers2",
    scannerID:"scanner.generic",
    name: "Privacy Trackers detection",
    description: "N/A",
    links: [],
    controls:[]
});


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

    const ctrl = new Control({
        id: sig.uid,
        name: sig.name,
        links: sig.refs,
    });


    /*const threat = ThreatFactory.newCodeThreatByTechnic("T1195.001",{
        name: sig.name,
        id: sig.uid,
        refs: sig.refs
    });*/

    let assessCtrl:ControlAssessment, assessCtrl2:ControlAssessment;

    if(sig.networkSignature.length>0){
        assessCtrl = new ControlAssessment({
            id: "network:uri",
            name: "URI Occurences",
            testType: TestType.STATIC_SCAN,
            analType: AnalysisType.SAST,
            rules: []
        });
        assessCtrl2 = new ControlAssessment({
            id: "network:uri_usage",
            name: "URI Usage",
            testType: TestType.IAST,
            analType: AnalysisType.SAST,
            rules: []
        });
        sig.networkSignature.map((x)=>{
            //assessCtrl.rules.push(Merlin.android().strings(`value:/${x.pattern}/`));
            assessCtrl.rules.push(Merlin.android().strings(`value:/${x.pattern}/`).filter(`@network.host.uri`));
            assessCtrl.rules.push(Merlin.android().strings(`value:/https?:\/\/.*${x.pattern}/`));
            assessCtrl2.rules.push(
                Merlin.android().strings( `value:/https?:\/\/.*${x.pattern}/`).on("network.uri.new")
            );
        });
        ctrl.assessments.push(assessCtrl);
        ctrl.assessments.push(assessCtrl2);
        //ctrl.assessments.push(assessCtrl);
    }

    if(sig.codeSignature.length>0){

        assessCtrl = new ControlAssessment({
            id: "code",
            name: "Object Occurencess",
            testType: TestType.STATIC_SCAN,
            analType: AnalysisType.SAST,
            rules: []
        })
        sig.codeSignature.map((x)=>{
            assessCtrl.rules.push(
                Merlin.android().method(`enclosingClass.name:/${x.pattern}/`)
            );
        });
        ctrl.assessments.push(assessCtrl);
    }


    model.controls.push(ctrl);
});

model.updateControlTree(model.controls);

export const PrivacyTrackersModel = model;