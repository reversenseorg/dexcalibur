import AssuranceModel from "../common/AssuranceModel.js";
import Control from "../common/Control.js";
import {Merlin} from "../../search/Merlin.js";
import ControlAssessment, {AnalysisType, DataOperation, MetadataTopic} from "../common/ControlAssessment.js";
import {TestType} from "../common/TestPlan.js";
import {MetadataType} from "../common/Metadata.js";
import {PiiCriticity} from "../privacy/pii/PiiCategory.js";


export const ReversenseNetworkSecurityModel = new AssuranceModel({
    id: "security.network",
    scannerID:"scanner.generic",
    name: "Reversense Network Usage for Reverser",
    description: "A referential to audit network communication from security and reversing point of view",
    links: [
        "https://docs.reversense.com/refs/security.network"
    ],
    controls:[
        new Control({
            id: "RVS-NET-CRED",
            name: "Credentials",
            description: "The perform authentication ",
            children: [
                new Control({
                    id: "RVS-NET-CRED-1",
                    name: "UNIX Credentials",
                    description: "Apps handle sensitive data coming from many sources such as the user, the backend, system services or other apps on the device and usually need to store it locally. The storage locations may be private to the app (e.g. its internal storage) or be public and therefore accessible by the user or other co-installed apps (e.g. public folders such as Downloads). This control ensures that any sensitive data that is intentionally stored by the app is properly protected independently of the target location.",
                    assessments: [
                        new ControlAssessment({
                            id:"unix.creds",
                            name:"UNIX Credentials",
                            description: "",
                            testType: TestType.STATIC_SCAN,
                            analType: AnalysisType.SAST,
                            metadata: [
                                { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.PROCESSING},
                                { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.SENSITIVE}
                            ],
                            rules: [
                                Merlin.android().class("name:^android\.net\.Credentials$")
                            ]
                        })
                    ]
                })
            ]
        }),
        new Control({
            id: "RVS-NET-VPN",
            name: "VPNs",
            description: "The perform authentication ",
            children: [
                new Control({
                    id: "RVS-NET-CRED-1",
                    name: "UNIX Credentials",
                    description: "",
                    assessments: [
                        new ControlAssessment({
                            id:"vpn:PlatformVpnProfile",
                            name:"VPN Generic Profile",
                            description: "",
                            testType: TestType.STATIC_SCAN,
                            analType: AnalysisType.SAST,
                            metadata: [
                                { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.PROCESSING},
                                { type:MetadataType.ANY, key:"key_point", value:{ name:"vpn.use.PlatformVpnProfile$" }}
                            ],
                            rules: [
                                Merlin.android().method("calleed.enclosingClass.name:^android\.net\.PlatformVpnProfile$"),
                                Merlin.android().class("name:^android\.net\.PlatformVpnProfile$"),
                            ]
                        }),
                        new ControlAssessment({
                            id:"vpn:Ikev2VpnProfile",
                            name:"VPN Ikev2 Profile",
                            description: "",
                            testType: TestType.STATIC_SCAN,
                            analType: AnalysisType.SAST,
                            metadata: [
                                { type:MetadataType.URI, key:"android doc", value:"https://developer.android.com/reference/android/net/Ikev2VpnProfile"},
                                { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.PROCESSING},
                                { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.SENSITIVE},
                                { type:MetadataType.ANY, key:"availableSince", value:{ api:"android", version:"30" }},
                                { type:MetadataType.ANY, key:"key_point", value:{ name:"vpn.use.Ikev2VpnProfile" }},
                                { type:MetadataType.ANY, key:"password:getter", value:{ name:"android.net.Ikev2VpnProfile;->getPassword()<java.lang.String>" }},
                                { type:MetadataType.ANY, key:"password:setter", value:{ name:"android.net.Ikev2VpnProfile$Builder;->setAuthUsernamePassword()<java.lang.String>" }},
                                { type:MetadataType.ANY, key:"privatekey:getter", value:{ name:"android.net.Ikev2VpnProfile;->getRsaPrivateKey()<java.security.PrivateKey>" }}
                            ],
                            rules: [
                                Merlin.android().method("calleed.enclosingClass.name:^android\.net\.Ikev2VpnProfile$"),
                                Merlin.android().class("name:^android\.net\.Ikev2VpnProfile$"),
                            ]
                        }),
                    ]
                })
            ]
        })
    ]
});


ReversenseNetworkSecurityModel.updateControlTree(ReversenseNetworkSecurityModel.controls);