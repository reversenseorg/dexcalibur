var assert = require('assert');
var chai = require('chai'),
    expect = chai.expect,
    sinonChai = require('sinon-chai'),
    sinon = require('sinon');

    chai.use(sinonChai);

const CONFIG = require('./res/config.js');
const PKG_NAME = "unit.test";
var Workspace = require('../src/Workspace.js');




describe('Workspace component', function() {


    beforeEach(function() {
        sinon.spy(console, 'log');
    });

    afterEach(function() {
        console.log.restore();
    });

    beforeEach(function(){
        this.cStub1 = sinon.stub(console, "info");
        this.cStub2 = sinon.stub(console, "log");
        this.cStub3 = sinon.stub(console, "error");
        this.cStub4 = sinon.stub(console, "trace");
    });
    afterEach(function(){
        this.cStub1.restore();
        this.cStub2.restore();
        this.cStub3.restore();
        this.cStub4.restore();
    });

    describe('import config', function() {
        let ws = new Workspace(PKG_NAME, CONFIG);

        it('set package name', function () {
            assert.equal(ws._pkg, PKG_NAME);
        });

        it('set config', function () {
            //assert.equal(ws._config, PKG_NAME);
        });
    });

    describe('setup working directory', function() {
        let ws = new Workspace(PKG_NAME, CONFIG);


        it('get working directory', function () {
            ws.getWD()
            
            assert.equal(ws.getWD(), "");
        });
    });


});