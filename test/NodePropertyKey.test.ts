import {assert} from 'chai';
import {DbKeyType} from '@reversense/dexcalibur-orm';
import {NodeProperty} from '../src/persist/orm/NodeProperty.js';

describe('NodeProperty key matching', () => {
    it('distinguishes unset, matching and different key types', () => {
        const property = new NodeProperty('id');
        assert.equal(property.isKey(), false);
        assert.equal(property.isKey(DbKeyType.PRIMARY), false);
        property.key(DbKeyType.PRIMARY);
        assert.equal(property.isKey(), true);
        assert.equal(property.isKey(DbKeyType.PRIMARY), true);
        assert.equal(property.isKey(DbKeyType.FOREIGN), false);
        assert.equal(property.isKey(DbKeyType.COMPOSITE), false);
    });
});
