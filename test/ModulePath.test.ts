import { strict as assert } from 'node:assert';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import Util from '../src/Utils.js';

describe('Utils module paths', function () {
    it('returns a filesystem directory from an encoded module URL', function () {
        const filename = resolve('directory with spaces #', 'module.ts');
        assert.equal(Util.__dirname(pathToFileURL(filename).href), dirname(filename));
    });

    it('reads package metadata relative to the module', function () {
        const expected = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
        assert.deepEqual(Util.readPackageJson(), expected);
    });
});
