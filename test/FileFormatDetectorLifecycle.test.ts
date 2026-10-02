import {expect} from 'chai';
import {EventEmitter} from 'node:events';
import {FileFormatDetector} from '../src/formats/identifier/FileFormatDetector.js';
import {FileFormatDetectorWorker} from '../src/formats/identifier/FileFormatDetectorWorker.js';

describe('FileFormatDetector lifecycle', () => {
    const original = FileFormatDetectorWorker.queueScheduler;
    afterEach(() => {FileFormatDetectorWorker.queueScheduler = original;});

    it('uses its configured pool size and replays completed results', async () => {
        const worker = new EventEmitter();
        let poolSize;
        FileFormatDetectorWorker.queueScheduler = (async size => {poolSize = size; return worker;}) as any;
        const detector = new FileFormatDetector(2);
        const result = await detector.analyzeFiles([], null);
        expect(poolSize).to.equal(2);
        worker.emit('exit', 0);
        let received;
        let completed = false;
        result.subscribe({next: value => {received = value;}, complete: () => {completed = true;}});
        expect(received).to.deep.equal([]);
        expect(completed).to.equal(true);
    });

    it('reports worker failure to subscribers', async () => {
        const worker = new EventEmitter();
        FileFormatDetectorWorker.queueScheduler = (async () => worker) as any;
        const result = await new FileFormatDetector(2).analyzeFiles(['fixture'], null);
        let received;
        result.subscribe({error: error => {received = error;}});
        worker.emit('exit', 1);
        expect(received).to.be.instanceOf(Error);
    });
    it('replays startup errors and handles worker errors', async () => {
        const failure = new Error('fixture startup failure');
        FileFormatDetectorWorker.queueScheduler = (async () => {throw failure;}) as any;
        const failed = await new FileFormatDetector(2).analyzeFiles([], null);
        let received;
        failed.subscribe({error: error => {received = error;}});
        expect(received).to.equal(failure);
        const worker = new EventEmitter();
        FileFormatDetectorWorker.queueScheduler = (async () => worker) as any;
        const result = await new FileFormatDetector(2).analyzeFiles([], null);
        result.subscribe({error: error => {received = error;}});
        worker.emit('error', failure);
        expect(received).to.equal(failure);
    });
});
