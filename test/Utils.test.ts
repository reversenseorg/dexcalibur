import {expect} from 'chai';
import {ValidationRule} from "@reversense/dexcalibur-orm";
import {ProjectInputPurpose} from "../src/analyzer/ProjectInput.js";
import Util from '../src/Utils.js';
import * as console from "node:console";


describe('Utils', function() {


    describe('psList() : list host processes', function() {

         console.log(Util.psList());
        console.log(Util.psList({ command: /slave-/g }));

         /*.then((a)=>{

             console.log(a);
         }).catch((e)=>{

             console.log(e);
         })*/

    });

});