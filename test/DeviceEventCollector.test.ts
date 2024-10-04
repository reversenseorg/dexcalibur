import DeviceEventCollector from "../src/platform/DeviceEventCollector.js";
import AndroidEventRecordSession from "../src/deviceEvent/AndroidEventRecordSession.js";
import {expect} from 'chai';
import {
    AndroidEventType,
    AndroidKeyEventLabel,
    getEnumKeyByEnumValue,
    getEventLabelEnumFromType
} from "../src/android/AndroidInputEvent.js";
import AndroidPhysicalEventWrapper from "../src/deviceEvent/AndroidPhysicalEventWrapper.js";


const FIRST_BATCH_RAW = "[  188364.900319] /dev/input/event12: EV_KEY       KEY_A                DOWN                \n" +
    "[  188364.900319] /dev/input/event12: EV_SYN       SYN_REPORT           00000000            \n" +
    "[  188364.900409] /dev/input/event12: EV_KEY       KEY_A                UP                  \n" +
    "[  188364.900409] /dev/input/event12: EV_SYN       SYN_REPORT           00000000";
const FIRST_LINE_PARSED = {"timestamp": 188364.900319,
    "device": "/dev/input/event12" ,
    "eventType": "EV_KEY",
    "eventCode": "KEY_A",
    "eventValue": "DOWN"};
const FIRST_BATCH_PARSED = [
    {"timestamp": 188364.900319,
        "device": "/dev/input/event12" ,
        "eventType": "EV_KEY",
        "eventCode": "KEY_A",
        "eventValue": "DOWN"},
    {"timestamp": 188364.900319,
        "device": "/dev/input/event12" ,
        "eventType": "EV_SYN",
        "eventCode": "SYN_REPORT",
        "eventValue": "00000000"},
    {"timestamp": 188364.900409,
        "device": "/dev/input/event12" ,
        "eventType": "EV_KEY",
        "eventCode": "KEY_A",
        "eventValue": "UP"},
    {"timestamp": 188364.900409,
        "device": "/dev/input/event12" ,
        "eventType": "EV_SYN",
        "eventCode": "SYN_REPORT",
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
        "eventCode": "ABS_MT_TRACKING_ID",
        "eventValue": "00000000"},
    {"timestamp": 188317.265032,
        "device": "/dev/input/event1" ,
        "eventType": "EV_ABS",
        "eventCode": "ABS_MT_POSITION_X",
        "eventValue": "0000749e"},
    {"timestamp": 188317.265032,
        "device": "/dev/input/event1" ,
        "eventType": "EV_ABS",
        "eventCode": "ABS_MT_POSITION_Y",
        "eventValue": "00003d10"},
    {"timestamp": 188317.265032,
        "device": "/dev/input/event1" ,
        "eventType": "EV_ABS",
        "eventCode": "ABS_MT_PRESSURE",
        "eventValue": "00000400"},
    {"timestamp": 188317.265032,
        "device": "/dev/input/event1" ,
        "eventType": "EV_SYN",
        "eventCode": "SYN_REPORT",
        "eventValue": "00000000"}
];
const INCOMPLETE_BATCH_RAW = "[  188317.265032] ";
const INCOMPLETE_BATCH_PARSED = [];

