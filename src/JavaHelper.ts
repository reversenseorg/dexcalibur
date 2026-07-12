/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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