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

import {External} from "./external/External.js";
import * as _os_ from "os";
import * as  _util_ from 'util';
import * as  _ps_ from 'child_process';
import Util from "./Utils.js";

const _exec_ = _util_.promisify(_ps_.exec);

const WIN_CMD = "cmd.exe";
const UNIX_CMD = '/bin/sh'

export default class ShellHelper extends External.ExternalHelper {

    /**
     * Internal shell/os -specific escape function
     */
    static _os_escape:Function;

    /**
     * To check if shell is installed and can be used
     *
     * @return {Promise<boolean>}  TRUE if ready, else FALSE
     * @async
     * @static
     * @method
     */
    static async check():Promise<boolean> {
        const cmd = ShellHelper.getExtPath("shell");
        const rand = Util.now();
        const out = await _exec_(
            `${cmd} -c "echo '${rand}'"`
        );

        return (out.stdout!=null)
            && ((new RegExp("^"+rand+"\n$")).test(out.stdout)) ;
    }

    static getDefaultPath():string {
        if(_os_.platform()=="win32"){
            return process.env.ComSpec!=null ? process.env.ComSpec : WIN_CMD;
        }else{
            return  UNIX_CMD;
        }
    }

    /**
     * To escape special character to prevent MS-DOS interpreting
     *
     * @param pString
     */
    static escapeMSDOS(pString:string):string {
        return pString.replace(/%/g,"%%").replace(/([|><&)(\s])/g,"^$1");
    }

    /**
     * To escape special character to prevent shell interpreting
     *
     * @param pString
     */
    static espaceShell(pString:string):string {
        return pString.replace(/([$|><&)(\s])/g,"\\$1");
    }

    /**
     * The generic wrapper for OS specific escape
     * @param pString
     */
    static escape( pString:string):string {
        return this._os_escape(pString);
    }
}

if(_os_.platform()=="win32"){
    ShellHelper._os_escape = ShellHelper.escapeMSDOS;
}else{
    ShellHelper._os_escape = ShellHelper.espaceShell;
}
