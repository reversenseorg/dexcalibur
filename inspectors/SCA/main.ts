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