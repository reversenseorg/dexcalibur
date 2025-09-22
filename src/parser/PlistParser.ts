import {XMLParser} from "fast-xml-parser";
import {PlistDocument} from "../ios/PlistDocument.js";
import {Struct} from "@dexcalibur/dxc-struct";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {BufferEncoding} from "typescript";
import {IMagicParser, IParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Buffer} from "buffer";
import ModelResource from "../ModelResource.js";
import {Tag, NodeUtils} from "@dexcalibur/dexcalibur-orm";
import ModelStringValue from "../ModelStringValue.js";
import {INodeRef} from "../INode.js";

/**
 *
 */
export namespace Plist {

    export interface Entry {
        key?:string;
        value?:string;
        comment?:string;
        line:number;
        lineCount:number;
        invalid?:boolean;
    }

    export enum DataFormat {
        KEY_VALUE,
        TABLE
    }

    export interface Results extends IResults<ModelResource<PlistDocument>>{
        ok: ModelResource<PlistDocument>;
        invalid: Error[];
    }

    export interface BinaryPlistHeader {
        version:number;
    }

    export interface BinaryPlistTrailer {
        offsetSize: number;
        objectRefSize: number;
        numObjects: BigInt;
        topObject: BigInt;
        offsetTableOffset: BigInt;
    }

    export class ObjectUID {
        _uid:number;
        constructor(pUid:number) {
            this._uid = pUid;
        }
    }

    export interface ParserOptions extends IParserOptions {
        eol?:string;
    }

    export class BinaryParser {

        static MAGIC="bplist";

        buf:Uint8Array;

        constructor(pBuffer:Uint8Array) {
            this.buf =pBuffer;
        }



        private _readVarSizedUInt(pBuffer:Uint8Array, pOffset:number):number {
            let l = 0;
            for (let i = pOffset; i < pBuffer.length; i++) {
                l <<= 8;
                l |= pBuffer.at(i) & 0xFF;
            }
            return l;
        }

        private _swapBytes(pBuffer:Uint8Array) {
            const len = pBuffer.length;
            for (let i = 0; i < len; i += 2) {
                const a = pBuffer[i];
                pBuffer[i] = pBuffer[i+1];
                pBuffer[i+1] = a;
            }
            return pBuffer;
        }

        parseHeader(): BinaryPlistHeader {
            const header = this.buf.slice(0, BinaryParser.MAGIC.length).toString();
            if (header !== BinaryParser.MAGIC) {
                throw new Error("Invalid plist header.");
            }

            const version = this.buf.slice(BinaryParser.MAGIC.length,BinaryParser.MAGIC.length+2).toString();
            return {
                version: parseInt(version)
            };
        }



        parseTrailer(): BinaryPlistTrailer {

            const trailer = Buffer.from(this.buf.slice(this.buf.length - 32, this.buf.length));
            // skip 6 null bytes from 0 to 5
            const data = Struct.unpack('BBQQQ', trailer as Buffer,6); //trailer.readUInt8(6);

            return {
                offsetSize: data[0],
                objectRefSize: data[1],
                numObjects: data[2],
                topObject: data[3],
                offsetTableOffset: data[4],
            };
        }


        parseOffsetTable(pCntObj:bigint, pOffsetTableOffset: bigint, pOffsetSize: number):number[] {

            const offsetTable:any[] = [];
            let chunk:Uint8Array;
            let i:number;

            if( pCntObj > BigInt(Number.MAX_SAFE_INTEGER)
                || pOffsetTableOffset > BigInt(Number.MAX_SAFE_INTEGER)){
                throw new Error("Invalid plist offset.");
            }

            const max = Number(pCntObj);
            let res:any[] = [];

            for (let i = 0; i < max; i++) {
                chunk = this.buf.slice(
                    Number(pOffsetTableOffset) + i * pOffsetSize,
                    Number(pOffsetTableOffset) + (i + 1) * pOffsetSize);

                res =  Struct.unpack('H',chunk as Buffer,0); //readUInt(offsetBytes, 0);
                if(res.length==1){
                    offsetTable[i] = res[0];
                }

                //console.log("Offset for Object #" + i + " is " + offsetTable[i] + " [" + offsetTable[i].toString(16) + "]");

            }
            return offsetTable;
        }

