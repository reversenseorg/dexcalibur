import {DataOperation} from "./ControlAssessment.js";
import {IJSONSchema} from "@dexcalibur/dexcalibur-orm";

export enum MetadataType {
    TEXT,
    ANY,
    URI,
    PARAM
}


export enum MetadataTopic {
    DFLOW_STEP="step",
    IMPACT="impact",
    CRITICITY="criticity",
    GROUP='grp',
    CATEGORY='category',
    ADVISORY='recommandation',
    RECO="recommandation",
    COUNTRY='country',
    PURPOSE='sbom.purpose',
    WEBSITE='www',
    COMPANY='company',
    REVISION='rev',
    EXTRACT='ext',
    CTRL='ctrl',
    PREFERED_ABI='pabi',
    FILE_HEADER='file.header',
    FILE_DATA='file.data',
    OS='os',
    CPE_ID="cpeid",
    CVE_ID="cveid",
    CWE_ID="cweid",
    FUZZ="fuzz",
    KP="kp"
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