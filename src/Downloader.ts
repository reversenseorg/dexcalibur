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
import * as _fs_ from "fs";
import * as _url_ from "url";

import * as Got from "got";
const got = Got.default;
import * as _stream_ from "stream";
import {promisify} from "util";

const pipeline = promisify(_stream_.pipeline);

import DexcaliburWorkspace from './DexcaliburWorkspace.js';
import Util from './Utils.js';


/**
 * @class
 * @author Georges-B. MICHEL
 */
export default class Downloader
{

    /**
     * 
     * @param {*} pRemoteURL 
     * @param {*} pLocalPath 
     * @param {*} pOptions 
     * @static
     * @method
     * @async
     */
    static async download( pRemoteURL:string, pLocalPath:string, pOptions:any = { force: false } ):Promise<string>{

        if( (_fs_.existsSync(pLocalPath) == true) && pOptions.force ){
            _fs_.unlinkSync(pLocalPath);
        }
        
        // download file
        await pipeline(
            got.stream(pRemoteURL),
            _fs_.createWriteStream( pLocalPath, {
                flags: 'w+',
                mode: pOptions.mode!=null ? pOptions.mode : 0o666,
                encoding: pOptions.encoding!=null ? pOptions.encoding : 'binary' 
            } )
        );

        if(_fs_.existsSync(pLocalPath) == true){
            return pLocalPath;
        }else{
            return null;
        }
    }

    /**
     * 
     * @param {*} pRemoteURL 
     * @param {*} pOptions 
     * @returns {Path|String} Path of downloaded file
     * @static
     * @async
     * @method
     */
    static async downloadTemp( pRemoteURL:string, pOptions:any):Promise<string>{
        let tmp = _path_.join(
            DexcaliburWorkspace.getInstance().getTempFolderLocation(),
            Util.randString( 16, Util.ALPHA)
        );

        return await Downloader.download( pRemoteURL, tmp, pOptions);
    }
}
