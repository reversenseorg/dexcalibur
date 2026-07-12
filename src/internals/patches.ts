
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

import {DXC_LIFECYCLE_EVENT} from "../CoreConst.js";

export const PATCHES = [
   {
        ev: DXC_LIFECYCLE_EVENT.OPEN_PROJECT,
        _code: function (pCtx:any):any{
            /*if(pCtx.PROJECT==null) return;

            const project:DexcaliburProject = pCtx.PROJECT;
            const hm:HookManager = project.getHookManager();
            hm.getDbAPI().fragments.map((vFrag:HookTemplateFragment)=>{
                if(vFrag.getStrategy() == null){
                    hm.get
                }
            })*/
        }
    }
]