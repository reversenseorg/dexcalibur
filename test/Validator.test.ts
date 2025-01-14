import {expect} from 'chai';
import {ValidationRule} from "../src/Validator.js";
import {ProjectInputPurpose} from "../src/analyzer/ProjectInput.js";


describe('Validator', function() {


    describe('Validator.newRegexpAssert', function() {

        const rule = ValidationRule.newRegexpAssert(
                /^[0-9a-z]{17}$/
            );

        it('valid input', function () {
            expect(rule.test('ufy7k7kig3yfl0gbm')).to.be.true;
        });

        it('not matching string input', function () {
            expect(rule.test('ufy7k7kig3yfl0gbmaaaaaaaaaa')).to.be.false;
            expect(rule.test('ufy7')).to.be.false;
        });

        it('NULL input', function () {
            expect(rule.test(null)).to.be.false;
        });

        it('UNDEFINED input', function () {
            expect(rule.test(undefined)).to.be.false;
        });

        it('Object input', function () {
            expect(rule.test({})).to.be.false;
        });

        it('Array input', function () {
            expect(rule.test([])).to.be.false;
        });

        it('Function input', function () {
            expect(rule.test(()=>{})).to.be.false;
        });

        it('number input', function () {
            expect(rule.test(10)).to.be.false;
        });

        it('Infinity input', function () {
            expect(rule.test(Infinity)).to.be.false;
        });

        it('NaN input', function () {
            expect(rule.test(NaN)).to.be.false;
        });
    });

    describe('Validator.newPinklistAssert', function() {

        const rule = ValidationRule.newPinklistAssert([
            ProjectInputPurpose.MAIN,
            ProjectInputPurpose.EXTRA
        ]);

        it('valid input', function () {
            expect(rule.test('main')).to.be.true;
        });

        it('invalid input', function () {
            expect(rule.test('lol')).to.be.false;
        });

        it('NULL input', function () {
            expect(rule.test(null)).to.be.false;
        });

        it('UNDEFINED input', function () {
            expect(rule.test(undefined)).to.be.false;
        });

        it('Object input', function () {
            expect(rule.test({})).to.be.false;
        });

        it('Array input', function () {
            expect(rule.test([])).to.be.false;
        });

        it('Function input', function () {
            expect(rule.test(()=>{})).to.be.false;
        });

        it('number input', function () {
            expect(rule.test(10)).to.be.false;
        });

        it('Infinity input', function () {
            expect(rule.test(Infinity)).to.be.false;
        });

        it('NaN input', function () {
            expect(rule.test(NaN)).to.be.false;
        });
    });

    describe('Validator.structure', function() {

        const rule = ValidationRule.structure({
            uploadID: ValidationRule.newRegexpAssert(
                /^[0-9a-z]{16,17}$/
            ),
            purpose: ValidationRule.newPinklistAssert([
                ProjectInputPurpose.MAIN,
                ProjectInputPurpose.EXTRA
            ])
        })

        const valid = {
            uploadID: 'ufy7k7kig3yfl0gbm',
            purpose: 'main'
        };

        it('with valid input', function () {
            expect(rule.test(valid)).to.be.true;
        });

        it('NULL input', function () {
            expect(rule.test(null)).to.be.false;
        });

        it('UNDEFINED input', function () {
            expect(rule.test(undefined)).to.be.false;
        });

        it('Object input', function () {
            expect(rule.test({})).to.be.false;
        });

        it('Array input', function () {
            expect(rule.test([])).to.be.false;
        });

        it('Function input', function () {
            expect(rule.test(()=>{})).to.be.false;
        });

        it('number input', function () {
            expect(rule.test(10)).to.be.false;
        });

        it('Infinity input', function () {
            expect(rule.test(Infinity)).to.be.false;
        });

        it('NaN input', function () {
            expect(rule.test(NaN)).to.be.false;
        });
    });

    describe('Validator.asArrayOf', function() {

        const rule = ValidationRule.asArrayOf([
            ValidationRule.structure({
                uploadID: ValidationRule.newRegexpAssert(
                    /^[0-9a-z]{16,17}$/
                ),
                purpose: ValidationRule.newPinklistAssert([
                    ProjectInputPurpose.MAIN,
                    ProjectInputPurpose.EXTRA
                ])
            })
        ]);

        const valid = [{
            uploadID: 'ufy7k7kig3yfl0gbm',
            purpose: 'main'
        },{
            uploadID: 'jejeofepfjahajkaj',
            purpose: 'extra'
        }];

        it('with valid input', function () {
            expect(rule.test(valid)).to.be.true;
        });

        it('Empty Array', function () {
            expect(rule.test([])).to.be.true;
        });

        it('NULL input', function () {
            expect(rule.test(null)).to.be.false;
        });

        it('UNDEFINED input', function () {
            expect(rule.test(undefined)).to.be.false;
        });

        it('Object input', function () {
            expect(rule.test({})).to.be.false;
        });


        it('Function input', function () {
            expect(rule.test(()=>{})).to.be.false;
        });

        it('number input', function () {
            expect(rule.test(10)).to.be.false;
        });

        it('Infinity input', function () {
            expect(rule.test(Infinity)).to.be.false;
        });

        it('NaN input', function () {
            expect(rule.test(NaN)).to.be.false;
        });
    });
});