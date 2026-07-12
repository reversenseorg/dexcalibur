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

import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import BusEvent from "../../src/BusEvent.js";
import ModelMethod from "../../src/ModelMethod.js";


// ===== INIT =====

var ReactNativeGenericInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    /*tags: [
        {
            name:"react.type",
            _tagsOptions:[
                { name:"aks", label:"KeyStorage:AndroidKeyStore"},
                { name:"bks", label:"KeyStorage:BouncyCastle"},
                { name:"keychain", label:"KeyStorage:KeyChain"},
                { name:"tpm", label:"KeyStorage:TPM"},
                { name:"ese", label:"KeyStorage:SecureElement"},
                { name:"db", label:"KeyStorage:DBMS"},
            ]
        },{
            name:"keystore.service",
            _tagsOptions:[
                { name:"aks", label:"KeyService:AndroidKeyStore"}
            ]
        }
    ],*/

    id: "ReactNative",

    hookSet: {
        name: "ReactNative generic inspector",
        description: "Detect globally React Native application and generate usefull hooks",
        hookShare: {
            fd: [],
            stream: []
        },
        strategies: [
            {
                name: "instance",
                descr: "To detect new keystore instance",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid:  [
                        "java.security.KeyStore.getInstance(<java.lang.String>)<java.security.KeyStore>",
                        "java.security.KeyStore.getInstance(<java.lang.String><java.lang.String>)<java.security.KeyStore>",
                        "java.security.KeyStore.getInstance(<java.lang.String><java.security.Provider>)<java.security.KeyStore>"
                    ]
                },
                autoEmit: true,
                emitEvent: "hook.keystore.get.instance",
                before: `     
                    
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        {
                            name: arg0
                        }
                    );
                `
            }
        ]
    },

    eventListenerSources: {
        "dxc.fullscan.post_deploy": {
            source: `
                //<ts>={
                let ctx = pEvent.getContext();
                

                let app = ctx.find.file("@data.type.ELF").filter("@");
                
            `,
            lang: "ts"
        }
    },
});



export  default ReactNativeGenericInspector;