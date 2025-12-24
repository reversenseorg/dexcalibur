import {NodeSchema} from "../src/NodeSchema.js";
import {ElixirUtils} from "../src/elixir/ElixirUtils.js";
import {SecurityZone} from "../src/security/SecurityZone.js";


describe('ElixirUtils', function() {

    describe('spawn radare2 instance', async function() {

        NodeSchema.init();

        console.log(ElixirUtils.exportDefinition(SecurityZone.PUBLIC));
    });
});