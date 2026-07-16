/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {Struct} from "@reversense/dxc-struct";
import {Nullable} from "@reversense/dxc-core-api";
import {OPCODE} from "../Opcode.js";
import { FormatOpcode } from "./DalvikOpcode.js";


export namespace DexStructures {

    export enum MapItemType {
        TYPE_HEADER_ITEM = 0x0000,
        TYPE_STRING_ID_ITEM = 0x0001,
        TYPE_TYPE_ID_ITEM = 0x0002,
        TYPE_PROTO_ID_ITEM = 0x0003,
        TYPE_FIELD_ID_ITEM = 0x0004,
        TYPE_METHOD_ID_ITEM = 0x0005,
        TYPE_CLASS_DEF_ITEM = 0x0006,
        TYPE_CALL_SITE_ID_ITEM = 0x0007,
        TYPE_METHOD_HANDLE_ITEM = 0x0008,
        TYPE_MAP_LIST = 0x1000,
        TYPE_TYPE_LIST = 0x1001,
        TYPE_ANNOTATION_SET_REF_LIST = 0x1002,
        TYPE_ANNOTATION_SET_ITEM = 0x1003,
        TYPE_CLASS_DATA_ITEM = 0x2000,
        TYPE_CODE_ITEM = 0x2001,
        TYPE_STRING_DATA_ITEM = 0x2002,
        TYPE_DEBUG_INFO_ITEM = 0x2003,
        TYPE_ANNOTATION_ITEM = 0x2004,
        TYPE_ENCODED_ARRAY_ITEM = 0x2005,
        TYPE_ANNOTATIONS_DIRECTORY_ITEM = 0x2006,
        TYPE_HIDDENAPI_CLASS_DATA_ITEM = 0xF000
    }

    /**
     * DEX file magic number and version
     */
    export const DEX_FILE_MAGIC = "dex\n";
    export const DEX_SUPPORTED_VERSIONS = ["035", "036", "037", "038", "039"];

    /**
     * Access flags for classes, methods, and fields
     */
    export enum AccessFlags {
        ACC_PUBLIC = 0x1,
        ACC_PRIVATE = 0x2,
        ACC_PROTECTED = 0x4,
        ACC_STATIC = 0x8,
        ACC_FINAL = 0x10,
        ACC_SYNCHRONIZED = 0x20,
        ACC_VOLATILE = 0x40,
        ACC_BRIDGE = 0x40,
        ACC_TRANSIENT = 0x80,
        ACC_VARARGS = 0x80,
        ACC_NATIVE = 0x100,
        ACC_INTERFACE = 0x200,
        ACC_ABSTRACT = 0x400,
        ACC_STRICT = 0x800,
        ACC_SYNTHETIC = 0x1000,
        ACC_ANNOTATION = 0x2000,
        ACC_ENUM = 0x4000,
        ACC_CONSTRUCTOR = 0x10000,
        ACC_DECLARED_SYNCHRONIZED = 0x20000
    }

    /**
     * Type codes for encoded values
     */
    export enum ValueType {
        VALUE_BYTE = 0x00,
        VALUE_SHORT = 0x02,
        VALUE_CHAR = 0x03,
        VALUE_INT = 0x04,
        VALUE_LONG = 0x06,
        VALUE_FLOAT = 0x10,
        VALUE_DOUBLE = 0x11,
        VALUE_METHOD_TYPE = 0x15,
        VALUE_METHOD_HANDLE = 0x16,
        VALUE_STRING = 0x17,
        VALUE_TYPE = 0x18,
        VALUE_FIELD = 0x19,
        VALUE_METHOD = 0x1a,
        VALUE_ENUM = 0x1b,
        VALUE_ARRAY = 0x1c,
        VALUE_ANNOTATION = 0x1d,
        VALUE_NULL = 0x1e,
        VALUE_BOOLEAN = 0x1f
    }

    /**
     * DEX file header
     */
    export class DexHeader {
        magic: string = "";
        version: string = "";
        checksum: number = 0;
        signature: Buffer = Buffer.alloc(20);
        fileSize: number = 0;
        headerSize: number = 0x70;
        endianTag: number = 0;
        linkSize: number = 0;
        linkOff: number = 0;
        mapOff: number = 0;
        stringIdsSize: number = 0;
        stringIdsOff: number = 0;
        typeIdsSize: number = 0;
        typeIdsOff: number = 0;
        protoIdsSize: number = 0;
        protoIdsOff: number = 0;
        fieldIdsSize: number = 0;
        fieldIdsOff: number = 0;
        methodIdsSize: number = 0;
        methodIdsOff: number = 0;
        classDefsSize: number = 0;
        classDefsOff: number = 0;
        dataSize: number = 0;
        dataOff: number = 0;

