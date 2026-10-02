import {expect} from 'chai';
import {DataSource} from '../src/DataSource.js';

describe('DataSource multiple lookups', () => {
    it('uses the single lookup contract for every requested UID', () => {
        const calls: any[] = [];
        const project: any = {};
        const type: any = {};
        const source = new DataSource('test', {single: (...args: any[]) => {
            calls.push(args);
            return args[2] === 'missing' ? null : {uid: args[2]};
        }});
        expect(source.findMult(type, project, ['first', 'missing', 'last'])).to.deep.equal([{uid: 'first'}, null, {uid: 'last'}]);
        expect(calls).to.deep.equal([[project, type, 'first'], [project, type, 'missing'], [project, type, 'last']]);
        expect(source.findMult(type, project, [])).to.deep.equal([]);
        expect(source.findMult(type, project, null)).to.deep.equal([]);
        expect(calls).to.have.length(3);
    });
});
