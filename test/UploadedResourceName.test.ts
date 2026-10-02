import {expect} from 'chai';
import {UploadedResource} from '../src/common/UploadedResource.js';
import {SecurityZone} from '../src/security/SecurityZone.js';

describe('UploadedResource names', () => {
    it('serializes missing names and preserves ordinary names', () => {
        expect(new UploadedResource().toJsonObject().name).to.equal(null);
        expect(new UploadedResource({name: 'sample.apk'}).toJsonObject().name).to.equal('sample.apk');
        expect(new UploadedResource().toJsonObject(undefined, SecurityZone.PRIVATE).name).to.equal(null);
    });
});
