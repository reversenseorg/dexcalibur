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

import * as _os_ from "os";
import {IParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelResource from "../ModelResource.js";
import ModelStringValue from "../ModelStringValue.js";
import {TagUUID} from "@reversense/dexcalibur-orm";

export namespace Properties {
    export interface Entry {
        key?:string;
        value?:string|ModelStringValue;
        comment?:string;
        line:number;
        lineCount:number;
        invalid?:boolean;
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

    export interface Results extends IResults<ModelResource<Record<string, Entry>>>{
        ok: ModelResource<Record<string, Entry>>;
        invalid: Entry[];
    }


    function cleanStringBegin(pStr:string):string {
        let k:number;
        for(k=0; pStr[k]=="\x20"||pStr[k]=="\t"||pStr[k]=="\r"||pStr[k]=="\n"; k++);
        return pStr.substring(k);
    }



    export const SUPPORTED_FORMATS:string[] = ["properties"];

    export interface ParserOptions extends IParserOptions {
        eol?:string;
    }


    export class Parser implements IParser<any> {

        FEATURES = [
            IParserFeature.STRUCT,
        ];

        UID = "properties_1.0.0";

        FORMAT_NAMES:string[] = ["properties"];

        FILE_EXTENSIONS:string[] = [".properties",".prop"];


        description = "Properties file";

        static RE_KEY_TERM = /[^\\]([:=])/;

        static SUPPORTED_SEPARATORS = [':','='];



        static cleanStringBegin(pStr:string):string {
            let k:number;
            for(k=0; pStr[k]=="\x20"||pStr[k]=="\t"||pStr[k]=="\r"||pStr[k]=="\n"; k++);
            return pStr.substring(k);
        }
        /**
         * Remove escape char `\` from `pEncodedStr`
         *
         * @param {string} pEncodedStr
         */
        static decodeString(pEncodedStr:string):string {
            let out:string = "";
            let i = 0;

            while(i<pEncodedStr.length){
                if(out.length==0){
                    if(pEncodedStr[i]!=' ' && pEncodedStr[i]!="\t"){
                        out+=pEncodedStr[i];
                    }

                    i++;
                    continue;
                }

                if(pEncodedStr[i]=="\\"){
                    // test if an unicode char is encoded as \xHHHHH
                    if(pEncodedStr.substring(i,i+6).match(/^\\u[0-9a-fA-F]{4}$/)){
                        out += String.fromCharCode(parseInt(pEncodedStr.substring(i+2,i+6),16));
                        i+=6;
                    }else{
                        out+=pEncodedStr[i+1];
                        i+=2;
                    }

                }else if(pEncodedStr[i]==' ' || pEncodedStr[i]=="\t" ){
                    i++;
                }else{
                    out+=pEncodedStr[i++];
                }
            }

            return out;
        }

        constructor() {
        }
        
        async fromBuffer(pBuffer:Buffer, pOffset:number, pOptions:ParserOptions = { encoding:'utf-8', eol:null, raw:true, tags:[] } ):Promise<Results> {
            if(pOptions.tags==null) pOptions.tags = [];

            const eol = (pOptions.eol==null ? _os_.EOL : pOptions.eol);
            const res:Results = {
                ok: new ModelResource<any>({
                    value:{},
                    tags: pOptions.tags.map(t => t.getUUID())
                }),
                invalid: [],
                strings: (pOptions.raw ? null : [])
            };

            const tags:TagUUID[] = pOptions.tags.map(t=> t.getUUID());

            let m:any, multiLine = false;
            let i =pOffset, ln=0, skip=0,  line:string = "";
            let entry:Entry = {line:1,lineCount:1};

            let end = pBuffer.indexOf(eol,i);

            do {
                ln++;
                if(end==-1) {
                    // one line property
                    end = pBuffer.length;
                }

                line = pBuffer.subarray((i>pOffset?i+1:i)+skip,end).toString('utf-8');
                i = end;

                if(skip>=1) skip=0;

                if((/^[\s\t\n\r]*$/.test(line))){
                    skip = line.length;
                    continue;
                }

                if(entry!=null){
                    if(multiLine){
                        if(line.endsWith("\\")){
                            multiLine = true;
                            entry.value += line.substring(0,line.length-1);
                        }else{
                            multiLine = false;
                            entry.value += line;
                        }
                        continue
                    }else if(entry.key!=null){
                        if(pOptions.raw){
                            res.ok.value[entry.key] = entry;
                        }else{
                            entry.value = ModelStringValue.addStringRefTo( res.strings, entry.value as string, false) as ModelStringValue;
                            (entry.value as ModelStringValue).tags = tags;
                            res.ok.value[entry.key] = entry;
                        }

                        entry = {
                            line: ln,
                            lineCount: 1
                        };
                    }
                }else{
                    entry = {
                        line: ln,
                        lineCount: 1
                    };
                }


                // remove unescaped spaces at begin of line
                line =cleanStringBegin(line);

                if(line[0]=='#'||line[0]=='!'){
                    entry.comment = (entry.comment!=null?entry.comment+"\n":"")
                        +cleanStringBegin(line.substring(1));
                    continue;
                }


                m = Parser.RE_KEY_TERM.exec(line);
                if(m == null){
                    // mark as invalid file
                    entry.invalid = true;
                    res.invalid.push(entry);
                    continue;
                }

                entry.key = cleanStringBegin(Parser.decodeString(line.substring(0, m.index+1)));
                entry.value = "";

                if(line.endsWith("\\")){
                    multiLine = true;
                    entry.value += line.substring(m.index+2,line.length-1)+_os_.EOL;
                    continue;
                }else{
                    entry.value = line.substring(m.index+2);
                }

            }while((end = pBuffer.indexOf(eol,end+1))>-1 || (i < pBuffer.length));

            if(entry.key!=null){
                if(pOptions.raw){
                    res.ok.value[entry.key] = entry;
                }else{
                    entry.value = ModelStringValue.addStringRefTo( res.strings, entry.value as string, false) as ModelStringValue;
                    (entry.value as ModelStringValue).tags = tags;
                    res.ok.value[entry.key] = entry;
                }
            }else if(entry != null){
                res.invalid.push(entry);
            }

            return res;
        }

        setContext(pProject:DexcaliburProject):void {

        }

    }
}
