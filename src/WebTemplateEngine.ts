
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

import * as _path_ from "path";
import * as _fs_ from 'fs';
import Util from "./Utils.js";

// Replace 'pattern' by 'replace" in 'source' buffer and 
// return the new buffer
function BufferReplace(source:Buffer, pattern:string, replace:string):string{
    let bo:Buffer = Buffer.alloc(source.length + replace.length - pattern.length);
    let off:number = source.indexOf(pattern);

    source.copy(bo, 0, 0, off);

    let rep:Buffer = Buffer.from(replace, 'binary');
    rep.copy(bo, off, 0, replace.length);

    source.copy(bo, off + replace.length, off + pattern.length, source.length);

    return bo.toString('utf8');
}

const TPL_TOKEN = new RegExp("<!--##\\s*(.+)\\s+##-->");

/**
 * Minimalistic template engine replace token by file content
 * (as old Apache module SSI)
 * 
 * @class
 */
export default class WebTemplateEngine
{
    tokens:any = null;
    root:string = null;

    constructor() {
        this.tokens = {};
        this.root = _path_.join( Util.__dirname(import.meta.url), "webserver", "public");
    }

    
    /**
     * To replace token by the corresponding file content  before
     * to send the HTTP response to the client.
     * 
     * Token should take the form <!--## file/path/to/tpl.html ##-->
     * 
     * @param {*} data 
     */
    process(data:string|Buffer):string{
        let m:RegExpExecArray = null, tpl:string = null, match:boolean = false;
        do {
            m = TPL_TOKEN.exec((data instanceof Buffer)? data.toString('utf8') : (data as string));

            if (m == null || m.length < 2) {
                break;
            }
            tpl = _fs_.readFileSync(_path_.join(this.root, m[1]), 'binary');

            // data = data.replace(m[0], fs.readFileSync(this.root+m[1]));
            data = BufferReplace((typeof data ==='string'?Buffer.from(data):data), m[0], tpl);
        } while (TPL_TOKEN.test(data));

        if(data instanceof Buffer) data = data.toString('utf8');

        return (data as string);
    }
}
