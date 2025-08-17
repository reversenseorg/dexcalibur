import {Metadata} from "./Metadata.js";
import {MatchOccurence} from "./Match.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";

export interface IControl {
    __:NodeInternalType;
    id:string;
    name:string;
    description:string;
    metadata:Metadata[];
    matches:MatchOccurence<any>[];
    isControlAssessment():boolean;
    isControl():boolean;
}