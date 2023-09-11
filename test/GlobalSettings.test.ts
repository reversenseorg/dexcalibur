import {expect} from 'chai';
// -- App specific --

import {Settings} from "../src/Settings.js";
import GlobalSettings = Settings.GlobalSettings;
import ServerSettings = Settings.ServerSettings;

describe('GlobalSettings', function() {

    let gEngine:Settings.GlobalSettings = null;

    describe('constructor', function() {

        it('valid settings', async function() {

            const settings = new GlobalSettings({
                bin: {
                    java: "/bin/java"
                },
                server: {
                    heapSize: 8192
                },
                web: {
                    http: 8080,
                    ws: 9999
                }
            });

            expect(settings.getServerSettings().getHeapSize()).to.equals(8192);
            expect(settings.getWebserverSettings().getWsPort()).to.equals(9999);
            expect(settings.getWebserverSettings().getHttpPort()).to.equals(8080);
            expect(settings.getExternalSettings().getTool("java")).to.equals("/bin/java");
        });

        it('empty settings', async function() {

            const settings = new GlobalSettings();

            expect(settings.getServerSettings().getHeapSize()).to.equals(ServerSettings.DEFAULT_HEAP_SIZE);
            expect(settings.getWebserverSettings().getWsPort()).to.equals(Settings.DEFAULT_WS_PORT);
            expect(settings.getWebserverSettings().getHttpPort()).to.equals(Settings.DEFAULT_HTTP_PORT);
            expect(settings.getExternalSettings().getTool("java")).to.be.undefined;
        });
    });

    describe('toObject', function() {

        it('valid settings', async function() {

            const settings = new GlobalSettings({
                bin: {
                    java: "/bin/java"
                },
                server: {
                    heapSize: 8192
                },
                web: {
                    http: 8080,
                    ws: 9999
                }
            });

            expect(settings.getServerSettings().getHeapSize()).to.equals(8192);
            expect(settings.getWebserverSettings().getWsPort()).to.equals(9999);
            expect(settings.getWebserverSettings().getHttpPort()).to.equals(8080);
            expect(settings.getExternalSettings().getTool("java")).to.equals("/bin/java");
        });
    });
});