        static fromBuffer(buffer: Buffer, offset: number = 0): DexHeader {
            const header = new DexHeader();

            // Read magic and version
            header.magic = buffer.subarray(offset, offset + 4).toString('ascii');
            header.version = buffer.subarray(offset + 4, offset + 7).toString('ascii');

            if (header.magic !== DEX_FILE_MAGIC) {
                throw new Error(`Invalid DEX magic: ${header.magic}`);
            }

            if (!DEX_SUPPORTED_VERSIONS.includes(header.version)) {
                // TODO : tag as unsupported version
                console.warn(`Unsupported DEX version: ${header.version}`);
            }

            offset += 8; // Skip magic and version and null byte

            // Read header fields
            const data = Struct.unpack('<I20sIIIIIIIIIIIIIIIIIIII', buffer, offset);
            header.checksum = data[0];
            header.signature = Buffer.from(data[1] as any);
            header.fileSize = data[2];
            header.headerSize = data[3];
            header.endianTag = data[4];
            header.linkSize = data[5];
            header.linkOff = data[6];
            header.mapOff = data[7];
            header.stringIdsSize = data[8];
            header.stringIdsOff = data[9];
            header.typeIdsSize = data[10];
            header.typeIdsOff = data[11];
            header.protoIdsSize = data[12];
            header.protoIdsOff = data[13];
            header.fieldIdsSize = data[14];
            header.fieldIdsOff = data[15];
            header.methodIdsSize = data[16];
            header.methodIdsOff = data[17];

            header.classDefsSize = data[18];
            header.classDefsOff = data[19];
            header.dataSize = data[20];
            header.dataOff = data[21];

            return header;
        }
    }

    /**
     * Utility class to read LEB128 encoded values
     */
    export class Leb128 {
        /**
         * Read an unsigned LEB128 value
         */
        static readUleb128(buffer: Buffer, offset: number): { value: number, size: number } {
            let result = 0;
            let shift = 0;
            let size = 0;

            while (true) {
                const byte = buffer[offset + size];
                result |= (byte & 0x7f) << shift;
                size++;

                if ((byte & 0x80) === 0) {
                    break;
                }

                shift += 7;
            }

            return { value: result, size };
        }

        /**
         * Read a signed LEB128 value
         */
        static readSleb128(buffer: Buffer, offset: number): { value: number, size: number } {
            let result = 0;
            let shift = 0;
            let size = 0;
            let byte: number;

            do {
                byte = buffer[offset + size];
                result |= (byte & 0x7f) << shift;
                shift += 7;
                size++;
            } while ((byte & 0x80) !== 0);

            // Sign extend if necessary
            if ((shift < 32) && (byte & 0x40)) {
                result |= -(1 << shift);
            }

            return { value: result, size };
        }

        /**
         * Read an unsigned LEB128p1 value (used for encoded_value)
         */
        static readUleb128p1(buffer: Buffer, offset: number): { value: number, size: number } {
            const { value, size } = Leb128.readUleb128(buffer, offset);
            return { value: value - 1, size };
        }
    }

