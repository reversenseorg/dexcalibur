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

import {DataFormatManagerException} from "../error/DataFormatManagerException.js";
import * as _fs_ from "fs";
import {Plist} from "../../parser/PlistParser.js";
import {PlistDocument} from "../../ios/PlistDocument.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import ModelResource from "../../ModelResource.js";
import {DataLocation, DataLocationType} from "../../DataLocation.js";
import ModelStringValue from "../../ModelStringValue.js";
import doc = Mocha.reporters.doc;
import DexcaliburProject from "../../DexcaliburProject.js";

/**
 * Helper class to work with plist files
 *
 * @class
 * @since 1.10.2
 */
export class PlistHelper {

    /**
     * To create a ModelResource instance from  a plist file or buffer
     *
     * @param {string|Buffer} pInput Path of a plist file, or a buffer containing plist-formated data
     * @param {number} pOffset Offset of plist data in the buffer or the file
     * @return {Promise<Nullable<ModelResource<any>>> } The model resource
     * @async
     * @static
     * @since 1.10.2
     */
    static async parseFile(pInput:string|Buffer, pOffset= -1,
                           pContext:Nullable<DexcaliburProject>=null):Promise<Nullable<ModelResource<any>>> {

        const parser:Plist.Parser = new Plist.Parser();
        const isFile = (typeof pInput === "string");

        let buf:Buffer;
        if(isFile){
            buf = _fs_.readFileSync(pInput);
        }else{
            buf = pInput;
        }

        if(buf.length==0){
            throw new Error("Plist cannot be parsed : buffer is empty");
        }

        const pres = await parser.fromBuffer(buf, pOffset);

        // {
        //                     __: NodeInternalType.RESOURCE,
        //                     _uid: ResUID
        //                 }

        if(pres.ok==null){
            throw DataFormatManagerException.NOT_PARSABLE('plist');
        }

        pres.ok.location = DataLocation.fromFile(null, pOffset) /*new DataLocation({
            type: DataLocationType.FILE,
            source: {
                fileUID: null,
                offset: pOffset
            }
        });*/

        return pres.ok;
    }
}