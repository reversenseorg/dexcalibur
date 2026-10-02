import {expect} from 'chai';
import {Endpoint} from '../src/network/Endpoint.js';
import {NetworkInterface} from '../src/network/NetworkInterface.js';

describe('Endpoint options', () => {
    it('accepts a plain options object', () => {
        const interfaces = [new NetworkInterface({ip: '127.0.0.1', version: 'ipv4'})];
        const endpoint = new Endpoint({host: 'localhost', port: 8080, interfaces, includeSubdomains: false});
        expect(endpoint.getHost()).to.equal('localhost');
        expect(endpoint.getPort()).to.equal(8080);
        expect(endpoint.interfaces).to.equal(interfaces);
        expect(endpoint.includeSubdomains).to.equal(false);
    });
    it('retains defaults without options', () => {
        const endpoint = new Endpoint();
        expect(endpoint.getHost()).to.equal(null);
        expect(endpoint.getPort()).to.equal(null);
        expect(endpoint.interfaces).to.deep.equal([]);
    });
});
