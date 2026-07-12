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

import ModelMethod from "./ModelMethod.js";
import DDVM_ClassInstance from "./android/DDVM_ClassInstance.js";



export interface DvmParamsOpts {
    notset:boolean;
    val:string;
}
/**
 * Interface required for any VM into Dexcalibur
 *
 * @interface
 * @export
 * @since 1.0.0
 * @author Gezorges-B. MICHEL
 */
export interface DexcaliburVM {

   // defineHook( pMethodSignature:string, pHook:Function ):void;

    setupHooks():void;

    //runMethod( pMethod:ModelMethod):void;

    setConfig( pConfig:any):void;

    softReset():void;

    reset():void;

    start( pMethod:ModelMethod, pThis:any, pArguments:DvmParamsOpts[]):void;

    getPseudoCode():string[];

    printStackTrace():any;

    getLog():any;

    toJsonObject(): any;
}