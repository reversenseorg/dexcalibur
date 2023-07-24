import {PiiCriticity} from "../pii/PiiCategory.js";
import {PiiType} from "../pii/PiiType.js";
import {Merlin} from "../../../search/Merlin.js";
import CodeConstraint from "../../common/CodeConstraint.js";
import {NodeInternalType} from "../../../NodeInternalType.js";
import ModelClass from "../../../ModelClass.js";
import Control, {ControlMap} from "../../common/Control.js";
import ControlAssessment, {DataOperation, MetadataTopic} from "../../common/ControlAssessment.js";
import {MetadataType} from "../../common/Metadata.js";
import ModelField from "../../../ModelField.js";


export const PII_DataType:ControlMap = {
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


export const PII_Data:ControlMap = {
    identity: new Control({
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
                        name:"title",
                        rules: [
                            Merlin.android().class("name:Civility" ),
                        ]
                    }),
                    new ControlAssessment({
                        name:"lastname",
                        rules: [
                            Merlin.android().method("name:^getLastName.*" ),
                            Merlin.android().class("name:Person" ),
                            Merlin.android().class("name:User" )
                        ]
                    }),
                    new ControlAssessment({
                        name:"firstname",
                        rules: [
                            Merlin.android().method("name:^getFirstName.*" ),
                            Merlin.android().class("name:Person" ),
                            Merlin.android().class("name:User" )
                        ]
                    }),

                    new ControlAssessment({
                        name:"age",
                        rules: [
                            Merlin.android().class("name:Civility" ),
                        ]
                    }),
                    new ControlAssessment({
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
                        id:"dead",
                        name:"Dead"
                    }),
                    new ControlAssessment({
                        id:"residenceCountry",
                        name:"Residence country"
                    }),
                ]
            }),
            new Control({
                name: "family",
                metadata: [
                    { type:MetadataType.ANY, key:"criticity", value:PiiCriticity.LOW }
                ],
                children: [
                    new Control({
                        name:"family relationship",
                        children: [
                            //   class: "identify"
                        ]
                    })
                ],
                assessments: [
                    new ControlAssessment({
                        name:"matriomonial status",
                        rules: [
                            Merlin.android().class("name:RelationType" ),
                        ]
                    })
                ]
            }),
            new Control({
                name: "identity documents metadata",
                metadata: [
                    { type:MetadataType.ANY, key:"criticity", value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"ID card ID"
                    }),
                    new ControlAssessment({
                        name:"ID card issue date",
                    }),
                    new ControlAssessment({
                        name:"ID card issue location",
                    }),
                    new ControlAssessment({
                        name:"Authority ID",
                    })
                ]
            }),
            new Control({
                name: "identity documents",
                metadata: [
                    { type:MetadataType.ANY, key:"criticity", value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"ID card"
                    }),
                    new ControlAssessment({
                        name:"Passport",
                    }),
                    new ControlAssessment({
                        name:"Driver licence",
                    })
                ]
            }),
            new Control({
                name: "media",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"picture"
                    }),
                    new ControlAssessment({
                        name:"video",
                    })
                ]
            })
        ]
    }),
    contact: new Control({
        name: "contact",
        children: [
            new Control({
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
    bankingData: new Control({
        name: "banking",
        children: [
            new Control({
                name: "Banking address",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
                ],
                children: [
                    PII_DataType.postalAddress as Control
                ],
                assessments: [
                    new ControlAssessment({
                        name:"Customer ID",
                    }),
                    new ControlAssessment({
                        name:"Account number",
                    }),
                    new ControlAssessment({
                        name:"IBAN",
                    }),
                    new ControlAssessment({
                        name:"BIC",
                    }),
                    new ControlAssessment({
                        name:"SWIFT",
                    }),

                    new ControlAssessment({
                        name:"Account type", // ?
                    })
                ]
            }),
            new Control({
                name: "Credits",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"Details",
                    }),
                    new ControlAssessment({
                        name:"Historic",
                    })
                ]
            })
        ]
    }),
    insuranceData: new Control({
        name: "insurance",
        metadata: [
            { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
        ],
        children: []
    }),
    marketingData: new Control({
        name: "marketing",
        children: [
            new Control({
                name: "customer profile",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"Acquisition channel",
                    }),
                    new ControlAssessment({
                        name:"Customer segments",
                    }),
                    new ControlAssessment({
                        name:"Cookies",
                    }),
                    new ControlAssessment({
                        name:"Social trends",
                    })
                ]
            })]
    }),
    piData: new Control({
        name: "personal activity",
        children: [
            new Control({
                name: "IT tracing",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"Endpoints & User Agent",
                        rules: [
                            Merlin.android().method("name:^getUserAgent.*" ),
                            Merlin.android().nocase().field("name:useragent" ),
                            Merlin.android().nocase().strings("value:useragent" )
                        ]
                    }),
                    new ControlAssessment({
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
                        name:"Credentials",
                    }),
                    new ControlAssessment({
                        name:"Logs",
                    }),
                    new ControlAssessment({
                        name:"Timestamp",
                    })
                ]
            }),
            new Control({
                name: "Legal",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"Criminal record"
                    })
                ]
            }),
            new Control({
                name: "Sensitive",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.SENSITIVE }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"Ethnical origins"
                    }),
                    new ControlAssessment({
                        name:"Political trends",
                    }),
                    new ControlAssessment({
                        name:"Religion",
                    }),
                    new ControlAssessment({
                        name:"Worker syndicated",
                    }),
                    new ControlAssessment({
                        name:"Biometric data",
                    }),
                    new ControlAssessment({
                        name:"Genetic data",
                    }),
                    new ControlAssessment({
                        name:"Sexual trends",
                    }),
                    new ControlAssessment({
                        name:"Health status",
                    }),
                    new ControlAssessment({
                        name:"Health status (advanced)",
                    }),
                    new ControlAssessment({
                        name:"Health status historic",
                    }),
                    new ControlAssessment({
                        name:"Disability",
                    })
                ]
            }),
            new Control({
                name: "identity",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.LOW }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"NIC",
                    })
                ]
            }),
            new Control({
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
                name: "biologic",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.SENSITIVE }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"DNA sample",
                    })
                ]
            })
        ]
    }),
    deviceData: new Control({
        name: "Device",
        children: [
            new Control({
                name: "Operator",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
                ],
                assessments: [
                    new ControlAssessment({
                        name:"Acquisition channel",
                    }),
                    new ControlAssessment({
                        name:"Customer segments",
                    }),
                    new ControlAssessment({
                        name:"Cookies",
                    }),
                    new ControlAssessment({
                        name:"Social trends",
                    })
                ]
            }),
            new Control({
                name: "Device Fingerprint",
                metadata: [
                    { type:MetadataType.ANY, key:MetadataTopic.CRITICITY, value:PiiCriticity.MEDIUM }
                ],
                children: [
                    new Control({
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
                ],
                assessments: [
                    new ControlAssessment({
                        name:"IMEI Sourcing",
                        metadata: [
                            { type:MetadataType.ANY, key:MetadataTopic.DFLOW_STEP, value:DataOperation.SOURCING }
                        ],
                        rules: [
                            Merlin.android().nocase().method("name:devicefingerprint" ),
                            Merlin.android().nocase().field("name:userame" ),
                            Merlin.android().class("name:Person" ),
                            Merlin.android().class("name:User" )
                        ]
                    })
                ]
            })
        ]
    }),
};
