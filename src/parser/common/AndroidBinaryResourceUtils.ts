import {Struct} from "@dexcalibur/dxc-struct";

export namespace AndroidBinary {

    /**
     * Resource chunk types shared between ARSC and AXML
     */
    export enum RES_TYPE {
        NULL = 0x0000,
        STRING_POOL = 0x0001,
        TABLE = 0x0002,
        XML = 0x0003,
        XML_START_NAMESPACE = 0x0100,
        XML_END_NAMESPACE = 0x0101,
        XML_START_ELEMENT = 0x0102,
        XML_END_ELEMENT = 0x0103,
        XML_CDATA = 0x0104,
        XML_RESOURCE_MAP = 0x0180,
        TABLE_PACKAGE = 0x0200,
        TABLE_TYPE = 0x0201,
        TABLE_TYPE_SPEC = 0x0202,
        TABLE_LIBRARY = 0x0203
    }

    /**
     * String pool flags
     */
    export enum StringPoolFlags {
        SORTED = 1 << 0,
        UTF8 = 1 << 8
    }

    /**
     * Resource value types
     */
    export enum ValueType {
        NULL = 0x00,
        REFERENCE = 0x01,
        ATTRIBUTE = 0x02,
        STRING = 0x03,
        FLOAT = 0x04,
        DIMENSION = 0x05,
        FRACTION = 0x06,
        DYNAMIC_REFERENCE = 0x07,
        DYNAMIC_ATTRIBUTE = 0x08,
        FIRST_INT = 0x10,
        INT_DEC = 0x10,
        INT_HEX = 0x11,
        INT_BOOLEAN = 0x12,
        FIRST_COLOR_INT = 0x1c,
        INT_COLOR_ARGB8 = 0x1c,
        INT_COLOR_RGB8 = 0x1d,
        INT_COLOR_ARGB4 = 0x1e,
        INT_COLOR_RGB4 = 0x1f,
        LAST_COLOR_INT = 0x1f,
        LAST_INT = 0x1f
    }

    /**
     * Generic chunk header structure
     */
    export class ResChunkHeader {
        type: number = 0;
        headerSize: number = 0;
        size: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): { header: ResChunkHeader, offset: number } {
            const header = new ResChunkHeader();
            const data = Struct.unpack('<HHI', buffer, offset);
            header.type = data[0];
            header.headerSize = data[1];
            header.size = data[2];
            return { header, offset: offset + 8 };
        }

