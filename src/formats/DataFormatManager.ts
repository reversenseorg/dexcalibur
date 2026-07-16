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

import {DataFormatManagerException} from "./error/DataFormatManagerException.js";
import {Json} from "../parser/JsonParser.js";
import {Plist} from "../parser/PlistParser.js";
import {Properties} from "../parser/PropertiesParser.js";
import {Nib} from "../parser/NibParser.js";
import {Cgbi} from "../parser/CgbiParser.js";
import {Smali} from "../parser/SmaliParser.js";
import {IMagicParser, IParser, IParserFeature, IParserOptions} from "../parser/IParser.js";
import {Nullable} from "@reversense/dxc-core-api";
import DexcaliburProject from "../DexcaliburProject.js";
import {MachO} from "../parser/MachOParser.js";
import {Elf} from "../parser/ElfParser.js";
import {Zip} from "../parser/ZipParser.js";
import {MagicSignature} from "./common.js";

let gInstance:DataFormatManager = null;


/**
 * Singleton
 *
 * @class
 */
export class DataFormatManager {

    private _ctx:Nullable<DexcaliburProject> = null;

    mapping:Record<string, Record<string, any[]>> = {
        ext: {},
        name: {}
    };

    magic: IMagicParser<any>[] = [];


    constructor(pCtx:Nullable<DexcaliburProject> = null) {

        if(pCtx!=null) this._ctx = pCtx;

        [
            new Properties.Parser(),
            new Json.Parser(),
            new Plist.Parser(),
            new Nib.Parser(),
            new Cgbi.Parser(),
            new Smali.Parser(),
            new Zip.Parser(),
            new MachO.Parser(),
            new Elf.Parser(),
            //new Xml.Parser(),
        ].map((vParser:(IParser<any>))=>{
            if(this._ctx!=null){
                vParser.setContext(this._ctx);
            }

            if(vParser.FEATURES.indexOf(IParserFeature.MAGIC_CHECK)>-1){
                this.magic.push(vParser as IMagicParser<any>);
            }

            if(vParser.FILE_EXTENSIONS.length>0){
                this.addFileExtMapping(vParser.FILE_EXTENSIONS, vParser);
            }

            this.addFormatMapping(vParser.FORMAT_NAMES, vParser);
        });
    }

    addFormatMapping( pNames:string[], pParserConstr:any):void {
        this.addMapping("name",pNames,pParserConstr);
    }

    addFileExtMapping( pExt:string[], pParserConstr:any):void {
        this.addMapping("ext",pExt,pParserConstr);
    }

    addMapping( pType:string, pPattern:string[], pParserConstr:any):void {
        pPattern.map(x =>{
            if(this.mapping[pType][x]==null){
                this.mapping[pType][x] = []
            }

            this.mapping[pType][x].push(pParserConstr);
        });
    }
    static getInstance():DataFormatManager {
        if(gInstance==null){
            gInstance = new DataFormatManager();
        }

        return gInstance;
    }

    /**
     * To get a list of candidate parser from format name
     *
     * @param {string} pFormat File format name
     */
     getParserByFormat<T>(pFormat:string):IParser<T>[]  {
        return this.getParserBy( "name", pFormat);
    }

    /**
     * To get a list of candidate parser from format name
     *
     * @param {string} pFormat File format name
     */
    getMagicByFormat<T>(pFormat:string):MagicSignature[]  {
        let candidates:MagicSignature[] = [];
        for(let i=0, len=this.magic.length; i<len;i++){
            if(this.magic[i].FORMAT_NAMES.indexOf(pFormat)>-1){
                candidates.push(this.magic[i].getMagic());
            }
        }
        return candidates;
    }

    /**
     * To get a list of candidate parser from format name
     *
     * @param {string} pFormat File format name
     */
    getParserByFileExtension<T>(pFormat:string, pOptions:{skipEmpty:boolean} = {skipEmpty:false}):IParser<T>[] /*Parser*/ {
        if(pOptions.skipEmpty && pFormat=="") return [];

        return this.getParserBy( "ext", pFormat);
    }

    async getParserBySignature<T>(pBuffer:Buffer, pOffset:number, pOptions:IParserOptions):Promise<IParser<T>[]> /*Parser*/ {
        let candidates:IParser<T>[] = [];
        for(let i=0, len=this.magic.length; i<len;i++){
            if(await(this.magic[i] as IMagicParser<any>).hasSignature(pBuffer,pOffset,pOptions)){
                candidates.push(this.magic[i]);
            }
        }

        return candidates;
    }

    /**
     * To get a parser by one of its property (file type, file extension, and so...)
     *
     * @param pType
     * @param pValue
     */
    getParserBy( pType:string, pValue:string):any[] {
        const mapping = this.mapping[pType];

        if(mapping==null){
            throw DataFormatManagerException.INVALID_MAPPING(pType);
        }

        const candidates = mapping[pValue];
        if(candidates==null || candidates.length==0){
            throw DataFormatManagerException.NOT_PARSABLE(pValue);
        }

        return candidates;
    }
    /**
     * To iterate over parsers and keep parsers that generated no or few errors
     *
     * @param pFormat
     */
    static getParserBySpeculation(pFormat:string):any[] /*Parser*/ {
        throw DataFormatManagerException.NOT_IMPLEMENTED("getParserBySpeculation");
    }

    /*searchParser(pBuffer:Buffer, pOffset: number):Nullable<IParser<any>> {

    }*/
}