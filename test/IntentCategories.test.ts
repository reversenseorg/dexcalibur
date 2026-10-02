import {expect} from 'chai';
import {Intent, IntentCommandFactory} from '../src/IntentFactory.js';

describe('Intent categories', () => {
    it('emits each array category as a separate argument', () => {
        const intent = new Intent({category: ['example.ONE', 'example.TWO']});
        expect(intent.buildCommand().trim().split(/\s+/)).to.deep.equal(['-c', 'example.ONE', '-c', 'example.TWO']);
        const factory = new IntentCommandFactory('broadcast');
        expect(factory.getIntentCommand(intent).trim().split(/\s+/)).to.deep.equal(['am', 'broadcast', '-c', 'example.ONE', '-c', 'example.TWO']);
    });
    it('keeps string, empty and omitted categories working', () => {
        expect(new Intent({category: 'example.ONE'}).buildCommand().trim()).to.equal('-c example.ONE');
        expect(new Intent({category: []}).buildCommand()).to.equal('');
        expect(new Intent().buildCommand()).to.equal('');
    });
});
