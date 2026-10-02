import {expect} from 'chai';
import {TagManager} from '../src/tags/TagManager.js';

describe('TagManager searches', () => {
    it('intersects cache criteria without appending duplicates or unrelated tags', async () => {
        const manager = new TagManager();
        const first = {name: 'target', label: 'keep'};
        const second = {name: 'target', label: 'drop'};
        const third = {name: 'other', label: 'keep'};
        manager.cache = {one: {getTags: () => [first, second]}, two: {getTags: () => [third]}} as any;
        expect(await manager.searchTagsFromCache({name: 'target', label: 'keep'})).to.deep.equal([first]);
        expect(await manager.searchTagsFromCache({name: '^target$', label: '^keep$'}, {regexp: true})).to.deep.equal([first]);
    });
    it('removes only regex delimiters and translates wildcard stars', async () => {
        const manager = new TagManager();
        const patterns: string[] = [];
        manager.searchTagsByRegexp = async pattern => {patterns.push(pattern); return [];};
        await manager.searchTags('/crypto.hash/');
        await manager.searchTags('crypto.*');
        await manager.searchTags('crypto.h*');
        expect(patterns).to.deep.equal(['crypto.hash', 'crypto\\..*', 'crypto\\.h.*']);
    });
});
