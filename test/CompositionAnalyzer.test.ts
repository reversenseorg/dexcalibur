import {expect} from 'chai';
import {OperatingSystem} from '@reversense/dxc-core-api';
import {CompositionAnalyzer} from '../src/analyzer/CompositionAnalyzer.js';

describe('CompositionAnalyzer context and namespace filtering', () => {
    it('retains the configured context', () => {
        const context = {} as any;
        expect(new CompositionAnalyzer({ctx: context}).ctx).to.equal(context);
    });
    it('excludes app components while retaining other namespaces', async () => {
        const own = {getUID: () => 'com.example.app', getName: () => 'App', getType: () => 1};
        const foreign = {getUID: () => 'org.library.widget', getName: () => 'Widget', getType: () => 1};
        const search = () => ({executePDB: async () => ({count: () => 2, list: () => [own, foreign]})});
        const context = {os: OperatingSystem.ANDROID, getAppAnalyzer: () => ({getPackageName: () => 'com.example.app'}), merlin: {activity: search, provider: search, receiver: search, service: search}};
        const analyzer = new CompositionAnalyzer({});
        analyzer.setContext(context as any);
        const chunks = await (analyzer as any)._extractAndroidComponentUids();
        expect(chunks.map(chunk => chunk.value)).to.deep.equal(['Widget', 'Widget', 'Widget', 'Widget']);
    });
    it('returns the collected chunks to its caller', async () => {
        const analyzer = new CompositionAnalyzer({ctx: {os: OperatingSystem.ANDROID} as any});
        (analyzer as any)._extractAndroidComponentUids = async () => ['components'];
        (analyzer as any)._extractLibraryParts = async () => ['libraries'];
        (analyzer as any)._extractAndroidPackages = async () => ['packages'];
        expect(await analyzer.extractChunks()).to.deep.equal(['components', 'libraries', 'packages']);
    });
});
