import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";

// ===== INIT =====

var AliasToSourceInspector:InspectorFactory = new InspectorFactory({
    id: "AliasToSource",
    startStep: INSPECTOR_TYPE.POST_APP_SCAN,
    version: "1.0.11",
    hookSet: {
        id: "AliasToSource",
        name: "Alias to Source",
        description: "Set default alias for classes that contains a valid source attribute",
        strategies:[]
    },
    eventListenerSources: {
        "action.deobfuscate.aliasToSource": {
            lang: "ts",
            source: `
                //<ts>={
                console.log("[INSPECTOR][ALIASTOSOURCE] Try to set default alias for classes with source");
                let ctx = pEvent.getContext();
                let classFinderResult = ctx.getSearchEngine().class("innerClass:false")
                                                             // Is not internal
                                                             .filter("@discover.static")
                                                             // Source do not contain null or SourceFile 
                                                             .filter("source:/^(?!null$)(?!SourceFile$).*/")
                                                             .filter("alias:/null/")
                // class("innerClass:false").filter("@discover.static").filter("source:/^(?!null$)(?!SourceFile$).*/").filter("alias:/null/") 
                classFinderResult.foreach((pOffset, pClass) => {
                    let classSource = pClass.source;
                    //Remove file extension 
                    classSource = classSource.substring(0, classSource.lastIndexOf('.'));
                    if (classSource !== pClass.simpleName) {
                        let pkg = pClass.getPackage();
                        if (pkg != null && pkg.hasAliasedClass(alias)) {
                            let prefix = 0;
                            let aliasPrefixed = classSource + '_' + prefix;
                            while (pkg.hasAliasedClass(aliasPrefixed)) {
                                prefix ++;
                                aliasPrefixed = classSource + '_' + prefix;
                            }
                            classSource = aliasPrefixed;
                        }
                        pClass.setAlias(classSource);
                    }
                })
                console.log("[INSPECTOR][ALIASTOSOURCE] About " + Number(classFinderResult.count()) + " class aliases " +
                 "were set with source file value");
            `
        },
        "dxc.fullscan.post_deploy": {
            lang: "ts",
            source: `
                //<ts>={
                pEvent.getContext().trigger({type: "action.deobfuscate.aliasToSource"});
            `
        },
    }
});

export default AliasToSourceInspector;
