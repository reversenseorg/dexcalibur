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
import ModelMethod from "../../src/ModelMethod.js";

// ===== INIT =====

var ContentProviderInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.4",
    hookSet: {
        // source from @Ch0pin https://github.com/Ch0pin/medusa/blob/master/modules/content_providers/file_provider_implemetation.med
        id: "FileProvider",
        name: "File Provider",
        description: "Logs maps of file->content URIs",
        strategies: [{
            name: "SimplePathStrategy addRoot",
            descr: "Try to hook private method SimplePathStrategy addRoot",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^androidx.core.content.FileProvider\$SimplePathStrategy$/").filter("name:addRoot")'
            },
            autoEmit: true,
            emitEvent: "hook.fileProvider.$simplePathStrategy.addRoot",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_name'] = arguments[0];
                data['arg1_root'] = arguments[1];
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                );
            `
        },
        {
            name: "Stripped SimplePathStrategy method",
            descr: "Hook Stripped SimplePathStrategy method",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^androidx.core.content.FileProvider\$b/").filter("name:<init>")'
            },
            autoEmit: true,
            emitEvent: "hook.fileProvider.$b.init",
            before: ` 
                if (DXC.utils.isInstanceOf(arguments[0], "java.lang.String")) {
                    let data : Record<string, any> = {};
                    data['arg0_authority'] = arguments[0];
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        data
                    );
                }
            `
        },
        {
            name: "Stripped SimplePathStrategy addRoot",
            descr: "Hook Stripped SimplePathStrategy addRoot method",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^androidx.core.content.FileProvider\$b/").filter("name:a")'
            },
            autoEmit: true,
            emitEvent: "hook.fileProvider.$b.a",
            before:`
                if (DXC.utils.isInstanceOf(arguments[0], "java.lang.String") ||
                    DXC.utils.isInstanceOf(arguments[1], "java.io.File")){
                    let data : Record<string, any> = {};
                    data['arg0_name'] = arguments[0];
                    data['arg1_root'] = arguments[1];
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        data
                );}
            `
        }]
    },
    eventListeners: {
    }
});


export default ContentProviderInspector;