'use strict';

const ConnectorFactory = require('./ConnectorFactory');


/**
 * Represent a database used by analyzer
 *
 * @class
 * @author Georges-B. MICHEL
 */
class AnalyzerDatabase
{
    /**
     * To create an analyzer database
     *
     * @param {DexcaliburProject} pContext Project associated to the database
     * @param {String} pConnectorType [Optional] Default NULL. Connector type
     * @constructor
     */
    constructor(pContext, pConnectorType=null){
        this.ctx = pContext;

        /**
         * DB connector
         * @type {null}
         */
        this.conn = null;

        if(pConnectorType !== null){
            this.conn = ConnectorFactory.getInstance().newConnector(pConnectorType, pContext);
        }else {
            this.conn = pContext.connector;
        }

        this.conn.connect();

        this.classes =this.conn.getCollection("classes");
        this.fields =this.conn.getCollection("fields");
        this.methods =this.conn.getCollection("methods");
        this.call =this.conn.getIndex("call");
        this.unmapped =this.conn.getIndex("unmapped");
        this.notbinded =this.conn.getIndex("notbinded");
        this.notloaded =this.conn.getIndex("notloaded");
        this.missing =this.conn.getIndex("missing");
        this.parseErrors =this.conn.getIndex("parseErrors");
        this.strings =this.conn.getIndex("strings");
        this.packages =this.conn.getCollection("packages");
        this.files =this.conn.getIndex("files");
        this.buffers =this.conn.getIndex("buffers");
        this.datablock =this.conn.getCollection("datablock");
        this.tagcategories =this.conn.getCollection("tagcategories");
        this.syscalls =this.conn.getCollection("syscalls");
        this.activities =this.conn.getCollection("activities");
        this.receivers =this.conn.getCollection("receivers");
        this.services =this.conn.getCollection("services");
        this.providers =this.conn.getCollection("providers");
        this.permissions =this.conn.getIndex("permissions");

        // Manifest node
        this.manifest = null;
    }

    /**
     * To get DB connector
     *
     * @return {InMemoryConnector|*}
     * @method
     */
    getConnector(){
        return this.conn;
    }
}

module.exports = AnalyzerDatabase;