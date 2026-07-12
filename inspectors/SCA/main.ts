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

// ===== INIT =====
import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";
import BusEvent from "../../src/BusEvent.js";
import {ScaBundleSwiftEvent, ScaJavaLibraryEvent} from "./Types.js";
import ModelBom from "../../src/ModelBom.js";
import {CycloneDX} from "../../src/bom/CycloneDX.js";
import EvidenceFieldType = CycloneDX.EvidenceFieldType;
import EvidenceTechnique = CycloneDX.EvidenceTechnique;

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var ScaInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    db: {
        dbms: 'inmemory',
        type: 'collection',
        name: 'sca'
    },

    tags: [
        {
            name:"sca.lang",
            _tagsOptions:[
                { name:"kotlin" },
                { name:"java" },
                { name:"objc" },
                { name:"js" },
                { name:"hermes" },
                { name:"c" }
            ]
        }
    ],

    hookSet: {
        id: "SCA",
        name: "Software Composition Analysis",
        description: "Detect languages and techs",

        // must be updated at runtime
        hookShare: {

        },

        strategies: [

        ]
    },

    eventListeners: {
        "sca.detect.java.library": function(pEvent:BusEvent<ScaJavaLibraryEvent>):any{
            (async ()=>{
                const ctx = pEvent.getContext();
                const data:ScaJavaLibraryEvent  = pEvent.getData();
                const tm = ctx.getTagManager();

                // TODO : search in signature DB

                ctx.getProjectDB().save(ModelBom.fromCdxComponent({
                    name: data.libraryName,
                    version: data.libraryVersion,
                    hashes: [],
                    components: [],
                    external_references: [],
                    licenses: [],
                    properties: [],
                    evidence: [
                        {
                            licenses: [],
                            copyright: [],
                            identity: [{
                                field: EvidenceFieldType.EVIDENCE_FIELD_NAME,
                                methods: [{
                                    technique: EvidenceTechnique.EVIDENCE_TECHNIQUE_BINARY_ANALYSIS,
                                    confidence: 0.8,
                                    value: data.proof.path // put search request instead
                                }],
                                tools: ["dxc"]
                            },{
                                field: EvidenceFieldType.EVIDENCE_FIELD_VERSION,
                                methods: [{
                                    technique: EvidenceTechnique.EVIDENCE_TECHNIQUE_BINARY_ANALYSIS,
                                    confidence: 0.8,
                                    value: data.proof.path // put search request instead
                                }],
                                tools: ["dxc"]
                            }],
                            occurrences: [{
                                location: data.proof.path
                            }]
                        }
                    ]
                }))
            })();

        },
        "sca.sbom.new": function(pEvent:BusEvent<ScaBundleSwiftEvent>):any{
            (async ()=>{
                const ctx = pEvent.getContext();
                const data:ScaJavaLibraryEvent  = pEvent.getData();
                const tm = ctx.getTagManager();

                // TODO : search in signature DB

                ctx.getProjectDB().save(ModelBom.fromCdxComponent({
                    name: data.libraryName,
                    version: data.libraryVersion,
                    hashes: [],
                    components: [],
                    external_references: [],
                    licenses: [],
                    properties: [],
                    evidence: [
                        {
                            licenses: [],
                            copyright: [],
                            identity: [{
                                field: EvidenceFieldType.EVIDENCE_FIELD_NAME,
                                methods: [{
                                    technique: EvidenceTechnique.EVIDENCE_TECHNIQUE_BINARY_ANALYSIS,
                                    confidence: 0.8,
                                    value: data.proof.path // put search request instead
                                }],
                                tools: ["dxc"]
                            },{
                                field: EvidenceFieldType.EVIDENCE_FIELD_VERSION,
                                methods: [{
                                    technique: EvidenceTechnique.EVIDENCE_TECHNIQUE_BINARY_ANALYSIS,
                                    confidence: 0.8,
                                    value: data.proof.path // put search request instead
                                }],
                                tools: ["dxc"]
                            }],
                            occurrences: [{
                                location: data.proof.path
                            }]
                        }
                    ]
                }))
            })();

        }
    },


});


export default ScaInspector;