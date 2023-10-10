import AssuranceModel from "../common/AssuranceModel.js";
import Control from "../common/Control.js";
import {Merlin} from "../../search/Merlin.js";
import ControlAssessment, {AnalysisType} from "../common/ControlAssessment.js";
import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../../Utils.js";
import {TrackerInfo} from "../privacy/TrackerInfo.js";
import {TestType} from "../common/TestPlan.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";


const model = new AssuranceModel({
    id: "privacy.trackers.shared",
    scannerID:"scanner.generic",
    name: "Privacy Trackers detection",
    description: "N/A",
    links: [],
    controls:[]
});

model.beforeLoad(async (pModel:AssuranceModel)=>{
    console.log("BEFORE LOAD MODEL");
    let server = DexcaliburEngine.getInstance().getSignatureServer();
    pModel.controls = await server.getTrackers();
    console.log("BEFORE LOAD MODEL 2", pModel.controls);
    pModel.updateControlTree(pModel.controls);
});

export const PrivacyTrackersModel = model;