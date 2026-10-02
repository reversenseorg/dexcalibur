import {expect} from 'chai';
import Screenshot from '../src/platform/Screenshot.js';
import ScreenshotSession from '../src/platform/ScreenshotSession.js';
import PhysicalEventChannel from '../src/platform/PhysicalEventChannel.js';

describe('Platform session collections', function () {
    it('retains screenshots in a default session', function () {
        const session = new ScreenshotSession();
        const screenshot = new Screenshot({data: Buffer.from([1, 2])});
        session.push(screenshot);
        expect(session.screenshots).to.deep.equal([screenshot]);
    });

    it('preserves supplied screenshot collections', function () {
        const screenshots = [new Screenshot()];
        const session = new ScreenshotSession({screenshots});
        const next = new Screenshot();
        session.push(next);
        expect(session.screenshots).to.equal(screenshots);
        expect(screenshots).to.have.lengthOf(2);
    });

    it('starts records in a default channel', function () {
        const channel = new PhysicalEventChannel();
        const record = channel.startRecord();
        expect(channel.records).to.deep.equal([record]);
        expect(record.getUID()).to.be.a('string');
    });

    it('preserves supplied record collections', function () {
        const records = [];
        const channel = new PhysicalEventChannel({records});
        const record = channel.startRecord();
        expect(channel.records).to.equal(records);
        expect(records).to.deep.equal([record]);
    });
});
