import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = ts.createSourceFile('EngineNode.ts', readFileSync(new URL('../src/core/EngineNode.ts', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true);
const declaration = source.statements.find(node => ts.isClassDeclaration(node) && node.name.text === 'EngineNode');
const method = declaration.members.find(node => node.name?.getText(source) === 'startScan');
const emitted = ts.transpileModule(`class Node { ${method.getText(source)} }`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const Node = new Function('NodeState', 'OperationType', 'ScanState', emitted + '\nreturn Node;')(
    { BUSY: 'busy', NEW: 'new', STARTING: 'starting', STOPPED: 'stopped' }, { SCAN_ORDER: 'scan' }, { WAITING: 'waiting' }
);

function fixture(queue, state = 'busy') {
    const instance = new Node();
    instance.state = state;
    instance.activeOpe = null;
    instance.activeScanSession = null;
    instance.waitingQueue = queue.map(order => ({ order }));
    instance.isReady = () => false;
    instance.refreshWaitingQueue = async () => {};
    instance.save = async () => {};
    instance._engine = { getEngineDB: () => ({ updateOrder: async () => {} }) };
    const order = { getUUID: () => 'new-order', getUID: () => 'new-order', getOption: () => ({ owner: 'owner' }), dates: {}, setState: value => { order.state = value; } };
    return { instance, order };
}

test('different scan orders can queue while duplicate orders are skipped', async () => {
    const { instance, order } = fixture(['old-order']);
    await instance.startScan(order);
    assert.deepEqual(instance.waitingQueue.map(entry => entry.order), ['old-order', 'new-order']);
    await instance.startScan(order);
    assert.equal(instance.waitingQueue.length, 2);
});

test('starting nodes mark the queued order waiting without requiring an active scan', async () => {
    const { instance, order } = fixture([], 'starting');
    await instance.startScan(order);
    assert.equal(order.state, 'waiting');
    assert.equal(instance.waitingQueue[0].order, 'new-order');
});
