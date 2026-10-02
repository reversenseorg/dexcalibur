import { strict as assert } from 'node:assert';
import { DataOperation } from '../src/audit/common/DataOperation.js';
import { MetadataJsonSchema } from '../src/audit/common/Metadata.js';
import InMemoryDbCollection from '../connectors/inmemory/InMemoryDbCollection.js';

describe('Audit metadata dependencies', function () {
    it('preserves serialized data operation values', function () {
        assert.equal(DataOperation.SOURCING, 0);
        assert.equal(DataOperation.HASHING, 6);
        assert.deepEqual(MetadataJsonSchema.properties.value.anyOf[2].enum, Object.values(DataOperation));
    });

    it('initializes the in-memory collection without a Merlin inheritance cycle', function () {
        const collection = new InMemoryDbCollection('metadata-import');
        collection.addEntry('value', 42);
        assert.equal(collection.getEntry('value'), 42);
        assert.equal(collection.size(), 1);
        collection.removeEntry('value');
        assert.equal(collection.size(), 0);
        collection.removeEntry('value');
        assert.equal(collection.size(), 0);
        collection.addEntry('value', 7);
        collection.setEntry('value', 9);
        assert.equal(collection.size(), 1);
        assert.equal(collection.getEntry('value'), 9);
    });
});
