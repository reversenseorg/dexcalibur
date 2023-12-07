

import {expect} from 'chai';
import {TraceRouteHelper} from "../src/actionnable/TraceRouteHelper.js";


describe('TraceRouteHelper', function() {


    before(function(){
    });


    describe('New TraceRoute', function() {

        it('valid domain', function () {

            let helper:TraceRouteHelper = new TraceRouteHelper();
            let traces = helper.trace("www.google.com");

            expect(traces.length>0).to.be.true;
        });

    });



});