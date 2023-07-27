import AssuranceModel from "../common/AssuranceModel.js";
import Control from "../common/Control.js";
import ControlAssessment, {DataOperation, MetadataTopic} from "../common/ControlAssessment.js";
import {Merlin} from "../../search/Merlin.js";
import {MetadataType} from "../common/Metadata.js";
import ModelField from "../../ModelField.js";
import {PiiCriticity} from "../privacy/pii/PiiCategory.js";
import ModelClass from "../../ModelClass.js";


const model = new AssuranceModel({
    id: "privacy.pii2",
    scannerID:"scanner.generic",
    name: "Personal Identifiable Information 2",
    description: "N/A",
    links: [],
    controls:[

    ]
});



export const PII_DataType:any = {
    postalAddress: new Control({
        name:"postal_address",
        children: [
            new Control({
                name: "house_name",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        name: "house_name:api",
                        metadata: [
                            { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.PROCESSING }
                        ],
                        rules: [
                            Merlin.android().call("calleed.name:^android\.location\.Address;->getSubThoroughfare"),
                        ]
                    }),
                ]
            }),
            new Control({
                name: "postbox_number",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        name: "postbox_number:api",
                        metadata: [
                            { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.PROCESSING }
                        ],
                        rules: [
                            Merlin.android().call("calleed.name:^android\.location\.Address;->getAddressLine"),
                            Merlin.android().call("calleed.name:^android\.location\.Address;->getSubThoroughfare"),
                        ]
                    }),
                ]
            }),
            new Control({
                name: "street",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        name: "street:api",
                        metadata: [
                            { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.PROCESSING }
                        ],
                        rules: [
                            Merlin.android().method("name:^android\.location\.Address;->getAddressLine"),
                            Merlin.android().class("name:^android\.location\.Address")
                        ]
                    }),
                ]
            }),

            /**
             * https://developer.android.com/reference/android/view/View.html#setAutofillHints(java.lang.String[])
             * https://developer.android.com/reference/androidx/autofill/HintConstants#attr_android:autofillHint
             */
            new Control({
                name: "zip_code",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        name: "zip_code:source",
                        metadata: [
                            { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.SOURCING }
                        ],
                        rules: [
                            Merlin.android().call("calleed.name:^android\.view\.View;->setAutofillHints"),
                            Merlin.android().field("__signature__:^androidx\.autofill\.HintConstants;->AUTOFILL_HINT_POSTAL_ADDRESS_EXTENDED_POSTAL_CODE")
                                .select(ModelField.TYPE.getProperty("callers")),
                            Merlin.android().field("__signature__:^androidx\.autofill\.HintConstants;->AUTOFILL_HINT_POSTAL_CODE")
                                .select(ModelField.TYPE.getProperty("callers"))
                                .select(ModelField.TYPE.getProperty("callers")),
                            Merlin.flutter().field("enclosingClass.name:AutofillHints").filter("name:^postalCode$")
                        ]
                    }),
                    new ControlAssessment({
                        name: "zip_code:api",
                        metadata: [
                            { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.PROCESSING }
                        ],
                        rules: [
                            Merlin.android().call("calleed.name:^android\.location\.Address;->getPostalCode"),
                            Merlin.android().field("field.name:^android\.location\.Address;->getPostalCode"),
                        ]
                    })
                ]
            }),
            new Control({
                name: "country",

            }),
            new Control({
                name: "province"
            })
        ]
    }),
    phoneNumbers: new Control({
        name:"phone numbers",
        assessments: [
            new ControlAssessment({
                name: "phone",
                rules: [
                    Merlin.android().class("name:RelationType" ),
                ]
            }),
            new ControlAssessment({
                name: "fax",
                rules: [
                    Merlin.android().class("name:RelationType" ),
                ]
            })
        ]
    }),
    email: new ControlAssessment({
        name:"email",
        rules: [
            Merlin.android().class("name:RegExp"),
        ]
    })
};