        parseSimple(pInfo:number):Nullable<boolean> {
            //Simple
            switch (pInfo) {
                case 0x0: // null
                    return null;
                case 0x8: // false
                    return false;
                case 0x9: // true
                    return true;
                case 0xF: // filler byte
                    return null;
                default:
                    throw new Error("Unhandled simple type 0x" + pInfo.toString(16));
            }
        }

        parseObjects( pTopObj:number, pOffsetTable:number[], pObjRefSz:number, pRaw:boolean, pStrings:ModelStringValue[] = []):any {
            const offset = pOffsetTable[pTopObj];
            const type = Struct.unpack('B',this.buf as Buffer, offset);

            //const objType = (type & 0xF0) >> 4;
            const marker = (type[0] & 0xF0) >> 4;
            const data = (type[0] & 0x0F);
            // pivot on object type
            switch (marker) {
                case 0x0:
                    return this.parseSimple(data);
                case 0x1:
                    return this.parseInteger(data, offset);
                case 0x8:
                    return this.parseUID(data,offset);
                case 0x2:
                    return this.parseReal(data,offset);
                case 0x3:
                    return this.parseDate(data,offset);
                case 0x4:
                    return this.parseData(data,offset);
                case 0x5: // ASCII
                    return this.parsePlistString(data,offset, { charset:'ascii', raw:pRaw }, pStrings);
                case 0x6: // UTF-16
                    return this.parsePlistString(data, offset, { charset:'utf-16', raw:pRaw }, pStrings);
                case 0xA:
                    return this.parseArray(data, pOffsetTable, offset, pObjRefSz, pRaw, pStrings);
                case 0xD:
                    return this.parseDict(data, pOffsetTable, offset, pObjRefSz, pRaw, pStrings);
                default:
                    throw new Error("Unhandled type 0x" + (marker).toString(16));
            }
        }



        parseInteger(pData: number, pOffset:number) {
            const length = Math.pow(2, pData);
            if (length < Parser.MAX_OBJ_SZ) {
                const data = this.buf.slice(pOffset + 1, pOffset + 1 + length);
                if (length === 16) {
                    let str:string = "";
                    let i:number=0, c:number=0;
                    do{
                        c = data.at(i);
                        str += c.toString(16).padStart(2,'0');
                        i++;
                    }while(c!=0 && i<data.length);

                    return BigInt(`0x${str}`);
                }

                return data.reduce((vAcc, vCurr) => {
                    vAcc <<= 8;
                    vAcc |= vCurr & 255;
                    return vAcc;
                });
            }

            throw new Error("Too little heap space available! Wanted to read " + length + " bytes, but only " + Parser.MAX_OBJ_SZ + " are available.");
        }

        parseUID(pData: number, pOffset: number):any {
            const length = pData + 1;
            if (length < Parser.MAX_OBJ_SZ) {
                return new ObjectUID(
                    this._readVarSizedUInt(
                        this.buf.slice(pOffset + 1, pOffset + 1 + length), 0
                    )
                );
            }
            throw new Error("Too little heap space available! Wanted to read " + length + " bytes, but only " + Parser.MAX_OBJ_SZ + " are available.");
        }

        parseReal(pData: number, pOffset: number):any  {
            const length = Math.pow(2, pData);
            if (length < Parser.MAX_OBJ_SZ) {
                const realBuffer = this.buf.slice(pOffset + 1, pOffset + 1 + length);
                if (length === 4) {
                    return (realBuffer as Buffer).readFloatBE(0);
                }
                if (length === 8) {
                    return (realBuffer as Buffer).readDoubleBE(0);
                }
            } else {
                throw new Error("Too little heap space available! Wanted to read " + length + " bytes, but only " + Parser.MAX_OBJ_SZ + " are available.");
            }
        }

        parseDate(pData: number, pOffset: number):any  {
            if (pData != 0x3) {
                console.error("Unknown date type :" + pData + ". Parsing anyway...");
            }
            const dateBuffer = this.buf.slice(pOffset + 1, pOffset + 9);
            return new Date(Parser.EPOCH + (1000 * (dateBuffer as Buffer).readDoubleBE(0)));
        }

