import { strict as assert } from 'node:assert';
import InMemoryDbCollection from '../connectors/inmemory/InMemoryDbCollection.js';
import InMemoryDbIndex from '../connectors/inmemory/InMemoryDbIndex.js';
import SerializedObject from '../connectors/inmemory/SerializedObject.js';
import { InMemoryDb } from '../connectors/inmemory/InMemoryDb.js';

describe('In-memory serialization', function () {
    it('writes database container types to the output without mutating live containers', function () {
        const db = Object.create(InMemoryDb.prototype) as InMemoryDb;
        const index = new InMemoryDbIndex('index');
        index.__type = 'existing-type';
        const collection = new InMemoryDbCollection('collection');
        (db as any).indexes = { index, collection };
        const json = db.toJsonObject();
        assert.equal(json.indexes.index.__type, 'Index');
        assert.equal(json.indexes.collection.__type, 'Collection');
        assert.equal(index.__type, 'existing-type');
        assert.equal(Object.hasOwn(collection, '__type'), false);
    });
    it('preserves the collection serializer result and nullable entries', function () {
        const collection = new InMemoryDbCollection('roundtrip');
        collection.addEntry('custom', { serialize: () => ({ serialized: true }), toJsonObject: () => ({ json: true }) });
        collection.addEntry('null', null);
        assert.deepEqual(collection.serialize().values, { custom: { serialized: true }, null: null });
        assert.equal(collection.toJsonObject().values.null, null);
        assert.equal(InMemoryDbCollection.unserialize(collection.serialize()).getEntry('null'), null);
    });

    it('supports inherited index serializers and removed entries without changing offsets', function () {
        class Entry {
            isSerializable() { return true; }
            serialize() { return { serialized: true }; }
        }
        const index = new InMemoryDbIndex('roundtrip');
        assert.equal(index.isSerializable(), true);
        index.addEntry(new Entry());
        index.addEntry(new Entry());
        index.removeEntry(1);
        assert.equal(index.isSerializable(), true);
        assert.deepEqual(index.serialize().refs, [{ serialized: true }, null]);
        assert.equal(index.toJsonObject().refs[1], null);
        assert.deepEqual(InMemoryDbIndex.unserialize(index.serialize()).getAll(), [{ serialized: true }, null]);
        index.addEntry({ isSerializable: () => false });
        assert.equal(index.isSerializable(), false);
    });

    it('rejects null and unknown serialized type identifiers', function () {
        assert.equal(SerializedObject.isSerializable(null), false);
        for (const value of [null, undefined, { __type: 'unknown', __raw: {} }, { __type: 'toString', __raw: {} }]) {
            assert.equal(SerializedObject.isUnserializable(value), false);
        }
    });
});
