import { strict as assert } from 'node:assert';
import { parse } from 'node:url';
import { UrlParser } from '../src/user/session/UrlParser.js';

describe('UrlParser', function () {
    it('parses request paths and queries without shadowing the URL module', function () {
        for (const value of ['/api/projects', '/api/projects?limit=5']) {
            const actual = UrlParser.fastparse(value);
            const expected = parse(value);
            assert.equal(actual.pathname, expected.pathname);
            assert.equal(actual.query, expected.query);
            assert.equal(actual.search, expected.search);
            assert.equal(actual.path, expected.path);
        }
    });

    it('uses the standard URL parser for absolute URLs and special characters', function () {
        for (const value of ['https://example.com/api?limit=5', '/api#fragment', '/api with space']) {
            assert.deepEqual(UrlParser.fastparse(value), parse(value));
        }
    });

    it('reuses fresh cached values and reparses changed URLs', function () {
        const request: any = { url: '/api?limit=5' };
        const first = UrlParser.parseurl(request);
        assert.equal(UrlParser.parseurl(request), first);
        request.url = '/api?limit=10';
        assert.notEqual(UrlParser.parseurl(request), first);
        request.originalUrl = '/original?limit=15';
        assert.equal(UrlParser.originalurl(request).query, 'limit=15');
        delete request.originalUrl;
        assert.equal(UrlParser.originalurl(request), UrlParser.parseurl(request));
        assert.equal(UrlParser.parseurl({}), undefined);
    });
});
