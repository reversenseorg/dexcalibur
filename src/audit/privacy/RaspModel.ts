import AssuranceModel from "../common/AssuranceModel.js";
import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../../Utils.js";
import {TrackerInfo} from "./TrackerInfo.js";
import {ThreatFactory} from "../common/ThreatFactory.js";
import CodeConstraint from "../common/CodeConstraint.js";
import {NodeInternalType} from "../../NodeInternalType.js";
import {PII_Data} from "./assets/pii_schema.js";
import {PiiCategory} from "./pii/PiiCategory.js";
import {PiiClass} from "./pii/PiiClass.js";
import {PiiField} from "./pii/PiiField.js";
import {PiiType} from "./pii/PiiType.js";

/**
 * 
 */
export class RaspModel extends AssuranceModel {


    constructor( pConfig:any = null) {
        super({
            id: "rasp.generic",
            scannerID: "scanner.privacy"
        });

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }


    /**
     * To load trackers signatures and put it to threat list of the model
     *
     * @method
     */
    loadRASP():void {

        const rawData = JSON.parse(
            _fs_.readFileSync(
                _path_.join(
                    Util.__dirname(import.meta.url),
                    '..',
                    'kb',
                    'rasp.json'
                ), {encoding:'utf8'}
            ).toString()
        );

        rawData.products.map((vRaw)=>{

        });
    }

    load():void {
        // load trackers as threats
        this.loadRASP();
    }

}