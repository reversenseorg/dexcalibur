import {expect} from 'chai';
import {Readable, Writable} from 'node:stream';
import {FileManager} from '../src/core/FileManager.js';
import {randomUUID} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

describe('FileManager stream failures', () => {
    it('rejects source upload errors and destroys the destination', async () => {
        const source = new Readable({read() {}});
        const destination = new Writable({write(_chunk, _encoding, callback) { callback(); }});
        // Observe the error so the original regression remains contained.
        source.on('error', () => {});
        const manager = new FileManager(null, null);
        (manager as any)._buckets.test = {openUploadStream: () => destination};
        const failure = new Error('source failed');
        const pending = manager.writeFileStream('test', source, 'file', {});
        const outcome = pending.then(() => 'resolved', error => error);
        source.destroy(failure);
        const result = await Promise.race([outcome, new Promise(resolve => setTimeout(() => resolve('timeout'), 100))]);
        expect(result).to.equal(failure);
        expect(destination.destroyed).to.equal(true);
    });

    it('returns the completed upload id', async () => {
        const destination = new Writable({write(_chunk, _encoding, callback) { callback(); }});
        (destination as any).id = 'upload-id';
        const manager = new FileManager(null, null);
        (manager as any)._buckets.test = {openUploadStream: () => destination};
        expect(await manager.writeFileStream('test', Readable.from(['data']), 'file', {})).to.equal('upload-id');
    });

    it('rejects output errors and destroys the download stream', async () => {
        const source = new Readable({read() {}});
        const manager = new FileManager(null, null);
        (manager as any)._buckets.test = {openDownloadStreamByName: () => source};
        const path = join(tmpdir(), `dxc-missing-${randomUUID()}`, 'output');
        const result = await manager.readFileTo('test', 'file', path).then(() => null, error => error);
        expect(result.code).to.equal('ENOENT');
        expect(source.destroyed).to.equal(true);
    });
});
