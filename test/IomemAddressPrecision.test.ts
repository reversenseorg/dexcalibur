import {expect} from 'chai';
import {IomemLayoutParser} from '../src/linux/parser/IomemLayoutParser.js';

describe('Iomem address precision', function () {
    it('preserves exact high addresses and distinct adjacent ranges', function () {
        const layout = new IomemLayoutParser().parse(Buffer.from(
            '20000000000001-20000000000003 : first\n' +
            '20000000000002-20000000000004 : second'
        ));
        const blocks = layout.listBlocks();
        expect(blocks).to.have.lengthOf(2);
        expect(blocks[0].start.address).to.equal(0x20000000000001n);
        expect(blocks[0].end.address).to.equal(0x20000000000003n);
        expect(blocks[0].name).to.equal('first');
        expect(blocks[1].start.address).to.equal(0x20000000000002n);
        expect(blocks[1].end.address).to.equal(0x20000000000004n);
        expect(blocks[1].name).to.equal('second');
    });

    it('preserves ordinary low addresses', function () {
        const blocks = new IomemLayoutParser().parse(Buffer.from('09000000-09000fff : UART')).listBlocks();
        expect(blocks[0].start.address).to.equal(0x9000000n);
        expect(blocks[0].end.address).to.equal(0x9000fffn);
        expect(blocks[0].name).to.equal('UART');
    });
});
