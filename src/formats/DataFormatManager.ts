import { Properties } from "@dexcalibur/dxc-parser-properties";
import {DataFormatManagerException} from "./error/DataFormatManagerException.js";
import {Json} from "../parser/JsonParser.js";

let gInstance:DataFormatManager = null;


/**
 * Singleton
 *
 * @class
 */
export class DataFormatManager {


    mapping:Record<string, Record<string, any[]>> = {
        ext: {},
        name: {}
    };

    constructor() {

        [
            Properties.Parser,
            Json.Parser
        ].map((vParserclzz:any)=>{
            this.addFileExtMapping(vParserclzz.FILE_EXTENSIONS, vParserclzz);
            this.addFormatMapping(vParserclzz.FORMAT_NAMES, vParserclzz);
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
     getParserByFormat(pFormat:string):any[]  {
        return this.getParserBy( "ext", pFormat);
    }

    /**
     * To get a list of candidate parser from format name
     *
     * @param {string} pFormat File format name
     */
    getParserByFileExtension(pFormat:string):any[] /*Parser*/ {
        return this.getParserBy( "ext", pFormat);
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

}