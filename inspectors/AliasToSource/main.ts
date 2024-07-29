import InspectorFactory, {FlattenTagCategoryOptions} from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";
import ModelPackage from "../../src/ModelPackage.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====

var AliasToSourceInspector:InspectorFactory = new InspectorFactory({
    id: "AliasToSource",
    startStep: INSPECTOR_TYPE.POST_APP_SCAN,
    version: "1.0.10",
    eventListenerSources: {
        "action.deobfuscate.aliasToSource": {
            lang: "ts",
            source: `
                //<ts>={
                console.log("[INSPECTOR][ALIASTOSOURCE] Try to set default alias for classes with source");
                let ctx = pEvent.getContext();
                let classFinderResult = ctx.getSearchEngine().class("source:/^(?!null$)(?!SourceFile$).*/")
                                                             .filter("alias:/null/");
                classFinderResult.foreach((pOffset, pClass) => {
                    let alias = pClass.source;
                    if (alias !== pClass.simpleName) {
                        let pkg = pClass.getPackage();
                        if (pkg != null && pkg.hasAliasedClass(alias)) {
                            let prefix = 0;
                            let aliasPrefixed = alias + prefix;
                            while (pkg.hasAliasedClass(aliasPrefixed)) {
                                prefix ++;
                                aliasPrefixed = alias + prefix;
                            }
                            alias = aliasPrefixed;
                        }
                        pClass.setAlias(alias);
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
