import {External} from "./external/External";
import * as _os_ from "os";

const WIN_CMD = "cmd.exe";
const UNIX_CMD = '/bin/sh'

export default class ShellHelper extends External.ExternalHelper {

    /**
     * Internal shell/os -specific escape function
     */
    static _os_escape:Function;

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
