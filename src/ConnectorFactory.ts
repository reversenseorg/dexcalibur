
import * as _fs_ from 'fs';
import * as _path_ from 'path';

import DexcaliburProject from "./DexcaliburProject";


let gInstance:ConnectorFactory = null;

/**
 * Represent the connector factory.
 *
 * @class
 */
export default class ConnectorFactory
{
    connectors:any = {};

    /**
     * To create a new factory for each connector contaiend into connectors/*
     *
     * @constructor
     */
    constructor() {
        this.connectors = {};

        let ws:string = _path_.join(__dirname, '..', 'connectors');
        let files:string[] = _fs_.readdirSync(ws);
        let p:string = null;

        for(let i=0; i<files.length; i++){
            p = _path_.join( ws, files[i], "adapter.js");
            if(_fs_.existsSync(p))
                this.connectors[files[i]] = require(p);
        }
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

        return new this.connectors[pType](pProject, pOptions);
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
            o.push(this.connectors[i].getProperties());
        }
        return o;
    }
}
