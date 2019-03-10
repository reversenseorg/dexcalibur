const SCAN = require("./../Scanner.js")
const UT = require("./../utils.js")


var ALL = {
    obfuscation: {
        multidex_application: new SCAN.Rule({
            name: "MultiDex Application",  
            description: `
The main Application class extends the MultidexApplication class. 
It implies the package can contains several .dex file not dynamically obfuscated.
            `,
            type: SCAN.TYPE.code,
            pattern: function(ctx){
                let res = null;
                res = ctx.find.class("extends.name:android\.support\.multidex\.MultiDexApplication");
                if(res.count()>1)
                    return new SCAN.RuleResult({
                        format: SCAN.FORMAT.list,
                        data: res,
                        header: ["package","simpleName"],
                        match: true
                    });
                else if(res.count()>0)
                    return new SCAN.RuleResult({
                        format: SCAN.FORMAT.code,
                        data: res.get(0).toString(),
                        match: true
                    });
                else
                    return null;
            },
            hasMatch: function(res){
                return res.count()>0;
            }
        }),
        multidex_load: new SCAN.Rule({
            name: "Application loading additional .dex file at runtime",  
            description: `
The application uses the MultiDex class in order to load Dex files
at runtime. It often implies the package contains several compressed and encypted 
.dex file. In fact, the application is probably obfuscated dynamically. 
            `,
            type: SCAN.TYPE.list,
            pattern: function(ctx){
                let res = null;
                return ctx.find
                    .invoke("calleed.enclosingClass.name:MultiDex");
            },
            hasMatch: function(res){
                return res.count()>0;
            },
            header: ['name','simpleName']
        }),
    },
    integrity: {

    },
    root_detection: {
        safety_net: new SCAN.Rule({
            enable:false,
            name : "Google's SafetyNet",
            description: `Google's SafetyNet web-service is used in order to 
            check the device fingerprint`,
            pattern: function(ctx){
                let res = ctx.find.class("name:SafetyNet");
                //res.intersect(ctx.find.invoke("called.__signature__:gson\.serialize"))
                //    .on("name","enclosingClass.name");
            }
        })
    },
    tamper_detection: {

    },
    device_binding: {
        finderprint: new SCAN.Rule({
            enable:false,
            name: "Device binding use the Android Fingerprint API"
        })
    },
    ssl_pinning: {
        // android_keystore_based: {},
        custom_keystore_based: new SCAN.Rule({
            // disable the rule
            enable: false,
            name: "SSL Pining with a custom Keystore",
            description: `
            The application seems use a custom keystore where the custom certificate is stored.
            `,
            pattern: function(ctx){
                ctx.find.call("calleed.enclosingClass.name:SSLFactory");
            }
        }),
        harcoded_certificate_signature: new SCAN.rule({
            enable: false,
            name: "SSL Pining uses a comparaison with an hardcoded signature",
            description: `
            The application seems use a custom keystore where the custom certificate is stored.
            `,
            pattern: function(ctx){
                ctx.find.call("calleed.enclosingClass.name:SSLFactory");
            }
        }),
        okhttp3_pinner: new SCAN.rule({
            enable: false,
            name: "SSL Pining by the okHttpClient and a custom keystore",
            description: `
            The application seems use the .
            `,
        }),
    }
};



function SecurityScanner(SearchApi,context)
{
    this.finder = SearchApi;
    this.context = context;


    this.integrity = function(){

    };

    this.obfuscation = function(){
        // search for dynamic obfuscation
        let obf1 = this.finder
            .invoke("calleed.__signature__:Class\.forName")
                .intersect("calleed.name:getMethod")
                    .on("caller.__signature__")
                .intersect("calleed.name:invoke")
                    .on("caller.__signature__")
            .select("caller").show();

//            .invoke("calleed.__signature__:Class\.forName").intersect("calleed.name:getMethod").on("caller.__signature__").intersect("calleed.name:invoke").on("caller.__signature__").select("caller").show()

        // search for string obfuscation
        
        // search for renamed symbol
            
    };

    this.rootdetection = function(){

        // related to hook/root detecteion

        this.finder.class("name:blacklist")
            .union(this.finder.method("name:blacklist"))
            .union(this.finder.field("name:blacklist"))
            .show();

        this.finder.invoke("calleed.name:canExecute")
            .filter("calleed.enclosingClass.fqcn:java.io.File")
            .show();

        this.finder.invoke("calleed.name:canExecute")
            .filter("calleed.enclosingClass.fqcn:java.io.File")
            .select("caller")
                .intersect(
                    this.finder.string("value:su")
                ).on("__signature__")
            .show();

        this.finder.

        // android/content/pm/PackageManager;->getPackageInfo
        this.finder
            .invoke("calleed.enclosingClass.name:android\.content\.pm\.PackageManager")
                .intersect("calleed.name:getPackageInfo")
                    .on("caller.__signature__") 
                .using("method.name:contains");
    };

    this.hookdetection = function(){

    };

    this.devicebinding = function(){

    };
}

module.exports = {
    invoke: function(ctx){
        return new Scanner({

        })

    }

}