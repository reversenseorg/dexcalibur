import {PiiClass, PiiClassMap} from "../pii/PiiClass.js";
import {PiiCategory, PiiCriticity} from "../pii/PiiCategory.js";
import {PiiType, PiiTypeMap} from "../pii/PiiType.js";
import {PiiField} from "../pii/PiiField.js";
import {Merlin} from "../../../search/Merlin.js";
import CodeConstraint from "../../common/CodeConstraint.js";
import {NodeInternalType} from "../../../NodeInternalType.js";
import ModelField from "../../../ModelField.js";
import ModelClass from "../../../ModelClass.js";


export const PII_DataType:PiiTypeMap = {
    postalAddress: new PiiType({
        name:"postal address",
        fields: [,
            new PiiField({
                name: "house name"
            }),
            new PiiField({
                name: "number"
            }),
            new PiiField({
                name: "street",
                signature: [
                    (new CodeConstraint(NodeInternalType.METHOD,{pattern:"android.location.Address;->getAddressLine"} )),
                    (new CodeConstraint(NodeInternalType.METHOD,{pattern:"android.location.Address;->setAddressLine"} )),
                    (new CodeConstraint(NodeInternalType.CLASS,{pattern:"android.location.Address"} )),
                ]
            }),
            new PiiField({
                name: "zip code",
                signature: [
                    (new CodeConstraint(NodeInternalType.METHOD,{pattern:"android.location.Address;->getPostalCode"} ))
                ],
                rules: [
                    Merlin.android().javaClass("name:^android\.location\.Geocoder$" ),
                    Merlin.android().javaCallToMethod("enclosingClass.name:^android\.location\.Geocoder$"),
                    Merlin.flutter().field("enclosingClass.name:AutofillHints").filter("name:^postalCode$")
                ]
            }),
            new PiiField({
                name: "country"
            }),
            new PiiField({
                name: "province"
            })
        ]
    }),
    phoneNumbers: new PiiType({
        name:"phone numbers",
        fields: [
            new PiiField({
                name: "phone",
                rules: [
                    Merlin.android().class("name:RelationType" ),
                ]
            }),
            new PiiField({
                name: "fax",
                rules: [
                    Merlin.android().class("name:RelationType" ),
                ]
            })
        ]
    }),
    email: new PiiType({
        name:"email",
        rules: [
            Merlin.android().class("name:RegExp"),
        ]
    })
}


