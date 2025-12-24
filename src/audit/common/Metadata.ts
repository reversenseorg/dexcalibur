import {DataOperation, MetadataTopic} from "./ControlAssessment.js";
import {IJSONSchema} from "@dexcalibur/dexcalibur-orm";

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

export const MetadataJsonSchema:IJSONSchema = {
    type:"object",
    properties:{
        key:{
            anyOf:[
                {type: "string"},
                {type: "string", enum: Object.values(MetadataTopic)}
            ]
        },
        type:{ type: "number", enum: Object.values(MetadataType) },
        value:{
            anyOf:[
                {type: "string"},
                {type: "object"},
                {type: "number", enum: Object.values(DataOperation)}
            ]
        }
    }
}