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

import {Struct} from "@dexcalibur/dxc-struct";
import {AndroidBinary} from "./AndroidBinaryResourceUtils.js";

export namespace AxmlStructures {


    /**
     * DOM-like node structure for parsed XML
     */
    export interface XmlNode {
        type: 'element' | 'text' | 'comment';
        name?: string;
        namespace?: string | null;
        attributes?: Map<string, any>;
        children?: XmlNode[];
        text?: string;
        lineNumber?: number;
    }


    /**
     * XML attribute structure
     */
    export class AxmlAttribute {
        namespace: number = -1;
        name: number = 0;
        rawValue: number = -1;
        typedValue: AndroidBinary.ResValue = new AndroidBinary.ResValue();

        static fromBuffer(buffer: Buffer, offset: number): { attribute: AxmlAttribute, offset: number } {
            const attr = new AxmlAttribute();
            const data = Struct.unpack('<III', buffer, offset);
            attr.namespace = data[0];
            attr.name = data[1];
            attr.rawValue = data[2];
            offset += 12;

            const { value, offset: valueOffset } = AndroidBinary.ResValue.fromBuffer(buffer, offset);
            attr.typedValue = value;

            return { attribute: attr, offset: valueOffset };
        }

        getNameString(stringPool: AndroidBinary.ResStringPool): string {
            return stringPool.getString(this.name) || `attr_${this.name}`;
        }

        getNamespaceString(stringPool: AndroidBinary.ResStringPool): string | null {
            if (this.namespace === -1 || this.namespace === 0xFFFFFFFF) {
                return null;
            }
            return stringPool.getString(this.namespace);
        }

        getValue(stringPool: AndroidBinary.ResStringPool): any {
            return AndroidBinary.Utils.getResourceValue(this.typedValue, stringPool);
        }
    }

    /**
     * XML namespace structure
     */
    export class AxmlNamespace {
        header: AndroidBinary.ResChunkHeader;
        lineNumber: number = 0;
        comment: number = -1;
        prefix: number = 0;
        uri: number = 0;

        constructor(header: AndroidBinary.ResChunkHeader) {
            this.header = header;
        }

        static fromBuffer(buffer: Buffer, offset: number): { namespace: AxmlNamespace, offset: number } {
            const startOffset = offset;
            const { header, offset: newOffset } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
            offset = newOffset;

            const ns = new AxmlNamespace(header);

            const data = Struct.unpack('<IiII', buffer, offset);
            ns.lineNumber = data[0];
            ns.comment = data[1];
            ns.prefix = data[2];
            ns.uri = data[3];

            return { namespace: ns, offset: startOffset + header.size };
        }

        getPrefixString(stringPool: AndroidBinary.ResStringPool): string {
            return stringPool.getString(this.prefix) || `prefix_${this.prefix}`;
        }

        getUriString(stringPool: AndroidBinary.ResStringPool): string {
            return stringPool.getString(this.uri) || `uri_${this.uri}`;
        }
    }

    /**
     * XML start element structure
     */
    export class AxmlStartElement {
        header: AndroidBinary.ResChunkHeader;
        lineNumber: number = 0;
        comment: number = -1;
        namespace: number = -1;
        name: number = 0;
        attributeStart: number = 0;
        attributeSize: number = 0;
        attributeCount: number = 0;
        idIndex: number = 0;
        classIndex: number = 0;
        styleIndex: number = 0;
        attributes: AxmlAttribute[] = [];

        constructor(header: AndroidBinary.ResChunkHeader) {
            this.header = header;
        }

        static fromBuffer(buffer: Buffer, offset: number): { element: AxmlStartElement, offset: number } {
            const startOffset = offset;
            const { header, offset: newOffset } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
            offset = newOffset;

            const element = new AxmlStartElement(header);

            const data = Struct.unpack('<IiIIHHHHHH', buffer, offset);
            element.lineNumber = data[0];
            element.comment = data[1];
            element.namespace = data[2];
            element.name = data[3];
            element.attributeStart = data[4];
            element.attributeSize = data[5];
            element.attributeCount = data[6];
            element.idIndex = data[7];
            element.classIndex = data[8];
            element.styleIndex = data[9];
            offset += 28;

            // Read attributes
            for (let i = 0; i < element.attributeCount; i++) {
                const { attribute, offset: attrOffset } = AxmlAttribute.fromBuffer(buffer, offset);
                element.attributes.push(attribute);
                offset = attrOffset;
            }

            return { element, offset: startOffset + header.size };
        }

