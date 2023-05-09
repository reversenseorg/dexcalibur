/**
 * Represent a database used by analyzer
 *
 * @class
 * @author Georges-B. MICHEL
 */
import DexcaliburProject from "./DexcaliburProject.js";
import {ConnectorFactory } from "./ConnectorFactory.js";
import {IDatabaseAdapter, IDbCollection, IDbIndex} from "./persist/orm/DbAbstraction.js";
import {NodeInternalType} from "./NodeInternalType.js";
import { NodeType } from "./persist/orm/NodeType.js";
import {IStringIndex} from "./core/IStringIndex.js";


export default class AnalyzerDatabase
{
    ctx:DexcaliburProject = null;

    _tmpConn:IDatabaseAdapter;

    /**
     * DB connector
     * @type {null}
     */
    conn:IDatabaseAdapter = null;

    funcs:IDbCollection = null;
    classes:IDbCollection = null;
    fields:IDbCollection = null;
    methods:IDbCollection = null;
    call:IDbIndex = null;
    unmapped:IDbIndex = null;
    notbinded:IDbIndex = null;
    notloaded:IDbIndex = null;
    missing:IDbIndex = null;
    parseErrors:IDbIndex = null;
    strings:IDbIndex = null;
    packages:IDbCollection = null;
    files:IDbCollection = null;
    buffers:IDbIndex = null;
    datablock:IDbCollection = null;
    tagcategories:IDbCollection = null;
    syscalls:IDbCollection = null;
    activities:IDbCollection = null;
    receivers:IDbCollection = null;
    services:IDbCollection = null;
    providers:IDbCollection = null;
    permissions:IDbIndex = null;

    // Manifest node
    manifest:any = null;

    /**
     * To create an analyzer database
     *
     * @param {DexcaliburProject} pContext Project associated to the database
     * @param {String} pConnectorType [Optional] Default NULL. Connector type
     * @constructor
     */
    constructor(pContext:DexcaliburProject, pConnectorType:string=null, pDbFactory:ConnectorFactory|null = null){
        this.ctx = pContext;

        if(pConnectorType != null){
            this.conn = ConnectorFactory.getInstance().newConnector(pConnectorType, pContext);
        }else {
            this.conn = pContext.connector;
        }


        if(pDbFactory!=null){
            this._tmpConn = pDbFactory.newConnector('inmemory',pContext);
        }


        this.conn.connect({});

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
        this.files = this.conn.getCollection("files");
        this.buffers =this.conn.getIndex("buffers");
        this.datablock =this.conn.getCollection("datablock");
        this.tagcategories =this.conn.getCollection("tagcategories");
        this.syscalls =this.conn.getCollection("syscalls");
        this.activities =this.conn.getCollection("activities");
        this.receivers =this.conn.getCollection("receivers");
        this.services =this.conn.getCollection("services");
        this.providers =this.conn.getCollection("providers");
        this.permissions =this.conn.getIndex("permissions");
        this.funcs =this.conn.getCollection("funcs");

        // Manifest node
        this.manifest = null;
    }

    /**
     * To get DB connector
     *
     * @return {InMemoryConnector|*}
     * @method
     */
    getConnector():IDatabaseAdapter{
        return this.conn;
    }

    searchNode( pTypeUID:number, pUID:string):any{
        let res:any = null;
        switch (pTypeUID) {
            case NodeInternalType.FILE:
                res = this.files.getEntry(pUID);
                break;
            case NodeInternalType.PACKAGE:
                res = this.packages.getEntry(pUID);
                break;
            case NodeInternalType.CLASS:
                res = this.classes.getEntry(pUID);
                break;
            case NodeInternalType.METHOD:
                res = this.methods.getEntry(pUID);
                break;
            case NodeInternalType.FIELD:
                res = this.fields.getEntry(pUID);
                break;
            case NodeInternalType.FUNC:
                res = this.funcs.getEntry(pUID);
                break;
        }
        return res;
    }

    /**
     * To get a coolection from local connector instance or to allocate it
     *
     * @param pName
     * @param pNodeType
     */
    getCollection(pName:string, pNodeType:NodeType):IDbCollection {
        if((this as IStringIndex)[pName]==null){
            return this.conn.getCollection(pName);
        }else{
            return ((this as IStringIndex)[pName] as IDbCollection);
        }
    }


    getTempConnector():IDatabaseAdapter {
        return this._tmpConn;
    }
}
