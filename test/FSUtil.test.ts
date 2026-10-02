import { strict as assert } from 'node:assert';
import { promises as fs } from 'node:fs';
import { FSUtil } from '../src/util/FSUtil.js';

describe('FSUtil file handle lifecycle', function () {
    const originalOpen = fs.open;
    afterEach(function () { fs.open = originalOpen; });

    for (const failure of ['none', 'stat', 'size', 'read']) {
        it(`closes the opened file after ${failure}`, async function () {
            let closes = 0;
            fs.open = (async () => ({
                stat: async () => {
                    if (failure === 'stat') throw new Error('stat failed');
                    return { size: failure === 'size' ? FSUtil.MAX_FILE_SIZE_B + 1 : 3 };
                },
                readFile: async () => {
                    if (failure === 'read') throw new Error('read failed');
                    return Buffer.from('abc');
                },
                close: async () => { closes++; }
            })) as any;
            if (failure === 'none') assert.deepEqual(await FSUtil.readFile('fixture'), Buffer.from('abc'));
            else await assert.rejects(FSUtil.readFile('fixture'));
            assert.equal(closes, 1);
        });
    }
});
