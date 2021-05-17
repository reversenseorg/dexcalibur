import {Core} from "./Core";


export default class JavaHelper extends Core.External.ExternalHelper {

    static getJRE():string {
        if(process.env.DEXCALIBUR_JAVA != null){
            return process.env.DEXCALIBUR_JAVA;
        }else{
            return JavaHelper.getExtPath();
        }
    }
}