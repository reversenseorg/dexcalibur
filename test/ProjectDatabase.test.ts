import {expect} from 'chai';
// -- App specific --
import * as _path_ from "path";
import {ProjectDatabase} from "../src/database/ProjectDatabase.js";
import ModelResource from "../src/ModelResource.js";




describe('ProjectDatabase', function() {

    describe("generateIncrementalUUID", function(){
        console.log(ProjectDatabase.generateIncrementalUUID(new ModelResource<any>({}),100));
    })
});