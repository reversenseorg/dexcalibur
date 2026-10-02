import { strict as assert } from 'node:assert';
import { Readable } from 'node:stream';
import { FileManager } from '../src/core/FileManager.js';

describe('FileManager.readFile', function () {
    function manager(files: any[]) {
        const instance = new FileManager(null, null);
        (instance as any)._buckets.sample = {
            find: () => ({ toArray: async () => files }),
            openDownloadStreamByName: () => Readable.from([Buffer.from('first'), Buffer.from('second')])
        };
        return instance;
    }

    it('reads a uniquely named file', async function () {
        assert.deepEqual(await manager([{ filename: 'file' }]).readFile('sample', 'file'), Buffer.from('firstsecond'));
    });

    it('rejects missing and duplicate filenames', async function () {
        await assert.rejects(manager([]).readFile('sample', 'file'));
        await assert.rejects(manager([{}, {}]).readFile('sample', 'file'));
    });
});
