'use strict';

const ConnectorFactory = require('./ConnectorFactory');


/**
 * @class
 * @author Georges-B. MICHEL
 */
class AnalyzerDatabase
{
    /**
     *
     * @param {DexcaliburProject} context
     * @constructor
     */
    constructor(context, pConnectorType=null){
        this.ctx = context;

        if(pConnectorType !== null){
            this.conn = ConnectorFactory.getInstance().newConnector(pConnectorType, context);
        }else {
            this.conn = context.connector;
        }

        this.conn.connect();

        this.classes =this.conn.getIndex("classes");
        this.fields =this.conn.getIndex("fields");
        this.methods =this.conn.getIndex("methods");
        this.call =this.conn.getIndex("call");
        this.unmapped =this.conn.getIndex("unmapped");
        this.notbinded =this.conn.getIndex("notbinded");
        this.notloaded =this.conn.getIndex("notloaded");
        this.missing =this.conn.getIndex("missing");
        this.parseErrors =this.conn.getIndex("parseErrors");
        this.strings =this.conn.getIndex("strings");
        this.packages =this.conn.getIndex("packages");
        this.files =this.conn.getIndex("files");
        this.buffers =this.conn.getIndex("buffers");
        this.datablock =this.conn.getIndex("datablock");
        this.tagcategories =this.conn.getIndex("tagcategories");
        this.syscalls =this.conn.getIndex("syscalls");
        this.activities =this.conn.getIndex("activities");
        this.receivers =this.conn.getIndex("receivers");
        this.services =this.conn.getIndex("services");
        this.providers =this.conn.getIndex("providers");
        this.permissions =this.conn.getIndex("permissions");

        // Manifest node
        this.manifest = null;
    }
}

module.exports = AnalyzerDatabase;