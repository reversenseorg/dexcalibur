import {expect} from 'chai';
import {NativeAnalyzerCommands} from '../src/analyzer/NativeAnalyzerCommands.js';

describe('NativeAnalyzerCommands', () => {
    it('returns requested function commands in order', () => {
        expect(NativeAnalyzerCommands.getFuncCmd('DISASS:DECOMPILE:XREF')).to.deep.equal(['f_disass', 'f_dec', 'f_xref']);
    });
    it('returns requested file commands', () => {
        expect(NativeAnalyzerCommands.getFileCmd('EXTRACT_SYM:EXTRACT_SECTIONS')).to.deep.equal(['e_sym', 'e_sections']);
    });
});
