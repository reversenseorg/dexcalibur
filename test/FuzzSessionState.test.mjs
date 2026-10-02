import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const text = readFileSync(new URL('../src/fuzzing/FuzzSession.ts', import.meta.url), 'utf8');
const source = ts.createSourceFile('FuzzSession.ts', text, ts.ScriptTarget.Latest, true);
const cls = source.statements.find(ts.isClassDeclaration);
function method(name, dependencies = {}) {
    const node = cls.members.find(node => node.name?.getText(source) === name);
    const code = ts.transpileModule(`function run${node.getText(source).slice(name.length)}`, {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
    return new Function(...Object.keys(dependencies), `${code}; return run;`)(...Object.values(dependencies));
}

test('new sessions initialize the input queue', () => {
    const field = cls.members.find(node => node.name?.getText(source) === 'inputValuesQueue');
    assert.ok(field.initializer);
    const queue = new Function(`return ${field.initializer.getText(source)};`)();
    const state = {inputValuesQueue: queue, generateInputDict: () => ({value: 'sample'})};
    assert.deepEqual(method('getNextInputDict').call(state), {value: 'sample'});
});

test('events without a case id use the latest case', () => {
    const first = {};
    const latest = {pushEvent: () => {}};
    let received;
    const state = {testCases: [first, latest], findResolverForEvent: () => ({process: testCase => {received = testCase; return {flag: 2};}})};
    const event = {getData: () => ({})};
    method('resolveEvent', {FuzzingResolverResult: {SUCCESS: 0, FAIL: 1, INFO: 2, DISCARD: 3}}).call(state, event);
    assert.equal(received, latest);
});

test('events with no matching case do not invoke a resolver', () => {
    const state = {testCases: [{getUID: () => 'known'}], findResolverForEvent: () => {throw new Error('unexpected resolver');}};
    const resolve = method('resolveEvent', {FuzzingResolverResult: {}});
    assert.equal(resolve.call(state, {getData: () => ({tcid: 'unknown'})}), null);
    state.testCases = [];
    assert.equal(resolve.call(state, {getData: () => ({})}), null);
});
