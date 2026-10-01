import {expect} from 'chai';
import {ClassRefType, NativeBackend} from '../src/types/common.js';
import {TypeManager} from '../src/types/TypeManager.js';

describe('TypeManager class references', function () {
    it('replaces an unresolved canonical reference while retaining mappings', function () {
        const manager = new TypeManager();
        const descriptor = 'Lexample/Type;';
        const unresolved = new ClassRefType(descriptor, NativeBackend.DEX, 64);
        const external = {origin: NativeBackend.DEX, sourceId: 'fixture', nativeId: 'type'};
        manager.importFromBackend(unresolved, external);
        manager.markDirty(unresolved.id);
        const nodeRef: any = {uid: 'fixture-node'};
        const resolved = manager.resolveClassRef(descriptor, NativeBackend.DEX, {
            findByDescriptor: () => nodeRef,
            createStub: () => {throw new Error('existing node should be used');}
        });
        expect(resolved.isResolved).to.equal(true);
        expect(resolved.nodeRef).to.equal(nodeRef);
        expect(resolved.bitSize).to.equal(64);
        expect(manager.lookup(unresolved.id)).to.equal(resolved);
        expect(manager.lookupByExternalRef(external)).to.equal(resolved);
        expect(manager.getPendingSync(NativeBackend.DEX, 'fixture')[0].canonical).to.equal(resolved);
        expect(unresolved.isResolved).to.equal(false);
    });

    it('reuses resolved references and creates missing stubs', function () {
        const manager = new TypeManager();
        const nodeRef: any = {uid: 'fixture-stub'};
        let creates = 0;
        const nodes = {findByDescriptor: () => null, createStub: () => {creates++; return nodeRef;}};
        const first = manager.resolveClassRef('Lexample/Missing;', NativeBackend.DEX, nodes);
        expect(first.nodeRef).to.equal(nodeRef);
        expect(manager.resolveClassRef('Lexample/Missing;', NativeBackend.DEX, nodes)).to.equal(first);
        expect(creates).to.equal(1);
    });
});