        getNameString(stringPool: AndroidBinary.ResStringPool): string {
            return stringPool.getString(this.name) || `element_${this.name}`;
        }

        getNamespaceString(stringPool: AndroidBinary.ResStringPool): string | null {
            if (this.namespace === -1 || this.namespace === 0xFFFFFFFF) {
                return null;
            }
            return stringPool.getString(this.namespace);
        }
    }

    /**
     * XML end element structure
     */
    export class AxmlEndElement {
        header: AndroidBinary.ResChunkHeader;
        lineNumber: number = 0;
        comment: number = -1;
        namespace: number = -1;
        name: number = 0;

        constructor(header: AndroidBinary.ResChunkHeader) {
            this.header = header;
        }

        static fromBuffer(buffer: Buffer, offset: number): { element: AxmlEndElement, offset: number } {
            const startOffset = offset;
            const { header, offset: newOffset } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
            offset = newOffset;

            const element = new AxmlEndElement(header);

            const data = Struct.unpack('<IiII', buffer, offset);
            element.lineNumber = data[0];
            element.comment = data[1];
            element.namespace = data[2];
            element.name = data[3];

            return { element, offset: startOffset + header.size };
        }

        getNameString(stringPool: AndroidBinary.ResStringPool): string {
            return stringPool.getString(this.name) || `element_${this.name}`;
        }

        getNamespaceString(stringPool: AndroidBinary.ResStringPool): string | null {
            if (this.namespace === -1 || this.namespace === 0xFFFFFFFF) {
                return null;
            }
            return stringPool.getString(this.namespace);
        }
    }

    /**
     * XML CDATA structure
     */
    export class AxmlCData {
        header: AndroidBinary.ResChunkHeader;
        lineNumber: number = 0;
        comment: number = -1;
        data: number = 0;
        typedData: AndroidBinary.ResValue = new AndroidBinary.ResValue();

        constructor(header: AndroidBinary.ResChunkHeader) {
            this.header = header;
        }

        static fromBuffer(buffer: Buffer, offset: number): { cdata: AxmlCData, offset: number } {
            const startOffset = offset;
            const { header, offset: newOffset } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
            offset = newOffset;

            const cdata = new AxmlCData(header);

            const data = Struct.unpack('<IiI', buffer, offset);
            cdata.lineNumber = data[0];
            cdata.comment = data[1];
            cdata.data = data[2];
            offset += 12;

            const { value, offset: valueOffset } = AndroidBinary.ResValue.fromBuffer(buffer, offset);
            cdata.typedData = value;

            return { cdata, offset: startOffset + header.size };
        }

        getDataString(stringPool: AndroidBinary.ResStringPool): string {
            return stringPool.getString(this.data) || `data_${this.data}`;
        }
    }

    /**
     * XML resource map
     */
    export class AxmlResourceMap {
        header: AndroidBinary.ResChunkHeader;
        resourceIds: number[] = [];

        constructor(header: AndroidBinary.ResChunkHeader) {
            this.header = header;
        }

        static fromBuffer(buffer: Buffer, offset: number): { resourceMap: AxmlResourceMap, offset: number } {
            const startOffset = offset;
            const { header, offset: newOffset } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
            offset = newOffset;

            const resourceMap = new AxmlResourceMap(header);

            const count = (header.size - header.headerSize) / 4;
            for (let i = 0; i < count; i++) {
                const [resId] = Struct.unpack('<I', buffer, offset);
                resourceMap.resourceIds.push(resId);
                offset += 4;
            }

            return { resourceMap, offset: startOffset + header.size };
        }
    }
}