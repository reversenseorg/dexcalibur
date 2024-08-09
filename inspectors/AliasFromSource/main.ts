import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";

// ===== INIT =====

var AliasFromSourceInspector:InspectorFactory = new InspectorFactory({
    id: "AliasFromSource",
    startStep: INSPECTOR_TYPE.POST_APP_SCAN,
    version: "1.0.24",
    hookSet: {
        id: "AliasFromSource",
        name: "Alias From Source",
        description: "Set default alias for classes that contains a valid source attribute",
        strategies:[]
    },
    eventListenerSources: {
        "action.deobfuscate.aliasFromSource": {
            lang: "ts",
            source: `
                //<ts>={
                console.log("[INSPECTOR][ALIAS_FROM_SOURCE] Try to set default alias for classes with source");
                let ctx = pEvent.getContext();
                let classFinderResult = ctx.getSearchEngine().class("source:/^(?!null$)(?!SourceFile$).+/")
                                                             .exclude("@discover.internal") 
                                                             .filter("alias:/^(null)?$/");
                                                             // Source do not contain null or SourceFile and is not empty
                // class("source:/^(?!null$)(?!SourceFile$).+/").filter("@discover.static").filter("alias:/^(null)?$/");
                // class("@discover.static").filter("source:/^(?!null$)(?!SourceFile$).+/").filter("alias:/null/")
                console.log("[INSPECTOR][ALIAS_FROM_SOURCE] Classes found by request: ", classFinderResult.count())
                let aliasCounter: number = 0;
                classFinderResult.foreach((pOffset, pClass) => {
                    let classSource = pClass.getSource();
                    if (classSource.includes('$$')) {
                        return;
                    }
                    // Remove file extension 
                    if (classSource.includes('.')) {
                        classSource = classSource.substring(0, classSource.lastIndexOf('.'));
                    }
                    let simpleName = pClass.getSimpleName();
                    let simpleNameToKeep = '';
                    let simpleNameToReplace = simpleName;
                    if (pClass.isInnerClass() === true) {
                        simpleNameToKeep = simpleName.substring(simpleName.indexOf('$'))
                        simpleNameToReplace = simpleName.substring(0, simpleName.indexOf('$'))
                    }
                    if (classSource !== simpleNameToReplace) {
                        let newAlias = classSource + simpleNameToKeep
                        let pkg = pClass.getPackage();
                        if (pkg != null && pkg.hasAliasedClass(newAlias))
                            newAlias += '_' + simpleNameToReplace
                        pClass.setAlias(newAlias);
                        aliasCounter++
                    }
                })
                // Treat anonymous classes
                // anonymousClasses.forEach((pClass) => {
                //     if (pClass.hasSuperClass()) {
                //         let extendedClass = pClass.getSuperClass();
                //         let newAlias: string;
                //         let name: string;
                //         if (extendedClass.hasAlias())
                //             newAlias = extendedClass.getAlias();
                //         else 
                //             newAlias = extendedClass.getSimpleName();
                //         if (pClass.hasAlias()) 
                //             name = pClass.getAlias();
                //         else
                //             name = pClass.getSimpleName();
                //         newAlias = name.substring(0, name.lastIndexOf('$') + 1) + newAlias
                //         pClass.setAlias(newAlias);
                //         aliasCounter++
                //     }
                // })
                console.log("[INSPECTOR][ALIAS_FROM_SOURCE] About " + aliasCounter + " class aliases " +
                 "were set with source file value");
            `
        },
        "dxc.fullscan.post_deploy": {
            lang: "ts",
            source: `
                //<ts>={
                pEvent.getContext().trigger({type: "action.deobfuscate.aliasFromSource"});
            `
        },
    }
});

export default AliasFromSourceInspector;