        parseData(pData: number, pOffset: number):any  {
            let dataoffset = 1;
            let length = pData;
            if (pData == 0xF) {
                const int_type = this.buf.at(pOffset + 1);
                const intType = (int_type & 0xF0) / 0x10;
                if (intType != 0x1) {
                    console.error("0x4: UNEXPECTED LENGTH-INT TYPE! " + intType);
                }
                const intInfo = int_type & 0x0F;
                const intLength = Math.pow(2, intInfo);

                dataoffset = 2 + intLength;
                length = this._readVarSizedUInt(this.buf.slice(pOffset + 2, pOffset + 2 + intLength),0);

                /*if (intLength < 3) {
                    length = this._readVarSizedUInt(this.buf.slice(pOffset + 2, pOffset + 2 + intLength),0);
                } else {
                    length = readUInt(this.buf.slice(pOffset + 2, pOffset + 2 + intLength));
                }*/
            }
            if (length < Parser.MAX_OBJ_SZ) {
                return this.buf.slice(pOffset + dataoffset, pOffset + dataoffset + length);
            }
            throw new Error("Too little heap space available! Wanted to read " + length + " bytes, but only " + Parser.MAX_OBJ_SZ + " are available.");
        }



        parsePlistString(pData: number, pOffset: number, pOptions: {charset:string, raw:boolean}, pStrings:ModelStringValue[]):any  {

            let enc:BufferEncoding = "utf8";
            let length = pData;
            let stroffset = 1;
            if (pData == 0xF) {
                const int_type = this.buf.at(pOffset + 1);
                const intType = (int_type & 0xF0) / 0x10;
                if (intType != 0x1) {
                    console.error("UNEXPECTED LENGTH-INT TYPE! " + intType);
                }
                const intInfo = int_type & 0x0F;
                const intLength = Math.pow(2, intInfo);
                stroffset = 2 + intLength;
                if (intLength < 3) {
                    length = this._readVarSizedUInt(this.buf.slice(pOffset + 2, pOffset + 2 + intLength),0);
                } else {
                    length = this._readVarSizedUInt(this.buf.slice(pOffset + 2, pOffset + 2 + intLength),0);
                }
            }
            // length is String length -> to get byte length multiply by 2, as 1 character takes 2 bytes in UTF-16
            length *= (pOptions.charset==='utf-16' ? 2 : 1);
            if (length < Parser.MAX_OBJ_SZ) {
                let plistString = new Uint8Array(this.buf.slice(pOffset + stroffset, pOffset + stroffset + length));
                if (pOptions.charset==='utf-16') {
                    plistString = this._swapBytes(plistString);
                    enc = "ucs2";
                }

                const str = Buffer.from(plistString).toString(enc);
                return (!pOptions.raw) ? ModelStringValue.addStringRefTo(pStrings, str, false) : str;
            }
            throw new Error("Too little heap space available! Wanted to read " + length + " bytes, but only " + Parser.MAX_OBJ_SZ + " are available.");
        }



        parseArray(pData: number, pOffsetTable:number[], pOffset: number,   pObjRefSz:number, pRaw:boolean, pStrings:ModelStringValue[]):any  {
            let length = pData;
            let arrayoffset = 1;
            if (pData == 0xF) {
                const int_type = this.buf.at(pOffset + 1);
                const intType = (int_type & 0xF0) / 0x10;
                if (intType != 0x1) {
                    console.error("0xa: UNEXPECTED LENGTH-INT TYPE! " + intType);
                }
                const intInfo = int_type & 0x0F;
                const intLength = Math.pow(2, intInfo);
                arrayoffset = 2 + intLength;
                if (intLength < 3) {
                    length = this._readVarSizedUInt(this.buf.slice(pOffset + 2, pOffset + 2 + intLength),0);
                } else {
                    length = this._readVarSizedUInt(this.buf.slice(pOffset + 2, pOffset + 2 + intLength),0);
                }
            }
            if (length * pObjRefSz > Parser.MAX_OBJ_SZ) {
                throw new Error("Too little heap space available!");
            }
            const array = [];
            for (let i = 0; i < length; i++) {
                const objRef = this._readVarSizedUInt(
                    this.buf.slice(pOffset + arrayoffset + i * pObjRefSz, pOffset + arrayoffset + (i + 1) * pObjRefSz),0
                );

                array[i] = this.parseObjects(objRef, pOffsetTable, pObjRefSz, pRaw, pStrings);
            }
            return array;
        }


