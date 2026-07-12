
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

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {DbDataType, DbKeyType, INode, NodeProperty, NodeType, SerializeOptions} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "./core/IStringIndex.js";
import {CycloneDX} from "./bom/CycloneDX.js";
import {CryptoUtils} from "./CryptoUtils.js";
import {IPersistent} from "./persist/orm/IPersistent.js";


/**
 * Represent a BOM
 *
 *
 * @class
 */
export default class ModelBom  implements INode,IPersistent,CycloneDX.Bom
{
    static TYPE:NodeType = (new NodeType( "bom", NodeInternalType.BOM, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        // cdx
        (new NodeProperty("spec_version")).type(DbDataType.STRING).def(null),
        (new NodeProperty("version")).type(DbDataType.STRING).def(null),
        (new NodeProperty("serial_number")).type(DbDataType.STRING).def(null),
        (new NodeProperty("metadata")).type(DbDataType.STRING).def(null),
        (new NodeProperty("components")).type(DbDataType.STRING).def([]),
        (new NodeProperty("services")).type(DbDataType.STRING).def([]),
        (new NodeProperty("external_references")).type(DbDataType.STRING).def([]),
        (new NodeProperty("dependencies")).type(DbDataType.STRING).def([]),
        (new NodeProperty("compositions")).type(DbDataType.STRING).def([]),
        (new NodeProperty("vulnerabilities")).type(DbDataType.STRING).def([]),
        (new NodeProperty("annotations")).type(DbDataType.STRING).def([]),
        (new NodeProperty("properties")).type(DbDataType.STRING).def([]),
        (new NodeProperty("formulation")).type(DbDataType.STRING).def([])
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.BOM;

    // SRC_NODE_TYPE : SRC_UUID : STR_TYPE : UID
    _uid:string;
    tags:number[] = [];


    // cyclone DX interface

    // The version of the CycloneDX specification a BOM is written to (starting at version 1.3)
    spec_version: string;
    // The version allows component publishers/authors to make changes to existing BOMs to update various aspects of the document such as description or licenses. When a system is presented with multiple BOMs for the same component, the system should use the most recent version of the BOM. The default version is '1' and should be incremented for each version of the BOM that is published. Each version of a component should have a unique BOM and if no changes are made to the BOMs, then each BOM will have a version of '1'.
    version?: Nullable<number>;
    // Every BOM generated should have a unique serial number, even if the contents of the BOM being generated have not changed over time. The process or tool responsible for creating the BOM should create random UUID's for every BOM generated.
    serial_number?: Nullable<string>;
    // Provides additional information about a BOM.
    metadata?: Nullable<CycloneDX.Metadata> = null;
    // Provides the ability to document a list of components.
    components: CycloneDX.Component[] = [];
    // Provides the ability to document a list of external services.
    services: CycloneDX.Service[] = [];
    // Provides the ability to document external references related to the BOM or to the project the BOM describes.
    external_references: CycloneDX.ExternalReference[] = [];
    // Provides the ability to document dependency relationships.
    dependencies: CycloneDX.Dependency[] = [];
    // Compositions describe constituent parts (including components, services, and dependency relationships) and their completeness. The completeness of vulnerabilities expressed in a BOM may also be described.
    compositions: CycloneDX.Composition[] = [];
    // Vulnerabilities identified in components or services.
    vulnerabilities: CycloneDX.Vulnerability[] = [];
    // Comments made by people, organizations, or tools about any object with a bom-ref, such as components, services, vulnerabilities, or the BOM itself. Unlike inventory information, annotations may contain opinion or commentary from various stakeholders.
    annotations: CycloneDX.Annotation[] = [];
    // Specifies optional, custom, properties
    properties: CycloneDX.Property[] = [];
    // Describes how a component or service was manufactured or deployed. This is achieved through the use of formulas, workflows, tasks, and steps, which declare the precise steps to reproduce along with the observed formulas describing the steps which transpired in the manufacturing process.
    formulation: CycloneDX.Formula[] = [];

    constructor(pConfig:any) {

        if(pConfig !== null)
            for(const i in pConfig)
                this[i] = pConfig[i];
    }

    static fromCycloneDX( pConfig:CycloneDX.Bom):ModelBom{
        const bom = new ModelBom(pConfig);
        return bom;
    }

    static fromCdxComponent( pConfig:CycloneDX.Component):ModelBom{
        const bom = new ModelBom({
            components: [pConfig]
        });
        bom.generateUID();
        return bom;
    }

    generateUID():string {
        if(this.components.length==0){
            throw new Error("BOM Serial Number cannot be generated.");
        }

        return this._uid = CryptoUtils.md5(
            `${this.components[0].name}:${this.components[0].version}`,
            "hex",
            true);
    }

    getUID(): string {
        return this._uid;
    }

    toJsonObject(pOption?: SerializeOptions): any {
        return this;
    }
}

ModelBom.TYPE.builder(ModelBom);