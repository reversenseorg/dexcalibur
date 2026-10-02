import {expect} from 'chai';
import FuzzTestCase from '../src/fuzzing/FuzzTestCase.js';

describe('FuzzTestCase identity', () => {
    it('uses the provided case id', () => {
        const testCase = new FuzzTestCase({id: '3', inputValueDict: {text: 'sample'}});
        expect(testCase.getUID()).to.equal('3');
    });
});
