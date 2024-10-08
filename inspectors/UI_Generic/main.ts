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
import EventRecordSession from "../../src/platform/EventRecordSession.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====



// === CONFIG
export default new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    useGUI: true,

    version: "1.0.1",
    tags : [
        {
            name:"ui.event",
            _tagsOptions:[
                { name:"click"},
                { name:"touch"},
                { name:"drag"},
                { name:"drop"},
                { name:"hover"},
                { name:"key"},
            ]
        },
        {
            name:"ui.input",
            _tagsOptions:[
                { name:"text"},
                { name:"pan"},
                { name:"pincode"},
                { name:"date"},
                { name:"email"},
            ]
        },
        {
            name:"ui.cmp",
            _tagsOptions:[
                { name:"label"},
                { name:"input"},
                { name:"layout"},
                { name:"listener"},
                { name:"event"},
            ]
        }
    ],

    hookSet: {
        id: "UI_Generic",
        name: "Generic UI analyzer",
        description: "Find, tag, filter, analyze UI components",
        strategies:[]
    },

    eventListeners: {
        "action.input.record.start": function(pEvent:BusEvent<any>){

            // get device
            const dev = pEvent.getContext().getContext().getDeviceManager().getDevice(pEvent.getData().dev);

            if(dev==null){
                pEvent.getContext().LOG.error("[action.input.record.start] Failure : target device is undefined");
                return;
            }

            // get input devices, and start to record them
            const inputDevices = dev.getProfile().getInputProfile().getInputDevices();
            let recSession:EventRecordSession;
            pEvent.getData().session.extra.inputsRec = {};
            for(let k=0; k<inputDevices.length; k++){
                recSession = inputDevices[k].startRecord(dev);
                recSession.attachHookSession(pEvent.getData().session);
                pEvent.getData().session.extra.inputsRec[recSession.inputName] = recSession;
            }
        },
        "action.input.record.stop": function(pEvent:BusEvent<any>){

            // get device
            const dev = pEvent.getContext().getContext().getDeviceManager().getDevice(pEvent.getData().dev);

            if(dev==null){
                pEvent.getContext().LOG.error("[action.input.record.start] Failure : target device is undefined");
                return;
            }

            const records = pEvent.getData().session.extra.inputsRec;
            if(records==null) return null;

            for(let k in records){
                (pEvent.getData().session.extra.inputsRec[k] as EventRecordSession).stop();
            }

        }
    }
});


