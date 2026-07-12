/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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
