import {DbColumnTemplate} from "./DbColumnTemplate";
import {NodeProperty} from "./NodeProperty";
import {NodeInternalType} from "../../NodeInternalType";


export interface NodePropertyMap {
    [pptName:string] :NodeProperty;
}

/**
 * Represents the type of the node
 *
 * @class
 */
export class NodeType {

    /**
     * The internal (short) name of the node type
     * @type {string}
     * @field
     */
    _type:NodeInternalType = null;

    /**
     * The name of the node type
     * @type {string}
     * @field
     */
    _name:string = null;

    /**
     * The constructor associated to this node type
     * @type {function}
     * @field
     */
    _builder:any = null;

    /**
     *
     */
    _ppts:NodePropertyMap = {};

    /**
     *
     * @param {string} pName Node type name
     * @param {NodeProperty[]} pCols
     * @constructor
     */
    constructor( pName:string, pInternalType:NodeInternalType, pCols:NodeProperty[]) {
        this._name = pName;
        this._type = pInternalType;
        this.updateProperties(pCols);
    }

    builder(pConstructor:any):NodeType {
        this._builder = pConstructor;
        return this;
    }

    getBuilder():any{
        return this._builder;
    }

    /**
     * To update the properties of the node template
     *
     * @param {NodeProperty[]} pCols A list of properties to insert into this template
     * @method
     */
    updateProperties(pCols:NodeProperty[]):void {
        pCols.map( (vPpt:NodeProperty) => {
            this._ppts[vPpt.getName()] = vPpt;
        })
    }

    /**
     * To get the node type name
     *
     * @return {string} The node type name
     * @method
     */
    getName():string {
        return this._name;
    }

    /**
     * To get table columns template
     *
     * @return {DbColumnTemplate[]} Columns template
     * @method
     */
    getProperties():NodeProperty[] {
        return Object.values(this._ppts);
    }
}