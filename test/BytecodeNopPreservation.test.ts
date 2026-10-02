import {expect} from 'chai';
import {Rules} from '../inspectors/BytecodeCleaner/src/Rules.js';
import {CONST} from '../src/CoreConst.js';
import {readFileSync} from 'node:fs';
import * as ts from 'typescript';

const legacySource = readFileSync(new URL('../inspectors/BytecodeCleaner/service/main.ts', import.meta.url), 'utf8');
const ast = ts.createSourceFile('main.ts', legacySource, ts.ScriptTarget.Latest, true);
const method = ast.statements.find(x => ts.isFunctionDeclaration(x) && x.name?.text === 'cleanNopOpcode') as ts.FunctionDeclaration;
const emitted = ts.transpileModule(method.getText(ast), {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
const legacyClean = new Function('CONST', emitted + '\nreturn cleanNopOpcode;')(CONST);

describe('Bytecode NOP cleanup', () => {
    it('removes only known NOP instructions and preserves unknown entries', () => {
        const unknown = {opcode: null};
        const known = {opcode: {type: CONST.INSTR_TYPE.RET}};
        for (const clean of [Rules.cleanNopOpcode, legacyClean]) {
            const method: any = {instr: [{stack: [unknown, {opcode: {type: CONST.INSTR_TYPE.NOP}}, known]}]};
            expect(Rules.countNopOpcode(method)).to.deep.equal({anyCtr: 3, nopCtr: 1});
            expect(clean(method)).to.deep.equal({nopCtr: 1});
            expect(method.instr[0].stack).to.deep.equal([unknown, known]);
            expect(clean(method)).to.deep.equal({nopCtr: 0});
        }
    });
});
