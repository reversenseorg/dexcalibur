import {CodeSignature} from "./CodeSignature.js";
import {NetworkSignature} from "./NetworkSignature.js";
import { TrackerCategory } from "./TrackerCategory.js";
import {NodeInternalType} from "../../../src/NodeInternalType.js";


interface ExodusTrackerJson{
    id:string;
    name:string;
    code_signature:string;
    network_signature:string;
    website:string;
    category:string[];
    is_in_exodus:boolean;
    documentation:string[];
}

export class TrackerInfo {

    uid:string = "";

    name:string = "";

    codeSignature:CodeSignature[] = [];
    networkSignature:NetworkSignature[] = [];

    category:TrackerCategory[] = [];

    website:string = "";

    refs:string[] = [];

    constructor( pConfig:any) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

    /**
     * To parse a raw object serialized using Exodus format
     *
     * @param {any} pRaw Poor js object
     * @return {TrackerInfo} Tracker metadata and signatures
     */
    static importFromExodus(pRaw:ExodusTrackerJson):TrackerInfo {
        const o = new TrackerInfo({});

        o.name = pRaw.name;
        o.uid = pRaw.id;
        o.refs = pRaw.documentation;

        if(pRaw.code_signature!=""){
            if(pRaw.code_signature.indexOf('|')>-1){
                pRaw.code_signature.split('|').map((vPattern)=>{
                    o.codeSignature.push(new CodeSignature(
                        NodeInternalType.PACKAGE,
                        vPattern
                    ));
                });
            }else{
                o.codeSignature.push(new CodeSignature(
                    NodeInternalType.PACKAGE,
                    pRaw.code_signature
                ));
            }
        }

        if(pRaw.network_signature!=""){
            if(pRaw.network_signature.indexOf('|')>-1){
                pRaw.network_signature.split('|').map((vPattern)=>{
                    o.networkSignature.push(new NetworkSignature(
                        "http",
                        vPattern
                    ));
                });
            }else{
                o.networkSignature.push(new NetworkSignature(
                    "http",
                    pRaw.network_signature
                ));
            }
        }

        o.website = pRaw.website;

        pRaw.category.map((vCat:string)=>{
            const cat = TrackerCategory.getInstance(vCat);
            cat.addTracker(o);
        });

        return o;
    }
}