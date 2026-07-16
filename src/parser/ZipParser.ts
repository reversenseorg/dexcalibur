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

import {Struct} from "@reversense/dxc-struct";
import {MonitoredError, Tag} from "@reversense/dexcalibur-orm";
import {BinProcessState, BinTpl, BinTplHelper} from "./BinTplHelper.js";
import {Nullable} from "@reversense/dxc-core-api";
import {NibArchive, NibArchiveOptions} from "../ios/NibArchive.js";
import { IMagicParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelResource from "../ModelResource.js";
import {Buffer} from "buffer";
import {MagicSignature} from "../formats/common.js";

/**
 *  Parser and types for NibArchive files
 *
 *  More details on format:
 *  https://www.mothersruin.com/software/Archaeology/reverse/uinib.html
 *
 *  @author Georges-Bastien Michel <georges@reversense.com>
 *  @since 1.11.0
 *  @namespace
 */
export namespace Zip {


    export interface Results extends IResults<ModelResource<any>>{
        ok: Nullable<ModelResource<any>>;
        invalid: ParserException[];
    }

    export class ParserException extends MonitoredError {

        static ERR = {
            INVALID_HEADER:  1,
            MISSING_PNG_HEADER:  2,
            INCONSISTENT_CHUNK_LEN: 3,
            CHUNK_LEN_TOO_HIGH: 4
        };

        static INVALID_HEADER = (pOffset:number)=>{
            return new ParserException(`The NIBArchive header is invalid at ${pOffset}`,
                ParserException.ERR.INVALID_HEADER );
        };

        constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
            super('Parser::Zip', pMsg, pCode, pExtra);
        }
    }

    export class ZipArchiveHeader {
        magic:string;
    }


    export interface ParserOptions extends IParserOptions {
        print:boolean;
    }

    /**
     * @class
     */
    export class Parser implements IMagicParser<ModelResource<NibArchive>>{

        FEATURES = [
            IParserFeature.MAGIC_CHECK,
            IParserFeature.STRUCT
        ];

        UID = "zip_1.0.0";

        FORMAT_NAMES:string[] = ["zip"];

        FILE_EXTENSIONS:string[] = [".zip",".apk",".aar"];

        description = "Zip archive";

        static MAGIC = "\x50\x4B\x03\x04";

        static HEADER_TPL:BinTpl[] = [
          /*  ["<I","_formatVersion"],           // UIMaximumCompatibleFormatVersion == 0x1
            ["<I","_coderVersion"],             // UICurrentCoderVersion == 0xa (as of macOS 10.15)
            ["<I","_objectCount"],              // this many UINibArchiveObject objects ...
            ["<I","_objectOffset"],             // ... at this offset into archive data
            ["<I","_keyStringCount"],           // this many UINibArchiveKey objects ..
            ["<I","_keyStringOffset"],          // ... at this offset into archive data
            ["<I","_coderValueCount"],          // this many UINibArchiveCoderValue objects ...
            ["<I","_coderValueOffset"],         // ... at this offset into archive data
            ["<I","_classNameCount"],           // this many UINibArchiveClassName objects ...
            ["<I","_classNameOffset"]*/
        ];

        static VALUE_TYPES = ["Int8","Int16","Int32","Int64","False","True","Float","Double","Bytes","Nil","Reference"];
        private zipTag: Nullable<Tag>;


        async hasSignature(pBuffer: Buffer, pOffset: number): Promise<boolean> {
            const magic = Struct.unpack("4s", pBuffer, pOffset);
            return (magic[0]===Parser.MAGIC);
        }

        getMagic(): MagicSignature[] {
            return [{ offset:0, magic:Parser.MAGIC }];
        }

        parseHeader(pBuffer:Buffer, pOffset:number):BinProcessState<ZipArchiveHeader> {

            let offset = pOffset;
            let header: ZipArchiveHeader;
            const magic = Struct.unpack("4s", pBuffer, offset);
            offset += 0x4;


            if(magic[0]!==Parser.MAGIC){
                throw ParserException.INVALID_HEADER(pOffset);
            }


            let state = BinTplHelper.unpackObject<ZipArchiveHeader>(
                Parser.HEADER_TPL,
                pBuffer,
                offset
            );

            return state;
        }

        parseEntry(pBuffer:Buffer, pOffset:number):any {

        }


        /**
         *
         * @param {Buffer} pBuffer
         * @param {number} pOffset
         * @param pEOL
         */
         async fromBuffer(pBuffer:Buffer, pOffset = 0, pOptions:ParserOptions = {encoding:'binary', print:false, tags:[], raw:true }):Promise<Results> {
            if(pOptions.tags==null) pOptions.tags = [];

            let res = { ok:null, invalid:[]};
             let o = pOffset;
             let header = this.parseHeader(pBuffer, o);

             /*
             let entry: NibArchiveOptions = {
                 offset: -!,
                 clsTable: [],
                 coderTable: [],
                 keyTable: [],
                 objTable: []
             };

             o = header.offset;

             // parse objects table
             let objs = this.parseObjects(
                pBuffer,
                archive.header._objectOffset,
                archive.header._objectCount,
                archive.header._keyStringOffset,
                pOptions.print
            );
             archive.objTable = objs.res;

            let keys = this.parseKeyTable(
                pBuffer,
                archive.header._keyStringOffset,
                archive.header._keyStringCount,
                pOptions.print
            );
            archive.keyTable = keys.res;

            let values = this.parseValues(
                pBuffer,
                archive.header._coderValueOffset,
                archive.header._coderValueCount,
                pOptions.print
            );
            archive.coderTable = values.res;

            let clss = this.parseClassNamesTable(
                pBuffer,
                archive.header._classNameOffset,
                archive.header._classNameCount,
                pOptions.print
            );
            archive.clsTable = clss.res;
            */
            //const a = new NibArchive(archive);
            const r = new ModelResource<NibArchive>({
                value: {},
                tags: pOptions.tags.map(t => t.getUUID())
            });

            // todo : index models strings and ref and push it in properties

            if(this.zipTag!=null){
                r.tags.push(this.zipTag.getUUID());
            }

             res.ok = r;
             return res;
        }

        setContext(pProject:DexcaliburProject):void {
            if(pProject == null) return;
            this.zipTag = pProject.getTagManager().getTag("data.type.zip");
        }
    }
}