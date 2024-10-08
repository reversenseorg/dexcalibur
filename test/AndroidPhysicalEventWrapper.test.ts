import {expect} from 'chai';
import AndroidPhysicalEventWrapper from "../src/platform/AndroidPhysicalEventWrapper.js";

const RAW_EVENT_ABS_1 = Buffer.from("fc2de466000000007a860b00000000000300390000000000", 'hex');
const DECODED_EVENT_ABS_1 = {type: 3, code: 57, value: '00000000', timestamp: "1726230012.755322", typeLabel: 'EV_ABS', codeLabel: 'ABS_MT_TRACKING_ID'}
const RAW_EVENT_ABS_2 = Buffer.from("fc2de466000000007a860b0000000000030035005c090000", "hex");
const DECODED_EVENT_ABS_2 = {type: 3, code: 53, value: '0000095c', timestamp: "1726230012.755322", typeLabel: 'EV_ABS', codeLabel: 'ABS_MT_POSITION_X'}
const RAW_EVENT_ABS_3 = Buffer.from("fc2de4660000000015fe0c000000000003003900ffffffff", "hex");
const DECODED_EVENT_ABS_3 = {type: 3, code: 57, value: 'ffffffff', timestamp: "1726230012.851477", typeLabel: 'EV_SYN', codeLabel: 'SYN_REPORT'}
const RAW_EVENT_SYN_REPORT = Buffer.from("fc2de466000000007a860b00000000000000000000000000", "hex");
const DECODED_SYN_REPORT = {type: 0, code: 0, value: '00000000', timestamp: "1726230012.755322", typeLabel: 'EV_ABS', codeLabel: 'ABS_MT_TRACKING_ID'}
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
    "000000000000", "hex");
const DECODED_CHUNK_EVENT = [
    {type: 3, code: 57, value: '00000000', timestamp: "1726230012.755322", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {type: 3, code: 53, value: '0000095c', timestamp: "1726230012.755322", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_X'}, 
    {type: 3, code: 54, value: '0000418b', timestamp: "1726230012.755322", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_Y'}, 
    {type: 3, code: 58, value: '00000400', timestamp: "1726230012.755322", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {type: 0, code: 0, value: '00000000', timestamp: "1726230012.755322", eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {type: 3, code: 58, value: '00000000', timestamp: "1726230012.851477", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {type: 3, code: 57, value: 'ffffffff', timestamp: "1726230012.851477", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {type: 0, code: 0, value: '00000000', timestamp: "1726230012.851477", eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {type: 3, code: 57, value: '00000000', timestamp: "1726230013.103224", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {type: 3, code: 53, value: '000019f4', timestamp: "1726230013.103224", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_X'}, 
    {type: 3, code: 54, value: '00003332', timestamp: "1726230013.103224", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_Y'}, 
    {type: 3, code: 58, value: '00000400', timestamp: "1726230013.103224", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {type: 0, code: 0, value: '00000000', timestamp: "1726230013.103224", eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {type: 3, code: 58, value: '00000000', timestamp: "1726230013.189945", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {type: 3, code: 57, value: 'ffffffff', timestamp: "1726230013.189945", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {type: 0, code: 0, value: '00000000', timestamp: "1726230013.189945", eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {type: 3, code: 57, value: '00000000', timestamp: "1726230013.536719", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {type: 3, code: 53, value: '00002b23', timestamp: "1726230013.536719", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_X'},
    {type: 3, code: 54, value: '00002f32', timestamp: "1726230013.536719", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_POSITION_Y'}, 
    {type: 3, code: 58, value: '00000400', timestamp: "1726230013.536719", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {type: 0, code: 0, value: '00000000', timestamp: "1726230013.536719", eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'}, 
    {type: 3, code: 58, value: '00000000', timestamp: "1726230013.632357", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_PRESSURE'}, 
    {type: 3, code: 57, value: 'ffffffff', timestamp: "1726230013.632357", eventTypeLabel: 'EV_ABS', eventCodeLabel: 'ABS_MT_TRACKING_ID'}, 
    {type: 0, code: 0, value: '00000000', timestamp: "1726230013.632357", eventTypeLabel: 'EV_SYN', eventCodeLabel: 'SYN_REPORT'},
]


describe('AndroidPhysicalEventWrapper', function() {
    
    describe('Decode individual event', function() {
        it('Decode an raw input event with null value', function () {
            let eventDecoded = new AndroidPhysicalEventWrapper().decode(RAW_EVENT_ABS_1);
            console.log(eventDecoded);
            expect(eventDecoded.timestamp).to.equal(DECODED_EVENT_ABS_1.timestamp);
            expect(eventDecoded.value).to.equal(DECODED_EVENT_ABS_1.value);
            expect(eventDecoded.code.value).to.equal(DECODED_EVENT_ABS_1.code);
            expect(eventDecoded.type.value).to.equal(DECODED_EVENT_ABS_1.type);
        });

        it('Decode an raw input event with non null value', function () {
            let eventDecoded = new AndroidPhysicalEventWrapper().decode(RAW_EVENT_ABS_2);
            console.log(eventDecoded);
            expect(eventDecoded.timestamp).to.equal(DECODED_EVENT_ABS_2.timestamp);
            expect(eventDecoded.value).to.equal(DECODED_EVENT_ABS_2.value);
            expect(eventDecoded.code.value).to.equal(DECODED_EVENT_ABS_2.code);
            expect(eventDecoded.type.value).to.equal(DECODED_EVENT_ABS_2.type);
        });

        it('Decode an raw input event with fffffffff value ', function () {
            let eventDecoded = new AndroidPhysicalEventWrapper().decode(RAW_EVENT_ABS_3);
            console.log(eventDecoded);
            expect(eventDecoded.timestamp).to.equal(DECODED_EVENT_ABS_3.timestamp);
            expect(eventDecoded.value).to.equal(DECODED_EVENT_ABS_3.value);
            expect(eventDecoded.code.value).to.equal(DECODED_EVENT_ABS_3.code);
            expect(eventDecoded.type.value).to.equal(DECODED_EVENT_ABS_3.type);
        });

        it('Decode an raw input SYN report event', function () {
            let eventDecoded = new AndroidPhysicalEventWrapper().decode(RAW_EVENT_SYN_REPORT);
            console.log(eventDecoded);
            expect(eventDecoded.timestamp).to.equal(DECODED_SYN_REPORT.timestamp);
            expect(eventDecoded.value).to.equal(DECODED_SYN_REPORT.value);
            expect(eventDecoded.code.value).to.equal(DECODED_SYN_REPORT.code);
            expect(eventDecoded.type.value).to.equal(DECODED_SYN_REPORT.type);
        });
    });
    describe('Decode chunk of events', function() {
        
        it('Decode a chunk of data, check timestamp, value, type value, code value', function () {
            let chunkDecoded = new AndroidPhysicalEventWrapper().decodeBufferChunk(CHUNK_EVENT_HEX);
            console.log(chunkDecoded);
            expect(chunkDecoded.length).to.equal(DECODED_CHUNK_EVENT.length);
            for (let i = 0; i < chunkDecoded.length; i++) {
                let eventDecoded = chunkDecoded[i];
                let expected_eventDecoded = DECODED_CHUNK_EVENT[i];
                console.log(eventDecoded)
                expect(eventDecoded.timestamp).to.equal(expected_eventDecoded.timestamp);
                expect(eventDecoded.value).to.equal(expected_eventDecoded.value);
                expect(eventDecoded.code.value).to.equal(expected_eventDecoded.code);
                expect(eventDecoded.type.value).to.equal(expected_eventDecoded.type);
            }
        });
    });
});