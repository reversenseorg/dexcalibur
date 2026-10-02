import {expect} from 'chai';
import {KeyPointManagerException} from '../src/errors/KeyPointManagerException.js';

describe('KeyPointManager property errors', () => {
    it('distinguishes an invalid property from an unknown keypoint', () => {
        expect(KeyPointManagerException.INVALID_KEYPOINT_PPT('fixture').getCode()).to.equal(KeyPointManagerException.ERR.INVALID_KEYPOINT_PPT);
        expect(KeyPointManagerException.UNKNOW_KEYPOINT('fixture').getCode()).to.equal(KeyPointManagerException.ERR.UNKNOW_KEYPOINT);
    });
});
