import chai = require("chai");
import {Modifier, ModifierFormat} from "../src/AccessFlags";


let expect:Chai.ExpectStatic = chai.expect;



describe('Modifier', function() {


    describe('Modifier enum', function() {


            it('public', function(){

                let mod:Modifier = Modifier.PUBLIC & Modifier.STATIC;

                expect(mod & Modifier.PUBLIC).to.equals(true);
            });

    });

    describe('ModifierFormat', function() {

        it('sprint PUBLIC', function(){
            let mod:Modifier = Modifier.PUBLIC | Modifier.STATIC;

            expect(ModifierFormat.sprint(mod)).to.equals('[public,static]');
        });
    });


});