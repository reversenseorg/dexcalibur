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

import {Nullable} from "@dexcalibur/dxc-core-api";
import {Struct} from "@dexcalibur/dxc-struct";
import {AndroidBinary} from "./AndroidBinaryResourceUtils.js";
import {AxmlStructures} from "./AxmlStructures.js";
import XmlNode = AxmlStructures.XmlNode;

/**
 * Main AXML document structure
 */
export class AxmlDocument {

    header: AndroidBinary.ResChunkHeader;
    stringPool: Nullable<AndroidBinary.ResStringPool> = null;
    resourceMap: Nullable<AxmlStructures.AxmlResourceMap> = null;
    namespaces: Map<string, string> = new Map();
    rootNode: Nullable<XmlNode> = null;

    constructor(header: AndroidBinary.ResChunkHeader) {
        this.header = header;
    }

    static fromBuffer(buffer: Buffer, offset: number = 0): AxmlDocument {
        const startOffset = offset;
        const { header, offset: newOffset } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
        offset = newOffset;

        if (header.type !== AndroidBinary.RES_TYPE.XML) {
            throw new Error(`Invalid AXML document type: ${header.type}`);
        }

        const doc = new AxmlDocument(header);

        // Read string pool
        const { header: poolHeader } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
        if (poolHeader.type === AndroidBinary.RES_TYPE.STRING_POOL) {
            const { pool, offset: poolOffset } = AndroidBinary.ResStringPool.fromBuffer(buffer, offset);
            doc.stringPool = pool;
            offset = poolOffset;
        }

        // Read resource map (optional)
        if (offset < startOffset + header.size) {
            const { header: mapHeader } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);
            if (mapHeader.type === AndroidBinary.RES_TYPE.XML_RESOURCE_MAP) {
                const { resourceMap, offset: mapOffset } = AxmlStructures.AxmlResourceMap.fromBuffer(buffer, offset);
                doc.resourceMap = resourceMap;
                offset = mapOffset;
            }
        }

        // Parse XML nodes
        doc.rootNode = doc.parseNodes(buffer, offset, startOffset + header.size);

        return doc;
    }

    private parseNodes(buffer: Buffer, offset: number, endOffset: number): XmlNode {
        const root: XmlNode = {
            type: 'element',
            name: 'root',
            children: []
        };

        const stack: XmlNode[] = [root];

        while (offset < endOffset) {
            const { header } = AndroidBinary.ResChunkHeader.fromBuffer(buffer, offset);

            switch (header.type) {
                case AndroidBinary.RES_TYPE.XML_START_NAMESPACE: {
                    const { namespace: ns, offset: nsOffset } = AxmlStructures.AxmlNamespace.fromBuffer(buffer, offset);
                    const prefix = ns.getPrefixString(this.stringPool!);
                    const uri = ns.getUriString(this.stringPool!);
                    this.namespaces.set(prefix, uri);
                    offset = nsOffset;
                    break;
                }

                case AndroidBinary.RES_TYPE.XML_END_NAMESPACE: {
                    const { namespace: ns, offset: nsOffset } = AxmlStructures.AxmlNamespace.fromBuffer(buffer, offset);
                    offset = nsOffset;
                    break;
                }

                case AndroidBinary.RES_TYPE.XML_START_ELEMENT: {
                    const { element, offset: elemOffset } = AxmlStructures.AxmlStartElement.fromBuffer(buffer, offset);

                    const node: XmlNode = {
                        type: 'element',
                        name: element.getNameString(this.stringPool!),
                        namespace: element.getNamespaceString(this.stringPool!),
                        attributes: new Map(),
                        children: [],
                        lineNumber: element.lineNumber
                    };

                    // Parse attributes
                    for (const attr of element.attributes) {
                        const attrName = attr.getNameString(this.stringPool!);
                        const attrNs = attr.getNamespaceString(this.stringPool!);
                        const fullName = attrNs ? `${attrNs}:${attrName}` : attrName;
                        const attrValue = attr.getValue(this.stringPool!);
                        node.attributes!.set(fullName, attrValue);
                    }

                    const parent = stack[stack.length - 1];
                    parent.children!.push(node);
                    stack.push(node);
                    offset = elemOffset;
                    break;
                }

                case AndroidBinary.RES_TYPE.XML_END_ELEMENT: {
                    const { element, offset: elemOffset } = AxmlStructures.AxmlEndElement.fromBuffer(buffer, offset);
                    stack.pop();
                    offset = elemOffset;
                    break;
                }

                case AndroidBinary.RES_TYPE.XML_CDATA: {
                    const { cdata, offset: cdataOffset } = AxmlStructures.AxmlCData.fromBuffer(buffer, offset);
                    const textNode: XmlNode = {
                        type: 'text',
                        text: cdata.getDataString(this.stringPool!),
                        lineNumber: cdata.lineNumber
                    };
                    const parent = stack[stack.length - 1];
                    parent.children!.push(textNode);
                    offset = cdataOffset;
                    break;
                }

                default:
                    // Unknown chunk, skip it
                    offset += header.size;
                    break;
            }
        }

        return root;
    }

    /**
     * Convert to XML string
     */
    toXmlString(indent: number = 2): string {
        if (!this.rootNode || !this.rootNode.children) {
            return '';
        }

        let xml = '<?xml version="1.0" encoding="utf-8"?>\n';

        for (const child of this.rootNode.children) {
            xml += this.nodeToXml(child, 0, indent);
        }

        return xml;
    }

    private nodeToXml(node: XmlNode, level: number, indent: number): string {
        const indentStr = ' '.repeat(level * indent);

        if (node.type === 'text') {
            return `${indentStr}${node.text}\n`;
        }

        if (node.type !== 'element' || !node.name) {
            return '';
        }

        let xml = `${indentStr}<${node.name}`;

        // Add namespace declarations on root element
        if (level === 0 && this.namespaces.size > 0) {
            for (const [prefix, uri] of this.namespaces) {
                xml += ` xmlns:${prefix}="${uri}"`;
            }
        }

        // Add attributes
        if (node.attributes && node.attributes.size > 0) {
            for (const [name, value] of node.attributes) {
                let attrValue = value;
                if (typeof value === 'object' && value !== null) {
                    attrValue = value.value || JSON.stringify(value);
                }
                xml += ` ${name}="${this.escapeXml(String(attrValue))}"`;
            }
        }

        if (!node.children || node.children.length === 0) {
            xml += ' />\n';
        } else {
            xml += '>\n';
            for (const child of node.children) {
                xml += this.nodeToXml(child, level + 1, indent);
            }
            xml += `${indentStr}</${node.name}>\n`;
        }

        return xml;
    }

    private escapeXml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Get all strings from the document
     */
    getAllStrings(): string[] {
        const strings: string[] = [];
        if (this.stringPool) {
            strings.push(...this.stringPool.strings.filter(s => s && s.length > 0));
        }
        return strings;
    }
}