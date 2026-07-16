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

import {AccessAttribute, AccessAttributeMap} from "./user/acl/AccessAttribute.js";
import {ValidationCapable, ValidationRulesMap} from "@reversense/dexcalibur-orm";


/**
 * Represent a Node with Limited Accesses verified by
 * AccessControl at runtime
 *
 * @extends {ValidationCapable}
 * @abstract
 * @class
 */
export abstract class Auditable extends ValidationCapable{

    /**
     * The map of access attribute for this instance
     * @type {AccessAttributeMap}
     * @field
     */
    protected _attr: AccessAttributeMap = {};

    constructor( pValidationRules:ValidationRulesMap) {
        super(pValidationRules);

        this.initAccessAttributes();
    }

    abstract initAccessAttributes();

    /**
     * To remove an access attribute
     *
     * It must recreated immediately after, else an exception will be throw
     * at first check
     *
     * @param {AccessAttribute} pAttr Definittion of attribute to remove from current instance
     * @return {void}
     * @method
     */
    removeAccessAttribute(pAttr: AccessAttribute<any>):void {
        delete this._attr[pAttr.name];
    }

    /**
     * To get access attribute by its name
     *
     * Should be a list user UUIDs
     *
     * @param {AccessAttribute<T>} pAttr Attribute name
     * @return {AccessAttribute<T>}
     */
    getAccessAttribute<T>(pAttr: AccessAttribute<T>): AccessAttribute<T> {
        return this._attr[pAttr.name];
    }

    /**
     * To set access attribute of this instance
     *
     * @param {AccessAttribute<T>} pAttr Attribute name
     * @param {T[]} pValue Optional. Attribute initial value
     * @return {void}
     * @method
     */
    setAccessAttribute<T>(pAttr: AccessAttribute<T>, pValue?:T[]|T): void {
        if(this._attr==null){
            this._attr = {};
        }

        if(this._attr[pAttr.name]==null){
            this._attr[pAttr.name] = pAttr;
        }

        if(pValue!=null){
            if(Array.isArray(pValue)){
                this._attr[pAttr.name].value = pValue;
            }else{
                this._attr[pAttr.name].value = [pValue];
            }
        }
    }

    /**
     * To append a value to an attribute of the current instance
     *
     * @param {AccessAttribute<T>} pAttr
     * @param {T} pValue
     * @return {void}
     * @method
     */
    appendToAccessAttribute<T>(pAttr:AccessAttribute<T>, pValue:T): void {
        if(this._attr==null){
            this._attr = {};
        }

        if(this._attr[pAttr.name]==null){
            this.setAccessAttribute(pAttr);
            // throw AccessControlException.UNKNOWN_ACL_ATTRIBUTE(pAttr);
        }

        this._attr[pAttr.name].append(pValue);
    }


    importAccessAttributes(pRawAttr:AccessAttributeMap): void {
        for(const n in pRawAttr){
            this._attr[n] = pRawAttr[n];
        }
    }
}