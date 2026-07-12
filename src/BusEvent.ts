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

import ModelField from "./ModelField.js";
import ModelClass from "./ModelClass.js";
import ModelMethod from "./ModelMethod.js";
import {ModelFunction} from "./ModelFunction.js";
import DexcaliburProject from "./DexcaliburProject.js";

export interface BusEventOptions<T> {
    type?:string;
    data?:T;
    interceptors?:string[];
    meth?:ModelMethod;
    cls?:ModelClass;
    field?:ModelField;
    func?:ModelFunction;
}

/**
 * Represent an event on a bus
 *
 * Data from various sources, and the type of event are encapsulated in an envelope named "bus event",
 * and send over the main bus.
 *
 * @class
 */
export default class BusEvent<T>
{
    context?:DexcaliburProject;
    type:string = null;
    data:T = null;
    interceptors:string[] = [];

    /**
     *
     * @param {BusEventOptions<T>} pConfig Optional
     * @constructor
     */
    constructor(pConfig:BusEventOptions<T> = {}) {
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    /**
     * To get the type of event
     *
     * @return {string} Type of event
     * @method
     */
    getType():string{
        return this.type;
    }

    /**
     * To set the type of event
     *
     * @param {string} pType Type of event
     * @method
     */
    setType(pType:string):void {
        this.type = pType;
        this.interceptors.push(pType);
    }

    /**
     * To get the event payload
     *
     * @return {T} Return the data encapsulated into this event
     * @method
     */
    getData():T{
        return this.data;
    }

    /**
     * To get the project which hold the bus where this event
     * has been published.
     *
     * @return {DexcaliburProject} Project instance
     * @method
     */
    getContext():DexcaliburProject{
        return this.context;
    }
}
