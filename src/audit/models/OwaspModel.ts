import AssuranceModel from "../common/AssuranceModel.js";
import Control from "../common/Control.js";
import {Merlin} from "../../search/Merlin.js";
import ControlAssessment, {AnalysisType} from "../common/ControlAssessment.js";
import {TestType} from "../common/TestPlan.js";


export const OwaspMasvsModel = new AssuranceModel({
    id: "security.owasp_masvs",
    scannerID:"scanner.generic",
    name: "OWASP Mobile Application Verification Standard",
    description: "The OWASP MASVS (Mobile Application Security Verification Standard) is the industry standard for mobile app security",
    links: [
        "https://github.com/OWASP/owasp-masvs"
    ],
    controls:[
        new Control({
            id: "MASVS-STORAGE-1",
            name: "The app securely stores sensitive data.",
            description: "Apps handle sensitive data coming from many sources such as the user, the backend, system services or other apps on the device and usually need to store it locally. The storage locations may be private to the app (e.g. its internal storage) or be public and therefore accessible by the user or other co-installed apps (e.g. public folders such as Downloads). This control ensures that any sensitive data that is intentionally stored by the app is properly protected independently of the target location.",
            children: [
                new Control({
                    id: "MSTG-STORAGE-1",
                    name: "The app securely stores sensitive data.",
                    description: "Apps handle sensitive data coming from many sources such as the user, the backend, system services or other apps on the device and usually need to store it locally. The storage locations may be private to the app (e.g. its internal storage) or be public and therefore accessible by the user or other co-installed apps (e.g. public folders such as Downloads). This control ensures that any sensitive data that is intentionally stored by the app is properly protected independently of the target location.",
                    assessments: [
                        new ControlAssessment({
                            id:"android.perm",
                            name:"Android Permissions checks",
                            description: "Check AndroidManifest.xml for read/write external storage permissions",
                            testType: TestType.STATIC_SCAN,
                            analType: AnalysisType.SAST,
                            rules: [
                                Merlin.android().permission("name:^android\.permission\.WRITE_EXTERNAL_STORAGE$")
                            ]
                        }),
                        new ControlAssessment({
                            id:"API_keywords",
                            name:"Occurences of API keyword",
                            description: "Check the binary code for keywords/static fields from API related to data storage",
                            testType: TestType.STATIC_SCAN,
                            analType: AnalysisType.SAST,
                            rules: [
                                Merlin.android()
                                        .call("_signature_:^android\.content\.Context;->MODE_WORLD_READABLE$")
                                .intersect(
                                    Merlin.android()
                                        .call("_signature_:^android\.content\.Context;->MODE_WORLD_WRITABLE$")
                                )
                            ]
                        }),
                        new ControlAssessment({
                            id:"API_calls",
                            name:"Occurences of call to Android API",
                            description: "Check the binary code for call to API's methods related to data storage",
                            testType: TestType.STATIC_SCAN,
                            analType: AnalysisType.SAST,
                            rules: [
                                Merlin.android().call("calleed.enclosingClass.simpleName:^SharedPreferences$"),
                                Merlin.android().call("calleed.enclosingClass.simpleName:^FileOutPutStream$"),
                                Merlin.android().call("calleed.name:^getExternal"),
                                Merlin.android().call("calleed.name:^getWritableDatabase$"),
                                Merlin.android().call("calleed.name:^getReadableDatabase$"),
                                Merlin.android().call("calleed.name:^getCacheDir$"),
                                Merlin.android().call("calleed.name:^getExternalCacheDirs$"),
                            ]
                        }),
                    ]
                })
            ]
        }),
        new Control({
            id: "MASVS-RESILIENCE-1",
            name: "The app validates the integrity of the platform.",
            description: "Running on a platform that has been tampered with can be very dangerous for apps, as this may disable certain security features, putting the data of the app at risk. Trusting the platform is essential for many of the MASVS controls relying on the platform being secure (e.g. secure storage, biometrics, sandboxing, etc.). This control tries to validate that the OS has not been compromised and its security features can thus be trusted.",
            children: [
                new Control({
                    id: "MSTG-RESILIENCE-1",
                    name: "Testing Root Detection",
                    description: "Apps handle sensitive data coming from many sources such as the user, the backend, system services or other apps on the device and usually need to store it locally. The storage locations may be private to the app (e.g. its internal storage) or be public and therefore accessible by the user or other co-installed apps (e.g. public folders such as Downloads). This control ensures that any sensitive data that is intentionally stored by the app is properly protected independently of the target location.",
                    assessments: [
                        new ControlAssessment({
                            id:"android.perm",
                            name:"Android Permissions checks",
                            description: "Check AndroidManifest.xml for read/write external storage permissions",
                            testType: TestType.STATIC_SCAN,
                            analType: AnalysisType.SAST,
                            rules: [
                                Merlin.android().strings("value:test-keys"),
                                Merlin.android().strings("value:Superuser")
                            ]
                        }),
                        new ControlAssessment({
                            id:"android.perm",
                            name:"Android Permissions checks",
                            description: "Check AndroidManifest.xml for read/write external storage permissions",
                            testType: TestType.IAST,
                            analType: AnalysisType.DAST,
                            rules: [
                                Merlin.android().strings("value:google").on("data.uri.index")
                               // Merlin.android().inspector("RootDetection").dynamic_bypass()
                            ]
                        }),
                    ]
                })
            ]
        })
    ]
})


OwaspMasvsModel.updateControlTree(OwaspMasvsModel.controls);