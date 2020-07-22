
import chai = require("chai");
import { Modifier, ModifierFormat } from "../src/AccessFlags";


let expect:Chai.ExpectStatic = chai.expect;



describe('Modifier', function() {


    describe('Modifier enum', function() {

            it('public', function(){
                let mod:Modifier = Modifier.PUBLIC | Modifier.STATIC;
                expect((mod & Modifier.PUBLIC)>0).to.equals(true);
            });

            it('private', function(){
                let mod:Modifier = Modifier.PRIVATE | Modifier.STATIC;
                expect((mod & Modifier.PRIVATE)>0).to.equals(true);
            });

            it('protected', function(){
                let mod:Modifier = Modifier.STATIC | Modifier.PROTECTED;
                expect((mod & Modifier.PROTECTED)>0 ).to.equals(true);
            });
    });

    describe('sprintModifier', function() {

        it('sprint PUBLIC', function(){
            //console.log(ModifierFormat);
            let mod:Modifier = Modifier.PUBLIC | Modifier.STATIC | Modifier.FINAL;
            expect(ModifierFormat.sprintModifier(mod)).to.equals('[public,static,final,]');
        });
    });


});