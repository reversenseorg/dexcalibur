import * as _path_ from 'path';
import {TestHelper} from "../src/TestHelper.js";
import AdbWrapper from "../src/AdbWrapper.js";
import {Device} from "../src/Device.js";
import DeviceEventCollector from "../src/deviceEvent/DeviceEventCollector.js";
import {expect} from 'chai';

const FIRST_BATCH_RAW = "[  188364.900319] /dev/input/event12: EV_KEY       KEY_A                DOWN                \n" +
    "[  188364.900319] /dev/input/event12: EV_SYN       SYN_REPORT           00000000            \n" +
    "[  188364.900409] /dev/input/event12: EV_KEY       KEY_A                UP                  \n" +
    "[  188364.900409] /dev/input/event12: EV_SYN       SYN_REPORT           00000000";
const FIRST_LINE_PARSED = {"timestamp": 188364.900319,
    "device": "/dev/input/event12" ,
    "eventType": "EV_KEY",
    "eventName": "KEY_A",
    "eventValue": "DOWN"};
const FIRST_BATCH_PARSED = [
    {"timestamp": 188364.900319,
        "device": "/dev/input/event12" ,
        "eventType": "EV_KEY",
        "eventName": "KEY_A",
        "eventValue": "DOWN"},
    {"timestamp": 188364.900319,
        "device": "/dev/input/event12" ,
        "eventType": "EV_SYN",
        "eventName": "SYN_REPORT",
        "eventValue": "00000000"},
    {"timestamp": 188364.900409,
        "device": "/dev/input/event12" ,
        "eventType": "EV_KEY",
        "eventName": "KEY_A",
        "eventValue": "UP"},
    {"timestamp": 188364.900409,
        "device": "/dev/input/event12" ,
        "eventType": "EV_SYN",
        "eventName": "SYN_REPORT",
        "eventValue": "00000000"}
];
const SECOND_BATCH_RAW = "[  188317.265032] /dev/input/event1: EV_ABS       ABS_MT_TRACKING_ID   00000000            \n" +
    "[  188317.265032] /dev/input/event1: EV_ABS       ABS_MT_POSITION_X    0000749e            \n" +
    "[  188317.265032] /dev/input/event1: EV_ABS       ABS_MT_POSITION_Y    00003d10            \n" +
    "[  188317.265032] /dev/input/event1: EV_ABS       ABS_MT_PRESSURE      00000400            \n" +
    "[  188317.265032] /dev/input/event1: EV_SYN       SYN_REPORT           00000000            \n" +
    "\n"
const SECOND_BATCH_PARSED = [
    {"timestamp": 188317.265032,
        "device": "/dev/input/event1" ,
        "eventType": "EV_ABS",
        "eventName": "ABS_MT_TRACKING_ID",
        "eventValue": "00000000"},
    {"timestamp": 188317.265032,
        "device": "/dev/input/event1" ,
        "eventType": "EV_ABS",
        "eventName": "ABS_MT_POSITION_X",
        "eventValue": "0000749e"},
    {"timestamp": 188317.265032,
        "device": "/dev/input/event1" ,
        "eventType": "EV_ABS",
        "eventName": "ABS_MT_POSITION_Y",
        "eventValue": "00003d10"},
    {"timestamp": 188317.265032,
        "device": "/dev/input/event1" ,
        "eventType": "EV_ABS",
        "eventName": "ABS_MT_PRESSURE",
        "eventValue": "00000400"},
    {"timestamp": 188317.265032,
        "device": "/dev/input/event1" ,
        "eventType": "EV_SYN",
        "eventName": "SYN_REPORT",
        "eventValue": "00000000"}
];
const INCOMPLETE_BATCH_RAW = "[  188317.265032] ";
const INCOMPLETE_BATCH_PARSED = [];


describe('Devices Events Collector', function() {

    before(function(){
    });

    beforeEach(function() {
    });

    afterEach(function() {
       // console.log.restore();
    });
    
    describe('Device Event Collector', function() {

        it('Parse batch of Device events', function () {
            let parsedChunk = DeviceEventCollector.parseEventChunk(FIRST_BATCH_RAW);
            expect(parsedChunk[0]).to.deep.equal(FIRST_LINE_PARSED);
            expect(parsedChunk).to.deep.equal(FIRST_BATCH_PARSED);
        });

        it('Parse batch of Device events', function () {
            let parsedChunk = DeviceEventCollector.parseEventChunk(SECOND_BATCH_RAW);
            expect(parsedChunk).to.deep.equal(SECOND_BATCH_PARSED);
        });

        it('Parse batch of Device events', function () {
            let parsedChunk = DeviceEventCollector.parseEventChunk(INCOMPLETE_BATCH_RAW);
            expect(parsedChunk).to.deep.equal(INCOMPLETE_BATCH_PARSED);
        });
    });

});