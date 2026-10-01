import {expect} from 'chai';
import ModelExecutableSection from '../src/ModelExecutableSection.js';

describe('Executable section addresses', function () {
    it('returns distinct physical and virtual addresses', function () {
        const section = new ModelExecutableSection({paddr: 0x100, vaddr: 0x200});
        expect(section.getPhysAddr()).to.equal(0x100);
        expect(section.getVirtualAddr()).to.equal(0x200);
    });

    it('preserves zero and default physical addresses', function () {
        expect(new ModelExecutableSection({paddr: 0, vaddr: 5}).getPhysAddr()).to.equal(0);
        expect(new ModelExecutableSection().getPhysAddr()).to.equal(-1);
    });
});