    /**
     * String ID item
     */
    export class StringIdItem {
        stringDataOff: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): StringIdItem {
            const item = new StringIdItem();
            const [stringDataOff] = Struct.unpack('<I', buffer, offset);
            item.stringDataOff = stringDataOff;
            return item;
        }
    }

    /**
     * String data item
     */
    export class StringDataItem {
        utf16Size: number = 0;
        data: string = "";

        static fromBuffer(buffer: Buffer, offset: number): StringDataItem {
            const item = new StringDataItem();
            const { value: utf16Size, size: uleb128Size } = Leb128.readUleb128(buffer, offset);
            item.utf16Size = utf16Size;
            offset += uleb128Size;

            // Read MUTF-8 encoded string
            let endOffset = offset;
            while (buffer[endOffset] !== 0) {
                endOffset++;
            }

            item.data = buffer.subarray(offset, endOffset).toString('utf8');
            return item;
        }
    }

    /**
     * Type ID item
     */
    export class TypeIdItem {
        descriptorIdx: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): TypeIdItem {
            const item = new TypeIdItem();
            const [descriptorIdx] = Struct.unpack('<I', buffer, offset);
            item.descriptorIdx = descriptorIdx;
            return item;
        }
    }

    /**
     * Proto ID item
     */
    export class ProtoIdItem {
        shortyIdx: number = 0;
        returnTypeIdx: number = 0;
        parametersOff: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): ProtoIdItem {
            const item = new ProtoIdItem();
            const data = Struct.unpack('<III', buffer, offset);
            item.shortyIdx = data[0];
            item.returnTypeIdx = data[1];
            item.parametersOff = data[2];
            return item;
        }
    }

    /**
     * Field ID item
     */
    export class FieldIdItem {
        classIdx: number = 0;
        typeIdx: number = 0;
        nameIdx: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): FieldIdItem {
            const item = new FieldIdItem();
            const data = Struct.unpack('<HHI', buffer, offset);
            item.classIdx = data[0];
            item.typeIdx = data[1];
            item.nameIdx = data[2];
            return item;
        }
    }

    /**
     * Method ID item
     */
    export class MethodIdItem {
        classIdx: number = 0;
        protoIdx: number = 0;
        nameIdx: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): MethodIdItem {
            const item = new MethodIdItem();
            const data = Struct.unpack('<HHI', buffer, offset);
            item.classIdx = data[0];
            item.protoIdx = data[1];
            item.nameIdx = data[2];
            return item;
        }
    }

    /**
     * Class definition item
     */
    export class ClassDefItem {
        classIdx: number = 0;
        accessFlags: number = 0;
        superclassIdx: number = 0;
        interfacesOff: number = 0;
        sourceFileIdx: number = 0;
        annotationsOff: number = 0;
        classDataOff: number = 0;
        staticValuesOff: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): ClassDefItem {
            const item = new ClassDefItem();
            const data = Struct.unpack('<IIIIIIII', buffer, offset);
            item.classIdx = data[0];
            item.accessFlags = data[1];
            item.superclassIdx = data[2];
            item.interfacesOff = data[3];
            item.sourceFileIdx = data[4];
            item.annotationsOff = data[5];
            item.classDataOff = data[6];
            item.staticValuesOff = data[7];
            return item;
        }
    }

    /**
     * Type list
     */
    export class TypeList {
        size: number = 0;
        list: number[] = [];

        static fromBuffer(buffer: Buffer, offset: number): TypeList {
            const typeList = new TypeList();
            const [size] = Struct.unpack('<I', buffer, offset);
            typeList.size = size;
            offset += 4;

            for (let i = 0; i < size; i++) {
                const [typeIdx] = Struct.unpack('<H', buffer, offset);
                typeList.list.push(typeIdx);
                offset += 2;
            }

            return typeList;
        }
    }

    /**
     * Encoded field
     */
    export class EncodedField {
        fieldIdxDiff: number = 0;
        accessFlags: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): { field: EncodedField, offset: number } {
            const field = new EncodedField();
            const { value: fieldIdxDiff, size: size1 } = Leb128.readUleb128(buffer, offset);
            field.fieldIdxDiff = fieldIdxDiff;
            offset += size1;

            const { value: accessFlags, size: size2 } = Leb128.readUleb128(buffer, offset);
            field.accessFlags = accessFlags;
            offset += size2;

            return { field, offset };
        }
    }

    /**
     * Encoded method
     */
    export class EncodedMethod {
        methodIdxDiff: number = 0;
        accessFlags: number = 0;
        codeOff: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): { method: EncodedMethod, offset: number } {
            const method = new EncodedMethod();
            const { value: methodIdxDiff, size: size1 } = Leb128.readUleb128(buffer, offset);
            method.methodIdxDiff = methodIdxDiff;
            offset += size1;

            const { value: accessFlags, size: size2 } = Leb128.readUleb128(buffer, offset);
            method.accessFlags = accessFlags;
            offset += size2;

            const { value: codeOff, size: size3 } = Leb128.readUleb128(buffer, offset);
            method.codeOff = codeOff;
            offset += size3;

            return { method, offset };
        }
    }

    /**
     * Class data item
     */
    export class ClassDataItem {
        staticFieldsSize: number = 0;
        instanceFieldsSize: number = 0;
        directMethodsSize: number = 0;
        virtualMethodsSize: number = 0;
        staticFields: EncodedField[] = [];
        instanceFields: EncodedField[] = [];
        directMethods: EncodedMethod[] = [];
        virtualMethods: EncodedMethod[] = [];

        static fromBuffer(buffer: Buffer, offset: number): ClassDataItem {
            const classData = new ClassDataItem();

            // Read sizes
            let { value, size } = Leb128.readUleb128(buffer, offset);
            classData.staticFieldsSize = value;
            offset += size;

            ({ value, size } = Leb128.readUleb128(buffer, offset));
            classData.instanceFieldsSize = value;
            offset += size;

            ({ value, size } = Leb128.readUleb128(buffer, offset));
            classData.directMethodsSize = value;
            offset += size;

            ({ value, size } = Leb128.readUleb128(buffer, offset));
            classData.virtualMethodsSize = value;
            offset += size;

            // Read static fields
            for (let i = 0; i < classData.staticFieldsSize; i++) {
                const { field, offset: newOffset } = EncodedField.fromBuffer(buffer, offset);
                classData.staticFields.push(field);
                offset = newOffset;
            }

            // Read instance fields
            for (let i = 0; i < classData.instanceFieldsSize; i++) {
                const { field, offset: newOffset } = EncodedField.fromBuffer(buffer, offset);
                classData.instanceFields.push(field);
                offset = newOffset;
            }

            // Read direct methods
            for (let i = 0; i < classData.directMethodsSize; i++) {
                const { method, offset: newOffset } = EncodedMethod.fromBuffer(buffer, offset);
                classData.directMethods.push(method);
                offset = newOffset;
            }

            // Read virtual methods
            for (let i = 0; i < classData.virtualMethodsSize; i++) {
                const { method, offset: newOffset } = EncodedMethod.fromBuffer(buffer, offset);
                classData.virtualMethods.push(method);
                offset = newOffset;
            }

            return classData;
        }
    }

    /**
     * Try item
     */
    export class TryItem {
        startAddr: number = 0;
        insnCount: number = 0;
        handlerOff: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): TryItem {
            const tryItem = new TryItem();
            const data = Struct.unpack('<IHH', buffer, offset);
            tryItem.startAddr = data[0];
            tryItem.insnCount = data[1];
            tryItem.handlerOff = data[2];
            return tryItem;
        }
    }



    /**
     * Map item
     */
    export class MapItem {
        type: number = 0;
        unused: number = 0;
        size: number = 0;
        offset: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): MapItem {
            const item = new MapItem();
            const data = Struct.unpack('<HHII', buffer, offset);
            item.type = data[0];
            item.unused = data[1];
            item.size = data[2];
            item.offset = data[3];
            return item;
        }


        /**
         * Get the name of the item type
         */
        getTypeName(): string {
            switch (this.type) {
                case MapItemType.TYPE_HEADER_ITEM:
                    return 'TYPE_HEADER_ITEM';
                case MapItemType.TYPE_STRING_ID_ITEM:
                    return 'TYPE_STRING_ID_ITEM';
                case MapItemType.TYPE_TYPE_ID_ITEM:
                    return 'TYPE_TYPE_ID_ITEM';
                case MapItemType.TYPE_PROTO_ID_ITEM:
                    return 'TYPE_PROTO_ID_ITEM';
                case MapItemType.TYPE_FIELD_ID_ITEM:
                    return 'TYPE_FIELD_ID_ITEM';
                case MapItemType.TYPE_METHOD_ID_ITEM:
                    return 'TYPE_METHOD_ID_ITEM';
                case MapItemType.TYPE_CLASS_DEF_ITEM:
                    return 'TYPE_CLASS_DEF_ITEM';
                case MapItemType.TYPE_CALL_SITE_ID_ITEM:
                    return 'TYPE_CALL_SITE_ID_ITEM';
                case MapItemType.TYPE_METHOD_HANDLE_ITEM:
                    return 'TYPE_METHOD_HANDLE_ITEM';
                case MapItemType.TYPE_MAP_LIST:
                    return 'TYPE_MAP_LIST';
                case MapItemType.TYPE_TYPE_LIST:
                    return 'TYPE_TYPE_LIST';
                case MapItemType.TYPE_ANNOTATION_SET_REF_LIST:
                    return 'TYPE_ANNOTATION_SET_REF_LIST';
                case MapItemType.TYPE_ANNOTATION_SET_ITEM:
                    return 'TYPE_ANNOTATION_SET_ITEM';
                case MapItemType.TYPE_CLASS_DATA_ITEM:
                    return 'TYPE_CLASS_DATA_ITEM';
                case MapItemType.TYPE_CODE_ITEM:
                    return 'TYPE_CODE_ITEM';
                case MapItemType.TYPE_STRING_DATA_ITEM:
                    return 'TYPE_STRING_DATA_ITEM';
                case MapItemType.TYPE_DEBUG_INFO_ITEM:
                    return 'TYPE_DEBUG_INFO_ITEM';
                case MapItemType.TYPE_ANNOTATION_ITEM:
                    return 'TYPE_ANNOTATION_ITEM';
                case MapItemType.TYPE_ENCODED_ARRAY_ITEM:
                    return 'TYPE_ENCODED_ARRAY_ITEM';
                case MapItemType.TYPE_ANNOTATIONS_DIRECTORY_ITEM:
                    return 'TYPE_ANNOTATIONS_DIRECTORY_ITEM';
                case MapItemType.TYPE_HIDDENAPI_CLASS_DATA_ITEM:
                    return 'TYPE_HIDDENAPI_CLASS_DATA_ITEM';
                default:
                    return `UNKNOWN_TYPE_0x${this.type.toString(16).padStart(4, '0')}`;
            }
        }

        /**
         * Get a human-readable string representation
         */
        toString(): string {
            return `${this.getTypeName().padEnd(35)} size=${this.size.toString().padStart(6)} offset=0x${this.offset.toString(16).padStart(8, '0')}`;
        }
    }

    /**
     * Map list
     */
    export class MapList {
        size: number = 0;
        list: MapItem[] = [];

        static fromBuffer(buffer: Buffer, offset: number): MapList {
            const mapList = new MapList();
            const [size] = Struct.unpack('<I', buffer, offset);
            mapList.size = size;
            offset += 4;

            for (let i = 0; i < size; i++) {
                const item = MapItem.fromBuffer(buffer, offset);
                mapList.list.push(item);
                offset += 12;
            }

            return mapList;
        }
    }


    /**
     * Code item
     */
    export class CodeItem {
        registersSize: number = 0;
        insSize: number = 0;
        outsSize: number = 0;
        triesSize: number = 0;
        debugInfoOff: number = 0;
        insnsSize: number = 0;
        insns: number[] = [];
        tries: TryItem[] = [];
        decodedInsns: DalvikInstruction[] = [];

        static fromBuffer(buffer: Buffer, offset: number): CodeItem {
            const codeItem = new CodeItem();
            const data = Struct.unpack('<HHHHII', buffer, offset);
            codeItem.registersSize = data[0];
            codeItem.insSize = data[1];
            codeItem.outsSize = data[2];
            codeItem.triesSize = data[3];
            codeItem.debugInfoOff = data[4];
            codeItem.insnsSize = data[5];
            offset += 16;

            // Read instructions (16-bit code units)
            for (let i = 0; i < codeItem.insnsSize; i++) {
                const [insn] = Struct.unpack('<H', buffer, offset);
                codeItem.insns.push(insn);
                offset += 2;
            }

            // Padding if needed
            if (codeItem.triesSize !== 0 && codeItem.insnsSize % 2 === 1) {
                offset += 2;
            }

            // Read try items
            for (let i = 0; i < codeItem.triesSize; i++) {
                const tryItem = TryItem.fromBuffer(buffer, offset);
                codeItem.tries.push(tryItem);
                offset += 8;
            }

            const insn = codeItem.decodeInstructions();

            //console.log((new DalvikBytecodeDecoder()).opcodeTable, OPCODE);

            return codeItem;
        }

        /**
         * Decode bytecode to Dalvik instructions
         */
        decodeInstructions(): DalvikInstruction[] {
            if (this.decodedInsns.length > 0) {
                return this.decodedInsns;
            }

            const decoder = new DalvikBytecodeDecoder();
            this.decodedInsns = decoder.decode(this.insns);
            return this.decodedInsns;
        }

        /**
         * Get bytecode as hex string
         */
        getBytecodeHex(): string {
            return this.insns.map(x => x.toString(16).padStart(4, '0')).join(' ');
        }

        /**
         * Get human-readable disassembly
         */
        disassemble(stringPool?: string[]): string {
            const instructions = this.decodeInstructions();
            let output = '';
            let addr = 0;

            for (const insn of instructions) {
                output += `${addr.toString(16).padStart(8, '0')}: ${insn.toString(stringPool)}\n`;
                addr += insn.size;
            }

            return output;
        }
    }

    /**
     * Dalvik instruction representation
     */
    export class DalvikInstruction {
        opcode: number = 0;
        mnemonic: string = '';
        size: number = 0; // Size in 16-bit code units
        operands: any[] = [];
        format: string = '';

        constructor(opcode: number, mnemonic: string, format: string, size: number = 1) {
            this.opcode = opcode;
            this.mnemonic = mnemonic;
            this.format = format;
            this.size = size;
        }

        toString(stringPool?: string[]): string {
            let result = `${this.mnemonic.padEnd(20)}`;

            for (let i = 0; i < this.operands.length; i++) {
                if (i > 0) result += ', ';

                const operand = this.operands[i];

                if (typeof operand === 'object' && operand.type === 'register') {
                    result += `v${operand.value}`;
                } else if (typeof operand === 'object' && operand.type === 'string' && stringPool) {
                    result += `"${stringPool[operand.value] || `#${operand.value}`}"`;
                } else if (typeof operand === 'object' && operand.type === 'type') {
                    result += `type@${operand.value}`;
                } else if (typeof operand === 'object' && operand.type === 'field') {
                    result += `field@${operand.value}`;
                } else if (typeof operand === 'object' && operand.type === 'method') {
                    result += `method@${operand.value}`;
                } else if (typeof operand === 'object' && operand.type === 'offset') {
                    result += `+${operand.value}`;
                } else {
                    if (Array.isArray(operand)) {
                        result += operand.map(x => 'v'+x.value).join(', ');
                    }else{
                        if(operand.value==undefined){
                            console.log(operand, this);
                        }
                        result += `string@${operand.value}`;
                    }

                }
            }

            return result;
        }
    }

    /**
     * Dalvik bytecode decoder
     */
    export class DalvikBytecodeDecoder {

        static ctr=0;
        opcodeTable: Map<number, OpcodeInfo> = new Map();

        constructor() {
            this.initOpcodeTable();
            this.verify();
        }

        verify(): void {
            if(DalvikBytecodeDecoder.ctr>0) return;
            DalvikBytecodeDecoder.ctr++;


            let c=0;
            Object.values(OPCODE).map((vOp)=> {
                if(this.opcodeTable.get(vOp.byte)==null){
                    console.log(vOp.instr);
                    c++;
                }
            });

            console.log("Missing Opcodes: "+c);
            c = 0;
            this.opcodeTable.forEach((vOp, key)=> {
                let op = Object.values(OPCODE).find((vOp2)=> {
                    return (vOp2.byte==key);
                });
                if(op==null){
                    c++;
                    console.log("New Opcode: ", op.instr, "0x"+op.byte.toString(16));
                }
            });
            console.log("New Opcodes: "+c);

        }

        /**
         * Initialize opcode table with Dalvik instruction set
         */
        private initOpcodeTable(): void {
            // Format: opcode => { mnemonic, format, size }
            const opcodes: [number, string, string, number][] = Object.values(OPCODE).map((vOp)=>{
                return [ vOp.byte, vOp.instr, FormatOpcode[vOp.format], parseInt(FormatOpcode[vOp.format][0],10) ]
            })
            for (const [opcode, mnemonic, format, size] of opcodes) {
                this.opcodeTable.set(opcode, { mnemonic, format, size });
            }
            //console.log("Opcode Table Initialized",this.opcodeTable);
            /*
            const opcodes: [number, string, string, number][] = [
                // 10x format (no operands)
                [0x00, 'nop', '10x', 1],

                // 11x format (vAA)
                [0x0e, 'return-void', '10x', 1],
                [0x01, 'move', '12x', 1],
                [0x04, 'move-wide', '12x', 1],
                [0x07, 'move-object', '12x', 1],
                [0x0a, 'move-result', '11x', 1],
                [0x0b, 'move-result-wide', '11x', 1],
                [0x0c, 'move-result-object', '11x', 1],
                [0x0d, 'move-exception', '11x', 1],
                [0x0f, 'return', '11x', 1],
                [0x10, 'return-wide', '11x', 1],
                [0x11, 'return-object', '11x', 1],

                // 21c format (vAA, type@BBBB)
                [0x1a, 'const-string', '21c', 2],
                [0x1b, 'const-string/jumbo', '31c', 3],
                [0x1c, 'const-class', '21c', 2],
                [0x1f, 'check-cast', '21c', 2],
                [0x22, 'new-instance', '21c', 2],

                // 35c format (invoke)
                [0x6e, 'invoke-virtual', '35c', 3],
                [0x6f, 'invoke-super', '35c', 3],
                [0x70, 'invoke-direct', '35c', 3],
                [0x71, 'invoke-static', '35c', 3],
                [0x72, 'invoke-interface', '35c', 3],

                // 3rc format (invoke-range)
                [0x74, 'invoke-virtual/range', '3rc', 3],
                [0x75, 'invoke-super/range', '3rc', 3],
                [0x76, 'invoke-direct/range', '3rc', 3],
                [0x77, 'invoke-static/range', '3rc', 3],
                [0x78, 'invoke-interface/range', '3rc', 3],

                // 11n format (vA, #+B)
                [0x12, 'const/4', '11n', 1],

                // 21s format (vAA, #+BBBB)
                [0x13, 'const/16', '21s', 2],
                [0x16, 'const-wide/16', '21s', 2],
                [0x19, 'const-wide/32', '31i', 3],

                // 31i format (vAA, #+BBBBBBBB)
                [0x14, 'const', '31i', 3],
                [0x15, 'const/high16', '21h', 2],
                [0x17, 'const-wide', '51l', 5],
                [0x18, 'const-wide/high16', '21h', 2],

                // Field operations
                [0x52, 'iget', '22c', 2],
                [0x53, 'iget-wide', '22c', 2],
                [0x54, 'iget-object', '22c', 2],
                [0x55, 'iget-boolean', '22c', 2],
                [0x56, 'iget-byte', '22c', 2],
                [0x57, 'iget-char', '22c', 2],
                [0x58, 'iget-short', '22c', 2],
                [0x59, 'iput', '22c', 2],
                [0x5a, 'iput-wide', '22c', 2],
                [0x5b, 'iput-object', '22c', 2],
                [0x5c, 'iput-boolean', '22c', 2],
                [0x5d, 'iput-byte', '22c', 2],
                [0x5e, 'iput-char', '22c', 2],
                [0x5f, 'iput-short', '22c', 2],
                [0x60, 'sget', '21c', 2],
                [0x61, 'sget-wide', '21c', 2],
                [0x62, 'sget-object', '21c', 2],
                [0x63, 'sget-boolean', '21c', 2],
                [0x64, 'sget-byte', '21c', 2],
                [0x65, 'sget-char', '21c', 2],
                [0x66, 'sget-short', '21c', 2],
                [0x67, 'sput', '21c', 2],
                [0x68, 'sput-wide', '21c', 2],
                [0x69, 'sput-object', '21c', 2],
                [0x6a, 'sput-boolean', '21c', 2],
                [0x6b, 'sput-byte', '21c', 2],
                [0x6c, 'sput-char', '21c', 2],
                [0x6d, 'sput-short', '21c', 2],

                // Array operations
                [0x23, 'new-array', '22c', 2],
                [0x24, 'filled-new-array', '35c', 3],
                [0x25, 'filled-new-array/range', '3rc', 3],
                [0x26, 'fill-array-data', '31t', 3],
                [0x44, 'aget', '23x', 2],
                [0x45, 'aget-wide', '23x', 2],
                [0x46, 'aget-object', '23x', 2],
                [0x47, 'aget-boolean', '23x', 2],
                [0x48, 'aget-byte', '23x', 2],
                [0x49, 'aget-char', '23x', 2],
                [0x4a, 'aget-short', '23x', 2],
                [0x4b, 'aput', '23x', 2],
                [0x4c, 'aput-wide', '23x', 2],
                [0x4d, 'aput-object', '23x', 2],
                [0x4e, 'aput-boolean', '23x', 2],
                [0x4f, 'aput-byte', '23x', 2],
                [0x50, 'aput-char', '23x', 2],
                [0x51, 'aput-short', '23x', 2],

                // Comparison
                [0x2d, 'cmpl-float', '23x', 2],
                [0x2e, 'cmpg-float', '23x', 2],
                [0x2f, 'cmpl-double', '23x', 2],
                [0x30, 'cmpg-double', '23x', 2],
                [0x31, 'cmp-long', '23x', 2],

                // Branches
                [0x28, 'goto', '10t', 1],
                [0x29, 'goto/16', '20t', 2],
                [0x2a, 'goto/32', '30t', 3],
                [0x32, 'if-eq', '22t', 2],
                [0x33, 'if-ne', '22t', 2],
                [0x34, 'if-lt', '22t', 2],
                [0x35, 'if-ge', '22t', 2],
                [0x36, 'if-gt', '22t', 2],
                [0x37, 'if-le', '22t', 2],
                [0x38, 'if-eqz', '21t', 2],
                [0x39, 'if-nez', '21t', 2],
                [0x3a, 'if-ltz', '21t', 2],
                [0x3b, 'if-gez', '21t', 2],
                [0x3c, 'if-gtz', '21t', 2],
                [0x3d, 'if-lez', '21t', 2],

                // Binary operations
                [0x90, 'add-int', '23x', 2],
                [0x91, 'sub-int', '23x', 2],
                [0x92, 'mul-int', '23x', 2],
                [0x93, 'div-int', '23x', 2],
                [0x94, 'rem-int', '23x', 2],
                [0x95, 'and-int', '23x', 2],
                [0x96, 'or-int', '23x', 2],
                [0x97, 'xor-int', '23x', 2],
                [0x98, 'shl-int', '23x', 2],
                [0x99, 'shr-int', '23x', 2],
                [0x9a, 'ushr-int', '23x', 2],

                // More operations...
                [0xb0, 'add-int/2addr', '12x', 1],
                [0xb1, 'sub-int/2addr', '12x', 1],
                [0xb2, 'mul-int/2addr', '12x', 1],
                [0xb3, 'div-int/2addr', '12x', 1],
                [0xb4, 'rem-int/2addr', '12x', 1],

                // Literal operations
                [0xd0, 'add-int/lit16', '22s', 2],
                [0xd1, 'rsub-int', '22s', 2],
                [0xd2, 'mul-int/lit16', '22s', 2],
                [0xd3, 'div-int/lit16', '22s', 2],
                [0xd4, 'rem-int/lit16', '22s', 2],
                [0xd5, 'and-int/lit16', '22s', 2],
                [0xd6, 'or-int/lit16', '22s', 2],
                [0xd7, 'xor-int/lit16', '22s', 2],
                [0xd8, 'add-int/lit8', '22b', 2],
                [0xd9, 'rsub-int/lit8', '22b', 2],
                [0xda, 'mul-int/lit8', '22b', 2],
                [0xdb, 'div-int/lit8', '22b', 2],
                [0xdc, 'rem-int/lit8', '22b', 2],
                [0xdd, 'and-int/lit8', '22b', 2],
                [0xde, 'or-int/lit8', '22b', 2],
                [0xdf, 'xor-int/lit8', '22b', 2],
                [0xe0, 'shl-int/lit8', '22b', 2],
                [0xe1, 'shr-int/lit8', '22b', 2],
                [0xe2, 'ushr-int/lit8', '22b', 2],
            ];*/

            for (const [opcode, mnemonic, format, size] of opcodes) {
                this.opcodeTable.set(opcode, { mnemonic, format, size });
            }
        }


        static generateOpcodeTable():string{
            let result = "";
            Object.values(OPCODE).map((vOp)=> {
                result += `[0x${vOp.byte}, '${vOp.instr}', '${FormatOpcode[vOp.format]}', ${FormatOpcode[vOp.format][0]}]`;
            });
            return result;
        }
        /**
         * Decode bytecode array into instructions
         */
        decode(bytecode: number[]): DalvikInstruction[] {
            const instructions: DalvikInstruction[] = [];
            let i = 0;

            while (i < bytecode.length) {
                const opcode = bytecode[i] & 0xFF;
                const opcodeInfo = this.opcodeTable.get(opcode);

                if (!opcodeInfo) {
                    // Unknown opcode, skip
                    const insn = new DalvikInstruction(opcode, `unknown_${opcode.toString(16)}`, 'unknown', 1);
                    instructions.push(insn);
                    i++;
                    continue;
                }

                const insn = new DalvikInstruction(opcode, opcodeInfo.mnemonic, opcodeInfo.format, opcodeInfo.size);
                this.decodeOperands(insn, bytecode, i, opcodeInfo.format);
                instructions.push(insn);
                i += opcodeInfo.size;
            }

            return instructions;
        }

        /**
         * Decode operands based on instruction format
         */
        private decodeOperands(insn: DalvikInstruction, bytecode: number[], offset: number, format: string): void {
            const codeUnit = bytecode[offset];

            switch (format) {
                case '10x': // No operands
                    break;

                case '11x': // vAA
                    insn.operands.push({ type: 'register', value: (codeUnit >> 8) & 0xFF });
                    break;

                case '12x': // vA, vB
                    insn.operands.push({ type: 'register', value: (codeUnit >> 8) & 0x0F });
                    insn.operands.push({ type: 'register', value: (codeUnit >> 12) & 0x0F });
                    break;

                case '11n': // vA, #+B
                    insn.operands.push({ type: 'register', value: (codeUnit >> 8) & 0x0F });
                    insn.operands.push(((codeUnit >> 12) & 0x0F) << 28 >> 28); // Sign extend
                    break;

                case '21s': // vAA, #+BBBB
                case '21h': // vAA, #+BBBB0000
                case '21t': // vAA, +BBBB
                    insn.operands.push({ type: 'register', value: (codeUnit >> 8) & 0xFF });
                    if (offset + 1 < bytecode.length) {
                        const value = bytecode[offset + 1];
                        insn.operands.push(format === '21t' ? { type: 'offset', value } : value);
                    }
                    break;

                case '21c': // vAA, type@BBBB | string@BBBB | field@BBBB
                    insn.operands.push({ type: 'register', value: (codeUnit >> 8) & 0xFF });
                    if (offset + 1 < bytecode.length) {
                        const index = bytecode[offset + 1];
                        if (insn.mnemonic.includes('const-string')) {
                            insn.operands.push({ type: 'string', value: index });
                        } else if (insn.mnemonic.includes('const-class') || insn.mnemonic.includes('check-cast') || insn.mnemonic.includes('new-instance')) {
                            insn.operands.push({ type: 'type', value: index });
                        } else {
                            insn.operands.push({ type: 'field', value: index });
                        }
                    }
                    break;

                case '22c': // vA, vB, field@CCCC | type@CCCC
                case '22s': // vA, vB, #+CCCC
                case '22t': // vA, vB, +CCCC
                case '22b': // vAA, vBB, #+CC
                    insn.operands.push({ type: 'register', value: (codeUnit >> 8) & 0x0F });
                    insn.operands.push({ type: 'register', value: (codeUnit >> 12) & 0x0F });
                    if (offset + 1 < bytecode.length && format !== '22b') {
                        const value = bytecode[offset + 1];
                        if (format === '22c') {
                            insn.operands.push({ type: 'field', value });
                        } else if (format === '22t') {
                            insn.operands.push({ type: 'offset', value });
                        } else {
                            insn.operands.push(value);
                        }
                    } else if (format === '22b') {
                        insn.operands.push((codeUnit >> 8) & 0xFF);
                    }
                    break;

                case '23x': // vAA, vBB, vCC
                    insn.operands.push({ type: 'register', value: (codeUnit >> 8) & 0xFF });
                    if (offset + 1 < bytecode.length) {
                        const next = bytecode[offset + 1];
                        insn.operands.push({ type: 'register', value: next & 0xFF });
                        insn.operands.push({ type: 'register', value: (next >> 8) & 0xFF });
                    }
                    break;

                case '31i': // vAA, #+BBBBBBBB
                case '31t': // vAA, +BBBBBBBB
                    insn.operands.push({ type: 'register', value: (codeUnit >> 8) & 0xFF });
                    if (offset + 2 < bytecode.length) {
                        const value = bytecode[offset + 1] | (bytecode[offset + 2] << 16);
                        insn.operands.push(format === '31t' ? { type: 'offset', value } : value);
                    }
                    break;

                case '31c': // vAA, string@BBBBBBBB
                    insn.operands.push({ type: 'register', value: (codeUnit >> 8) & 0xFF });
                    if (offset + 2 < bytecode.length) {
                        const index = bytecode[offset + 1] | (bytecode[offset + 2] << 16);
                        insn.operands.push({ type: 'string', value: index });
                    }
                    break;

                case '35c': // {vC, vD, vE, vF, vG}, method@BBBB | type@BBBB
                    const regCount = (codeUnit >> 12) & 0x0F;
                    const regs = [];
                    if (offset + 2 < bytecode.length) {
                        const regList = bytecode[offset + 2];
                        if (regCount > 0) regs.push({ type: 'register', value: (codeUnit >> 8) & 0x0F });
                        if (regCount > 1) regs.push({ type: 'register', value: (regList) & 0x0F });
                        if (regCount > 2) regs.push({ type: 'register', value: (regList >> 4) & 0x0F });
                        if (regCount > 3) regs.push({ type: 'register', value: (regList >> 8) & 0x0F });
                        if (regCount > 4) regs.push({ type: 'register', value: (regList >> 12) & 0x0F });
                    }
                    insn.operands.push(regs);
                    if (offset + 1 < bytecode.length) {
                        insn.operands.push({ type: 'method', value: bytecode[offset + 1] });
                    }
                    break;

                case '3rc': // {vCCCC .. vNNNN}, method@BBBB | type@BBBB
                    if (offset + 2 < bytecode.length) {
                        const count = (codeUnit >> 8) & 0xFF;
                        const firstReg = bytecode[offset + 2];
                        insn.operands.push({ type: 'register_range', start: firstReg, count });
                        insn.operands.push({ type: 'method', value: bytecode[offset + 1] });
                    }
                    break;

                case '51l': // vAA, #+BBBBBBBBBBBBBBBB
                    insn.operands.push({ type: 'register', value: (codeUnit >> 8) & 0xFF });
                    if (offset + 4 < bytecode.length) {
                        const low = bytecode[offset + 1] | (bytecode[offset + 2] << 16);
                        const high = bytecode[offset + 3] | (bytecode[offset + 4] << 16);
                        insn.operands.push((BigInt(high) << 32n) | BigInt(low));
                    }
                    break;

                default:
                    // Unknown format
                    break;
            }
        }
    }

    interface OpcodeInfo {
        mnemonic: string;
        format: string;
        size: number;
    }


    /**
     * Field information
     */
    export interface FieldInfo {
        className: string;
        typeName: string;
        name: string;
        fieldId: DexStructures.FieldIdItem;
    }

    /**
     * Method information
     */
    export interface MethodInfo {
        className: string;
        name: string;
        returnType: string;
        paramTypes: string[];
        shorty: string;
        methodId: DexStructures.MethodIdItem;
        proto: DexStructures.ProtoIdItem;
    }

    /**
     * Class information
     */
    export interface ClassInfo {
        className: string;
        accessFlags: number;
        superClass: string | null;
        sourceFile: string | null;
        interfaces: string[];
        staticFields: Array<{ field: FieldInfo, accessFlags: number }>;
        instanceFields: Array<{ field: FieldInfo, accessFlags: number }>;
        directMethods: Array<{ method: MethodInfo, accessFlags: number, code: Nullable<DexStructures.CodeItem> }>;
        virtualMethods: Array<{ method: MethodInfo, accessFlags: number, code: Nullable<DexStructures.CodeItem> }>;
        classDef: DexStructures.ClassDefItem;
    }

}