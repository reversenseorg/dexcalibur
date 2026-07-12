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

import {IParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";


export namespace Xml {
    export interface Entry {
        value?:string;
        line:number;
        lineCount:number;
        tag?:string;
        attributes?:Record<string, string>;
        children?:Entry[];
    }

    export class PropertyNode {

        /*static TYPE:NodeProperty[] = [
            (new NodeProperty("value")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("comment")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("line")).type(DbDataType.STRING),
            (new NodeProperty("lineCount")).type(DbDataType.STRING)
        ];*/

    }

    export enum DataFormat {
        KEY_VALUE,
        TABLE
    }

    export interface Results extends IResults<Record<string, Entry>> {
        ok: Record<string, Entry>;
        invalid: Error[];
    }



    export const SUPPORTED_FORMATS:string[] = ["xml"];


    export class Parser implements IParser<Record<string, Entry>> {

        FEATURES = [
        ];

        UID = "xml_1.0.0";

        FORMAT_NAMES:string[] = ["xml"];

        FILE_EXTENSIONS:string[] = [".xml"];

        description = "XML file";

        static SUPPORTED_SEPARATORS = [':','='];


        constructor() {

        }

        async fromBuffer(pBuffer:Buffer, pOffset:number, pOptions:IParserOptions = { encoding:'utf-8', raw:true }):Promise<Results> {
            if(pOptions.tags==null) pOptions.tags = [];

            const res:Results = {
                ok: null,
                invalid: [ new Error("Builtin XML parser not supported here.")]
            };

            // todo
            return res;
        }


        setContext(pProject:DexcaliburProject):void {

        }

    }
}
