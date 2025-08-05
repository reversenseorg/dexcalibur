/**
 * Represent a database used by analyzer
 *
 * @class
 * @author Georges-B. MICHEL
 */
import DexcaliburProject from "./DexcaliburProject.js";
import {ConnectorFactory} from "./ConnectorFactory.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {NodeType, IDatabaseAdapter, IDbCollection, IDbIndex} from "@dexcalibur/dexcalibur-orm";
import {IStringIndex} from "./core/IStringIndex.js";
import {AnalyzerException} from "./errors/AnalyzerException.js";
import {ProjectDatabase} from "./database/ProjectDatabase.js";
import ModelClass from "./ModelClass.js";
import ModelMethod from "./ModelMethod.js";
import ModelField from "./ModelField.js";
import ModelPackage from "./ModelPackage.js";
import ModelStringValue from "./ModelStringValue.js";
import ModelCall from "./ModelCall.js";


export default class AnalyzerDatabase
{
    ctx:DexcaliburProject = null;

    /**
     * Temporary in-memory DB
     *
     * Useful to create and use just-in-time DB
     *
     * @field
     */
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
    call:IDbCollection = null;
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

    resources:IDbCollection = null;
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

        if(pDbFactory==null){
            this._tmpConn = ConnectorFactory.getInstance().newConnector('inmemory',pContext);
        }else{
            this._tmpConn = pDbFactory.newConnector('inmemory',pContext);
        }


        this.conn.connect({});

        this.classes =this.conn.getCollection("classes");
        this.fields =this.conn.getCollection("fields");
        this.methods =this.conn.getCollection("methods");
        this.call =this.conn.getCollection("call"); //getIndex("call");
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
        this.resources =this.conn.getCollection("resources");
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
            case NodeInternalType.RESOURCE:
                res = this.resources.getEntry(pUID);
                break;
            case NodeInternalType.CALL:
                res = this.call.getEntry(pUID);
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
        if((this as IStringIndex<any>)[pName]==null){
            return this.conn.getCollection(pName);
        }else{
            return ((this as IStringIndex<any>)[pName] as IDbCollection);
        }
    }


    getTempConnector():IDatabaseAdapter {
        return this._tmpConn;
    }


    getDataSetFromNodeType(pNodeType:NodeInternalType):IDbCollection|IDbIndex {


        switch(pNodeType){
            case NodeInternalType.SYSCALL: return this.syscalls;
            case NodeInternalType.METHOD: return this.methods;
            case NodeInternalType.PACKAGE: return this.packages;
            case NodeInternalType.CLASS: return this.classes;
            case NodeInternalType.STRING: return this.strings;
            case NodeInternalType.FIELD: return this.fields;
            case NodeInternalType.FUNC: return this.funcs;
            case NodeInternalType.DATA_BLOCK: return this.datablock;
            case NodeInternalType.ANDROID_PERM: return this.permissions;
            case NodeInternalType.ANDROID_RECEIVER: return this.receivers;
            case NodeInternalType.ANDROID_SERVICE: return this.services;
            case NodeInternalType.ANDROID_PROVIDER: return this.providers;
            case NodeInternalType.ANDROID_ACTIVITY: return this.activities;
            case NodeInternalType.RESOURCE: return this.resources;
            case NodeInternalType.FILE: return this.files;
            case NodeInternalType.CALL: return this.call;
            case NodeInternalType.TAG: return this.tagcategories;
            default: throw AnalyzerException.MISSING_DATA_SET(pNodeType);
        }
    }

    /**
     * To restore inmemory analyzer DB from project DB
     *
     * @param pProjectDB
     */
    restoreFrom(pProjectDB: ProjectDatabase) {
        // restore raw data
        this.classes = pProjectDB.getCollectionOf(ModelClass.TYPE.getType());
        this.methods = pProjectDB.getCollectionOf(ModelMethod.TYPE.getType());
        this.fields = pProjectDB.getCollectionOf(ModelField.TYPE.getType());
        this.packages = pProjectDB.getCollectionOf(ModelPackage.TYPE.getType());
        this.classes = pProjectDB.getCollectionOf(ModelClass.TYPE.getType());
        this.call = pProjectDB.getCollectionOf(ModelCall.TYPE.getType());
    }

    /**
     *
     * @param pData
     */
    newStringValue( pData:any):ModelStringValue {
        const s = new ModelStringValue(pData);
        this.strings.insert(s, false);
        return s;
    }
}
