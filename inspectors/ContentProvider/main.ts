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

    version: "1.0.6",
    hookSet: {
        // source from @Ch0pin https://github.com/Ch0pin/medusa/blob/master/modules/content_providers/content_provider_query.med
        id: "ContentProvider",
        name: "Content Provider",
        description: "Monitor Content Provider and Content Resolver Queries",
        strategies: [{
            name: "ContentResolver query",
            descr: "Hook ContentResolver query methods",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.content.ContentResolver$/").filter("name:query")'
            },
            autoEmit: true,
            emitEvent: "hook.contentResolver.query",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_uri'] = arguments[0].toString() ;
                data['arg1_projection'] = arguments[1];
                if (arguments.length === 4) {
                    data['arg2_queryArgs'] = arguments[2];
                }
                if ((arguments.length === 5) || (arguments.length === 6)) {
                    data['arg2_selection'] = arguments[2];
                    data['arg3_selection_args'] = arguments[3];
                    data['arg4_sortOrder'] = arguments[4]; 
                }
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                );
            `
        },
        {
            name: "openFile",
            descr: "Hook openFile method",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.content.ContentResolver$/").filter("name:openFile")'
            },
            autoEmit: true,
            emitEvent: "hook.contentResolver.openFile",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_uri'] = arguments[0].toString();
                data['arg1_mode'] = arguments[1];
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                );
            `
        },
        {
            name: "openFileDescriptor",
            descr: "Hook openFileDescriptor method",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.content.ContentResolver$/").filter("name:openFileDescriptor")'
            },
            autoEmit: true,
            emitEvent: "hook.contentResolver.openFileDescriptor",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_uri'] = arguments[0].toString();
                data['arg1_mode'] = arguments[1];
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                );
            `
        },
        {
            name: "ContentProvider query",
            descr: "Hook ContentProvider query methods",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.content.ContentProvider$/").filter("name:query")'
            },
            autoEmit: true,
            emitEvent: "hook.contentProvider.query",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_uri'] = arguments[0].toString();
                data['arg1_projection'] = arguments[1];
                if (arguments.length === 4) {
                    data['arg2_queryArgs'] = arguments[2];
                }
                if ((arguments.length === 5) || (arguments.length === 6)) {
                    data['arg2_selection'] = arguments[2];
                    data['arg3_selection_args'] = arguments[3];
                    data['arg4_sortOrder'] = arguments[4]; 
                }
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                );
            `
        }
        ]
    },
    eventListeners: {
    }
});


export default ContentProviderInspector;