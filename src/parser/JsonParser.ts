import {BufferEncoding} from "typescript";


export namespace Json {

    export enum DataFormat {
        KEY_VALUE,
        TABLE
    }


    export const SUPPORTED_FORMATS:string[] = ["json"];


    export class Parser {

        static readonly UID = "json_1.0.0";

        static FORMAT_NAMES:string[] = ["json"];

        static FILE_EXTENSIONS:string[] = [".json"];
        
        dataFormat:DataFormat = DataFormat.KEY_VALUE;

        static SUPPORTED_SEPARATORS = [':','='];


        static fromBuffer(pBuffer:Buffer, pOffset:number, pEncoding:BufferEncoding = 'utf-8'):any {
            return JSON.parse(
                pBuffer.subarray(pOffset).toString(pEncoding)
                // TODO : add reviver with context
            );
        }

    }
}
