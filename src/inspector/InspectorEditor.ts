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

import DexcaliburProject from "../DexcaliburProject.js";
import InspectorFactory, {InspectorFactoryOptions} from "../InspectorFactory.js";
import {UserAccount} from "../user/UserAccount.js";
import HookStrategy from "../hook/HookStrategy.js";

export class InspectorEditor {

    private _ctx:DexcaliburProject;

    constructor(pCtx:DexcaliburProject){
        this._ctx = pCtx;
    }

    async createInspectorFactory(pUser:UserAccount, pOptions:InspectorFactoryOptions):Promise<InspectorFactory>{
        const fact = new InspectorFactory(pOptions);
        //this._ctx.getContext().getInspectorManager().

        await this.save(fact);

        return fact;
    }

    async updateHookStrategy(pUser:UserAccount, pFactory:string, pStrat:HookStrategy):Promise<void>{

    }


    async save(pInspector:InspectorFactory):Promise<void>{
        await this._ctx.getProjectDB().getCollectionOf(InspectorFactory.TYPE.getType())
            .asyncAddEntry(pInspector.getUID(), pInspector);
    }
}