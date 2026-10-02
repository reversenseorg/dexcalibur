import {expect} from 'chai';
import {createRequire} from 'node:module';
import Certificate, {CertificateFormat} from '../src/formats/common/Certificate.js';
const forge = createRequire(import.meta.url)('node-forge');

describe('Certificate data roundtrip', () => {
    const keys = forge.pki.rsa.generateKeyPair(512);
    const certificate = forge.pki.createCertificate();
    certificate.publicKey = keys.publicKey;
    certificate.serialNumber = '01';
    certificate.validity.notBefore = new Date('2020-01-01T00:00:00Z');
    certificate.validity.notAfter = new Date('2030-01-01T00:00:00Z');
    certificate.setSubject([{name: 'commonName', value: 'offline fixture'}]);
    certificate.setIssuer(certificate.subject.attributes);
    certificate.sign(keys.privateKey, forge.md.sha256.create());

    it('parses binary DER buffers without UTF-8 conversion', () => {
        const binary = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const parsed = Certificate.fromX509(Buffer.from(binary, 'binary'), CertificateFormat.DER);
        expect(parsed.serialNumber).to.equal('01');
        const restored = Certificate.fromJsonObject(JSON.parse(JSON.stringify(parsed.toJsonObject())));
        expect(restored.serialNumber).to.equal('01');
    });
    it('restores PEM certificates from JSON', () => {
        const pem = forge.pki.certificateToPem(certificate);
        const parsed = Certificate.fromX509(pem, CertificateFormat.PEM);
        parsed.setRemotePath('/fixture/certificate.pem');
        const serialized = parsed.toJsonObject();
        expect(serialized._raw).to.equal(pem);
        const restored = Certificate.fromJsonObject(JSON.parse(JSON.stringify(serialized)));
        expect(restored.serialNumber).to.equal('01');
        expect(restored.remote).to.equal('/fixture/certificate.pem');
        expect(parsed.toJsonObject({exclude: {_raw: true}})._raw).to.equal(undefined);
    });
});
