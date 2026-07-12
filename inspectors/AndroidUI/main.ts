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

import * as HOOK from '../../src/hook/HookManager.js';

import {IntentFilter} from "../../src/android/IntentFilter.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import Inspector, {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import ModelClass from "../../src/ModelClass.js";
import BusEvent from "../../src/BusEvent.js";
import AndroidActivity from "../../src/android/AndroidActivity.js";
import * as Log from "../../src/Logger.js";
import {AndroidManifest} from "../../src/android/AndroidManifest.js";
import {AndroidCodeAnalyzer} from "../../src/android/analyzer/AndroidCodeAnalyzer.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====



// === CONFIG
export default new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    useGUI: true,

    version: "1.0.0",
    tags : [
        {
            name:"ui.input",
            _tagsOptions:[
                { name:"text"},
                { name:"pan"},
                { name:"pincode"},
                { name:"date"},
                { name:"email"},
            ]
        }
    ],

    hookSet: {
        id: "AndroidUI",
        name: "Android UI analyzer",
        description: "Find, tag and hook UI components",
        strategies:[]
    },

    eventListeners: {
        "class.new":  function (pEvent:BusEvent<ModelClass>):any {

        }
    }
});


