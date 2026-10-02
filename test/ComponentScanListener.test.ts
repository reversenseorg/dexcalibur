import {expect} from 'chai';
import {readFileSync} from 'node:fs';
import * as ts from 'typescript';
import {NodeInternalType} from '@reversense/dxc-core-api';

describe('ApplicationTopography component listener', () => {
    it('compiles the actual listener and saves the resolved component', () => {
        const text = readFileSync(new URL('../inspectors/ApplicationTopography/main.ts', import.meta.url), 'utf8');
        const ast = ts.createSourceFile('main.ts', text, ts.ScriptTarget.Latest, true);
        let template: ts.TemplateExpression;
        const walk = (node: ts.Node) => {
            if (ts.isTemplateExpression(node) && node.getText(ast).includes('function getClassByManifestUid')) template = node;
            ts.forEachChild(node, walk);
        };
        walk(ast);
        const source = new Function('NodeInternalType', 'return ' + template.getText(ast))(NodeInternalType);
        const emitted = ts.transpileModule('function listener(pEvent:any) {' + source + '\n}', {
            compilerOptions: {target: ts.ScriptTarget.ES2022}, reportDiagnostics: true
        });
        expect((emitted.diagnostics || []).filter(x => x.category === ts.DiagnosticCategory.Error).map(x => x.code)).to.deep.equal([]);
        const listener = new Function('NodeInternalType', 'ANDROID_INTENT_TAG_MAPPING', emitted.outputText + '\nreturn listener;')(NodeInternalType, {});
        const cls = {__: NodeInternalType.CLASS};
        const events: any[] = [];
        const component: any = {name: '.Example', type: 'activity', attr: {}, intentFilters: [], setImplementedBy(value: any) {this.implementation = value;}};
        const context = {getTagManager: () => ({annotate() {}}), find: {get: {class: (name: string) => {
            expect(name).to.equal('example.Example');
            return cls;
        }}}, trigger: (event: any) => events.push(event)};
        listener({data: {obj: component, manifest: {attributes: {package: 'example'}}}, getContext: () => context, getData() {return this.data;}});
        expect(component.implementation).to.equal(cls);
        expect(events).to.deep.equal([{type: 'app.component.save', data: {fresh: true, obj: component, cls}}]);
    });
});