        getType(): RES_TYPE {
            return this.type as RES_TYPE;
        }
    }

    /**
     * String pool structure (shared between ARSC and AXML)
     */
    export class ResStringPool {
        header: ResChunkHeader;
        stringCount: number = 0;
        styleCount: number = 0;
        flags: number = 0;
        stringsStart: number = 0;
        stylesStart: number = 0;
        stringOffsets: number[] = [];
        styleOffsets: number[] = [];
        strings: string[] = [];
        styles: any[] = [];

        constructor(header: ResChunkHeader) {
            this.header = header;
        }

        static fromBuffer(buffer: Buffer, offset: number): { pool: ResStringPool, offset: number } {
            const startOffset = offset;
            const { header, offset: newOffset } = ResChunkHeader.fromBuffer(buffer, offset);
            offset = newOffset;

            if (header.type !== RES_TYPE.STRING_POOL) {
                throw new Error(`Invalid string pool type: ${header.type}`);
            }

            const pool = new ResStringPool(header);

            // Read string pool header
            const poolHeader = Struct.unpack('<IIIII', buffer, offset);
            pool.stringCount = poolHeader[0];
            pool.styleCount = poolHeader[1];
            pool.flags = poolHeader[2];
            pool.stringsStart = poolHeader[3];
            pool.stylesStart = poolHeader[4];
            offset += 20;

            // Read string offsets
            for (let i = 0; i < pool.stringCount; i++) {
                const [stringOffset] = Struct.unpack('<I', buffer, offset);
                pool.stringOffsets.push(stringOffset);
                offset += 4;
            }

            // Read style offsets
            for (let i = 0; i < pool.styleCount; i++) {
                const [styleOffset] = Struct.unpack('<I', buffer, offset);
                pool.styleOffsets.push(styleOffset);
                offset += 4;
            }

            // Read strings
            const isUtf8 = (pool.flags & StringPoolFlags.UTF8) !== 0;
            const stringsBaseOffset = startOffset + pool.stringsStart;

            for (let i = 0; i < pool.stringCount; i++) {
                const stringOffset = stringsBaseOffset + pool.stringOffsets[i];
                const str = ResStringPool.readString(buffer, stringOffset, isUtf8);
                pool.strings.push(str);
            }

            return { pool, offset: startOffset + header.size };
        }

        private static readString(buffer: Buffer, offset: number, isUtf8: boolean): string {
            if (isUtf8) {
                // UTF-8 encoded string
                // First byte(s): character count
                let charCount = buffer[offset];
                let strOffset = offset + 1;

                if ((charCount & 0x80) !== 0) {
                    charCount = ((charCount & 0x7F) << 8) | buffer[strOffset];
                    strOffset++;
                }

                // Second byte(s): byte count
                let byteCount = buffer[strOffset];
                strOffset++;

                if ((byteCount & 0x80) !== 0) {
                    byteCount = ((byteCount & 0x7F) << 8) | buffer[strOffset];
                    strOffset++;
                }

                // Read string bytes
                const strBuffer = buffer.subarray(strOffset, strOffset + byteCount);
                return strBuffer.toString('utf8');
            } else {
                // UTF-16 encoded string
                let charCount = buffer.readUInt16LE(offset);
                let strOffset = offset + 2;

                if ((charCount & 0x8000) !== 0) {
                    charCount = ((charCount & 0x7FFF) << 16) | buffer.readUInt16LE(strOffset);
                    strOffset += 2;
                }

                // Read string bytes (2 bytes per character)
                const byteCount = charCount * 2;
                const strBuffer = buffer.subarray(strOffset, strOffset + byteCount);
                return strBuffer.toString('utf16le');
            }
        }

        getString(index: number): string | null {
            if (index < 0 || index >= this.strings.length) {
                return null;
            }
            return this.strings[index];
        }

        isUtf8(): boolean {
            return (this.flags & StringPoolFlags.UTF8) !== 0;
        }
    }

    /**
     * Resource value structure
     */
    export class ResValue {
        size: number = 0;
        res0: number = 0;
        dataType: number = 0;
        data: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): { value: ResValue, offset: number } {
            const value = new ResValue();
            const data = Struct.unpack('<HBBI', buffer, offset);
            value.size = data[0];
            value.res0 = data[1];
            value.dataType = data[2];
            value.data = data[3];
            return { value, offset: offset + 8 };
        }

        getType(): ValueType {
            return this.dataType as ValueType;
        }
    }

    /**
     * Utility functions for Android binary formats
     */
    export class Utils {
        static isUtf8Bom(buffer: Buffer, offset: number): boolean {
            return (buffer.at(offset) === 0xEF
                && buffer.at(offset + 1) === 0xBB
                && buffer.at(offset + 2) === 0xBF);
        }

        static formatResourceId(id: number): string {
            return `0x${id.toString(16).padStart(8, '0')}`;
        }

        static getResourceValue(resValue: ResValue, stringPool?: ResStringPool): any {
            switch (resValue.dataType) {
                case ValueType.NULL:
                    return null;
                case ValueType.REFERENCE:
                    return { type: 'reference', value: Utils.formatResourceId(resValue.data) };
                case ValueType.ATTRIBUTE:
                    return { type: 'attribute', value: Utils.formatResourceId(resValue.data) };
                case ValueType.STRING:
                    return stringPool?.getString(resValue.data) || `string_${resValue.data}`;
                case ValueType.INT_DEC:
                case ValueType.INT_HEX:
                    return resValue.data;
                case ValueType.INT_BOOLEAN:
                    return resValue.data !== 0;
                case ValueType.INT_COLOR_ARGB8:
                case ValueType.INT_COLOR_RGB8:
                case ValueType.INT_COLOR_ARGB4:
                case ValueType.INT_COLOR_RGB4:
                    return `#${resValue.data.toString(16).padStart(8, '0')}`;
                case ValueType.FLOAT:
                    const floatBuffer = Buffer.alloc(4);
                    floatBuffer.writeUInt32LE(resValue.data);
                    return floatBuffer.readFloatLE(0);
                case ValueType.DIMENSION:
                    return Utils.formatDimension(resValue.data);
                case ValueType.FRACTION:
                    return Utils.formatFraction(resValue.data);
                default:
                    return { type: resValue.dataType, data: resValue.data };
            }
        }

        private static formatDimension(data: number): string {
            const units = ['px', 'dip', 'sp', 'pt', 'in', 'mm'];
            const value = (data >> 8) / (1 << ((data >> 4) & 0x0f));
            const unit = units[data & 0x0f] || 'unknown';
            return `${value}${unit}`;
        }

        private static formatFraction(data: number): string {
            const value = (data >> 8) / (1 << ((data >> 4) & 0x0f));
            const type = data & 0x0f;
            return type === 0 ? `${value}%` : `${value}%p`;
        }
    }
}
