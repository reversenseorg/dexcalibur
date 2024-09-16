

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

    export interface Results {
        ok: Record<string, Entry>;
        invalid: Entry[];
    }



    export const SUPPORTED_FORMATS:string[] = ["xml"];


    export class Parser {

        static readonly UID = "xml_1.0.0";

        static FORMAT_NAMES:string[] = ["xml"];

        static FILE_EXTENSIONS:string[] = [".xml"];

        dataFormat:DataFormat = DataFormat.KEY_VALUE;

        static SUPPORTED_SEPARATORS = [':','='];


        static fromBuffer(pBuffer:Buffer, pOffset:number, pEOL:string = null):Results {
            const res:Results = {
                ok: {},
                invalid: []
            };

            // todo
            return res;
        }

    }
}
