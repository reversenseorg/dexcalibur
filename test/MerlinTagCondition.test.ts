import {expect} from 'chai';
import {readFileSync} from 'node:fs';
import * as ts from 'typescript';
import {SearchRequestCondition} from '../src/search/SearchRequestCondition.js';
import {MerlinSearchRequestException} from '../src/search/error/MerlinSearchRequestException.js';

// Exercise the actual method body independently of the existing request/rule
// initialization cycle. This does not establish whole-module import acceptance.
const source = readFileSync(new URL('../src/search/MerlinSearchRequest.ts', import.meta.url), 'utf8');
const ast = ts.createSourceFile('MerlinSearchRequest.ts', source, ts.ScriptTarget.Latest, true);
const cls = ast.statements.find(x => ts.isClassDeclaration(x) && x.name?.text === 'MerlinSearchRequest') as ts.ClassDeclaration;
const method = cls.members.find(x => ts.isMethodDeclaration(x) && x.name.getText(ast) === 'parseConditionString') as ts.MethodDeclaration;
const functionSource = 'function parseConditionString(pPattern:string, pOptions:any = null, pWithField = true)' + method.body.getText(ast);
const emitted = ts.transpileModule(functionSource, {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
const parseConditionString = new Function('SearchRequestCondition', 'MerlinSearchRequestException', 'TAG_TOKEN', 'SEP_TOKEN', 'REGEXP_DELIMITER_TOKEN', emitted + '\nreturn parseConditionString;')(
    SearchRequestCondition, MerlinSearchRequestException, '@', ':', '/'
);

describe('Merlin tag conditions', () => {
    it('parses standalone and field tags without treating them as value patterns', () => {
        for (const [input, field] of [['@sample', ''], ['name@sample', 'name']]) {
            const condition = parseConditionString(input);
            expect(condition.field).to.equal(field);
            expect(condition.tagKey).to.equal('sample');
            expect(condition.pattern).to.equal(null);
            expect(condition.regexp).to.equal(false);
        }
    });
    it('keeps literal at signs in values and regex values intact', () => {
        expect(parseConditionString('name:hello@example').pattern).to.equal('hello@example');
        const condition = parseConditionString('name:/sample/i');
        expect(condition.regexp).to.equal(true);
    });
});

const restoreMethod = cls.members.find(x => ts.isMethodDeclaration(x) && x.name.getText(ast) === 'fromOperationJsonObj') as ts.MethodDeclaration;
const restoreSource = ts.transpileModule('function restore(pObject:any)' + restoreMethod.body.getText(ast), {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
const operationEnum = ast.statements.find(x => ts.isEnumDeclaration(x) && x.name.text === 'OperationType') as ts.EnumDeclaration;
const enumSource = ts.transpileModule(operationEnum.getText(ast).replace(/^export\s+/, ''), {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
const OperationType = new Function(enumSource + '\nreturn OperationType;')();
const restore = new Function('OperationType', 'SearchRequestCondition', restoreSource + '\nreturn restore;')(
    OperationType, SearchRequestCondition
);

describe('Merlin time operation serialization', () => {
    it('preserves comparison direction, field and timestamp', () => {
        for (const comparison of [0, 1]) {
            const operation = {type: OperationType.TIME, args: {comparison, field: 'createdAt', date: 1700000000000}};
            expect(restore(JSON.parse(JSON.stringify(operation)))).to.deep.equal(operation);
        }
    });
});
