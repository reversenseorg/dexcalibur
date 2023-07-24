import {Metadata} from "./Metadata.js";

export interface IControl {
    id:string;
    name:string;
    description:string;
    metadata:Metadata[];
    isControlAssessment():boolean;
    isControl():boolean;
}