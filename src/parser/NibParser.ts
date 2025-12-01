import {Struct} from "@dexcalibur/dxc-struct";
import {MonitoredError, Tag} from "@dexcalibur/dexcalibur-orm";
import {BinProcessState, BinTpl, BinTplHelper} from "./BinTplHelper.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {NibArchive, NibArchiveOptions} from "../ios/NibArchive.js";
import { IMagicParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelResource from "../ModelResource.js";
import {Buffer} from "buffer";
import {MagicSignature} from "../formats/common.js";

/**
 *  Parser and types for NibArchive files
 *
 *  More details on format:
 *  https://www.mothersruin.com/software/Archaeology/reverse/uinib.html
 *
 *  @author Georges-Bastien Michel <georges@reversense.com>
 *  @since 1.11.0
 *  @namespace
 */
export namespace Nib {


    export interface Results extends IResults<ModelResource<NibArchive>>{
        ok: Nullable<ModelResource<NibArchive>>;
        invalid: ParserException[];
    }

    export class ParserException extends MonitoredError {

        static ERR = {
            INVALID_HEADER:  1,
            MISSING_PNG_HEADER:  2,
            INCONSISTENT_CHUNK_LEN: 3,
            CHUNK_LEN_TOO_HIGH: 4
        };

        static INVALID_HEADER = (pOffset:number)=>{
            return new ParserException(`The NIBArchive header is invalid at ${pOffset}`,
                ParserException.ERR.INVALID_HEADER );
        };

        constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
            super('Parser::Nib', pMsg, pCode, pExtra);
        }
    }

    export class UINibArchiveHeader {
        magic:string;             // "NIBArchive"
        _formatVersion:number;            // UIMaximumCompatibleFormatVersion == 0x1
         _coderVersion:number;             // UICurrentCoderVersion == 0xa (as of macOS 10.15)
         _objectCount:number;              // this many UINibArchiveObject objects ...
         _objectOffset:number;             // ... at this offset into archive data
         _keyStringCount:number;           // this many UINibArchiveKey objects ..
         _keyStringOffset:number;          // ... at this offset into archive data
         _coderValueCount:number;          // this many UINibArchiveCoderValue objects ...
         _coderValueOffset:number;         // ... at this offset into archive data
         _classNameCount:number;           // this many UINibArchiveClassName objects ...
         _classNameOffset:number;          // ... at this offset into archive data
    }

    export enum UINibCoderValueType {
        Int8 = 0,     // UINibArchiveCoderValueFixed [1 byte]
        Int16,        // UINibArchiveCoderValueFixed [2 bytes]
        Int32,        // UINibArchiveCoderValueFixed [4 bytes]
        Int64,        // UINibArchiveCoderValueFixed [8 bytes]
        False,        // UINibArchiveCoderValue
        True,         // UINibArchiveCoderValue
        Float,        // UINibArchiveCoderValueFixed [4 bytes]
        Double,       // UINibArchiveCoderValueFixed [8 bytes]
        Bytes,        // UINibArchiveCoderValueVariable
        Nil,          // UINibArchiveCoderValue
        Reference,    // UINibArchiveCoderValueFixed [4 bytes]
    }


    export interface UINibArchiveObject {
        classIndex:number;
        valueStart:number;
        valueCount:number;
    }

    export interface UINibArchiveClassName {
        nameLen:number;
        numOfFbClasses:number; //     vint32_t    _numberOfFallbackClasses;
        fbClassIndex:number [];
        className:string;
    }

    export interface UINibArchiveKey {
        len:number;
        name:string;
    }

    export interface UINibArchiveCoderValue {
        keyID:number;
        type:UINibCoderValueType;
        bytes?:Nullable<any>;
    }

    export interface UINibArchiveCoderValueFixed extends UINibArchiveCoderValue {
        bytes:Nullable<Uint8Array>
    }

    export interface UINibArchiveCoderValueVariable extends UINibArchiveCoderValue {
        len:number;
        bytes:Nullable<Uint8Array>;
    }

    interface Varint {
        value: number,
        bytesRead:number;
    }

    export interface ParserOptions extends IParserOptions {
        print:boolean;
    }

    /**
     * @class
     */
    export class Parser implements IMagicParser<ModelResource<NibArchive>>{

        FEATURES = [
            IParserFeature.MAGIC_CHECK,
            IParserFeature.STRUCT
        ];

        UID = "nib_1.0.0";

        FORMAT_NAMES:string[] = ["nib"];

        FILE_EXTENSIONS:string[] = [".nib"];

        static MAGIC = "NIBArchive";


        description = "NIBArchive file";

        static HEADER_TPL:BinTpl[] = [
            ["<I","_formatVersion"],           // UIMaximumCompatibleFormatVersion == 0x1
            ["<I","_coderVersion"],             // UICurrentCoderVersion == 0xa (as of macOS 10.15)
            ["<I","_objectCount"],              // this many UINibArchiveObject objects ...
            ["<I","_objectOffset"],             // ... at this offset into archive data
            ["<I","_keyStringCount"],           // this many UINibArchiveKey objects ..
            ["<I","_keyStringOffset"],          // ... at this offset into archive data
            ["<I","_coderValueCount"],          // this many UINibArchiveCoderValue objects ...
            ["<I","_coderValueOffset"],         // ... at this offset into archive data
            ["<I","_classNameCount"],           // this many UINibArchiveClassName objects ...
            ["<I","_classNameOffset"]
        ];

        static VALUE_TYPES = ["Int8","Int16","Int32","Int64","False","True","Float","Double","Bytes","Nil","Reference"];
        private nibTag: Nullable<Tag>;


        async hasSignature(pBuffer: Buffer, pOffset: number): Promise<boolean> {
            const magic = Struct.unpack("10s", pBuffer, pOffset);
            return (magic[0]===Parser.MAGIC);
        }

        getMagic(): MagicSignature[] {
            return [{ offset:0, magic:Parser.MAGIC }];
        }

        readVarint(buffer: Uint8Array, offset: number = 0):Varint {
            let result = 0;
            let shift = 0;
            let bytesRead = 0;
            let buf = Buffer.alloc(4,0);


            while (bytesRead < 4) {

                if (offset + bytesRead >= buffer.length) {
                    throw new Error("Unexpected end of buffer");
                }

                const byte = buffer[offset + bytesRead];
                if ((byte & 0x80) > 0) {
                    // stop
                    if(bytesRead==0){
                        return { value: byte & 0x7F, bytesRead: 1 };
                    }else{
                        //buf.writeUint8(byte & 0x7F, bytesRead);
                        //buf.writeUint8(byte, bytesRead);
                        result |= (byte & 0x7F) << (bytesRead*7)

                        //console.log(buf.toString('hex'),  buf.readInt32LE(0).toString(16))
                        return { value: result, bytesRead };
                    }
                }

                result |= (byte & 0x7F) << (bytesRead*7)
                bytesRead++;
            }

            return { value: -1, bytesRead:-1 };
        }

        private _sizeOf(pNumber:number, pMax:number):number {
            let s:number = 0;
            for(let i = 0; i < pMax;  s += (((pNumber >> 8*i) & 0xFF)>0)? 1 : 0, i++);
            return s;
        }


        parseHeader(pBuffer:Buffer, pOffset:number):BinProcessState<UINibArchiveHeader> {

            let offset = pOffset;
            let header: UINibArchiveHeader;
            const magic = Struct.unpack("10s", pBuffer, offset);
            offset += 0xa;


            if(magic[0]!==Parser.MAGIC){
                throw ParserException.INVALID_HEADER(pOffset);
            }

            let state = BinTplHelper.unpackObject<UINibArchiveHeader>(
                Parser.HEADER_TPL,
                pBuffer,
                offset
            );

            return state;
        }

        parseKeyTable(pBuffer:Buffer, pOffset:number, pCount:number, pPrint = false):BinProcessState<UINibArchiveKey[]> {
            let offset = pOffset;
            let data: UINibArchiveKey[] = [], v32:Varint, key:UINibArchiveKey = { len:-1, name:"" };

            while(data.length < pCount){
                v32 = this.readVarint(pBuffer, offset)
                offset += v32.bytesRead;
                data.push({
                    len: v32.value,
                    name: Struct.unpack(`${v32.value}s`, pBuffer, offset)
                });
                offset += v32.value;
            }

            if(pPrint){
                console.log(`KEY TABLES [${data.length}] : \n -------------------------`);
                data.map(x => {
                    console.log(`\tkey ${x.name} (len=${x.len})`);
                });
            }


            return {
                res: data,
                offset: offset
            };
        }

        // UINibArchiveClassName
        parseClassNamesTable(pBuffer:Buffer, pOffset:number, pCount:number, pPrint = false):BinProcessState<UINibArchiveClassName[]> {
            let offset = pOffset;
            let data: UINibArchiveClassName[] = [], v32:Varint;
            let cls:UINibArchiveClassName;

            while(data.length < pCount){
                cls = { nameLen:-1, className:"", fbClassIndex:[], numOfFbClasses:-1 };

                v32 = this.readVarint(pBuffer, offset)
                offset += v32.bytesRead;
                cls.nameLen = v32.value;

                v32 = this.readVarint(pBuffer, offset)
                offset += v32.bytesRead;
                cls.numOfFbClasses = v32.value;

                cls.fbClassIndex = Struct.unpack(`<${cls.numOfFbClasses}I`, pBuffer, offset);
                offset += (cls.numOfFbClasses * 4);

                cls.className = Struct.unpack(`${cls.nameLen}s`, pBuffer, offset);
                offset += cls.nameLen;

                data.push(cls);
            }

            if(pPrint){
                console.log(`CLASS NAMES TABLE [${data.length}] : \n -------------------------`);
                data.map(x => {
                    console.log(`\t${x.className} (len=${x.nameLen}) fb[${x.numOfFbClasses}}]`);
                });
            }


            return {
                res: data,
                offset: offset
            };
        }
        parseValues(pBuffer:Buffer, pOffset:number, pCount:number, pPrint = false):BinProcessState<UINibArchiveCoderValue[]> {
            let offset = pOffset;
            let data: UINibArchiveCoderValue[] = [], v32:Varint, val:UINibArchiveCoderValue = { keyID:-1, type:0 };

            while(data.length < pCount){
                v32 = this.readVarint(pBuffer, offset)
                offset += v32.bytesRead;
                val = {
                    keyID: v32.value,
                    type: pBuffer.at(offset)
                };
                offset++;

                switch (val.type) {
                    case UINibCoderValueType.Int8:
                        val.bytes = pBuffer.at(offset);
                        offset++;
                        break;
                    case UINibCoderValueType.Int16:
                        val.bytes = pBuffer.readUInt16LE(offset);
                        offset+=2;
                        break;
                    case UINibCoderValueType.Float:
                        val.bytes = (pBuffer as Uint8Array).slice(offset,offset+=4);
                        break;
                    case UINibCoderValueType.Reference:
                    case UINibCoderValueType.Int32:
                        val.bytes = pBuffer.readUInt32LE(offset);
                        offset+=4;
                        break;
                    case UINibCoderValueType.Double:
                    case UINibCoderValueType.Int64:
                        val.bytes = (pBuffer as Uint8Array).slice(offset,offset+=8);
                        break;
                    case UINibCoderValueType.Bytes:
                        v32 = this.readVarint(pBuffer,offset);
                        offset += v32.bytesRead;

                        (val as UINibArchiveCoderValueVariable).len = v32.value;
                        (val as UINibArchiveCoderValueVariable).bytes = (pBuffer as Uint8Array).slice(offset, offset+v32.value);
                        offset += v32.value;
                        break;
                    case UINibCoderValueType.False:
                    case UINibCoderValueType.True:
                    case UINibCoderValueType.Nil:
                        // no value
                        break;
                    default:
                        break;
                }


                data.push(val);
            }

            data = data.sort((a,b)=>{
                return (a.keyID > b.keyID) ? 1 : -1;
            });

            if(pPrint){
                console.log(`CODER VALUE TABLES [${data.length}] : \n -------------------------`);
                data.map(x => {
                    switch (x.type) {
                        case UINibCoderValueType.Int16:
                        case UINibCoderValueType.Int32:
                        case UINibCoderValueType.Reference:
                        case UINibCoderValueType.Int8:
                            console.log(`\tkeyID ${(x.keyID+"").padStart(3,'0')}\ttype=${Parser.VALUE_TYPES[x.type]}\tbytes=${x.bytes}`);
                            break;
                        case UINibCoderValueType.Bytes:
                            console.log(`\tkeyID ${(x.keyID+"").padStart(3,'0')}\t${x.bytes.toString('ascii')}`);

                            break;
                        default:
                            console.log(`\tkeyID ${(x.keyID+"").padStart(3,'0')}\ttype=${Parser.VALUE_TYPES[x.type]}\tbytes=${x.bytes!=null ? '('+x.bytes.length+') 0x'+x.bytes.toString('hex'):'none'}`);
                            break;
                    }

                });
            }


            return {
                res: data,
                offset: offset
            };
        }

        parseObjects(pBuffer:Buffer, pOffset:number, pCount:number, pEnd:number, pPrint = false):BinProcessState<UINibArchiveObject[]> {

            let offset = pOffset;
            let data: any = [], ctr = 0;
            let clsIdx:number, vstart:number, vcnt:number, v32:Varint, obj:any;


            while(offset < pEnd && data.length < pCount) {

                if(offset > pBuffer.length){
                    throw new Error("Reach end of object table unexpectedly");
                }

                obj = {
                    classIndex: null,
                    valueStart: null,
                    valueCount: null
                };

                v32 = this.readVarint(pBuffer, offset);
                obj.classIndex = v32.value;
                offset = offset + v32.bytesRead;
                v32 = this.readVarint(pBuffer, offset);
                obj.valueStart = v32.value;
                offset = offset+v32.bytesRead;

                v32 = this.readVarint(pBuffer, offset);
                obj.valueCount = v32.value;
                offset = offset+v32.bytesRead;


                data.push(obj);
            }

            if(pPrint){
                console.log(`OBJECT TABLES [${data.length}] : \n -------------------------`);
                data.map(x => {
                    console.log(`\tclass 0x${x.classIndex.toString(16)}\t <start=0x${x.valueStart.toString(16)}, count=0x${x.valueCount.toString(16)}> `);
                });
            }


            return {
                res: data,
                offset: offset
            };
        }

        /**
         *
         * @param {Buffer} pBuffer
         * @param {number} pOffset
         * @param pEOL
         */
         async fromBuffer(pBuffer:Buffer, pOffset = 0, pOptions:ParserOptions = {encoding:'binary', print:false, tags:[], raw:true }):Promise<Results> {
            if(pOptions.tags==null) pOptions.tags = [];

            let res = { ok:null, invalid:[]};
             let o = pOffset;
             let header = this.parseHeader(pBuffer, o);

             let archive: NibArchiveOptions = {
                 header: header.res,
                 clsTable: [],
                 coderTable: [],
                 keyTable: [],
                 objTable: []
             };

             o = header.offset;

             // parse objects table
             let objs = this.parseObjects(
                pBuffer,
                archive.header._objectOffset,
                archive.header._objectCount,
                archive.header._keyStringOffset,
                pOptions.print
            );
             archive.objTable = objs.res;

            let keys = this.parseKeyTable(
                pBuffer,
                archive.header._keyStringOffset,
                archive.header._keyStringCount,
                pOptions.print
            );
            archive.keyTable = keys.res;

            let values = this.parseValues(
                pBuffer,
                archive.header._coderValueOffset,
                archive.header._coderValueCount,
                pOptions.print
            );
            archive.coderTable = values.res;

            let clss = this.parseClassNamesTable(
                pBuffer,
                archive.header._classNameOffset,
                archive.header._classNameCount,
                pOptions.print
            );
            archive.clsTable = clss.res;

            //const a = new NibArchive(archive);
            const r = new ModelResource<NibArchive>({
                value: new NibArchive(archive),
                tags: pOptions.tags.map(t => t.getUUID())
            });

            // todo : index models strings and ref and push it in properties

            if(this.nibTag!=null){
                r.tags.push(this.nibTag.getUUID());
            }

             res.ok = r;
             return res;
        }

        setContext(pProject:DexcaliburProject):void {
            if(pProject == null) return;
            this.nibTag = pProject.getTagManager().getTag("data.type.nib");
        }
    }
}