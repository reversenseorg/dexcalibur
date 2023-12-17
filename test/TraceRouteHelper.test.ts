import {expect} from 'chai';
import {TraceRouteHelper} from "../src/actionnable/TraceRouteHelper.js";
import {InterceptorType, TestExecHelper} from "../src/tests/TestExecHelper.js";
import {after} from "mocha";
import Util from "../src/Utils.js";


describe('TraceRouteHelper', function() {

    before(function(){

        process.env.DEXCALIBUR_TEST = "1";
        if(!TestExecHelper.hasInterceptor( InterceptorType.EXEC, "trace_crashlyticsreports")){
            TestExecHelper.intercept(
                InterceptorType.EXEC, {
                    name: "trace_crashlyticsreports",
                    testRE: /^traceroute\s+/,
                    ret: `traceroute to crashlyticsreports-pa.googleapis.com (142.250.179.67), 64 hops max, 52 byte packets
1  192.168.144.176 (192.168.144.176)  7.459 ms  4.153 ms  3.687 ms
2  * * *
3  10.2.3.122 (10.2.3.122)  51.207 ms  18.146 ms  30.630 ms
4  10.202.131.1 (10.202.131.1)  68.777 ms  41.871 ms  47.732 ms
5  199.142.6.194.rev.sfr.net (194.6.142.199)  17.956 ms  75.920 ms
193.142.6.194.rev.sfr.net (194.6.142.193)  28.937 ms
6  par21s19-in-f3.1e100.net (142.250.179.67)  26.025 ms  28.511 ms  39.160 ms
`
                })
        }
    });

    after(function(){
        TestExecHelper.deleteInterceptor(InterceptorType.EXEC, "trace_crashlyticsreports-pa");
    })


    describe('New TraceRoute', function() {

        it('valid domain', function () {

            let helper:TraceRouteHelper = new TraceRouteHelper();
            let traces = helper.trace("crashlyticsreports-pa.googleapis.com");

            expect(traces.length>0).to.be.true;
            expect(traces.length).to.be.equal(7);
            expect(traces[5].domain).to.be.equal("193.142.6.194.rev.sfr.net");
        });

    });



});