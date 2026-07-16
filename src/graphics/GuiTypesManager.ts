/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import ModelUiEventType from "./models/ModelUiEventType.js";
import ModelUiRole from "./models/ModelUiRole.js";
import {GuiAnalyzerException} from "./errors/GuiAnalyzerException.js";
import ModelUiComponentType from "./models/ModelUiComponentType.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {IDbCollection} from "@reversense/dexcalibur-orm";
import {NodeInternalType} from "@reversense/dxc-core-api";
import {ProjectDatabase} from "../database/ProjectDatabase.js";

export class GuiTypesManager {


    private _ctx:DexcaliburProject;

    evtTypes: IDbCollection; //Record<string, ModelUiEventType> = {};
    cmpTypes: IDbCollection; //Record<string, ModelUiEventType> = {};
    roles: IDbCollection; //Record<string, ModelUiRole> = {};

    constructor(pProject:DexcaliburProject) {
        this._ctx = pProject;

        // init refs to collections
        this.setProjectDB(this._ctx.getProjectDB());
    }

    /**
     * To change the project database used as backend
     *
     * @param {ProjectDatabase} pDB Project database where GUI types and instances are stored
     * @method
     */
    setProjectDB(pDB:ProjectDatabase):void {
        this.evtTypes = pDB.getCollectionOf(NodeInternalType.UI_EVT_TYPE);
        this.cmpTypes = pDB.getCollectionOf(NodeInternalType.UI_CMP_TYPE);
        this.roles = pDB.getCollectionOf(NodeInternalType.UI_ROLE);
    }

    /**
     * To add a new event type
     * @param pType
     */
    async addEventType(pType:ModelUiEventType):Promise<void> {
        if(await this.evtTypes.getEntry(pType.getUID())!=null){
            throw GuiAnalyzerException.EXISTING_EVT_TYPE(pType.getUID());
        }

        await this.evtTypes.asyncAddEntry(pType);
    }

    /**
     * To add a new component type
     * @param pType
     */
    async addCmpType(pType:ModelUiComponentType):Promise<void> {
        if(await this.cmpTypes.getEntry(pType.getUID())!=null){
            throw GuiAnalyzerException.EXISTING_CMP_TYPE(pType.getUID());
        }

        await this.cmpTypes.asyncAddEntry(pType);
    }

    /**
     * To add a new role
     * @param pRole
     */
    async addRole(pRole:ModelUiRole):Promise<void> {
        if(await this.roles.getEntry(pRole.getUID())!=null){
            throw GuiAnalyzerException.EXISTING_ROLE(pRole.getUID());
        }

        await this.roles.asyncAddEntry(pRole);
    }
}