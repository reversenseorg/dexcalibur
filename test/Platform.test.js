var chai = require('chai');
var expect = chai.expect;

const Platform = require("../src/Platform.js");


describe('Platform class', function() {
    
    describe('new instance', function() {
        
        it('pathNotSpecified', function () {
            let conf = new Platform({
                name: "android",
                version : "7.0.0",
                apiVersion: 24
            },"/tmp/test_path");

            expect(conf.name).to.equals("android");
            expect(conf.version).to.equals("7.0.0");
            expect(conf.apiVersion).to.equals(24);
            expect(conf.binaryPath).to.equals("/tmp/test_path/android_24");
        });

        it('pathSpecified', function () {
            let conf = new Platform({
                name: "android",
                version : "7.0.0",
                apiVersion: 24,
                binaryPath: "/home/dexcalibur/dexcalibur/APIs/android_24"
            },"/tmp/test_path");

            expect(conf.name).to.equals("android");
            expect(conf.version).to.equals("7.0.0");
            expect(conf.apiVersion).to.equals(24);
            expect(conf.binaryPath).to.equals("/home/dexcalibur/dexcalibur/APIs/android_24");
        });
    });

    describe('getters/setters', function() {
        
        it('getInternalName', function () {
            let conf = new Platform({
                name: "android",
                version : "7.0.0",
                apiVersion: 24
            },"/home/dexcalibur/dexcalibur/APIs");

            expect(conf.getInternalName()).to.equals("android_24");
        });


        it('getPublicVersion', function () {
            let conf = new Platform({
                name: "android",
                version : "7.0.0",
                apiVersion: 24
            },"/home/dexcalibur/dexcalibur/APIs");

            expect(conf.getPublicVersion()).to.equals("android:7.0.0");
        });


        it('getApiVersion', function () {
            let conf = new Platform({
                name: "android",
                version : "7.0.0",
                apiVersion: 24
            },"/home/dexcalibur/dexcalibur/APIs");

            expect(conf.getApiVersion()).to.equals(24);
        });

        it('getBinPath', function () {
            let conf = new Platform({
                name: "android",
                version : "7.0.0",
                apiVersion: 24
            },"/home/dexcalibur/dexcalibur/APIs");

            expect(conf.getBinPath()).to.equals("/home/dexcalibur/dexcalibur/APIs/android_24");
        });

        it('setBinPath', function () {
            let conf = new Platform({
                name: "android",
                version : "7.0.0",
                apiVersion: 24
            },"/home/dexcalibur/dexcalibur/APIs");

            conf.setBinPath("/tmp/custom_path/android");
            expect(conf.getBinPath()).to.equals("/tmp/custom_path/android");
        });
    });

    /*
    describe('isAndroid',function(){
        it('notAndroidPlatform', function () {
            let conf = new Platform({
                name: "custom",
                version : "7.0.0",
                apiVersion: 24
            },"/home/dexcalibur/dexcalibur/APIs");

            expect(conf.getBinPath()).to.equals("/home/dexcalibur/dexcalibur/APIs/android_24");
        });
    })*/
});