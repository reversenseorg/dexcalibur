import {expect} from 'chai';
import {SearchRequestCondition} from '../src/search/SearchRequestCondition.js';

describe('Search condition regex restoration', () => {
    it('preserves delimited regex source and flags after JSON roundtrip', () => {
        const original = new SearchRequestCondition({field: 'name', pattern: '/^sample$/i'});
        original.turnAsRegexp();
        const restored = new SearchRequestCondition(JSON.parse(JSON.stringify(original.toJsonObject())));
        expect(original.test({name: 'SAMPLE'} as any)).to.equal(true);
        expect(restored.test({name: 'SAMPLE'} as any)).to.equal(true);
        expect(restored.test({name: 'not-sample'} as any)).to.equal(false);
    });
    it('accepts undelimited regex sources through constructor and explicit activation', () => {
        const condition = new SearchRequestCondition({field: 'name', pattern: '^sample$', regexp: true});
        expect(condition.test({name: 'sample'} as any)).to.equal(true);
        const activated = new SearchRequestCondition({field: 'name', pattern: '^sample$'});
        activated.turnAsRegexp();
        expect(activated.test({name: 'sample'} as any)).to.equal(true);
        expect(activated.test({name: 'samples'} as any)).to.equal(false);
    });
});
