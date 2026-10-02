import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import {Subject} from 'rxjs';

const text = readFileSync(new URL('../src/formats/identifier/workers/scheduler.ts', import.meta.url), 'utf8');
const source = ts.createSourceFile('scheduler.ts', text, ts.ScriptTarget.Latest, true);
let body = text;
for (const statement of [...source.statements].reverse()) {
    if (ts.isImportDeclaration(statement)) body = body.slice(0, statement.pos) + body.slice(statement.end);
}
const script = ts.transpileModule(body, {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
async function run(options, factory) {
    const messages = [];
    const timers = [];
    let exit;
    const stopped = {};
    const fn = new AsyncFunction('getEnvironmentData', 'parentPort', 'Subject', 'FileFormatDetectorWorker', 'process', 'setTimeout', script);
    try {
        await fn(() => JSON.stringify(options), {postMessage: message => messages.push(message)}, Subject, {binwalkDetector: factory}, {exit: code => {exit = code; throw stopped;}}, callback => timers.push(callback));
        for(const callback of timers) callback();
    } catch (error) {if(error !== stopped) throw error;}
    return {messages, exit};
}

test('empty input completes without spawning workers', async () => {
    let spawned = 0;
    const result = await run({files: [], pool_size: 2, backend_type: 'binwalk', threadID: 'fixture'}, async () => {spawned++; return {name: 'worker', worker: {on() {}}};});
    assert.equal(result.exit, 0);
    assert.equal(spawned, 0);
    assert.ok(result.messages.some(message => message.cmd === 'complete'));
});

test('an unavailable worker pool exits with failure', async () => {
    const result = await run({files: ['fixture'], pool_size: 2, backend_type: 'binwalk', threadID: 'fixture'}, async () => {throw new Error('fixture startup failure');});
    assert.equal(result.exit, 1);
});

test('a partial pool completes all files using the available workers', async () => {
    let attempts = 0;
    let listener;
    const factory = async () => {
        if(attempts++===0) throw new Error('one unavailable worker');
        return {name: 'worker', worker: {on(_event, callback) {listener = callback;}, postMessage(message) {listener({cmd: 'exec', success: true, data: {file: message.data}, threadID: 'worker'});}}};
    };
    const result = await run({files: ['first', 'second'], pool_size: 2, backend_type: 'binwalk', threadID: 'fixture', delay: 0}, factory);
    assert.equal(result.exit, 0);
    assert.equal(result.messages.filter(message => message.cmd === 'exec').length, 2);
    assert.ok(result.messages.some(message => message.cmd === 'complete'));
});
