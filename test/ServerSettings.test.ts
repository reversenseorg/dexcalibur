import {expect} from 'chai';
// -- App specific --

import {Settings} from "../src/Settings.js";
import GlobalSettings = Settings.GlobalSettings;
import ServerSettings = Settings.ServerSettings;
import {SanitizedValue, IncomingValue} from "../src/security/SanitizedValue.js";
import * as _path_ from "path";
import Util from "../src/Utils.js";
import { AbstractSettings } from '../src/settings/AbstractSettings.js';



class MockParentSettings extends AbstractSettings {

    private server:ServerSettings;

    constructor() {
        super(null);
    }

    sanitize(pName: string, pValue: any): IncomingValue {
        return new SanitizedValue(pName, pValue);
    }

    toObject(): any {
        return {
          server: this.server.toObject()
        };
    }

    update(pValue: IncomingValue): void {
        this[pValue.getName()] = pValue.getValue();
    }
}

describe('ServerSettings', function() {

    let gEngine:Settings.GlobalSettings = null;


    const WS_path = _path_.join(Util.__dirname(import.meta.url), 'ws');

    describe('constructor', function() {

        it('default settings', async function() {

            const mock_settings = new GlobalSettings();
            const settings = new ServerSettings(mock_settings);

            expect(settings.getHeapSize()).to.equals(ServerSettings.DEFAULT_HEAP_SIZE);
            expect(settings.getWorkspace()).to.be.undefined;
            expect(settings.getRegistry()).to.be.undefined;
            expect(settings.getAuthenticationSettings()).to.be.undefined;
        });

        it('partial settings', async function() {


            const mock_settings = new GlobalSettings();
            const settings = new ServerSettings(mock_settings, {
                heapSize: 8192,
                registry: "http://127.0.0.1:8000/",
                registryAPI: "http://127.0.0.1:8001/",
                workspace: WS_path,
                auth: null
            });

            expect(settings.getHeapSize()).to.equals(8192);
            expect(settings.getWorkspace().getLocation()).to.equals(WS_path);
            expect(settings.getRegistry().api).to.equals("http://127.0.0.1:8001/");
            expect(settings.getRegistry().url).to.equals("http://127.0.0.1:8000/");
            expect(settings.getAuthenticationSettings()).to.be.undefined;
        });
    });

    describe('toObject', function() {

        it('basic', async function() {

            const mock_settings = new GlobalSettings();
            const settings = new ServerSettings(mock_settings, {
                heapSize: 8192,
                registry: "http://127.0.0.1:8000/",
                registryAPI: "http://127.0.0.1:8001/",
                workspace: WS_path,
                auth: null
            });

            const obj = settings.toObject();

            expect(obj.heapSize).to.equals(8192);
            expect(obj.workspace).to.equals(WS_path);
            expect(obj.registryAPI).to.equals("http://127.0.0.1:8001/");
            expect(obj.registry).to.equals("http://127.0.0.1:8000/");
            expect(obj.auth).to.be.undefined;


        });
    });

    describe('toObject', function() {

        it('basic', async function() {

            const mock_settings = new GlobalSettings();
            const settings = new ServerSettings(mock_settings, {
                heapSize: 8192,
                registry: "http://127.0.0.1:8000/",
                registryAPI: "http://127.0.0.1:8001/",
                workspace: WS_path,
                auth: null
            });

            const obj = settings.toObject();

            expect(obj.heapSize).to.equals(8192);
            expect(obj.workspace).to.equals(WS_path);
            expect(obj.registryAPI).to.equals("http://127.0.0.1:8001/");
            expect(obj.registry).to.equals("http://127.0.0.1:8000/");
            expect(obj.auth).to.be.undefined;


        });
    });
});