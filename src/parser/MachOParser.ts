import {IMagicParser, IParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelFile from "../ModelFile.js";
import {BinTpl, BinTplHelper} from "./BinTplHelper.js";
import {MonitoredError, Tag, TagUUID} from "@dexcalibur/dexcalibur-orm";
import {Struct} from "@dexcalibur/dxc-struct";
import {Endianness} from "../core/Endianness.js";
import ModelFileSection from "../ModelFileSection.js";
import {MetadataTopic, MetadataType} from "../audit/common/Metadata.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {Buffer} from "buffer";
import ModelResource from "../ModelResource.js";
import {MagicSignature} from "../formats/common.js";


export namespace MachO {

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

    export interface MachHeader {
        magic:Uint8Array;
        cpuType:number;
        cpuSubtype:number;
        filetype:number;
        nbCmds:number;
        sizeCmds:number;
        flags:number;
        // -- not in header
        endian: Endianness,
        addrSz: number,
        /**
         * To mark as fat binary (include binaries for multiple architecture)
         * @type {boolean}
         */
        fat: boolean
    }

    export class Parser implements IMagicParser<ModelResource<ModelFile>> {

        FEATURES = [
            IParserFeature.MAGIC_CHECK
        ];

        UID = "macho_1.0.0";

        FORMAT_NAMES:string[] = ["macho"];

        FILE_EXTENSIONS:string[] = ["",".dylib"]; // "" = no extension DO NOT REPLACE BY NULL !

        static HEADER_TPL:BinTpl[] = [
            ["<I","cpuType"],
            ["<I","cpuSubtype"],
            ["<I","filetype"],
            ["<I","nbCmds"],
            ["<I","sizeCmds"],
            ["<I","flags"]
        ];
        execTag: Nullable<Tag> = null;
        machoTag: Nullable<Tag> = null;

        description = "MachO Binary";

        constructor() {

        }

        getMagic():MagicSignature[] {
            return [
                { offset:0, magic:"\xcf\xfa\xed\xfe" },
                { offset:0, magic:"\xce\xfa\xed\xfe" },
                { offset:0, magic:"\xfe\xed\xfa\xcf" },
                { offset:0, magic:"\xfe\xed\xfa\xce" },
                { offset:0, magic:"\xca\xfe\xba\xbe" }
            ];
        }


        async hasSignature(pBuffer: Buffer, pOffset: number): Promise<boolean> {
            const magic = Buffer.from(Struct.unpack("4B",pBuffer,pOffset));

            switch (magic.toString('hex')){
                case 'cffaedfe':
                case 'cefaedfe':
                case 'feedfacf':
                case 'feedface':
                case 'cafebabe':
                    return true;
                default:
                    return false;
            }
        }

        parseHeader(pBuffer:Buffer, pOffset:number, pPrint = false):MachHeader {
            try{
                const s = BinTplHelper.unpackObject<MachHeader>(
                    Parser.HEADER_TPL,
                    pBuffer,
                    pOffset
                );

                // by default, not a fat binary
                s.res.fat = false;

                const magic = Buffer.from(Struct.unpack("4B",pBuffer,pOffset));

                switch (magic.toString('hex')){
                    case 'cffaedfe': s.res.addrSz=64; s.res.endian=Endianness.LITTLE_ENDIAN; break;
                    case 'cefaedfe': s.res.addrSz=32; s.res.endian=Endianness.LITTLE_ENDIAN; break;
                    case 'feedfacf': s.res.addrSz=64; s.res.endian=Endianness.BIG_ENDIAN; break;
                    case 'feedface': s.res.addrSz=32; s.res.endian=Endianness.BIG_ENDIAN; break;
                    case 'cafebabe': s.res.addrSz=32; s.res.fat = true;  s.res.endian=Endianness.BIG_ENDIAN; break;
                    default: throw ParserException.INVALID_HEADER(pOffset);
                }


                s.res.magic = magic;

                // if fat binary, gather supported architecture
                if(s.res.fat){
                    // todo
                }

                console.log(s.res);
                //console.log(`Magic = ${s.res.magic}`);

                if(pPrint){
                   // console.log(`MAGIC`);
                    // todo
                }

                return s.res;
            }catch (e){
                throw ParserException.INVALID_HEADER(pOffset);
            }
        }

        async fromBuffer(pBuffer:Buffer, pOffset:number, pOptions:IParserOptions = {encoding:'binary', raw:true, tags:[] }):Promise<Results> {
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
                file.addTag(this.machoTag);
                file.addMeta(MetadataType.ANY, MetadataTopic.FILE_HEADER, { data:header, tpl:Parser.HEADER_TPL });

                //file.tagAs()
                res.ok = new ModelResource<ModelFile>({
                    value: file,
                    tags: pOptions.tags.map(t => t.getUUID())
                });

            }catch (e){
                res.invalid.push(e);
            }

            return res;
        }


        setContext(pProject:DexcaliburProject):void {
            this.execTag = pProject.getTagManager().getTag("data.type.executable");
            this.machoTag = pProject.getTagManager().getTag("data.type.MachO");
        }

    }
}
