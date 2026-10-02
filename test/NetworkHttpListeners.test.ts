import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { CustomCode } from '../src/actionnable/CustomCode.js';

const source = ts.createSourceFile('main.ts', readFileSync(new URL('../inspectors/NetworkHttp/main.ts', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true);
const listeners = new Map<string, string>();
function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'eventListenerSources' && ts.isObjectLiteralExpression(node.initializer)) {
        for (const property of node.initializer.properties) {
            if (!ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer)) continue;
            const code = property.initializer.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText(source) === 'source') as ts.PropertyAssignment;
            listeners.set((property.name as ts.StringLiteral).text, (code.initializer as ts.NoSubstitutionTemplateLiteral).text);
        }
    }
    ts.forEachChild(node, visit);
}
visit(source);

describe('NetworkHttp generated listeners', function () {
    it('compiles every registered listener with the actual CustomCode compiler', function () {
        for (const source of listeners.values()) new CustomCode({ source, lang: 'ts' }).createFunction(['pEvent', 'pLogger']);
    });

    it('does not emit unrelated events and tags a single existing string without adding a duplicate', function () {
        const triggers = [];
        const errors = [];
        let tags = 0;
        let additions = 0;
        const context = {
            LOG: { error: value => errors.push(value) },
            trigger: event => triggers.push(event),
            getTagManager: () => ({ getTag: () => 'tag' }),
            find: { strings: () => ({ count: () => 1, foreach: callback => callback(0, { hasTag: () => false, addTag: () => { tags++; } }) }) },
            modelAPI: { newStringValue: () => { additions++; return { addTag: () => {} }; }, newInstance: () => ({}) },
            getAnalyzer: () => ({ getData: () => ({ strings: { addEntry: () => {} } }) })
        };
        const listener = new CustomCode({ source: listeners.get('hook.javaRegexMatcher.matches'), lang: 'ts' }).createFunction(['pEvent', 'pLogger']);
        listener({ getContext: () => context, getData: () => ({ data: { regex: 'unrelated' } }) });
        assert.equal(triggers.length, 0);
        listener({ getContext: () => context, getData: () => ({ data: { regex: '[a-zA-Z][a-zA-Z0-9_-]*', text: 'path' } }) });
        assert.deepEqual(errors, []);
        assert.equal(tags, 1);
        assert.equal(additions, 0);
        assert.equal(triggers.length, 1);
        const findListener = new CustomCode({ source: listeners.get('hook.javaRegexMatcher.find'), lang: 'ts' }).createFunction(['pEvent', 'pLogger']);
        findListener({ getContext: () => context, getData: () => ({ data: { regex: '\\{([a-zA-Z][a-zA-Z0-9_-]*)\\}', text: '{path}' } }) });
        assert.deepEqual(errors, []);
        assert.equal(tags, 2);
        assert.equal(additions, 0);
        assert.equal(triggers.length, 2);
    });
});