const CHUNK_EVENT_HEX = Buffer.from("fc2de466000000007a860b00000000000300390000000000fc2de4660000" +
    "00007a860b0000000000030035005c090000fc2de466000000007a860b00" +
    "00000000030036008b410000fc2de466000000007a860b00000000000300" +
    "3a0000040000fc2de466000000007a860b00000000000000000000000000" +
    "fc2de4660000000015fe0c000000000003003a0000000000fc2de4660000" +
    "000015fe0c000000000003003900fffffffffc2de4660000000015fe0c00" +
    "000000000000000000000000fd2de4660000000038930100000000000300" +
    "390000000000fd2de46600000000389301000000000003003500f4190000" +
    "fd2de4660000000038930100000000000300360032330000fd2de4660000" +
    "0000389301000000000003003a0000040000fd2de4660000000038930100" +
    "000000000000000000000000fd2de46600000000f9e50200000000000300" +
    "3a0000000000fd2de46600000000f9e502000000000003003900ffffffff" +
    "fd2de46600000000f9e50200000000000000000000000000fd2de4660000" +
    "00008f300800000000000300390000000000fd2de466000000008f300800" +
    "0000000003003500232b0000fd2de466000000008f300800000000000300" +
    "3600322f0000fd2de466000000008f3008000000000003003a0000040000" +
    "fd2de466000000008f300800000000000000000000000000fd2de4660000" +
    "000025a609000000000003003a0000000000fd2de4660000000025a60900" +
    "0000000003003900fffffffffd2de4660000000025a60900000000000000" +
    "000000000000fd2de46600000000d8c90a00000000000300390000000000" +
    "fd2de46600000000d8c90a000000000003003a0000040000fd2de4660000" +
    "0000d8c90a00000000000000000000000000fd2de466000000000b470c00" +
    "0000000003003a0000000000fd2de466000000000b470c00000000000300" +
    "3900fffffffffd2de466000000000b470c00000000000000000000000000" +
    "fd2de4660000000056650d00000000000300390000000000fd2de4660000" +
    "000056650d000000000003003a0000040000fd2de4660000000056650d00" +
    "000000000000000000000000fd2de4660000000054ca0e00000000000300" +
    "3a0000000000fd2de4660000000054ca0e000000000003003900ffffffff" +
    "fd2de4660000000054ca0e00000000000000000000000000", "hex");

const CHUNK_EVENT_PARSED = [
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(755322), eventType: 3, eventCode: 57, eventValue: '0'},
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(755322), eventType: 3, eventCode: 53, eventValue: '95c'},
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(755322), eventType: 3, eventCode: 54, eventValue: '418b'},
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(755322), eventType: 3, eventCode: 58, eventValue: '400'},
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(755322), eventType: 0, eventCode: 0, eventValue: '0'},
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(851477), eventType: 3, eventCode: 58, eventValue: '0'},
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(851477), eventType: 3, eventCode: 57, eventValue: '-1'},
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(851477), eventType: 0, eventCode: 0, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(103224), eventType: 3, eventCode: 57, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(103224), eventType: 3, eventCode: 53, eventValue: '19f4'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(103224), eventType: 3, eventCode: 54, eventValue: '3332'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(103224), eventType: 3, eventCode: 58, eventValue: '400'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(103224), eventType: 0, eventCode: 0, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(189945), eventType: 3, eventCode: 58, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(189945), eventType: 3, eventCode: 57, eventValue: '-1'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(189945), eventType: 0, eventCode: 0, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(536719), eventType: 3, eventCode: 57, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(536719), eventType: 3, eventCode: 53, eventValue: '2b23'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(536719), eventType: 3, eventCode: 54, eventValue: '2f32'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(536719), eventType: 3, eventCode: 58, eventValue: '400'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(536719), eventType: 0, eventCode: 0, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(632357), eventType: 3, eventCode: 58, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(632357), eventType: 3, eventCode: 57, eventValue: '-1'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(632357), eventType: 0, eventCode: 0, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(707032), eventType: 3, eventCode: 57, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(707032), eventType: 3, eventCode: 58, eventValue: '400'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(707032), eventType: 0, eventCode: 0, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(804619), eventType: 3, eventCode: 58, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(804619), eventType: 3, eventCode: 57, eventValue: '-1'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(804619), eventType: 0, eventCode: 0, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(877910), eventType: 3, eventCode: 57, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(877910), eventType: 3, eventCode: 58, eventValue: '400'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(877910), eventType: 0, eventCode: 0, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(969300), eventType: 3, eventCode: 58, eventValue: '0'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(969300), eventType: 3, eventCode: 57, eventValue: '-1'},
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(969300), eventType: 0, eventCode: 0, eventValue: '0'}
]



