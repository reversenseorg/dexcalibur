'use strict';

const _fs_ = require('fs');
const _path_ = require('path');


let gInstance = null;

/**
 * Represent the connector factory.
 *
 * @class
 */
class ConnectorFactory{

    /**
     * To create a new factory for each connector contaiend into connectors/*
     *
     * @constructor
     */
    constructor() {
        this.connectors = {};

        let ws = _path_.join(__dirname, '..', 'connectors');
        let files = _fs_.readdirSync(ws);
        let p = null

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
    static getInstance( pForce = false){
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
    newConnector( pType, pProject, pOptions = null){
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
    toJsonObject(){
        let o=[];
        for(let i in this.connectors){
            o.push(this.connectors[i].getProperties());
        }
        return o;
    }
}

module.exports = ConnectorFactory;