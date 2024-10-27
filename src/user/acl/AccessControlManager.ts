import DexcaliburEngine from "../../DexcaliburEngine.js";
import AccessControl from "./AccessControl.js";
import {AccessZone} from "./Zones.js";
import {ProjectAccessControl} from "./rbac/ProjectAccessContol.js";
import {OrganizationAccessControl} from "./rbac/OrganizationAccessContol.js";
import {SettingsAccessControl} from "./rbac/SettingsAccessContol.js";
import {GlobalAccessControl} from "./rbac/GlobalAccessContol.js";


export class AccessControlManager {

    private _ctx:DexcaliburEngine;

    constructor(pCtx:DexcaliburEngine) {
        this._ctx = pCtx;
    }

    init():void {
        AccessControl.init();

        //AccessControl.registerZone( AccessZone.GLOBAL, EngineAccessControl)
        AccessControl.registerZone( AccessZone.PROJECT, new ProjectAccessControl());
        AccessControl.registerZone( AccessZone.ORGANIZATION, new OrganizationAccessControl());
        AccessControl.registerZone( AccessZone.GLOBAL, new SettingsAccessControl());
        AccessControl.registerZone( AccessZone.GENERIC, new GlobalAccessControl());
    }
}