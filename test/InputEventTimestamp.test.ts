import {expect} from 'chai';
import AndroidPhysicalEventWrapper from '../src/platform/AndroidPhysicalEventWrapper.js';
import {LinuxInputDeviceDecoder} from '../src/platform/kernels/linux/LinuxInputDeviceDecoder.js';
import {InputDeviceType} from '../src/platform/kernels/common/InputDeviceType.js';
import InputEventType from '../src/platform/InputEventType.js';
import InputEventCode from '../src/platform/InputEventCode.js';

describe('Input event timestamps', function () {
    const deviceType = new InputDeviceType({eventTypes: [
        new InputEventType({value: 0, codes: [new InputEventCode({value: 0})]})
    ]});
    const decoders = [new LinuxInputDeviceDecoder(deviceType), new AndroidPhysicalEventWrapper()];

    function raw(seconds: bigint, microseconds: bigint): Buffer {
        const event = Buffer.alloc(24);
        event.writeBigUInt64LE(seconds, 0);
        event.writeBigUInt64LE(microseconds, 8);
        return event;
    }

    it('retains six fractional digits, including leading zeroes', function () {
        for(const decoder of decoders){
            expect(decoder.decode(raw(1726230012n, 42n)).timestamp).to.equal('1726230012.000042');
            expect(decoder.decode(raw(1726230012n, 0n)).timestamp).to.equal('1726230012.000000');
            expect(decoder.decode(raw(1726230012n, 755322n)).timestamp).to.equal('1726230012.755322');
        }
    });

    it('does not round the seconds field through Number', function () {
        for(const decoder of decoders){
            expect(decoder.decode(raw(9007199254740993n, 1n)).timestamp).to.equal('9007199254740993.000001');
        }
    });
});
