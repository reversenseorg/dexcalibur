import * as _util_ from "util";
import * as _ps_ from "child_process";

const _exec_ = _util_.promisify(_ps_.exec);

import {External} from "./external/External.js";

export default class JavaHelper extends External.ExternalHelper {

    static getJRE():string {
        if(process.env.DEXCALIBUR_JAVA != null){
            return process.env.DEXCALIBUR_JAVA;
        }else{
            return JavaHelper.getExtPath();
        }
    }

    /**
     * To check if Java is installed and can be used
     *
     * @return {Promise<boolean>}  TRUE if ready, else FALSE
     * @async
     * @static
     * @method
     */
    static async check():Promise<boolean> {
        const out = await _exec_(
            JavaHelper.getJRE()+' --version'
        );

        return (out.stdout!=null) && (/Java.*SE Runtime Environment/.test(out.stdout));
    }
}