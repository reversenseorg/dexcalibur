import {DataFormatManagerException} from "./error/DataFormatManagerException.js";
import {Json} from "../parser/JsonParser.js";
import {Plist} from "../parser/PlistParser.js";
import {Properties} from "../parser/PropertiesParser.js";
import {Nib} from "../parser/NibParser.js";
import {Cgbi} from "../parser/CgbiParser.js";
import {Smali} from "../parser/SmaliParser.js";
import {IMagicParser, IParser, IParserFeature, IParserOptions} from "../parser/IParser.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import DexcaliburProject from "../DexcaliburProject.js";
import {MachO} from "../parser/MachOParser.js";
import {Elf} from "../parser/ElfParser.js";

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
    getParserByFileExtension<T>(pFormat:string, pOptions:{magicFirst:boolean} = {magicFirst:false}):IParser<T>[] /*Parser*/ {
        if(pOptions.magicFirst){

        }

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