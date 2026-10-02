import {expect} from 'chai';
import {readFileSync} from 'node:fs';
import * as ts from 'typescript';
import {NodeType} from '@reversense/dexcalibur-orm';
import {NodeInternalType} from '@reversense/dxc-core-api';
import {SearchToken} from '../src/search/SearchToken.js';
import {SearchPattern} from '../src/search/SearchPattern.js';

const source = readFileSync(new URL('../src/search/Finder.ts', import.meta.url), 'utf8');
const ast = ts.createSourceFile('Finder.ts', source, ts.ScriptTarget.Latest, true);
const cls = ast.statements.find(x => ts.isClassDeclaration(x) && x.name?.text === 'Finder');
const emitted = ts.transpileModule(cls.getText(ast).replace(/^export /, ''), {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
// Actual complete Finder class with controlled database; excludes the existing
// module cycle and does not establish full module/database integration.
const Finder = new Function('NodeType', 'NodeInternalType', emitted + '\nreturn Finder;')(NodeType, NodeInternalType);

describe('Finder nested iterables', () => {
    it('marks only explicit trailing brackets as iterable', () => {
        expect(SearchToken.parseTokens('a.name').map(x => x.isIterable())).to.deep.equal([false, false]);
        expect(SearchToken.parseTokens('a[].name').map(x => x.isIterable())).to.deep.equal([true, false]);
    });
    it('returns a matching nested array or object child at the correct path offset', () => {
        const finder = new Finder({getConnector: () => ({newTemporaryDb: () => ({})})});
        const pattern = new SearchPattern({field: SearchToken.parseTokens('outer.children[].name'), fn: value => value === 'match'});
        expect(finder.__checkDeepField({outer: {children: [{name: 'miss'}, {name: 'match'}]}}, pattern)).to.equal(true);
        expect(finder.__checkDeepField({outer: {children: {first: {name: 'miss'}, second: {name: 'match'}}}}, pattern)).to.equal(true);
        expect(finder.__checkDeepField({outer: {children: [{name: 'miss'}, null]}}, pattern)).to.equal(false);
    });
});
