import {expect} from 'chai';
import {before} from "mocha";
import DexcaliburEngine, {DexcaliburEngineMode} from "../src/DexcaliburEngine.js";
import {Settings} from "../src/Settings.js";

describe('OrganizationManager', function() {

    let dxcInstance:DexcaliburEngine;
    let config: Settings.GlobalSettings;

    before(async function (){
        console.log("OK");
        config = Settings.GlobalSettings.load();

        dxcInstance = DexcaliburEngine.getInstance({
            offline: true,
            engine_mode: DexcaliburEngineMode.MASTER
        });

        await dxcInstance.loadConfiguration(config);
        // boot as headless mode
        let ready = await dxcInstance.boot(false,"");

        if(ready){
            await dxcInstance.start();
        }
    });

    beforeEach(async function(){

    });

    describe('listOrganizations()', async function() {

        const orgs = await dxcInstance.getOrgManager().listOrganizations(
            dxcInstance.getInternalAcc()
        );

        console.log(orgs);

        it('with internal account', function () {

            expect(orgs).to.be.an("array");
            expect(orgs).has.lengthOf(4);
        });

    });


});