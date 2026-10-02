import {expect} from 'chai';
import {InterceptorType, TestExecHelperClass} from '../src/tests/TestExecHelper.js';

describe('TestExecHelper interceptor lifecycle', () => {
    it('removes a registered interceptor from matching', () => {
        const helper = new TestExecHelperClass();
        helper.interceptExec('first', () => true, 'first');
        helper.interceptExec('second', () => true, 'second');
        helper.deleteInterceptor(InterceptorType.EXEC, 'first');
        expect(helper.hasInterceptor(InterceptorType.EXEC, 'first')).to.equal(false);
        expect(helper.filterInterceptor(InterceptorType.EXEC, 'unused').ret).to.equal('second');
    });

    it('clears both registration and matching state', () => {
        const helper = new TestExecHelperClass();
        helper.interceptExec('first', () => true, 'first');
        helper.clearInterceptors();
        expect(helper.hasInterceptor(InterceptorType.EXEC, 'first')).to.equal(false);
        expect(helper.filterInterceptor(InterceptorType.EXEC, 'unused').success).to.equal(false);
    });
});
