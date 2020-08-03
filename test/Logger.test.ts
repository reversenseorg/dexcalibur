
import chai = require("chai");
import * as Log from '../src/Logger';


let expect:Chai.ExpectStatic = chai.expect;


var Logger:Log.TestLogger = Log.newLogger({
    testMode: true,
    debugMode: false
},true) as Log.TestLogger;



describe('Logger', function() {

    beforeEach(function() {
        Logger.clearCache();
    });

    afterEach(function() {
        Logger.clearCache();
    });

    describe('error-level', function() {

        it('print error message', function(){
            Logger.error(" Test errror message ");

            let result = Logger.expect({
                type:Log.MessageType.T_ERROR,
                val: " Test errror message "
            });
            expect(result).to.equals(true);
        });
    });

    describe('info-level', function() {

        it('print info message', function(){
            Logger.info(" Test info message ");

            expect(Logger.expect({
                type:Log.MessageType.T_INFO,
                val: " Test info message "
            })).to.equals(true);
        });
    });


    describe('warning-level', function() {
        

        it('print warning message', function(){

            Logger.warn(" Test warning message ");

            expect(Logger.expect({
                type:Log.MessageType.T_WARN,
                val: " Test warning message "
            })).to.equals(true);
        });
    });

    describe('success-level', function() {

        it('print success message', function(){

            Logger.success(" Test success message ");

            expect(Logger.expect({
                type:Log.MessageType.T_SUCCESS,
                val: " Test success message "
            })).to.equals(true);
        });
    });

    describe('debug-level', function() {

        it('print debug message, if debug mode is enabled', function(){
            Logger = Log.newLogger({
                testMode: true,
                debugMode: false
            },true) as Log.TestLogger;

            Logger.debug(" Test debug message DISABLE");

            expect(Logger.expect({
                type:Log.MessageType.T_DEBUG,
                val: " Test debug message DISABLE"
            })).to.equals(false);
        });

        it('dont print debug message, if debug mode is disabled', function(){
            Logger = Log.newLogger({
                testMode: true,
                debugMode: true
            },true) as Log.TestLogger;

            Logger.debug(" Test debug message ENABLE");

            expect(Logger.expect({
                type:Log.MessageType.T_DEBUG,
                val: " Test debug message ENABLE"
            })).to.equals(true);
        });
    });

    describe('multiple arguments', function() {

        it('message parts concating', function(){

            Logger.error("Arg1 ","Arg2 ", 12);

            expect(Logger.expect({
                type:Log.MessageType.T_ERROR,
                val: "Arg1 Arg2 12"
            })).to.equals(true);

        });
    });

});