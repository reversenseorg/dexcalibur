import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

test('ViewGroup dump updates its timestamp and preserves shared modules', () => {
    const text = readFileSync(new URL('../inspectors/ViewGroup/main.ts', import.meta.url), 'utf8');
    const source = ts.createSourceFile('ViewGroup.ts', text, ts.ScriptTarget.Latest, true);
    let hook;
    function visit(node) {
        if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'after') hook = node.initializer.text;
        ts.forEachChild(node, visit);
    }
    visit(source);
    assert.equal(typeof hook, 'string');
    const script = ts.transpileModule(hook, {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
    let now = 1000;
    let sent = 0;
    const other = {};
    const DXC = {mods: {other}, java: {ui: {dumpView: () => ({data: []})}}, send: () => sent++};
    const FakeDate = class {getTime() {return now;}};
    const run = new Function('DXC', 'Date', script);
    run(DXC, FakeDate);
    assert.equal(DXC.mods.other, other);
    assert.equal(DXC.mods.last_dumpView, 1000);
    assert.equal(sent, 1);
    now = 1200;
    run(DXC, FakeDate);
    assert.equal(sent, 1);
    now = 1600;
    run(DXC, FakeDate);
    assert.equal(sent, 2);
});
