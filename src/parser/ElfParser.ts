import {IMagicParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelFile from "../ModelFile.js";
import {BinTpl, BinTplHelper} from "./BinTplHelper.js";
import {MonitoredError, Tag, TagUUID} from "@dexcalibur/dexcalibur-orm";
import {Struct} from "@dexcalibur/dxc-struct";
import {Endianness} from "../core/Endianness.js";
import ModelFileSection from "../ModelFileSection.js";
import {MetadataType} from "../audit/common/Metadata.js";
import {MetadataTopic} from "../audit/common/ControlAssessment.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {Buffer} from "buffer";
import ModelResource from "../ModelResource.js";
import {MagicSignature} from "../formats/common.js";


export namespace Elf {

    export interface Results extends IResults<ModelResource<ModelFile>> {
        ok: ModelResource<ModelFile>;
        invalid: Error[];
    }

    export class ParserException extends MonitoredError {

        static ERR = {
            INVALID_HEADER:  1,
            INCONSISTENT_CHUNK_LEN: 3,
            CHUNK_LEN_TOO_HIGH: 4
        };

        static INVALID_HEADER = (pOffset:number)=>{
            return new ParserException(`The MachO header is invalid at ${pOffset}`,
                ParserException.ERR.INVALID_HEADER );
        };

        constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
            super('Parser::MachO', pMsg, pCode, pExtra);
        }
    }

    export interface ElfHeader {
        magic:string;
        cls:number;
        endian:number;
        version:number;
        osabi:number;
        abiversion:number;
        padding1:number;
        padding2:number;
    }

    export class Parser implements IMagicParser<ModelResource<ModelFile>> {

        FEATURES = [
            IParserFeature.MAGIC_CHECK,
            IParserFeature.STRUCT
        ];

        UID = "elf_1.0.0";

        FORMAT_NAMES:string[] = ["elf"];

        FILE_EXTENSIONS:string[] = ["",".so"]; // "" = no extension DO NOT REPLACE BY NULL !

        description = "ELF Binary";

        static MAGIC = "\x7FELF";
        static HEADER_TPL:BinTpl[] = [
            ["4s","magic"],
            ["b","class"],
            ["b","endianess"],
            ["b","version"],
            ["b","osabi"],
            ["b","abiversion"],
            ["<I","padding1"],
            ["bbb","padding2"]
        ];

        execTag: Nullable<Tag> = null;
        elfTag: Nullable<Tag> = null;


        constructor() {

        }

        async hasSignature(pBuffer: Buffer, pOffset: number): Promise<boolean> {
            const magic = Struct.unpack("4s", pBuffer, pOffset);
            return (magic[0]===Parser.MAGIC);
        }


        getMagic(): MagicSignature[] {
            return [{ offset:0, magic:Parser.MAGIC }];
        }

        parseHeader(pBuffer:Buffer, pOffset:number, pPrint = false):ElfHeader {
            try{
                const s = BinTplHelper.unpackObject<ElfHeader>(
                    Parser.HEADER_TPL,
                    pBuffer,
                    pOffset
                );

                if(s.res.magic!==Parser.MAGIC){
                    throw ParserException.INVALID_HEADER(pOffset);
                }

                if(pPrint){
                   // console.log(`MAGIC`);
                }

                return s.res;
            }catch (e){
                throw ParserException.INVALID_HEADER(pOffset);
            }
        }

        async fromBuffer(pBuffer:Buffer, pOffset:number, pOptions:IParserOptions = {encoding:'binary', raw:true, tags:[]}):Promise<Results> {
            if(pOptions.tags==null) pOptions.tags = [];

            const res:Results = {
                ok: null,
                invalid: []
            };

            let file = new ModelFile({
                chunks: [],
                sections: [],
                tags: pOptions.tags.map(t => t.getUUID())
            });

            try{
                const header = this.parseHeader(pBuffer, pOffset);
                const hdr = new ModelFileSection(pOffset,'header');
                //hdr.setData()
                //hdr.setLen()

                file.appendChunk(hdr);
                file.addTag(this.execTag);
                file.addTag(this.elfTag);
                file.addMeta(MetadataType.ANY, MetadataTopic.FILE_HEADER, { data:header, tpl:Parser.HEADER_TPL });

                //file.tagAs()
                res.ok = new ModelResource<ModelFile>({
                    value: file,
                    tags: [
                        this.elfTag.getUUID()
                    ]
                });

                res.ok.setProperty('executable',true);
            }catch (e){
                res.invalid.push(e);
            }

            return res;
        }


        setContext(pProject:DexcaliburProject):void {
            this.execTag = pProject.getTagManager().getTag("data.type.executable");
            this.elfTag = pProject.getTagManager().getTag("data.type.ELF");
        }

    }
}
