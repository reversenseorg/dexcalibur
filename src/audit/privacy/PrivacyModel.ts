import AssuranceModel from "../common/AssuranceModel.js";
import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../../Utils.js";
import {TrackerInfo} from "./TrackerInfo.js";
import {ThreatFactory} from "../common/ThreatFactory.js";
import CodeConstraint from "../common/CodeConstraint.js";
import {NodeInternalType} from "../../NodeInternalType.js";


export class PrivacyModel extends AssuranceModel {



    constructor( pConfig:any = null) {
        super(pConfig);

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }


    loadTrackersSignatures():void {

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

            const threat = ThreatFactory.newCodeThreatByTechnic("T1195.001",{
                name: sig.name,
                id: sig.uid,
                refs: sig.refs
            });


            if(sig.networkSignature.length>0){
                sig.networkSignature.map((x)=>{
                    threat.appendSignature(new CodeConstraint(NodeInternalType.STRING,{
                        pattern: x.pattern,
                        el: threat
                    }));
                });
            }

            if(sig.codeSignature.length>0){
                sig.codeSignature.map((x)=>{
                    /*threat.appendSignature(new CodeConstraint(NodeInternalType.CLASS,{
                        pattern: x.pattern,
                        el: threat
                    }));*/
                    threat.appendSignature(new CodeConstraint(NodeInternalType.METHOD,{
                        pattern: x.pattern,
                        el: threat
                    }));
                });
            }


            this.globalThreats.push(threat);
        });
    }

    load():void {
        this.loadTrackersSignatures();
    }

}