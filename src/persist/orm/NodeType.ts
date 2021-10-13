import {DbColumnTemplate} from "./DbColumnTemplate";
import {NodeProperty} from "./NodeProperty";
import {NodeInternalType} from "../../NodeInternalType";


export interface NodePropertyMap {
    [pptName:string] :NodeProperty;
}

export interface NodeTypeMap {
    [typeName:string] :NodeType;
}

/**
 * Represents the type of the node
 *
 * @class
 */
export class NodeType {

    static ALL:NodeTypeMap = {}

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
     * Primary Key
     * cannot be a composite key
     */
    _pk:NodeProperty = null;

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

        if(NodeType.ALL[pName]==null){
            NodeType.ALL[pName] = this;
        }
    }

    /**
     *
     * @param pName
     */
    static lookup(pName:string) :NodeType {
        return NodeType.ALL[pName];
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
            if(vPpt.isPrimaryKey()){
                this._pk = vPpt;
            }
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

    getPrimaryKey():NodeProperty {
        return this._pk;
    }

    getType():NodeInternalType{
        return this._type;
    }
}