const CHUNK_EVENT_PARSED_AND_LABELED = [
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(755322), eventType: 3, eventCode: 57, eventValue: '0', timestamp: 1726230012.755322, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(755322), eventType: 3, eventCode: 53, eventValue: '95c', timestamp: 1726230012.755322, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_X'}, 
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(755322), eventType: 3, eventCode: 54, eventValue: '418b', timestamp: 1726230012.755322, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_Y'}, 
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(755322), eventType: 3, eventCode: 58, eventValue: '400', timestamp: 1726230012.755322, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(755322), eventType: 0, eventCode: 0, eventValue: '0', timestamp: 1726230012.755322, eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(851477), eventType: 3, eventCode: 58, eventValue: '0', timestamp: 1726230012.851477, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(851477), eventType: 3, eventCode: 57, eventValue: '-1', timestamp: 1726230012.851477, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {timestamp_sec: BigInt(1726230012), timestamp_usec: BigInt(851477), eventType: 0, eventCode: 0, eventValue: '0', timestamp: 1726230012.851477, eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(103224), eventType: 3, eventCode: 57, eventValue: '0', timestamp: 1726230013.103224, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(103224), eventType: 3, eventCode: 53, eventValue: '19f4', timestamp: 1726230013.103224, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_X'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(103224), eventType: 3, eventCode: 54, eventValue: '3332', timestamp: 1726230013.103224, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_Y'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(103224), eventType: 3, eventCode: 58, eventValue: '400', timestamp: 1726230013.103224, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(103224), eventType: 0, eventCode: 0, eventValue: '0', timestamp: 1726230013.103224, eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(189945), eventType: 3, eventCode: 58, eventValue: '0', timestamp: 1726230013.189945, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(189945), eventType: 3, eventCode: 57, eventValue: '-1', timestamp: 1726230013.189945, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(189945), eventType: 0, eventCode: 0, eventValue: '0', timestamp: 1726230013.189945, eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(536719), eventType: 3, eventCode: 57, eventValue: '0', timestamp: 1726230013.536719, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(536719), eventType: 3, eventCode: 53, eventValue: '2b23', timestamp: 1726230013.536719, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_X'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(536719), eventType: 3, eventCode: 54, eventValue: '2f32', timestamp: 1726230013.536719, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_Y'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(536719), eventType: 3, eventCode: 58, eventValue: '400', timestamp: 1726230013.536719, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(536719), eventType: 0, eventCode: 0, eventValue: '0', timestamp: 1726230013.536719, eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(632357), eventType: 3, eventCode: 58, eventValue: '0', timestamp: 1726230013.632357, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(632357), eventType: 3, eventCode: 57, eventValue: '-1', timestamp: 1726230013.632357, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(632357), eventType: 0, eventCode: 0, eventValue: '0', timestamp: 1726230013.632357, eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(707032), eventType: 3, eventCode: 57, eventValue: '0', timestamp: 1726230013.707032, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(707032), eventType: 3, eventCode: 58, eventValue: '400', timestamp: 1726230013.707032, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(707032), eventType: 0, eventCode: 0, eventValue: '0', timestamp: 1726230013.707032, eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(804619), eventType: 3, eventCode: 58, eventValue: '0', timestamp: 1726230013.804619, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(804619), eventType: 3, eventCode: 57, eventValue: '-1', timestamp: 1726230013.804619, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(804619), eventType: 0, eventCode: 0, eventValue: '0', timestamp: 1726230013.804619, eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(877910), eventType: 3, eventCode: 57, eventValue: '0', timestamp: 1726230013.87791, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(877910), eventType: 3, eventCode: 58, eventValue: '400', timestamp: 1726230013.87791, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(877910), eventType: 0, eventCode: 0, eventValue: '0', timestamp: 1726230013.87791, eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(969300), eventType: 3, eventCode: 58, eventValue: '0', timestamp: 1726230013.9693, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(969300), eventType: 3, eventCode: 57, eventValue: '-1', timestamp: 1726230013.9693, eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {timestamp_sec: BigInt(1726230013), timestamp_usec: BigInt(969300), eventType: 0, eventCode: 0, eventValue: '0', timestamp: 1726230013.9693, eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'},
]

describe('Devices Events Collector', function() {
    
    describe('Device Event Collector', function() {

        it('Parse batch of Device events', function () {
            let parsedChunk = DeviceEventCollector.parseEventChunk(FIRST_BATCH_RAW);
            expect(parsedChunk[0]).to.deep.equal(FIRST_LINE_PARSED);
            expect(parsedChunk).to.deep.equal(FIRST_BATCH_PARSED);
        });

        it('Parse second batch of Device events', function () {
            let parsedChunk = DeviceEventCollector.parseEventChunk(SECOND_BATCH_RAW);
            expect(parsedChunk).to.deep.equal(SECOND_BATCH_PARSED);
        });

        it('Parse incomplete batch of Device events', function () {
            let parsedChunk = DeviceEventCollector.parseEventChunk(INCOMPLETE_BATCH_RAW);
            expect(parsedChunk).to.deep.equal(INCOMPLETE_BATCH_PARSED);
        });
    });

    describe('AndroidEventRecordSession', function() {

        it('Parse a chunk of Device events', function () {
            let chunk_parsed = AndroidEventRecordSession.parseEventChunk(CHUNK_EVENT_HEX);
            expect(chunk_parsed).to.deep.equal(CHUNK_EVENT_PARSED);
        });

        it('Parse and label a chunk of Device events', function () {
            let test_decode = new AndroidPhysicalEventWrapper().decode(CHUNK_EVENT_HEX);
            console.log(test_decode);
            let chunk_parsed = AndroidEventRecordSession.parseEventChunk(CHUNK_EVENT_HEX);
            let labeled_Chunk : any[] = []
            chunk_parsed.forEach((event) => {
                let labeled_event = event;
                labeled_event["timestamp"] = parseInt(event.timestamp_sec) + parseInt(event.timestamp_usec) * 10 ** -6;
                labeled_event["eventTypeLabel"] = getEnumKeyByEnumValue(AndroidEventType, event.eventType);
                let keyEventEnum = getEventLabelEnumFromType(event.eventType)
                labeled_event["eventCodeLabel"] = getEnumKeyByEnumValue(keyEventEnum, event.eventCode);
                labeled_Chunk.push(labeled_event);
            })
            expect(labeled_Chunk).to.deep.equal(CHUNK_EVENT_PARSED_AND_LABELED);
        });

    });

    describe('AndroidInputEvent', function() {

        it('getEnumKeyByEnumValue enum value EV_KEY', function () {
            let EXPECTED_EK_LABEL = "EV_KEY";
            let enumKey = getEnumKeyByEnumValue(AndroidEventType, AndroidEventType.EV_KEY);
            expect(enumKey).to.equal(EXPECTED_EK_LABEL);
        });


        it('getEnumKeyByEnumValue direct hex value', function () {
            let EXPECTED_ER_LABEL = "EV_REL";
            const EV_REL = 0x02;
            let enumKey = getEnumKeyByEnumValue(AndroidEventType, EV_REL);
            expect(enumKey).to.equal(EXPECTED_ER_LABEL);
        });

        it('getEnumKeyByEnumValue direct int value', function () {
            let EXPECTED_ER_LABEL = "EV_REL";
            const EV_REL = 2;
            let enumKey = getEnumKeyByEnumValue(AndroidEventType, EV_REL);
            expect(enumKey).to.equal(EXPECTED_ER_LABEL);
        });

        it('getEnumKeyByEnumValue return empty string for value not in enum', function () {
            let EXPECTED_EMPTY_LABEL = "";
            const ERROR_ARG_NOT_IN_ENUM: number = 0x99999999999;
            let enumKey = getEnumKeyByEnumValue(AndroidEventType, ERROR_ARG_NOT_IN_ENUM)
            expect(enumKey).to.equal(EXPECTED_EMPTY_LABEL);
        });


        it('getEventLabelEnumFromType', function () {
            let keyEventEnum = getEventLabelEnumFromType(AndroidEventType.EV_KEY)
            expect(keyEventEnum).to.deep.equal(AndroidKeyEventLabel);
        });

        it('getEventLabelEnumFromType + getEnumKeyByEnumValue', function () {
            let EXPECTED_K1_LABEL = "KEY_1";
            let keyEventEnum = getEventLabelEnumFromType(AndroidEventType.EV_KEY)
            let enumKey = getEnumKeyByEnumValue(keyEventEnum, keyEventEnum.KEY_1);
            expect(enumKey).to.equal(EXPECTED_K1_LABEL);
        });

        it('getEventLabelEnumFromType + getEnumKeyByEnumValue with number value', function () {
            const ABS_EVENT_TYPE = 3;
            const ABS_WHEEL_EVENT_CODE = 8;
            let EXPECTED_AW_LABEL = "ABS_WHEEL";
            let keyEventEnum = getEventLabelEnumFromType(ABS_EVENT_TYPE);
            let enumKey = getEnumKeyByEnumValue(keyEventEnum, ABS_WHEEL_EVENT_CODE);
            expect(enumKey).to.equal(EXPECTED_AW_LABEL);
        });

    });

});