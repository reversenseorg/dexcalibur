import {IParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelResource from "../ModelResource.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {TagUUID} from "@dexcalibur/dexcalibur-orm";
import ModelStringValue from "../ModelStringValue.js";
import {Struct} from "@dexcalibur/dxc-struct";


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

        description = "JSON file";
        static SUPPORTED_SEPARATORS = [':','='];

        jsonTag:Nullable<TagUUID> =null;

        constructor() {

        }

        static isUtf8Str(pBuffer:Buffer, pOffset:number):boolean {
             return (pBuffer.at(pOffset)==0xEF
                    && pBuffer.at(pOffset+1)==0xBB
                    && pBuffer.at(pOffset+2)==0xBF );
        }

        async fromBuffer(pBuffer:Buffer, pOffset:number, pOptions:IParserOptions = {encoding:'utf-8', tags:[], raw:true}):Promise<Results> {
            if(pOptions.tags==null) pOptions.tags = [];

            const res =  {
                ok: null,
                invalid: [],
                strings: (pOptions.raw ? null : [])
            };

            const tags = pOptions.tags.map(t => t.getUUID());

            if(Parser.isUtf8Str(pBuffer,pOffset)) pOffset+=3;

            const raw = pBuffer.subarray(pOffset).toString(pOptions.encoding);
            const m = new ModelResource<any>({
                value: null,
                tags: pOptions.tags.map(t => t.getUUID())
            });

            const data = JSON.parse(
                raw,
                function (this: any, key: string, value: any):any {
                    if(typeof value !== "string") return value;

                    if(pOptions.raw){
                        return value;
                    }else{
                        const v = ModelStringValue.addStringRefTo( res.strings, value as string, false) as ModelStringValue;
                        v.tags = tags;
                        return v;
                    }
                }
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
