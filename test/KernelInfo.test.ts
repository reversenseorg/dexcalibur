import {expect} from 'chai';
import ModelSyscall from '../src/ModelSyscall.js';
import {KernelInfo} from '../src/platform/kernels/common/Kernel.js';
import {KernelInfoFactory} from '../src/platform/kernels/common/KernelFactory.js';

describe('KernelInfo', function () {
    it('retrieves registered system calls and replaces the same identity', function () {
        const kernel = new KernelInfo(null);
        const first = new ModelSyscall({os: 'linux', arch: 'aarch64', sysnum: 64, name: 'write'});
        const other = new ModelSyscall({os: 'linux', arch: 'aarch64', sysnum: 63, name: 'read'});
        const replacement = new ModelSyscall({os: 'linux', arch: 'aarch64', sysnum: 64, name: 'updated write'});
        kernel.addSystemCall(first);
        kernel.addSystemCall(other);
        expect(kernel.getSyscall(64)).to.equal(first);
        expect(kernel.getSyscall(63)).to.equal(other);
        expect(kernel.getSyscall(999)).to.equal(undefined);
        kernel.addSystemCall(replacement);
        expect(kernel.getSyscall(64)).to.equal(replacement);
        expect(kernel.getSyscall(63)).to.equal(other);
    });

    it('preserves system calls supplied through constructor options', function () {
        const syscall = new ModelSyscall({sysnum: 7});
        const kernel = new KernelInfo({_syscalls: [syscall]});
        expect(kernel.getSyscall(7)).to.equal(syscall);
    });

    it('returns a stable initialized factory instance', function () {
        const factory = KernelInfoFactory.getInstance();
        expect(factory).to.be.instanceOf(KernelInfoFactory);
        expect(KernelInfoFactory.getInstance()).to.equal(factory);
    });
});
