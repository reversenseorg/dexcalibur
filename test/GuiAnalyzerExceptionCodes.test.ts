import {expect} from 'chai';
import {GuiAnalyzerException} from '../src/graphics/errors/GuiAnalyzerException.js';

describe('GUI duplicate error codes', () => {
    it('preserves the declared event, component and role codes', () => {
        for (const name of ['EXISTING_EVT_TYPE', 'EXISTING_CMP_TYPE', 'EXISTING_ROLE'] as const) {
            expect(GuiAnalyzerException[name]('fixture').getCode()).to.equal(GuiAnalyzerException.ERR[name]);
        }
    });
});
