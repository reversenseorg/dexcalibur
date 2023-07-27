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
                        id:"title",
                        name:"Title",
                        rules: [
                            Merlin.android().class("name:Civility" ),
                        ]
                    }),
                    new PiiType({
                        id:"lastname",
                        name:"Lastname",
                        rules: [
                            Merlin.android().method("name:^getLastName.*" ),
                            Merlin.android().class("name:Person" ),
                            Merlin.android().class("name:User" )
                        ]
                    }),
                    new PiiType({
                        id:"firstname",
                        name:"Firstname",
                        rules: [
                            Merlin.android().method("name:^getFirstName.*" ),
                            Merlin.android().class("name:Person" ),
                            Merlin.android().class("name:User" )
                        ]
                    }),
                    new PiiType({
                        id:"username",
                        name:"username",
                        rules: [
                            Merlin.android().method("name:^UserName.*" ),
                            Merlin.android().nocase().field("name:userame" ),
                            Merlin.android().class("name:Person" ),
                            Merlin.android().class("name:User" )
                        ]
                    }),
                    new PiiType({
                        id:"age",
                        name:"age",
                        rules: [
                            Merlin.android().class("name:Civility" ),
                        ]
                    }),
                    new PiiType({
                        id:"status",
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
                        id:"deadDate",
                        name:"Dead"
                    }),
                    new PiiType({
                        id:"residenceCountry",
                        name:"Residence country"
                    }),
                ]
            }),
            new PiiCategory({
                id: "family",
                name: "Family",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        id:"matriomonialStatus",
                        name:"Matriomonial Status",
                        rules: [
                            Merlin.android().class("name:RelationType" ),
                        ]
                    }),
                    new PiiType({
                        id:"familyRelationship",
                        name:"Family Relationship",
                        children: {
                            class: "identify"
                        }
                    })
                ]
            }),
            new PiiCategory({
                id: "idDocMetadata",
                name: "ID documents metadata",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        id:"idCardId",
                        name:"ID card ID"
                    }),
                    new PiiType({
                        id:"idCardIssueDate",
                        name:"ID card issue date",
                    }),
                    new PiiType({
                        id:"idCardIssueLocation",
                        name:"ID card issue location",
                    }),
                    new PiiType({
                        id:"authorityId",
                        name:"Authority ID",
                    })
                ]
            }),
            new PiiCategory({
                id:"idDoc",
                name: "Identity documents",
                criticity: PiiCriticity.MEDIUM,
                types: [
                    new PiiType({
                        id:"idCard",
                        name:"ID card"
                    }),
                    new PiiType({
                        id:"passport",
                        name:"Passport",
                    }),
                    new PiiType({
                        id:"driverLicence",
                        name:"Driver licence",
                    })
                ]
            }),
            new PiiCategory({
                id: "media",
                name: "Media Resources",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        id: "picture",
                        name:"picture"
                    }),
                    new PiiType({
                        id: "video",
                        name:"video",
                    })
                ]
            })
        ]
    }),
    contact: new PiiClass({
        id: "contact",
        name: "Contact",
        categories: [
            new PiiCategory({
                id: "personalContact",
                name: "personal contact",
                criticity: PiiCriticity.LOW,
                types: [
                    PII_DataType.postalAddress,
                    PII_DataType.phoneNumbers,
                    PII_DataType.email
                ]
            }),
            new PiiCategory({
                id: "professionalContact",
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
    banking: new PiiClass({
        id: "banking",
        name: "banking",
        categories: [
            new PiiCategory({
                id: "bankingAddress",
                name: "Banking address",
                criticity: PiiCriticity.MEDIUM,
                types: [
                    new PiiType({
                        id: "customerID",
                        name:"Customer ID",
                    }),
                    new PiiType({
                        id: "accountNumber",
                        name:"Account number",
                    }),
                    new PiiType({
                        id: "iban",
                        name:"IBAN",
                    }),
                    new PiiType({
                        id: "bic",
                        name:"BIC",
                    }),
                    new PiiType({
                        id: "swift",
                        name:"SWIFT",
                    }),
                    PII_DataType.postalAddress,
                    new PiiType({
                        id: "accountType",
                        name:"Account type", // ?
                    })
                ]
            }),
            new PiiCategory({
                id: "credits",
                name: "Credits",
                criticity: PiiCriticity.MEDIUM,
                types: [
                    new PiiType({
                        id: "details",
                        name:"Details",
                    }),
                    new PiiType({
                        id: "historic",
                        name:"Historic",
                    })
                ]
            })
        ]
    }),
    insurance: new PiiClass({
        id:"insurance",
        name: "insurance",
        categories: []
    }),
    marketing: new PiiClass({
        id: "marketing",
        name: "marketing",
        categories: [
            new PiiCategory({
                id: "customerProfile",
                name: "customer profile",
                criticity: PiiCriticity.MEDIUM,
                types: [
                    new PiiType({
                        id: "acqChan",
                        name:"Acquisition channel",
                    }),
                    new PiiType({
                        id: "customChan",
                        name:"Customer segments",
                    }),
                    new PiiType({
                        id: "cookies",
                        name:"Cookies",
                    }),
                    new PiiType({
                        id: "socialTrends",
                        name:"Social trends",
                    })
                ]
            })]
    }),
    personal: new PiiClass({
        id: "personal",
        name: "Personal Pctivity",
        categories: [
            new PiiCategory({
                id: "itTracing",
                name: "IT tracing",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        id: "epua",
                        name:"Endpoints & User Agent",
                        rules: [
                            Merlin.android().method("name:^getUserAgent.*" ),
                            Merlin.android().nocase().field("name:useragent" ),
                            Merlin.android().nocase().strings("value:useragent" )
                        ]
                    }),
                    new PiiType({
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
                    new PiiType({
                        id: "creds",
                        name:"Credentials",
                    }),
                    new PiiType({
                        id: "logs",
                        name:"Logs",
                    }),
                    new PiiType({
                        id: "times",
                        name:"Timestamp",
                    })
                ]
            }),
            new PiiCategory({
                id: "legal",
                name: "Legal",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        id: "criminalRec",
                        name:"Criminal record"
                    })
                ]
            }),
            new PiiCategory({
                id: "itTracing",
                name: "Sensitive",
                criticity: PiiCriticity.SENSITIVE,
                types: [
                    new PiiType({
                        id: "ethnical",
                        name:"Ethnical origins"
                    }),
                    new PiiType({
                        id: "politics",
                        name:"Political trends",
                    }),
                    new PiiType({
                        id: "religion",
                        name:"Religion",
                    }),
                    new PiiType({
                        id: "syndicated",
                        name:"Worker syndicated",
                    }),
                    new PiiType({
                        id: "bio",
                        name:"Biometric data",
                    }),
                    new PiiType({
                        id: "generic",
                        name:"Genetic data",
                    }),
                    new PiiType({
                        id: "sexual",
                        name:"Sexual trends",
                    }),
                    new PiiType({
                        id: "healthStatus",
                        name:"Health status",
                    }),
                    new PiiType({
                        id: "healthStatusAdv",
                        name:"Health status (advanced)",
                    }),
                    new PiiType({
                        id: "healthStatusHist",
                        name:"Health status historic",
                    }),
                    new PiiType({
                        id: "disable",
                        name:"Disability",
                    })
                ]
            }),
            new PiiCategory({
                id: "legalIdentity",
                name: "Legal identity",
                criticity: PiiCriticity.LOW,
                types: [
                    new PiiType({
                        id: "nic",
                        name:"NIC",
                    })
                ]
            }),
            new PiiCategory({
                id: "geolocation",
                name: "geolocation",
                criticity: PiiCriticity.SENSITIVE,
                types: [
                    new PiiType({
                        id: "position",
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
                id: "biologic",
                name: "biologic",
                criticity: PiiCriticity.SENSITIVE,
                types: [
                    new PiiType({
                        id: "dna",
                        name:"DNA sample",
                    })
                ]
            })
        ]
    }),
    device: new PiiClass({
        id:"device",
        name: "Device Data",
        categories: [
            new PiiCategory({
                id:"operator",
                name: "Operator",
                criticity: PiiCriticity.MEDIUM,
                types: [

                ]
            }),
            new PiiCategory({
                id:"deviceFingerprint",
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
