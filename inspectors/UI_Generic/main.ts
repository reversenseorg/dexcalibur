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
import Screenshot from "../../src/platform/Screenshot.js";
import ScreenshotAgent from "../../src/platform/ScreenshotAgent.js";
import ScreenshotSession from "../../src/platform/ScreenshotSession.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====



// === CONFIG
export default new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    useGUI: true,

    version: "1.0.5",
    tags : [],

    hookSet: {
        id: "UI_Generic",
        name: "Generic UI analyzer",
        description: "Find, tag, filter, analyze UI components",
        strategies:[]
    },

    eventListeners: {
        "action.input.record.start": function(pEvent:BusEvent<any>){

            console.log("[action.input.record.start] triggered");
            // get device
            const dev = pEvent.getContext().getContext().getDeviceManager().getDevice(pEvent.getData().dev);
            try{
                console.log("[action.input.record.start] trigged");
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
                    pEvent.getData().session.extra.inputsRec[recSession.inputName] = recSession;
                    recSession.attachHookSession(pEvent.getData().session);
                }
            }catch(e){
                console.log(e);
            }
        },
        "action.input.record.stop": function(pEvent:BusEvent<any>){


            console.log("[action.input.record.stop] triggered");

            // get device
            const dev = pEvent.getContext().getContext().getDeviceManager().getDevice(pEvent.getData().dev);

            if(dev==null){
                pEvent.getContext().LOG.error("[action.input.record.stop] Failure : target device is undefined");
                return;
            }

            const records = pEvent.getData().session.extra.inputsRec;
            if(records==null) return null;

            for(let k in records){
                (pEvent.getData().session.extra.inputsRec[k] as EventRecordSession).stop();
            }

        },
        "hook.keystore.load": function(pEvent:BusEvent<any>){
            console.log("[hook.keystore.load] caught try to trigger action.screen.screenshot");
            let vSess = pEvent.getContext().getHookManager().lastSession()
            pEvent.getContext().trigger( {
                type: "action.screen.screenshot",
                data: {
                    dev: vSess.getDeviceUID(),
                    session: vSess
                }
            });
        },
        "action.screen.screenshot": function(pEvent:BusEvent<any>){

            console.log("[action.screen.screenshot] triggered");
            // get device
            const dev = pEvent.getContext().getContext().getDeviceManager().getDevice(pEvent.getData().dev);

            if(dev==null){
                pEvent.getContext().LOG.error("[action.input.record.start] Failure : target device is undefined");
                return;
            }

            let screenshotSess : ScreenshotSession = pEvent.getData().session.extra.screenshotSess;
            if(screenshotSess == null) {
                // create screenshotSession
                screenshotSess = dev.initScreenshotSession()
                screenshotSess.attachHookSession(pEvent.getData().session);
                pEvent.getData().session.extra.screenshotSess = screenshotSess;
            }
            // perform screenshot
            let screenshot = screenshotSess.performScreenshot();
            console.log("[screenshot] triggered");
            console.log(screenshot);
            console.log(" ---------- -------------- ----------- -- \n   DUMP screenshot data capture  \n ------- ")
            console.log(screenshot.data);
            console.log(" --------- End ------------");
        },
    }
});


