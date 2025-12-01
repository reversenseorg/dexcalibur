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