        /**
         * [MARKER][LEN][<offset>,...]
         *
         * @param pLen
         * @param pOffset
         * @param pTableOffset
         * @param pObjRefSz
         */
        parseDict(pLen: number,  pTableOffset:number[], pOffset: number,pObjRefSz:number, pRaw:boolean, pStrings:ModelStringValue[]):any  {
            let length = pLen;
            let dictoffset = 1;

            if (pLen == 0xF) {
                const int_type = this.buf.at(pOffset + 1);
                const intType = (int_type & 0xF0) / 0x10;
                if (intType != 0x1) {
                    console.error("0xD: UNEXPECTED LENGTH-INT TYPE! " + intType);
                }
                const intInfo = int_type & 0x0F;
                const intLength = Math.pow(2, intInfo);
                dictoffset = 2 + intLength;
                if (intLength < 3) {
                    length = this._readVarSizedUInt(this.buf.slice(pOffset + 2, pOffset + 2 + intLength),0);
                } else {
                    length = this._readVarSizedUInt(this.buf.slice(pOffset + 2, pOffset + 2 + intLength), 0);
                }
            }
            if (length * 2 * pObjRefSz > Parser.MAX_OBJ_SZ) {
                throw new Error("Too little heap space available!");
            }

            // console.log("Parsing dictionary #" + pOffset);
            const dict = {};
            let keyRef:number, valRef:number
            for (let i = 0; i < length; i++) {
                keyRef = this._readVarSizedUInt(
                    this.buf.slice(
                        pOffset + dictoffset + i * pObjRefSz,
                        pOffset + dictoffset + (i + 1) * pObjRefSz
                    ),0);
                valRef = this._readVarSizedUInt(
                    this.buf.slice(
                        pOffset + dictoffset + (length * pObjRefSz) + i * pObjRefSz,
                        pOffset + dictoffset + (length * pObjRefSz) + (i + 1) * pObjRefSz
                    ),0);


                const key = this.parseObjects(keyRef,pTableOffset,pObjRefSz, true, pStrings);
                const val = this.parseObjects(valRef,pTableOffset,pObjRefSz, pRaw, pStrings);

                //console.log("  DICT #" + pOffset + ": Mapped " + key + " to " + val);

                dict[key] = val;
            }
            return dict;
        }
    }


    /**
     * @class
     */
    export class Parser implements IMagicParser<ModelResource<PlistDocument>> {

        FEATURES = [
            IParserFeature.MAGIC_CHECK,
            IParserFeature.STRUCT,
            IParserFeature.CONVERT,
        ];

        UID = "plist_1.0.0";

        FORMAT_NAMES:string[] = ["plist"];

        FILE_EXTENSIONS:string[] = [".plist"];

        static MAX_OBJ_CTR = BigInt(32768);

        static MAX_OBJ_SZ = BigInt(100 * 1000 * 1000);
        static EPOCH = 978307200000;
        private plistTag: Nullable<Tag> = null;
        private xmlTag: Nullable<Tag> = null;
        private rawTag: Nullable<Tag> = null;


        static isXmlPlist(pBuffer:Uint8Array, pOffset = 0):boolean {
            return (pBuffer.slice(pOffset,5).toString()==="<?xml")
                && (pBuffer.slice(pOffset, (pOffset+200>pBuffer.length? pBuffer.length : 200)).toString().indexOf('<plist')>-1);
        }

        static isBPlist(pBuffer:Uint8Array, pOffset = 0):boolean {
            return (pBuffer.slice(pOffset,6).toString()==="bplist");
        }


        async hasSignature(pBuffer: Buffer, pOffset: number): Promise<boolean> {

            return Parser.isBPlist(pBuffer,pOffset) || Parser.isXmlPlist(pBuffer,pOffset);
        }

        /**
         *
         * @param {Buffer} pBuffer
         * @param {number} pOffset
         * @param pEOL
         */
         async fromBuffer(pBuffer:Buffer, pOffset:number, pOptions:ParserOptions = { encoding:'binary', eol: null, raw:true, tags:[] }):Promise<Results> {

            if(pOptions.tags==null) pOptions.tags = [];

            let res:Results;
            if(Parser.isXmlPlist(pBuffer)){
                res = await Parser.parseXml(pBuffer, pOffset, pOptions.eol, pOptions.raw, pOptions.tags);
                if(res.ok!=null){
                    if(this.plistTag!=null) res.ok.tags.push(this.plistTag.getUUID());
                    if(this.rawTag!=null) res.ok.tags.push(this.xmlTag.getUUID());
                }
                return res;
            }else if(Parser.isBPlist(pBuffer)){
                res = Parser.parseBPlist(pBuffer, pOffset, pOptions.eol, pOptions.raw, pOptions.tags);
                if(res.ok!=null){
                    if(this.plistTag!=null) res.ok.tags.push(this.plistTag.getUUID());
                    if(this.rawTag!=null) res.ok.tags.push(this.rawTag.getUUID());
                }
                return res;
            }else{
                throw new Error("Unrecognized PList type");
            }
        }


