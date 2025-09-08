import {IParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelResource from "../ModelResource.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {TagUUID} from "@dexcalibur/dexcalibur-orm";
import ModelStringValue from "../ModelStringValue.js";


export namespace Json {

    export interface Results extends IResults<ModelResource<any>> {
        ok: ModelResource<any>;
        invalid: any[];
    }

    export enum DataFormat {
        KEY_VALUE,
        TABLE
    }


    export const SUPPORTED_FORMATS:string[] = ["json"];

    export class Parser implements IParser<any> {

        FEATURES = [
            IParserFeature.STRUCT
        ];

        UID = "json_1.0.0";

        FORMAT_NAMES:string[] = ["json"];

        FILE_EXTENSIONS:string[] = [".json"];

        static SUPPORTED_SEPARATORS = [':','='];

        jsonTag:Nullable<TagUUID> =null;

        constructor() {

        }

        async fromBuffer(pBuffer:Buffer, pOffset:number, pOptions:IParserOptions = {encoding:'utf-8'}):Promise<Results> {
            const res =  {
                ok: null,
                invalid: []
            };

            const raw = pBuffer.subarray(pOffset).toString(pOptions.encoding);
            const m = new ModelResource<any>({
                value: null,
                tags: [] //this.jsonTag]
            });

            const strings:Record<string,ModelStringValue> = {};

            const data = JSON.parse(
                raw,
                function (this: any, key: string, value: any):any {
                    //console.log(key + ' => ' + value);
                    /*if(typeof value === 'string') {

                    }*/
                    return value;
                }
                // TODO : add reviver with context
            );

            m.setProperty('data',data);
            res.ok = m;

            return res;
        }

        setContext(pProject:DexcaliburProject):void {
            //this.jsonTag = pProject.getTagManager().getTag("format.json").getUUID();
        }
    }
}
