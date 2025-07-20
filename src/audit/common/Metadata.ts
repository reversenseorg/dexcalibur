import {DataOperation, MetadataTopic} from "./ControlAssessment.js";

export enum MetadataType {
    TEXT,
    ANY,
    URI,
    PARAM
}

export interface Metadata {
    key:string|MetadataTopic;
    type:MetadataType;
    value:any|DataOperation;
}