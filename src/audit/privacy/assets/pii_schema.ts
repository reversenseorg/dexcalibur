import {PiiClass, PiiClassMap} from "../pii/PiiClass.js";
import {PiiCategory, PiiCriticity} from "../pii/PiiCategory.js";
import {PiiType, PiiTypeMap} from "../pii/PiiType.js";
import {PiiField} from "../pii/PiiField.js";
import {Merlin} from "../../../search/Merlin.js";
import CodeConstraint from "../../common/CodeConstraint.js";
import {NodeInternalType} from "../../../NodeInternalType.js";
import ModelField from "../../../ModelField.js";


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
                    Merlin.android().javaCallToMethod("enclosingClass.name:^android\.location\.Geocoder$")
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
        fields: [,
            new PiiField({
                name: "phone"
            }),
            new PiiField({
                name: "fax"
            })
        ]
    }),
    email: new PiiType({
        name:"email",
        signature: [
        ]
    })
}


export const PII_Data:PiiClassMap = {
    identity: new PiiClass({
        name: "identity",
        categories: [
            new PiiCategory({
                name: "basic identity",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        name:"title"
                    }),
                    new PiiType({
                        name:"lastname",
                        signature: [
                            (new CodeConstraint(NodeInternalType.METHOD,{pattern:"->getFirstName"} )),
                            (new CodeConstraint(NodeInternalType.METHOD,{pattern:"->getLastName"} )),
                            (new CodeConstraint(NodeInternalType.CLASS,{pattern:"Person"} )),
                            (new CodeConstraint(NodeInternalType.CLASS,{pattern:"User"} ))
                        ]
                    }),
                    new PiiType({
                        name:"firstname",
                        signature: [

                        ]
                    }),
                    new PiiType({
                        name:"username"
                    }),
                    new PiiType({
                        name:"age",
                        signature: [

                        ]
                    }),
                    new PiiType({
                        name:"status"
                    }),
                ]

            }),
            new PiiCategory({
                name: "advanced identity",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        name:"nationality"
                    }),
                    new PiiType({
                        name:"birthdate"
                    }),
                    new PiiType({
                        name:"deadStatus"
                    }),
                    new PiiType({
                        name:"coupleStatus"
                    }),
                    new PiiType({
                        name:"dead"
                    }),
                    new PiiType({
                        name:"residence country"
                    }),
                ]
            }),
            new PiiCategory({
                name: "family",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        name:"matriomonial status"
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
                        name:"Endpoints & User Agent"
                    }),
                    new PiiType({
                        name:"IP address",
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
                            ).request
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
};
