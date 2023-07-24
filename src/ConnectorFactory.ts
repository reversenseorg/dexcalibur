
import * as _fs_ from 'fs';
import * as _path_ from 'path';

import DexcaliburProject from "./DexcaliburProject.js";

import InMemoryDbIndex from "../connectors/inmemory/InMemoryDbIndex.js";
import InMemoryDbCollection from "../connectors/inmemory/InMemoryDbCollection.js";
import SerializedObject from "../connectors/inmemory/SerializedObject.js";
import Util from "./Utils.js";
import InMemoryConnector from "../connectors/inmemory/adapter.js";
import SqliteConnector from '../connectors/sqlite/adapter.js';
import {CoreDebug} from "./core/CoreDebug.js";


let gInstance:ConnectorFactory = null;


export class ConnectorDb
{

}


/**
 * Represent the connector factory.
 *
 * @class
 */
export class ConnectorFactory
{
    connectors:any = {};

    /**
     * To create a new factory for each connector contaiend into connectors/*
     *
     * @constructor
     */
    constructor() {
        this.connectors = {
            inmemory: { default: InMemoryConnector },
            sqlite: { default: SqliteConnector }
        };
    }

    /**
     * To get the instance of ConnectorFactory
     *
     * @param {Boolean} pForce [Optional] Default FALSE. If TRUE, current instance is overridden
     * @returns {ConnectorFactory}
     * @method
     */
    static getInstance( pForce:boolean = false):ConnectorFactory{
        if(gInstance === null || pForce === true){
            gInstance = new ConnectorFactory();
        }

        return gInstance;
    }

    /**
     * To instanciate a new connector of a specified type
     *
     * @param {String} pType Connector type. example: 'inmemory'
     * @param {DexcaliburProject} pProject Project instance
     * @param {Object} pOptions [Optional] Default NULL.
     * @method
     */
    newConnector( pType:string, pProject:DexcaliburProject, pOptions:any = null):any{
        if(this.connectors.hasOwnProperty(pType)===false){
            throw new Error('[CONNECTOR] Unknown connector : '+pType);
        }

        return new this.connectors[pType].default(pProject, pOptions);
    }

    /**
     * To serialize all connectors available
     *
     * @returns {Object[]} Simple object ready to be JSON-serialized
     * @method
     */
    toJsonObject():any{
        let o:any=[];
        for(let i in this.connectors){
            o.push(this.connectors[i].default.getProperties());
        }
        CoreDebug.checkJsonSerialize(o, "ConnectorFactory");
        return o;
    }
}