export const PII_Data:PiiClassMap = {
    identity: new PiiClass({
        id: "identity",
        name: "Identity",
        categories: [
            new PiiCategory({
                id: "basicIdentity",
                name: "Basic identity",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        name:"title",
                        rules: [
                            Merlin.android().class("name:Civility" ),
                        ]
                    }),
                    new PiiType({
                        name:"lastname",
                        rules: [
                            Merlin.android().method("name:^getLastName.*" ),
                            Merlin.android().class("name:Person" ),
                            Merlin.android().class("name:User" )
                        ]
                    }),
                    new PiiType({
                        name:"firstname",
                        rules: [
                            Merlin.android().method("name:^getFirstName.*" ),
                            Merlin.android().class("name:Person" ),
                            Merlin.android().class("name:User" )
                        ]
                    }),
                    new PiiType({
                        name:"username",
                        rules: [
                            Merlin.android().method("name:^UserName.*" ),
                            Merlin.android().nocase().field("name:userame" ),
                            Merlin.android().class("name:Person" ),
                            Merlin.android().class("name:User" )
                        ]
                    }),
                    new PiiType({
                        name:"age",
                        rules: [
                            Merlin.android().class("name:Civility" ),
                        ]
                    }),
                    new PiiType({
                        name:"status",
                        rules: [
                            Merlin.android().class("name:RelationType" ),
                        ]
                    }),
                ]

            }),
            new PiiCategory({
                id: "advancedIdentity",
                name: "Advanced identity",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        id:"nationality",
                        name:"nationality",
                        rules: [
                            Merlin.android().method("name:^getNationality.*" ),
                            Merlin.android().nocase().field("name:nationality" ),
                            Merlin.android().nocase().class("name:nationality" ).select(ModelClass.TYPE.getProperty("methods")),
                            Merlin.android().nocase().strings("value:nationality" )
                        ]
                    }),
                    new PiiType({
                        id:"birthdate",
                        name:"birthdate",
                        rules: [
                            Merlin.android().method("name:^getBirthDate.*" ),
                            Merlin.android().nocase().field("name:birthdate" ),
                            Merlin.android().nocase().strings("value:birthdate" )
                        ]
                    }),
                    new PiiType({
                        id:"deadStatus",
                        name:"Dead Status"
                    }),
                    new PiiType({
                        id:"coupleStatus",
                        name:"Couple status",
                        rules: [
                            Merlin.android().class("name:RelationType" ),
                        ]
                    }),
                    new PiiType({
                        id:"dead",
                        name:"Dead"
                    }),
                    new PiiType({
                        id:"residenceCountry",
                        name:"Residence country"
                    }),
                ]
            }),
            new PiiCategory({
                name: "family",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        name:"matriomonial status",
                        rules: [
                            Merlin.android().class("name:RelationType" ),
                        ]
                    }),
                    new PiiType({
                        name:"family relationship",
                        children: {
                            class: "identify"
                        }
                    })
                ]
            }),
            new PiiCategory({
                name: "identity documents metadata",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        name:"ID card ID"
                    }),
                    new PiiType({
                        name:"ID card issue date",
                    }),
                    new PiiType({
                        name:"ID card issue location",
                    }),
                    new PiiType({
                        name:"Authority ID",
                    })
                ]
            }),
            new PiiCategory({
                name: "identity documents",
                criticity: PiiCriticity.MEDIUM,
                types: [
                    new PiiType({
                        name:"ID card"
                    }),
                    new PiiType({
                        name:"Passport",
                    }),
                    new PiiType({
                        name:"Driver licence",
                    })
                ]
            }),
            new PiiCategory({
                name: "media",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        name:"picture"
                    }),
                    new PiiType({
                        name:"video",
                    })
                ]
            })
        ]
    }),
    contact: new PiiClass({
        name: "contact",
        categories: [
            new PiiCategory({
                name: "personal contact",
                criticity: PiiCriticity.LOW,
                types: [
                    PII_DataType.postalAddress,
                    PII_DataType.phoneNumbers,
                    PII_DataType.email
                ]
            }),
            new PiiCategory({
                name: "professional contact",
                criticity: PiiCriticity.LOW,
                types: [
                    PII_DataType.postalAddress,
                    PII_DataType.phoneNumbers,
                    PII_DataType.email
                ]
            })
        ]
    }),
    bankingData: new PiiClass({
        name: "banking",
        categories: [
            new PiiCategory({
                name: "Banking address",
                criticity: PiiCriticity.MEDIUM,
                types: [
                    new PiiType({
                        name:"Customer ID",
                    }),
                    new PiiType({
                        name:"Account number",
                    }),
                    new PiiType({
                        name:"IBAN",
                    }),
                    new PiiType({
                        name:"BIC",
                    }),
                    new PiiType({
                        name:"SWIFT",
                    }),
                    PII_DataType.postalAddress,
                    new PiiType({
                        name:"Account type", // ?
                    })
                ]
            }),
            new PiiCategory({
                name: "Credits",
                criticity: PiiCriticity.MEDIUM,
                types: [
                    new PiiType({
                        name:"Details",
                    }),
                    new PiiType({
                        name:"Historic",
                    })
                ]
            })
        ]
    }),
    insuranceData: new PiiClass({
        name: "insurance",
        categories: []
    }),
    marketingData: new PiiClass({
        name: "marketing",
        categories: [
            new PiiCategory({
                name: "customer profile",
                criticity: PiiCriticity.MEDIUM,
                types: [
                    new PiiType({
                        name:"Acquisition channel",
                    }),
                    new PiiType({
                        name:"Customer segments",
                    }),
                    new PiiType({
                        name:"Cookies",
                    }),
                    new PiiType({
                        name:"Social trends",
                    })
                ]
            })]
    }),
    piData: new PiiClass({
        name: "personal activity",
        categories: [
            new PiiCategory({
                name: "IT tracing",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        name:"Endpoints & User Agent",
                        rules: [
                            Merlin.android().method("name:^getUserAgent.*" ),
                            Merlin.android().nocase().field("name:useragent" ),
                            Merlin.android().nocase().strings("value:useragent" )
                        ]
                    }),
                    new PiiType({
                        name:"IP address",
                        rules: [
                            Merlin.android().permission("name:^android\.permission\.INTERNET$"), // AND
                            Merlin.android().permission("name:^android\.permission\.ACCESS_NETWORK_STATE"),
                            Merlin.android().call("calleed.name:^getHardwareAddress$" ),
                            Merlin.android().method("calleed.name:^getHostAddress$" ),
                            Merlin.android().method("calleed.name:^getInetAddress" )
                        ]
                    }),
                    new PiiType({
                        name:"Credentials",
                    }),
                    new PiiType({
                        name:"Logs",
                    }),
                    new PiiType({
                        name:"Timestamp",
                    })
                ]
            }),
            new PiiCategory({
                name: "Legal",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        name:"Criminal record"
                    })
                ]
            }),
            new PiiCategory({
                name: "Sensitive",
                criticity: PiiCriticity.SENSITIVE,
                types: [
                    new PiiType({
                        name:"Ethnical origins"
                    }),
                    new PiiType({
                        name:"Political trends",
                    }),
                    new PiiType({
                        name:"Religion",
                    }),
                    new PiiType({
                        name:"Worker syndicated",
                    }),
                    new PiiType({
                        name:"Biometric data",
                    }),
                    new PiiType({
                        name:"Genetic data",
                    }),
                    new PiiType({
                        name:"Sexual trends",
                    }),
                    new PiiType({
                        name:"Health status",
                    }),
                    new PiiType({
                        name:"Health status (advanced)",
                    }),
                    new PiiType({
                        name:"Health status historic",
                    }),
                    new PiiType({
                        name:"Disability",
                    })
                ]
            }),
            new PiiCategory({
                name: "identity",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        name:"NIC",
                    })
                ]
            }),
            new PiiCategory({
                name: "geolocation",
                criticity: PiiCriticity.SENSITIVE,
                types: [
                    new PiiType({
                        name:"geolocation position",
                        signature: [
                            (new CodeConstraint(NodeInternalType.CLASS,{pattern:"android.webkit.GeolocationPermissions"} )),
                            (new CodeConstraint(NodeInternalType.ANDROID_PERM,{pattern:"ACCESS_FINE_LOCATION"} )),
                            (new CodeConstraint(NodeInternalType.ANDROID_PERM,{pattern:"ACCESS_COARSE_LOCATION"} )),
                            (new CodeConstraint(NodeInternalType.METHOD,{pattern:"android.location.Address;->getLatitude"} )),
                            (new CodeConstraint(NodeInternalType.METHOD,{pattern:"android.location.Address;->getLongitude"} )),
                        ],
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
            new PiiCategory({
                name: "biologic",
                criticity: PiiCriticity.SENSITIVE,
                types: [
                    new PiiType({
                        name:"DNA sample",
                    })
                ]
            })
        ]
    }),
    deviceData: new PiiClass({
        name: "Device",
        categories: [
            new PiiCategory({
                name: "Operator",
                criticity: PiiCriticity.MEDIUM,
                types: [
                    new PiiType({
                        name:"Acquisition channel",
                    }),
                    new PiiType({
                        name:"Customer segments",
                    }),
                    new PiiType({
                        name:"Cookies",
                    }),
                    new PiiType({
                        name:"Social trends",
                    })
                ]
            }),
            new PiiCategory({
                name: "Device Fingerprint",
                criticity: PiiCriticity.MEDIUM,
                types: [
                    new PiiType({
                        name:"IMEI Sourcing",
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
