
import {IParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelResource from "../ModelResource.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {TagUUID} from "@dexcalibur/dexcalibur-orm";
import ModelStringValue from "../ModelStringValue.js";
import {Struct} from "@dexcalibur/dxc-struct";
import {AndroidBinary} from "./common/AndroidBinaryResourceUtils.js";


export namespace Arsc {

    export interface Results extends IResults<ModelResource<any>> {
        ok: ModelResource<any>;
        invalid: any[];
    }

    export enum DataFormat {
        KEY_VALUE,
        TABLE
    }

    /**
     * Resource table configuration
     */
    export class ResTableConfig {
        size: number = 0;
        mcc: number = 0;
        mnc: number = 0;
        language: string = "";
        country: string = "";
        orientation: number = 0;
        touchscreen: number = 0;
        density: number = 0;
        keyboard: number = 0;
        navigation: number = 0;
        inputFlags: number = 0;
        inputPad0: number = 0;
        screenWidth: number = 0;
        screenHeight: number = 0;
        sdkVersion: number = 0;
        minorVersion: number = 0;

        static fromBuffer(buffer: Buffer, offset: number): { config: ResTableConfig, offset: number } {
            const config = new ResTableConfig();
            const [size] = Struct.unpack('<I', buffer, offset);
            config.size = size;

            if (size >= 28) {
                const data = Struct.unpack('<IHHBBBBHHBBBBHHHH', buffer, offset);
                config.mcc = data[1];
                config.mnc = data[2];

                const langBytes = buffer.subarray(offset + 8, offset + 10);
                config.language = String.fromCharCode(langBytes[0], langBytes[1]).replace(/\0/g, '');

                const countryBytes = buffer.subarray(offset + 10, offset + 12);
                config.country = String.fromCharCode(countryBytes[0], countryBytes[1]).replace(/\0/g, '');

                config.orientation = data[6];
                config.touchscreen = data[7];
                config.density = data[8];
                config.keyboard = data[9];
                config.navigation = data[10];
                config.inputFlags = data[11];
                config.inputPad0 = data[12];
                config.screenWidth = data[13];
                config.screenHeight = data[14];
                config.sdkVersion = data[15];
                config.minorVersion = data[16];
            }

            return { config, offset: offset + size };
        }
    }

    /**
     * Resource table entry
     */
    export class ResTableEntry {
        size: number = 0;
        flags: number = 0;
        key: number = 0;
        value: Nullable<AndroidBinary.ResValue> = null;
        isComplex: boolean = false;
        values: AndroidBinary.ResValue[] = [];

        static fromBuffer(buffer: Buffer, offset: number): { entry: ResTableEntry, offset: number } {
            const entry = new ResTableEntry();
            const entryHeader = Struct.unpack('<HHI', buffer, offset);
            entry.size = entryHeader[0];
            entry.flags = entryHeader[1];
            entry.key = entryHeader[2];
            offset += 8;

            entry.isComplex = (entry.flags & 0x0001) !== 0;

            if (entry.isComplex) {
                const [parent, count] = Struct.unpack('<II', buffer, offset);
                offset += 8;

                for (let i = 0; i < count; i++) {
                    const [name] = Struct.unpack('<I', buffer, offset);
                    offset += 4;
                    const { value, offset: valueOffset } = AndroidBinary.ResValue.fromBuffer(buffer, offset);
                    entry.values.push(value);
                    offset = valueOffset;
                }
            } else {
                const { value, offset: valueOffset } = AndroidBinary.ResValue.fromBuffer(buffer, offset);
                entry.value = value;
                offset = valueOffset;
            }

            return { entry, offset };
        }
    }

    /**
     * Resource table type spec structure
     */
    export class ResTableTypeSpec {
        header: AndroidBinary.ResChunkHeader;
        id: number = 0;
        res0: number = 0;
        res1: number = 0;
        entryCount: number = 0;
        entries: number[] = [];

        constructor(header: AndroidBinary.ResChunkHeader) {
            this.header = header;
        }

        static fromBuffer(buffer: Buffer, offset: number): { typeSpec: ResTableTypeSpec, offset: number } {
            const startOffset = offset;
            const { header, offset: newOffset } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
            offset = newOffset;

            const typeSpec = new ResTableTypeSpec(header);

            const specHeader = Struct.unpack('<BBHI', buffer, offset);
            typeSpec.id = specHeader[0];
            typeSpec.res0 = specHeader[1];
            typeSpec.res1 = specHeader[2];
            typeSpec.entryCount = specHeader[3];
            offset += 8;

            for (let i = 0; i < typeSpec.entryCount; i++) {
                const [entryFlags] = Struct.unpack('<I', buffer, offset);
                typeSpec.entries.push(entryFlags);
                offset += 4;
            }

            return { typeSpec, offset: startOffset + header.size };
        }
    }

    /**
     * Resource table type structure
     */
    export class ResTableType {
        header: AndroidBinary.ResChunkHeader;
        id: number = 0;
        res0: number = 0;
        res1: number = 0;
        entryCount: number = 0;
        entriesStart: number = 0;
        config: ResTableConfig = new ResTableConfig();
        entryOffsets: number[] = [];
        entries: ResTableEntry[] = [];

        constructor(header: AndroidBinary.ResChunkHeader) {
            this.header = header;
        }

        static fromBuffer(buffer: Buffer, offset: number): { type: ResTableType, offset: number } {
            const startOffset = offset;
            const { header, offset: newOffset } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
            offset = newOffset;

            const type = new ResTableType(header);

            const typeHeader = Struct.unpack('<BBHII', buffer, offset);
            type.id = typeHeader[0];
            type.res0 = typeHeader[1];
            type.res1 = typeHeader[2];
            type.entryCount = typeHeader[3];
            type.entriesStart = typeHeader[4];
            offset += 12;

            const { config, offset: configOffset } = ResTableConfig.fromBuffer(buffer, offset);
            type.config = config;
            offset = configOffset;

            for (let i = 0; i < type.entryCount; i++) {
                const [entryOffset] = Struct.unpack('<I', buffer, offset);
                type.entryOffsets.push(entryOffset);
                offset += 4;
            }

            const entriesBaseOffset = startOffset + type.entriesStart;
            for (let i = 0; i < type.entryCount; i++) {
                if (type.entryOffsets[i] === 0xFFFFFFFF) {
                    continue;
                }

                const entryOffset = entriesBaseOffset + type.entryOffsets[i];
                const { entry } = ResTableEntry.fromBuffer(buffer, entryOffset);
                type.entries.push(entry);
            }

            return { type, offset: startOffset + header.size };
        }
    }

    /**
     * Resource table package structure
     */
    export class ResTablePackage {
        header: AndroidBinary.ResChunkHeader;
        id: number = 0;
        name: string = "";
        typeStrings: number = 0;
        lastPublicType: number = 0;
        keyStrings: number = 0;
        lastPublicKey: number = 0;
        typeIdOffset: number = 0;

        typeStringPool: Nullable<AndroidBinary.ResStringPool> = null;
        keyStringPool: Nullable<AndroidBinary.ResStringPool> = null;
        typeSpecs: ResTableTypeSpec[] = [];
        types: ResTableType[] = [];

        constructor(header: AndroidBinary.ResChunkHeader) {
            this.header = header;
        }

        static fromBuffer(buffer: Buffer, offset: number): { package: ResTablePackage, offset: number } {
            const startOffset = offset;
            const { header, offset: newOffset } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
            offset = newOffset;

            if (header.type !== AndroidBinary.RES_TYPE.TABLE_PACKAGE) {
                throw new Error(`Invalid package type: ${header.type}`);
            }

            const pkg = new ResTablePackage(header);

            const pkgHeader = Struct.unpack('<I', buffer, offset);
            pkg.id = pkgHeader[0];
            offset += 4;

            const nameBuffer = buffer.subarray(offset, offset + 256);
            let nameLength = 0;
            for (let i = 0; i < 256; i += 2) {
                if (nameBuffer[i] === 0 && nameBuffer[i + 1] === 0) {
                    break;
                }
                nameLength = i + 2;
            }
            pkg.name = nameBuffer.subarray(0, nameLength).toString('utf16le');
            offset += 256;

            const pkgHeaderRest = Struct.unpack('<IIIII', buffer, offset);
            pkg.typeStrings = pkgHeaderRest[0];
            pkg.lastPublicType = pkgHeaderRest[1];
            pkg.keyStrings = pkgHeaderRest[2];
            pkg.lastPublicKey = pkgHeaderRest[3];
            pkg.typeIdOffset = pkgHeaderRest[4];
            offset += 20;

            const typeStringsOffset = startOffset + pkg.typeStrings;
            const { pool: typePool, offset: afterTypePool } = AndroidBinary.ResStringPool.fromBuffer(buffer, typeStringsOffset);
            pkg.typeStringPool = typePool;

            const keyStringsOffset = startOffset + pkg.keyStrings;
            const { pool: keyPool, offset: afterKeyPool } = AndroidBinary.ResStringPool.fromBuffer(buffer, keyStringsOffset);
            pkg.keyStringPool = keyPool;

            offset = Math.max(afterTypePool, afterKeyPool);
            const endOffset = startOffset + header.size;

            while (offset < endOffset) {
                const { header: chunkHeader } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);

                if (chunkHeader.type === AndroidBinary.RES_TYPE.TABLE_TYPE_SPEC) {
                    const { typeSpec, offset: newOff } = ResTableTypeSpec.fromBuffer(buffer, offset);
                    pkg.typeSpecs.push(typeSpec);
                    offset = newOff;
                } else if (chunkHeader.type === AndroidBinary.RES_TYPE.TABLE_TYPE) {
                    const { type, offset: newOff } = ResTableType.fromBuffer(buffer, offset);
                    pkg.types.push(type);
                    offset = newOff;
                } else {
                    offset += chunkHeader.size;
                }
            }

            return { package: pkg, offset: endOffset };
        }
    }

    /**
     * Main resource table structure
     */
    export class ResTable {
        header: AndroidBinary.ResChunkHeader;
        packageCount: number = 0;
        stringPool: Nullable<AndroidBinary.ResStringPool> = null;
        packages: ResTablePackage[] = [];

        constructor(header: AndroidBinary.ResChunkHeader) {
            this.header = header;
        }

        static fromBuffer(buffer: Buffer, offset: number = 0): ResTable {
            const startOffset = offset;
            const { header, offset: newOffset } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
            offset = newOffset;

            if (header.type !== AndroidBinary.RES_TYPE.TABLE) {
                throw new Error(`Invalid resource table type: ${header.type}`);
            }

            const table = new ResTable(header);

            const [packageCount] = Struct.unpack('<I', buffer, offset);
            table.packageCount = packageCount;
            offset += 4;

            const { header: nextHeader } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
            if (nextHeader.type === AndroidBinary.RES_TYPE.STRING_POOL) {
                const { pool, offset: poolOffset } = AndroidBinary.ResStringPool.fromBuffer(buffer, offset);
                table.stringPool = pool;
                offset = poolOffset;
            }

            const endOffset = startOffset + header.size;
            while (offset < endOffset) {
                const { header: pkgHeader } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);

                if (pkgHeader.type === AndroidBinary.RES_TYPE.TABLE_PACKAGE) {
                    const { package: pkg, offset: pkgOffset } = ResTablePackage.fromBuffer(buffer, offset);
                    table.packages.push(pkg);
                    offset = pkgOffset;
                } else {
                    offset += pkgHeader.size;
                }
            }

            return table;
        }

        getResources(): Map<string, any> {
            const resources = new Map<string, any>();

            for (const pkg of this.packages) {
                for (const type of pkg.types) {
                    const typeName = pkg.typeStringPool?.getString(type.id - 1) || `type_${type.id}`;

                    for (let i = 0; i < type.entries.length; i++) {
                        const entry = type.entries[i];
                        if (!entry) continue;

                        const keyName = pkg.keyStringPool?.getString(entry.key) || `key_${entry.key}`;
                        const resourceId = (pkg.id << 24) | (type.id << 16) | i;
                        const resourceName = `${pkg.name}:${typeName}/${keyName}`;

                        let value: any;
                        if (entry.isComplex) {
                            value = { type: 'complex', values: entry.values };
                        } else if (entry.value) {
                            value = this.getResourceValue(entry.value, pkg);
                        }

                        resources.set(resourceName, {
                            id: resourceId,
                            name: resourceName,
                            value: value,
                            package: pkg.name,
                            type: typeName,
                            key: keyName
                        });
                    }
                }
            }

            return resources;
        }

        private getResourceValue(resValue: AndroidBinary.ResValue, pkg: ResTablePackage): any {
            return AndroidBinary.Utils.getResourceValue(
                resValue,
                this.stringPool || pkg.typeStringPool || undefined
            );
        }
    }

    export const SUPPORTED_FORMATS: string[] = ["arsc"];

    export class Parser implements IParser<any> {

        FEATURES = [
            IParserFeature.STRUCT
        ];

        UID = "arsc_1.0.0";

        FORMAT_NAMES: string[] = ["arsc"];

        FILE_EXTENSIONS: string[] = [".arsc"];

        description = "Android Resource Storage Container (ARSC) file";

        arscTag: Nullable<TagUUID> = null;

        constructor() {

        }

        async fromBuffer(pBuffer: Buffer, pOffset: number, pOptions: IParserOptions = { encoding: 'utf-8', tags: [], raw: true }): Promise<Results> {
            if (pOptions.tags == null) pOptions.tags = [];

            const res: Results = {
                ok: null as any,
                invalid: [],
                strings: (pOptions.raw ? null : [])
            };

            const tags = pOptions.tags.map(t => t.getUUID());

            try {
                if (AndroidBinary.Utils.isUtf8Bom(pBuffer, pOffset)) pOffset += 3;

                const table = ResTable.fromBuffer(pBuffer, pOffset);
                const resources = table.getResources();

                const m = new ModelResource<any>({
                    value: null,
                    tags: pOptions.tags.map(t => t.getUUID())
                });

                const data = {
                    table: {
                        packageCount: table.packageCount,
                        packages: table.packages.map(pkg => ({
                            id: pkg.id,
                            name: pkg.name,
                            typeCount: pkg.types.length,
                            typeSpecCount: pkg.typeSpecs.length
                        }))
                    },
                    resources: Array.from(resources.entries()).map(([key, value]) => ({
                        name: key,
                        ...value
                    })),
                    resourceCount: resources.size
                };

                m.setProperty('data', data);
                m.setProperty('table', table);
                m.setProperty('resourceMap', resources);

                res.ok = m;

                if (!pOptions.raw && res.strings) {
                    for (const pkg of table.packages) {
                        if (pkg.typeStringPool) {
                            for (const str of pkg.typeStringPool.strings) {
                                if (str && str.length > 0) {
                                    const modelStr = new ModelStringValue({
                                        value: str,
                                        tags: tags
                                    });
                                    res.strings.push(modelStr);
                                }
                            }
                        }
                        if (pkg.keyStringPool) {
                            for (const str of pkg.keyStringPool.strings) {
                                if (str && str.length > 0) {
                                    const modelStr = new ModelStringValue({
                                        value: str,
                                        tags: tags
                                    });
                                    res.strings.push(modelStr);
                                }
                            }
                        }
                    }

                    if (table.stringPool) {
                        for (const str of table.stringPool.strings) {
                            if (str && str.length > 0) {
                                const modelStr = new ModelStringValue({
                                    value: str,
                                    tags: tags
                                });
                                res.strings.push(modelStr);
                            }
                        }
                    }
                }

            } catch (e) {
                res.invalid.push({
                    error: e instanceof Error ? e.message : String(e),
                    offset: pOffset
                });
            }

            return res;
        }

        setContext(pProject: DexcaliburProject): void {
        }
    }
}