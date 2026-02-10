import {StringAnalyzer} from "../src/analyzer/StringAnalyzer.js";


describe('StringAnalyzer', function() {


    describe('extractFormat()', function() {

        let u = "https://firebase-settings.crashlytics.com/spi%25v2/platforms/android/gmp/";
        let ext = StringAnalyzer.extractFormat(u);
        console.log(u, ext, new URL(u));

        u = "&bundleid=";
        ext = StringAnalyzer.extractFormat(u);
        console.log(u, ext);

        u = "&bundleid[0]=qqqqq";
        ext = StringAnalyzer.extractFormat(u);
        console.log(u, ext);

        u = "/settings";
        ext = StringAnalyzer.extractFormat(u);
        console.log(u, ext);

    });

});