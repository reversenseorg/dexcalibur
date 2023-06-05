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
export class PrivacyModel extends AssuranceModel {


    constructor( pConfig:any = null) {
        super({
            id: "privacy.generic",
            scannerID: "scanner.privacy"
        });

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }


    loadPII(){
        let  cls:PiiClass;
        for(let name in PII_Data){
            cls = PII_Data[name];
            cls.categories.map( vCat => {
                vCat.types.map( vType => {
                    if(vType.fields.length>0){
                        vType.fields.map( vField => {
                            const field = new PiiField(vField);
                            field.name = cls.name+':'+vCat.name+':'+vType.name+':'+vField.name;
                            this.primaryAssets.push(field);
                        });
                    }else{
                        const type = new PiiType(vType);
                        type.name = cls.name+':'+vCat.name+':'+vType.name;
                        this.primaryAssets.push( type);
                    }
                })
            });
        }
    }

    load():void {
        //
        this.loadPII();
    }
}