const PII_Data:Control[] = [
    new Control({
        id: "identity",
        name: "Identity",
        children: [
            new Control({
                id: "basicIdentity",
                name: "Basic identity",
                metadata: [
                    { type:MetadataType.ANY, key:"criticity", value:PiiCriticity.LOW }
                ],
                children: [
                    new Control({
                        id:"username",
                        name:"username",
                        assessments: [
                            new ControlAssessment({
                                name: "username:source",
                                metadata: [
                                    { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.SOURCING }
                                ],
                                rules: [
                                    Merlin.android().call("calleed.name:^android\.view\.View;->setAutofillHints"),
                                    Merlin.android().field("__signature__:^androidx\.autofill\.HintConstants;->AUTOFILL_HINT_USERNAME")
                                        .select(ModelField.TYPE.getProperty("callers"))
                                ]
                            }),
                            new ControlAssessment({
                                name:"username:api",
                                metadata: [
                                    { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.PROCESSING }
                                ],
                                rules: [
                                    Merlin.android().method("name:^UserName.*" ),
                                    Merlin.android().nocase().field("name:userame" ),
                                    Merlin.android().class("name:Person" ),
                                    Merlin.android().class("name:User" )
                                ]
                            })

                        ]
                    }),


                ],
                assessments: [
                    new ControlAssessment({
                        id:"title",
                        name:"Title",
                        rules: [
                            Merlin.android().class("name:Civility" ),
                        ]
                    }),
                    new ControlAssessment({
                        id:"lastname",
                        name:"Lastname",
                        rules: [
                            Merlin.android().method("name:^getLastName.*" ),
                            Merlin.android().class("name:Person" ),
                            Merlin.android().class("name:User" )
                        ]
                    }),
                    new ControlAssessment({
                        id:"firstname",
                        name:"Firstname",
                        rules: [
                            Merlin.android().method("name:^getFirstName.*" ),
                            Merlin.android().class("name:Person" ),
                            Merlin.android().class("name:User" )
                        ]
                    }),

                    new ControlAssessment({
                        id:"age",
                        name:"Age",
                        rules: [
                            Merlin.android().class("name:Civility" ),
                        ]
                    }),
                    new ControlAssessment({
                        id:"status",
                        name:"status",
                        rules: [
                            Merlin.android().class("name:RelationType" ),
                        ]
                    }),
                ]

            }),
            new Control({
                id: "advancedIdentity",
                name: "Advanced identity",
                metadata: [
                    { type:MetadataType.ANY, key:"criticity", value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        id:"nationality",
                        name:"nationality",
                        rules: [
                            Merlin.android().method("name:^getNationality.*" ),
                            Merlin.android().nocase().field("name:nationality" ),
                            Merlin.android().nocase().class("name:nationality" ).select(ModelClass.TYPE.getProperty("methods")),
                            Merlin.android().nocase().strings("value:nationality" )
                        ]
                    }),
                    new ControlAssessment({
                        id:"birthdate",
                        name:"birthdate",
                        rules: [
                            Merlin.android().method("name:^getBirthDate.*" ),
                            Merlin.android().nocase().field("name:birthdate" ),
                            Merlin.android().nocase().strings("value:birthdate" )
                        ]
                    }),
                    new ControlAssessment({
                        id:"deadStatus",
                        name:"Dead Status"
                    }),
                    new ControlAssessment({
                        id:"coupleStatus",
                        name:"Couple status",
                        rules: [
                            Merlin.android().class("name:RelationType" ),
                        ]
                    }),
                    new ControlAssessment({
                        id:"deadDate",
                        name:"Dead"
                    }),
                    new ControlAssessment({
                        id:"residenceCountry",
                        name:"Residence country"
                    }),
                ]
            }),
            new Control({
                id: "family",
                name: "Family",
                metadata: [
                    { type:MetadataType.ANY, key:"criticity", value:PiiCriticity.LOW }
                ],
                children: [
                    new Control({
                        id:"familyRelationship",
                        name:"Family Relationship",
                        children: [
                            //   class: "identify"
                        ]
                    })
                ],
                assessments: [
                    new ControlAssessment({
                        id:"matriomonialStatus",
                        name:"Matriomonial Status",
                        rules: [
                            Merlin.android().class("name:RelationType" ),
                        ]
                    })
                ]
            }),
            new Control({
                id: "idDocMetadata",
                name: "ID documents metadata",
                metadata: [
                    { type:MetadataType.ANY, key:"criticity", value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        id:"idCardId",
                        name:"ID card ID"
                    }),
                    new ControlAssessment({
                        id:"idCardIssueDate",
                        name:"ID card issue date",
                    }),
                    new ControlAssessment({
                        id:"idCardIssueLocation",
                        name:"ID card issue location",
                    }),
                    new ControlAssessment({
                        id:"authorityId",
                        name:"Authority ID",
                    })
                ]
            }),
            new Control({
                id:"idDoc",
                name: "identity documents",
                metadata: [
                    { type:MetadataType.ANY, key:"criticity", value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        id:"idCard",
                        name:"ID card"
                    }),
                    new ControlAssessment({
                        id:"passport",
                        name:"Passport",
                    }),
                    new ControlAssessment({
                        id:"driverLicence",
                        name:"Driver licence",
                    })
                ]
            }),
            new Control({
                id: "media",
                name: "Media Resources",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        id: "picture",
                        name:"picture"
                    }),
                    new ControlAssessment({
                        id: "video",
                        name:"video",
                    })
                ]
            })
        ]
    }),
    new Control({
        id: "contact",
        name: "Contact",
        children: [
            new Control({
                id: "personalContact",
                name: "personal contact",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                children: [
                    PII_DataType.postalAddress as Control,
                    PII_DataType.phoneNumbers as Control,
                    PII_DataType.email as Control
                ]
            }),
            new Control({
                id: "professionalContact",
                name: "professional contact",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                children: [
                    PII_DataType.postalAddress as Control,
                    PII_DataType.phoneNumbers as Control,
                    PII_DataType.email as Control
                ]
            })
        ]
    }),
    new Control({
        id: "banking",
        name: "banking",
        children: [
            new Control({
                id: "bankingAddress",
                name: "Banking address",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
                ],
                children: [
                    PII_DataType.postalAddress as Control
                ],
                assessments: [
                    new ControlAssessment({
                        id: "customerID",
                        name:"Customer ID",
                    }),
                    new ControlAssessment({
                        id: "accountNumber",
                        name:"Account number",
                    }),
                    new ControlAssessment({
                        id: "iban",
                        name:"IBAN",
                    }),
                    new ControlAssessment({
                        id: "bic",
                        name:"BIC",
                    }),
                    new ControlAssessment({
                        id: "swift",
                        name:"SWIFT",
                    }),

                    new ControlAssessment({
                        id: "accountType",
                        name:"Account type", // ?
                    })
                ]
            }),
            new Control({
                id: "credits",
                name: "Credits",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
                ],
                assessments: [
                    new ControlAssessment({
                        id: "details",
                        name:"Details",
                    }),
                    new ControlAssessment({
                        id: "historic",
                        name:"Historic",
                    })
                ]
            })
        ]
    }),
    new Control({
        id:"insurance",
        name: "insurance",
        metadata: [
            { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
        ],
        children: []
    }),
    new Control({
        id: "marketing",
        name: "marketing",
        children: [
            new Control({
                id: "customerProfile",
                name: "customer profile",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
                ],
                assessments: [
                    new ControlAssessment({
                        id: "acqChan",
                        name:"Acquisition channel",
                    }),
                    new ControlAssessment({
                        id: "customChan",
                        name:"Customer segments",
                    }),
                    new ControlAssessment({
                        id: "cookies",
                        name:"Cookies",
                    }),
                    new ControlAssessment({
                        id: "socialTrends",
                        name:"Social trends",
                    })
                ]
            })]
    }),
    new Control({
        id: "personal",
        name: "personal activity",
        children: [
            new Control({
                id: "itTracing",
                name: "IT tracing",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        id: "epua",
                        name:"Endpoints & User Agent",
                        rules: [
                            Merlin.android().method("name:^getUserAgent.*" ),
                            Merlin.android().nocase().field("name:useragent" ),
                            Merlin.android().nocase().strings("value:useragent" )
                        ]
                    }),
                    new ControlAssessment({
                        id: "ipAddr",
                        name:"IP address",
                        rules: [
                            Merlin.android().permission("name:^android\.permission\.INTERNET$"), // AND
                            Merlin.android().permission("name:^android\.permission\.ACCESS_NETWORK_STATE"),
                            Merlin.android().call("calleed.name:^getHardwareAddress$" ),
                            Merlin.android().method("calleed.name:^getHostAddress$" ),
                            Merlin.android().method("calleed.name:^getInetAddress" )
                        ]
                    }),
                    new ControlAssessment({
                        id: "creds",
                        name:"Credentials",
                    }),
                    new ControlAssessment({
                        id: "logs",
                        name:"Logs",
                    }),
                    new ControlAssessment({
                        id: "times",
                        name:"Timestamp",
                    })
                ]
            }),
            new Control({
                id: "legal",
                name: "Legal",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        id: "criminalRec",
                        name:"Criminal record"
                    })
                ]
            }),
            new Control({
                id: "sensitive",
                name: "Sensitive",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.SENSITIVE }
                ],
                assessments: [
                    new ControlAssessment({
                        id: "ethnical",
                        name:"Ethnical origins"
                    }),
                    new ControlAssessment({
                        id: "politics",
                        name:"Political trends",
                    }),
                    new ControlAssessment({
                        id: "religion",
                        name:"Religion",
                    }),
                    new ControlAssessment({
                        id: "syndicated",
                        name:"Worker syndicated",
                    }),
                    new ControlAssessment({
                        id: "bio",
                        name:"Biometric data",
                    }),
                    new ControlAssessment({
                        id: "generic",
                        name:"Genetic data",
                    }),
                    new ControlAssessment({
                        id: "sexual",
                        name:"Sexual trends",
                    }),
                    new ControlAssessment({
                        id: "healthStatus",
                        name:"Health status",
                    }),
                    new ControlAssessment({
                        id: "healthStatusAdv",
                        name:"Health status (advanced)",
                    }),
                    new ControlAssessment({
                        id: "healthStatusHist",
                        name:"Health status historic",
                    }),
                    new ControlAssessment({
                        id: "disable",
                        name:"Disability",
                    })
                ]
            }),
            new Control({
                id: "legalIdentity",
                name: "identity",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        id: "nic",
                        name:"NIC",
                    })
                ]
            }),
            new Control({
                id: "geolocation",
                name: "geolocation",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.SENSITIVE }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"geolocation position",
                        rules: [
                            Merlin.android().class("name:^android\.webkit\.GeolocationPermissions$"),
                            Merlin.android().permission("name:^ACCESS_FINE_LOCATION$"),
                            Merlin.android().permission("name:^ACCESS_COARSE_LOCATION"),
                            Merlin.android().javaCallToMethod("__signature__:^android\.location\.Address;->getLatitude"),
                            Merlin.android().javaCallToMethod("__signature__:^android\.location\.Address;->getLongitude"),
                            Merlin.android().javaCallToMethod("enclosingClass.name:^android\.location\.Geocoder$"),
                            Merlin.android().javaCallToMethod("enclosingClass.name:^android\.location\.LocationManager$"),
                            Merlin.android().javaCallToMethod("__signature__:^android\.location\.LocationManager$"),
                            Merlin.android().javaCallWithArgsAssert(
                                "__signature__:^android\.content\.PackageManager;->hasSystemFeature\(",
                                {
                                    "1": Merlin.android()
                                        .field("__signature__:android.content.pm.PackageManager;->FEATURE_LOCATION")
                                    //.select(ModelField.TYPE.getProperty("value"))


                                    //expect: Merlin.android().getDB().fields.getEntry("android.content.pm.PackageManager;->FEATURE_LOCATION")

                                }),
                            Merlin.android().sources(
                                Merlin.android().method("__signature__:^android\.location\.Address;->getLatitude")
                            ).sink(
                                Merlin.android().method("tags:file")
                            )
                        ]
                    })
                ]
            }),
            new Control({
                id: "biologic",
                name: "biologic",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.SENSITIVE }
                ],
                assessments: [
                    new ControlAssessment({
                        id: "dna",
                        name:"DNA sample",
                    })
                ]
            })
        ]
    }),
    new Control({
        id:"device",
        name: "Device Data",
        children: [
            new Control({
                id:"operator",
                name: "Operator",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
                ],
                assessments: [

                ]
            }),
            new Control({
                id:"deviceFingerprint",
                name: "Device Fingerprint",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
                ],
                children: [
                    new Control({
                        id:"emei",
                        name:"IMEI",
                        assessments: [
                            new ControlAssessment({
                                name:"IMEI:sourcing",
                                metadata: [
                                    { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.SOURCING }
                                ],
                                rules: [
                                    Merlin.android().nocase().method("name:devicefingerprint" ),
                                    Merlin.android().nocase().field("name:userame" ),
                                    Merlin.android().class("name:Person" ),
                                    Merlin.android().class("name:User" )
                                ],
                            }),
                            new ControlAssessment({
                                name:"IMEI:api",
                                metadata: [
                                    { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.PROCESSING }
                                ],
                                rules: [
                                    Merlin.android().nocase().call("caller.enclosingClass.name:^android\.telephony\.TelephonyManager$"),
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    }),
];

model.controls = PII_Data;
model.updateControlTree(model.controls);

export const PrivacyPiiModel2 = model;