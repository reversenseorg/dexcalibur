import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = ts.createSourceFile('EngineNodeManager.ts', readFileSync(new URL('../src/core/EngineNodeManager.ts', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true);
const declaration = source.statements.find(node => ts.isClassDeclaration(node) && node.name.text === 'EngineNodeManager');
const method = declaration.members.find(node => node.name?.getText(source) === 'getNextPorts');
const emitted = ts.transpileModule(`class Manager { ${method.getText(source)} }`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const Manager = new Function('process', 'EngineNode', 'EngineNodeException', emitted + '\nreturn Manager;')(
    { env: { KUBERNETES_PORT: 'fixture' } },
    { TYPE: { getType: () => 'node' } },
    { MAX_PORT_REACHED: () => new Error('port range exhausted') }
);

function manager(nodes, range = [10200, 10205]) {
    const instance = new Manager();
    instance.portRange = range;
    instance.engine = { getEngineDB: () => ({ getCollectionOf: () => ({ search: async () => nodes }) }) };
    return instance;
}

test('port pairs skip collisions in either half of the pair', async () => {
    for (const occupied of [10200, 10201]) {
        assert.deepEqual(await manager([{ httpPort: occupied, httpsPort: 11000 }]).getNextPorts(), { http: 10202, https: 10203 });
    }
});

test('port selection rejects a pair beyond the configured range', async () => {
    await assert.rejects(manager([{ httpPort: 10200, httpsPort: 10201 }], [10200, 10201]).getNextPorts(), /port range exhausted/);
});
