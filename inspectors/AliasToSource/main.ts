import InspectorFactory, {FlattenTagCategoryOptions} from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====

var AliasToSourceInspector:InspectorFactory = new InspectorFactory({
    startStep: INSPECTOR_TYPE.POST_APP_SCAN,
    version: "1.0.7",
    eventListenerSources: {
        "action.deobfuscate.aliasToSource": {
            lang: "ts",
            source: `
                //<ts>={
                console.log("[INSPECTOR][ALIASTOSOURCE] Try to set default alias for classes with source");
                let ctx = pEvent.getContext();
                // TODO: Look if necessary to add (?!SourceFile) in the source regexp.
                let classFinderResult = ctx.getSearchEngine().class("source:/^(?!null$).*/").filter("alias:/null/");
                classFinderResult.foreach((pOffset, pClass) => {
                    // TODO : implement safe setting of aliases
                    if (pClass.source !== pClass.simpleName)
                        pClass.setAlias(pClass.source);
                })
                console.log("[INSPECTOR][ALIASTOSOURCE] About " + Number(classFinderResult.count()) + " class aliases " +
                 "were set with source value");
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
