import {expect} from 'chai';
import {TaintCase} from '../src/analyzer/taint/TaintCase.js';

describe('TaintCase options', () => {
    it('retains descriptive options and optional collection defaults', () => {
        const source = {location: null, source: null};
        const taint = new TaintCase({ctx: null, source, name: 'reader-1', description: 'sample', author: 'user-1'});
        expect(taint.name).to.equal('reader-1');
        expect(taint.description).to.equal('sample');
        expect(taint.author).to.equal('user-1');
        expect(taint.source).to.equal(source);
        expect(taint.sinks).to.deep.equal([]);
    });
    it('retains supplied sink and propagation lists', () => {
        const entries = [{location: null, source: null}];
        const taint = new TaintCase({ctx: null, source: entries[0], name: 'reader-2', sinks: entries, propagators: entries, conds: entries});
        expect(taint.sinks).to.equal(entries);
        expect(taint.propagators).to.equal(entries);
        expect(taint.conds).to.equal(entries);
    });
});
