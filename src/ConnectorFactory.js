'use strict';

const _fs_ = require('fs');
const _path_ = require('path');

const Utils = require('./Utils');

let gInstance = null;

/**
 *
 * @class
 */
class ConnectorFactory{

    /**
     * @constructor
     */
    constructor() {
        this.connectors = {};

        let ws = _path_.join(__dirname, '..', 'connectors');
        let files = _fs_.readdirSync(ws);

        for(let i=0; i<files.length; i++){
            this.connectors[files[i]] = require(_path_.join( ws, files[i], "adapter.js"));
        }
    }

    /**
     *
     * @param pForce
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
     *
     * @param {String} pType
     * @param {DexcaliburProject} pProject
     */
    newConnector( pType, pProject, pOptions = null){
        if(this.connectors.hasOwnProperty(pType)===false){
            throw new Error('[CONNECTOR] Unknown connector : '+pType);
        }

        return new this.connectors[pType](pProject, pOptions);
    }
}

module.exports = ConnectorFactory;