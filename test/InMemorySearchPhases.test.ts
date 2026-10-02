import {expect} from 'chai';
import {readFileSync} from 'node:fs';
import * as ts from 'typescript';
import {SearchRequestCondition} from '../src/search/SearchRequestCondition.js';
import Util from '../src/Utils.js';

const requestSource = readFileSync(new URL('../src/search/MerlinSearchRequest.ts', import.meta.url), 'utf8');
const requestAst = ts.createSourceFile('request.ts', requestSource, ts.ScriptTarget.Latest, true);
const enums = requestAst.statements.filter(x => ts.isEnumDeclaration(x) && ['OperationType', 'Comparison'].includes(x.name.text)).map(x => x.getText(requestAst).replace(/^export /, '')).join('\n');
const backendSource = readFileSync(new URL('../connectors/inmemory/InMemoryMerlinBackend.ts', import.meta.url), 'utf8');
const backendAst = ts.createSourceFile('backend.ts', backendSource, ts.ScriptTarget.Latest, true);
const cls = backendAst.statements.find(x => ts.isClassDeclaration(x) && x.name?.text === 'InMemoryMerlinBackend');
const emitted = ts.transpileModule(enums + '\n' + cls.getText(backendAst).replace(/^export /, ''), {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
// Actual complete backend class and request enums; isolate their existing import
// cycle. These fixtures do not establish whole-module/database acceptance.
const {Backend, OperationType} = new Function('Util', emitted + '\nreturn {Backend: InMemoryMerlinBackend, OperationType};')(Util);

function search(phases: any[][], entries: any[]) {
    const result: any[] = [];
    new Backend({getAsList: () => entries}).search({getPhases: () => phases}, {setEntry: (i, x) => result[i] = x});
    return result;
}
const condition = (field, pattern) => new SearchRequestCondition({field, pattern, opts: {strict: true}});
const filter = (...patterns) => ({type: OperationType.SEARCH, args: {pattern: patterns}});

describe('in-memory search phases', () => {
    const entries = [{name: 'a', kind: 'one'}, {name: 'a', kind: 'two'}, {name: 'b', kind: 'one'}];
    it('applies every object condition and consecutive filtering phases', () => {
        expect(search([[filter(condition('name', 'a'), condition('kind', 'one'))]], entries)).to.deep.equal([entries[0]]);
        expect(search([[filter(condition('name', 'a'))], [{type: OperationType.SIZE, args: {limit: 2}}], [filter(condition('kind', 'two'))]], entries)).to.deep.equal([entries[1]]);
    });
    it('handles offset-only and unlimited windows without dropping the last entry', () => {
        expect(search([[], [{type: OperationType.SIZE, args: {offset: 1}}]], entries)).to.deep.equal(entries.slice(1));
        expect(search([[], [{type: OperationType.SIZE, args: {limit: -1}}]], entries)).to.deep.equal(entries);
    });
    it('unions entries from nested requests and selects children', () => {
        const nested = {getPhases: () => [[filter(condition('name', 'b'))]]};
        expect(search([[filter(condition('name', 'a'))], [{type: OperationType.UNION, args: {request: nested}}]], entries)).to.deep.equal(entries);
        expect(search([[], [{type: OperationType.INNERJOIN, args: {on: 'children'}}]], [{children: entries}])).to.deep.equal(entries);
    });
});
