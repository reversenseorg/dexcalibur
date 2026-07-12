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

/**
 * Class describing a hook into the VM, it allows to provide custom implementation
 * of method.
 *
 * @class
 * @classdesc Class describing a hook into the VM
 */
import DDVM_ClassInstance from "./DDVM_ClassInstance.js";

/**
 * @class
 */
export default class DDVM_Hook
{
    /**
     * @field
     */
    method:string = null;

    /**
     * @field
     */
    hook:Function = null;

    /**
     * @field
     */
    enable:boolean = false;

    /**
     *
     * @constructor
     * @param {String} pMethodName The signature of the method to hook
     * @param {Function} pHook
     * @param {Boolean} pEnable
     */
    constructor( pMethodSignature:string, pHook:Function, pEnable:boolean=true){
        this.method = pMethodSignature;
        this.hook = pHook;
        this.enable = pEnable;
    }

    /**
     * To execute the hook code with the given context
     *
     * @method
     * @param {VM} pVM The context of the VM
     * @param {VM_ClassInstance} pThis If the method is not static, the instance invoking the method. Else, if the method is static, it is NULL
     * @param {Symbol} pArgs The registers containing value of arguments
     * @return {*} Value returned by hook function
     */
    exec( pVM:any, pMethod:any, pThis:DDVM_ClassInstance, pArgs:any):any{
        return this.hook(pVM, pThis, pArgs);
    }
}
