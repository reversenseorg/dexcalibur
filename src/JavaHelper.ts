import {External} from "./external/External.js";

export default class JavaHelper extends External.ExternalHelper {

    static getJRE():string {
        if(process.env.DEXCALIBUR_JAVA != null){
            return process.env.DEXCALIBUR_JAVA;
        }else{
            return JavaHelper.getExtPath();
        }
    }
}