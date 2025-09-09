import {MonitoredError} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {Struct} from "@dexcalibur/dxc-struct";
import * as _zlib_ from 'zlib';
import {CrcUtils} from "../util/CrcUtils.js";
import {IMagicParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelFile from "../ModelFile.js";
import ModelResource from "../ModelResource.js";
import ModelFileSection from "../ModelFileSection.js";
import {MetadataType} from "../audit/common/Metadata.js";
import {Buffer} from "buffer";
import {cipher} from "node-forge";

/**
 *
 * Description from "https://theapplewiki.com/wiki/PNG_CgBI_Format" :
 *
 * To optimize for the native pixel format of the iPhone's early PowerVR GPUs, Apple implemented a non-standard PNG format where the red and blue pixels are flipped (BGRA instead of RGBA). The format additionally includes extra data before the PNG header, and compressed image data without the traditional headers and footers. All iPhone PNG images appear to follow this format.
 * The PNG format consists of a header, followed by a set of data atoms, or chunks. According to the PNG spec, the 'IHDR', or PNG header chunk, should always come first. In Apple's iPhone format, a 'CgBI' chunk appears before the header. This chunk's data is four bytes long and contains a value of 0x40 (48 decimal) and is marked mandatory and private, which means that the data contained in the 'CgBI' chunk is a third party extension to the PNG format that must be implemented by the parser. The purpose of this chunk, other than to signify that the PNG is in iPhone format, is unknown. It could be a format version identifier.
 * Compressed image data, stored in the 'IDAT' chunk, contains DEFLATE-compressed data without the zlib headers, footers, or checksums that normal PNGs contain. When using zlib to decompress data, a negative value must be passed as the windowSize to use zlib's undocumented "skip headers and CRC" feature. There does not appear to be a good technical reason for using this format instead of the standard.
 * Practically speaking, there is no reason to use the proprietary format on modern Apple devices, as the performance benefit is imperceptible. More benefit can be found by optimizing PNGs for file size using optimizing tools. The format is supported on iOS and macOS only in apps that use CoreGraphics for image decoding.
 *
 *
 * @author GBM <georges@reversense.com>
 * @namespace
 */
export namespace Cgbi {

    export interface Results extends IResults<ModelResource<ModelFile>>{
        ok: ModelResource<ModelFile>; // file:ModelFile, res:ModelResource<any>, raw:any };
        invalid: ParserException[];
    }

    export class ParserException extends MonitoredError {

        static ERR = {
            MISSING_CGBI_TAG:  1,
            MISSING_PNG_HEADER:  2,
            INCONSISTENT_CHUNK_LEN: 3,
            CHUNK_LEN_TOO_HIGH: 4
        };

        static MISSING_CGBI_TAG = ()=>{
            return new ParserException(`The CgBI header is mandatory.`,
                ParserException.ERR.MISSING_CGBI_TAG );
        };

        static MISSING_PNG_HEADER = ()=>{
            return new ParserException(`The PNG header is mandatory.`,
                ParserException.ERR.MISSING_PNG_HEADER );
        };

        static INCONSISTENT_CHUNK_LEN = ()=>{
            return new ParserException(`The chunk length is inconsistent.`,
                ParserException.ERR.INCONSISTENT_CHUNK_LEN );
        };

        static CHUNK_LEN_TOO_HIGH = ()=>{
            return new ParserException(`The length of chunk is too high.`,
                ParserException.ERR.CHUNK_LEN_TOO_HIGH );
        };

        constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
            super('Parser::CgBI', pMsg, pCode, pExtra);
        }
    }

    interface Chunk {
        type: Nullable<string>;
        data: Nullable<Uint8Array>;
        length: Nullable<number>;
        crc: Nullable<number>;
        offset: Nullable<number>;
    }

    export interface ParserOptions extends IParserOptions {
        print:boolean;
        preserveExtra?:boolean;
    }

    export class Parser implements IMagicParser<ModelResource<ModelFile>> {

        FEATURES = [
            IParserFeature.MAGIC_CHECK,
            IParserFeature.STRUCT,
            IParserFeature.CONVERT,
        ];

        UID = "png_cgbi_1.0.0";

        FORMAT_NAMES:string[] = ["png"];

        FILE_EXTENSIONS:string[] = [".png"];

        static PNG_HEADER = Buffer.from("89504e470d0a1a0a",'hex');
        static CGBI_TAG = Buffer.from("CgBI");

        static CGBI_HEADER = "CgBI";
        static IHDR_HEADER = "IHDR";
        static IDAT_HEADER = "IDAT";
        static IEND_HEADER = "IEND";


        static CGBI = "500020??";

        constructor() {

        }

        async hasSignature(pBuffer: Buffer, pOffset: number): Promise<boolean> {
            return false;
        }

        static isCgbiFile(pBuffer:Uint8Array, pOffset:number):boolean {
            return (pBuffer.slice(pOffset+12,pOffset+12+Parser.CGBI_TAG.length).toString()===Parser.CGBI_HEADER);
        }

        static isPngFile(pBuffer:Uint8Array, pOffset:number):boolean {
            return (pBuffer.slice(pOffset,pOffset+Parser.PNG_HEADER.length).toString()
                        ===Parser.PNG_HEADER.toString());
        }

        /**
         *
         * @param {Buffer} pBuffer
         * @param {number} pOffset
         * @param pEOL
         */
        async fromBuffer(pBuffer:Buffer, pOffset:number, pOptions:ParserOptions = { encoding:'binary', print:false, preserveExtra:false}):Promise<Results> {


            return await this.parse(pBuffer, pOffset, pOptions);
            /*
            if(Parser.isCgbiFile(pBuffer,pOffset)) {
                return await this.parse(pBuffer, pOffset);
            }else{
                return await this.parse(pBuffer, pOffset, false);
                //throw ParserException.MISSING_CGBI_TAG();
            }*/
        }

        /**
         * To poarse a PNG-like file in CgBI format
         *
         * @param pBuffer
         * @param pOffset
         */
        parse(pBuffer:Uint8Array, pOffset:number, pOptions:ParserOptions = { encoding:'binary', print:false, preserveExtra:false }):Results {
            const res = {ok:null, invalid:[]};
            let offset = pOffset;
            let chunk:Chunk, data:Uint8Array;
            let idat_data = Buffer.from([]);
            let mf = new ModelFile({
                chunks:[]
            });
            let echunk:Chunk;
            let mfc:ModelFileSection;

            let file:any = {
                width: null,
                height: null,
                optimized: false,
                chunks: []
            };

            if(!Parser.isPngFile(pBuffer,offset)){
                mf.type = "png";
                res.invalid.push( ParserException.MISSING_PNG_HEADER() );
                return;
            }
            offset += Parser.PNG_HEADER.length;

            let startAt = 0;

            while (offset < pBuffer.length) {

                if(chunk!=null && chunk.type=="IEND"){
                    if(pOptions.preserveExtra===true){

                        mfc = new ModelFileSection(offset, '_extra');
                        mfc.setData(pBuffer.slice(offset, pBuffer.length));
                        mfc.setLen(pBuffer.length-offset);
                        //mfc.addMeta({ type:MetadataType.PARAM, key:'checksum.crc', value:  chunk.crc });

                        mf.appendChunk(mfc);

                        file.chunks.push(chunk);
                        break;
                    }else{
                        break;
                    }
                }

                chunk = {
                    offset: -1,
                    length: -1,
                    type: null,
                    data:null,
                    crc: null
                };

                // [ LEN | TYPE | DATA | CRC ] ....
                // data = pBuffer.slice(offset, offset + 4);

                startAt = offset;

                // skip CGBI
                chunk.length = Struct.unpack(">L", pBuffer as Buffer, offset)[0];
                chunk.offset = offset;
                offset += 4;

                if(chunk.length<0){
                    res.invalid.push( ParserException.INCONSISTENT_CHUNK_LEN());
                    return res;
                }

                // add chunk length check
                //chunk.length = bufferpack.unpack("L>", data, 0)[0];

                /*
                data = buffer.slice(offset, offset + 4);
                offset += 4;
                chunk.type = data.toString();*/

                chunk.type = Struct.unpack("ssss", pBuffer as Buffer, offset).join('');
                offset += 4;


                if((offset + chunk.length > pBuffer.length)){
                    res.invalid.push( ParserException.CHUNK_LEN_TOO_HIGH() );
                    return res;
                }

                chunk.data = data = pBuffer.slice(offset, offset + chunk.length);
                offset += chunk.length;

                //let dataCrc = pBuffer.slice(offset, offset + 4);
                chunk.crc = Struct.unpack(">L", pBuffer as Buffer, offset)[0];
                offset += 4;

                if(pOptions.print){
                    console.log(`0x${startAt.toString(16).padStart(8,'0')}: ${chunk.type}\t ${(chunk.length+"").padStart(6,'0')}\tcrc=0x${Struct.pack(">L", [chunk.crc]).toString('hex')}`);
                }

                switch (chunk.type) {
                    case Parser.CGBI_HEADER:
                        file.optimized = true;
                        mf.type = "cgbi";
                        // console.log(`Not modified chunk: type=${chunk.type} len=${chunk.length} crc=${chunk.crc} data=Buffer[${chunk.data.length}]`);
                        break;
                    case Parser.IHDR_HEADER:
                        file.width = Struct.unpack(">L", data as Buffer)[0];
                        file.height = Struct.unpack(">L", data as Buffer, 4)[0];
                        // console.log(`Not modified chunk: type=${chunk.type} len=${chunk.length} crc=${chunk.crc} data=Buffer[${chunk.data.length}]`);
                        break;
                    case Parser.IDAT_HEADER:
                        if (file.optimized) {
                            idat_data = Buffer.concat([idat_data, data]);
                            // don't add chunk,  concatenate each chunk of compressed IDAT
                            continue;
                        }else{
                            // continue to push chunk
                            // console.log(`Not modified chunk: type=${chunk.type} len=${chunk.length} crc=${chunk.crc} data=Buffer[${chunk.data.length}]`);
                        }
                        break;
                    case Parser.IEND_HEADER:
                        if (file.optimized) {
                            // add uncrompressed IDAT chunk
                            echunk = this.decodeCgbiIdat(
                                idat_data,
                                file.height,
                                file.width,
                            )

                            mfc = new ModelFileSection(echunk.offset, echunk.type);
                            mfc.setData(echunk.data);
                            mfc.setLen(echunk.length);
                            mfc.addMeta({type: MetadataType.PARAM, key: 'checksum.crc', value: echunk.crc});

                            mf.appendChunk(mfc);

                            file.chunks.push(echunk);

                            mfc = new ModelFileSection(chunk.offset, chunk.type);
                            mfc.setData(chunk.data);
                            mfc.setLen(12);
                            mfc.addMeta({type: MetadataType.PARAM, key: 'checksum.crc', value: chunk.crc});

                            mf.appendChunk(mfc);

                            // add IEND
                            file.chunks.push(chunk);
                            continue;
                        }
                        break;
                    default:
                        // console.log(`Not modified (Ignore ?) chunk: type=${chunk.type} len=${chunk.length} crc=${chunk.crc} data=Buffer[${chunk.data.length}]`);
                        break;
                }

                if(chunk.length > -1){
                    mfc = new ModelFileSection(chunk.offset, chunk.type);
                    mfc.setData(chunk.data);
                    mfc.setLen(chunk.length);
                    mfc.addMeta({ type:MetadataType.PARAM, key:'checksum.crc', value:  chunk.crc });

                    mf.appendChunk(mfc);

                    file.chunks.push(chunk);
                }

            }

            const r = new ModelResource<ModelFile>({
                value: mf,
                tags: []
            });

            r.setProperty('width',file.width);
            r.setProperty('height',file.height);
            r.setProperty('cgbi',file.optimized);

            res.ok = [];
            res.ok.push(r);
            res.ok.push(file); // raw

            return res;
        }


        decodeCgbiIdat(pEncodedChunk:Buffer, pHeight:number, pWidth:number):Chunk {

            let uncompressed_idat = _zlib_.inflateRawSync(pEncodedChunk);
            let chunk:Chunk = {
                offset: -1,
                type: Parser.IDAT_HEADER,
                length: -1,
                data: Buffer.alloc(uncompressed_idat.length),
                crc: null
            }
            let h:number, w:number, y:number, j:number, x:number, k:number;

            let i = 0;

            // loop over scanline to convert each pixel from BGRA to RGBA
            for (
                y = j = 0, h = pHeight - 1;
                0 <= h ? j <= h : j >= h;
                y = 0 <= h ? ++j : --j
            ) {
                // copy scanline parameter : background color, ....
                chunk.data[i] = uncompressed_idat[i];
                i++;


                // BGRA to RGBA ( flip red/blue pixels)
                for (
                    x = k = 0, w = pWidth - 1;
                    0 <= w ? k <= w : k >= w;
                    x = 0 <= w ? ++k : --k
                ) {
                    chunk.data[i + 0] = uncompressed_idat[i + 2];
                    chunk.data[i + 1] = uncompressed_idat[i + 1];
                    chunk.data[i + 2] = uncompressed_idat[i + 0];
                    chunk.data[i + 3] = uncompressed_idat[i + 3];
                    i += 4;
                }
            }

            // recompress
            chunk.data = _zlib_.deflateSync(chunk.data);
            chunk.length = chunk.data.length;

            // compute crc32
            chunk.crc = CrcUtils.crc32(
                Buffer.concat([
                    Buffer.from(Parser.IDAT_HEADER) as Uint8Array,
                    chunk.data
                ]),null);

            chunk.crc = (chunk.crc + 0x100000000) % 0x100000000;

            return chunk;
        }

        encodeAsPng(pBuffer: Uint8Array, pOffset: number, pOptions:ParserOptions = {encoding:'binary', print:false}):Buffer {

            if(pOptions.print)  console.log("Is CGBI ? : ",Parser.isCgbiFile(pBuffer,pOffset));


            if(!Parser.isCgbiFile(pBuffer,pOffset)){
                return pBuffer as Buffer;
            }

            let res = this.parse(pBuffer, pOffset, pOptions);
            let chunk:ModelFileSection;
            let output = Buffer.copyBytesFrom(pBuffer, pOffset, pOffset+8);

            if(res.ok==null) throw new Error("Image cannot feet PNG format : file cannot be parsed");

            if(pOptions.print) console.log("----- ENCODE AS PNG -----");

            const chunks = res.ok[0].value.getChunks();
            let crc:number;

            for (let l = 0, len = chunks.length; l < len; l++) {
                chunk = chunks[l];
                crc = chunk.getMeta(MetadataType.PARAM,"checksum.crc").value;


                if(chunk.getType()=="CgBI") continue;

                if(pOptions.print) console.log(`0x${output.length.toString(16).padStart(8,'0')}: ${chunk.getType()}\t ${(chunk.l+"").padStart(6,'0')}\tcrc=0x${Struct.pack(">L", [crc]).toString('hex')}`);


                output = Buffer.concat([output, Struct.pack(">L", [chunk.l])]);
                output = Buffer.concat([output, Buffer.from(chunk.getType())]);
                if (chunk.l > 0) {
                    output = Buffer.concat([output, Buffer.from(chunk.data)]);
                }
                output = Buffer.concat([output, Struct.pack(">L", [crc])]);
            }


            return output;
        }

        setContext(pProject:DexcaliburProject):void {

        }
    }


}