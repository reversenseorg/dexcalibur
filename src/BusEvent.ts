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