        /**
         *
         * @param pBuffer
         * @param pOffset
         * @param pEOL
         */
        static async parseXml(pBuffer:Uint8Array, pOffset:number= -1, pEOL:string = null, pRaw = true, pTags:Tag[] = []):Promise<Results> {
            const res:Results = {
                ok: null,
                invalid: [],
                strings: []
            };

            let xml:any;

            const parser = new XMLParser({
                preserveOrder: true
            });
            xml = parser.parse(pBuffer as Buffer)

            const data = Parser.parseXmlDict( xml[1].plist[0].dict, pRaw, res.strings);

            try{
                if(data!=null){
                    const plistDoc = new PlistDocument();
                    for(let k in data){
                        plistDoc.addPair(k,data[k], pRaw);
                    }

                    res.ok = new ModelResource<PlistDocument>({
                        value: plistDoc,
                        tags: []
                    });
                }else{
                    throw new Error("XML plist cannot be parsed." );
                }
            }catch (e){
                console.log(e);
                res.ok = null;
            }


            return res;
        }


        static parseBPlist(pBuffer:Uint8Array, pOffset:number = 0, pEOL:string = null, pRaw = true, pTags:Tag[] = []):Results {
            const res:Results = {
                ok: null,
                invalid: [],
                strings: (pRaw  ? null : [])
            };

            const bp = new BinaryParser(pBuffer);

            const header = bp.parseHeader();
            const trailer = bp.parseTrailer();


            // check consistency
            if (trailer.numObjects.valueOf() > Parser.MAX_OBJ_CTR) {
                throw new Error("Too many objects");
            }

            // Handle offset table
            const offsetTable = bp.parseOffsetTable(
                trailer.numObjects.valueOf(),
                trailer.offsetTableOffset.valueOf(),
                trailer.offsetSize,
                );


            const objs = bp.parseObjects(
                Number(trailer.topObject.valueOf()),
                offsetTable,
                trailer.objectRefSize,
                pRaw,
                res.strings
            );

            const doc = new PlistDocument();
            for(let k in objs){
                doc.addPair(k,objs[k], pRaw);
            }

            res.ok = new ModelResource<PlistDocument>({
                    value: doc,
                    tags: pTags.map(t => t.getUUID())
                });

            return res;
        }


        static parseXmlValue(pValue: any, pRaw = true, pStrings:ModelStringValue[]=null):any {
            let data:any;
            for(let k in pValue){
                switch (k){
                    case 'string':
                        if(pValue[k].length>0){
                            if(pRaw){
                                return pValue[k][0]['#text']+"";
                            }else{
                                return ModelStringValue.addStringRefTo(pStrings, pValue[k][0]['#text']+"", false);
                            }
                        }else{
                            return "";
                        }
                    case 'true':
                        return true;
                    case 'false':
                        return false;
                    case 'array':
                        data = [];
                        pValue[k].map(x => {
                            data.push(Plist.Parser.parseXmlValue(x, pRaw, pStrings));
                        });
                        return data;
                    case 'dict':
                        return this.parseXmlDict( pValue[k], pRaw, pStrings);
                    case 'integer':
                        return pValue[k][0]['#text'];
                    case 'true':
                        return true;
                }
            }
        }

        static parseXmlDict(pDict:any[], pRaw = true, pStrings:ModelStringValue[]=null):Record<string, any>  {

            let obj:Record<string, any> = {};
            for(let i=0;i<pDict.length;i++){
                if(pDict[i].key!=null){
                    obj[pDict[i]['key'][0]['#text']] = Plist.Parser.parseXmlValue(pDict[i+1], pRaw, pStrings);
                    i+=1;
                }
            }

            return obj;
        }


        setContext(pProject:DexcaliburProject):void {
            if(pProject==null) return;
            this.plistTag = pProject.getTagManager().getTag("data.type.plist");
            this.xmlTag = pProject.getTagManager().getTag("data.type.xml");
            this.rawTag = pProject.getTagManager().getTag("data.type.raw");
        }
    }
}