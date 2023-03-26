import {Database} from "better-sqlite3";
import {DbDataType, DbSerialize} from "../../src/persist/orm/DbAbstraction.js";
import {NodeProperty} from "../../src/persist/orm/NodeProperty.js";
import {NodeType} from "../../src/persist/orm/NodeType.js";
import {SqliteException} from "./SqliteException.js";
import * as Log from "../../src/Logger.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface PreparedStatementList {
    selectSingle :any,
    selectAll :any,
    insertSingle :any,
    updateSingle :any,
    removeSingle :any,
}


export class SqliteAPI {

    _db:Database;

    constructor( pDb:Database ) {
        this._db = pDb;
    }

    /**
     * To serialize a node property
     *
     * @param pObject
     * @param pProperties
     * @private
     */
    _serializeProperty( pObject:any, pProperties:NodeProperty):string {

        const name = pProperties.getName();
        let res:any = null;

        switch(pProperties.getSerializeMethod()){
            case DbSerialize.JSON:
                if(pProperties.isMultiple()){
                    if(Array.isArray(pObject[name])){
                        if(pObject[name].length > 0){
                            res = [];
                            pObject[name].map( (val:any) => {
                                res.push(val.hasOwnProperty('toJsonObject')? val.toJsonObject() : val[name]);
                            })
                        }else{
                            res = pObject[name];
                        }
                    }
                }else{
                    res =pObject[name].hasOwnProperty('toJsonObject')? pObject[name].toJsonObject() : pObject[name];
                }

                res = JSON.stringify(res);
                break;
            case DbSerialize.RAW:
                res = pObject[name];
                break;
        }

        return res;
    }

    /**
     * To serialize a node property
     *
     * @param pObject
     * @param pProperties
     * @private
     */
    _unserializeProperty( pObject:any, pProperty:NodeProperty):string {

        const name = pProperty.getName();
        let res:any = null;

        switch(pProperty.getSerializeMethod()){
            case DbSerialize.JSON:
                /*if(pProperty.isMultiple()){
                    res = [];
                    const tmp =  JSON.parse(res);
                    if(Array.isArray(pObject[name])){
                        if(pObject[name].length > 0){
                            res = [];
                            pObject[name].map( (val:any) => {
                                res.push(val.hasOwnProperty('toJsonObject')? val.toJsonObject() : val[name]);
                            })
                        }else{
                            res = pObject[name];
                        }
                    }
                }else{
                    //res = pObject[name].hasOwnProperty('fromJsonObject')? pProperty.builder.fromJsonObject(pObject[name]) : pObject[name];

                    res = JSON.parse(res);
                }*/

                res = JSON.parse(pObject[name]);

                break;
            case DbSerialize.RAW:
                res = pObject[name];
                break;
        }

        return res;
    }

    _prepareParams( pObject:any, pNodeType:NodeType, pSubset:string[] = null):any {

        const pars:any = {};

        pNodeType.getProperties().map( (vPPT:NodeProperty) => {
            if(vPPT.isVolatile()) return;
            if(vPPT.isMultiple()) return;
            if(pSubset != null && pSubset.indexOf(vPPT.getName())==-1) return;

            const name = vPPT.getName();
            if(vPPT.isNode()){
                if(! vPPT.isMultiple()){
                    if(pObject[name] != null){
                        pars[name] = pObject[name][
                            vPPT.getNodeType()
                                .getPrimaryKey()
                                .getName()];
                    }else{
                        pars[name] = null;
                    }
                }else{
                    if(vPPT.isSerialized()){
                        pars[name] = this._serializeProperty( pObject, vPPT);
                    }else{
                        throw new SqliteException("RS : non-serializable children must be stored into separate table");
                    }
                }
            }else{
                if(vPPT.isSerialized()){
                    pars[name] = this._serializeProperty( pObject, vPPT);
                }else if(vPPT.isBoolean()){
                    pars[name] = pObject[name]===true ? 1 : 0;
                }else if(vPPT.hasSleep()){
                    pars[name] = vPPT.doSleep( { p:pObject[name], self:pObject });
                   // Logger.debug("====> SLEEP property "+name+" => after : "+pars[name]);
                }else{
                    pars[name] = pObject[name];
                }
            }
        });

        return pars;
    }


    /**
     * To extract a list of bind params from a node instance
     *
     * @param pObject
     * @param pProperties
     * @param pSubset
     * @private
     */
    _extractParams( pObject:any, pNodeType:NodeType, pSubset:string[] = null):any{

        let pars:any = {};
        let t:string;

        /*if(pNodeType.hasExternalProperties()){
            pNodeType.getExternalProperties().map( (vPpt:NodeProperty)=>{
                t = vPpt.getNodeType().getName();
                pars[t] = [];
                if(Array.isArray(pObject[vPpt.getName()])){
                    pObject[vPpt.getName()].map( x => { pars[t].push( this._prepareParams(x, vPpt.getNodeType(), pSubset))})
                }
            });
        }else{*/
            pars = this._prepareParams(pObject, pNodeType, pSubset);
        //}

        return pars;
    }

    /**
     * To get the list of existing tables
     *
     * @return {any[]} A list of table names
     * @method
     */
    _getTables():string[] {
        return this._db
            .prepare("SELECT name FROM sqlite_master WHERE type =? AND name NOT LIKE ?")
            .all('table','sqlite_%').map( x => x.name);
    }

    _getDB():Database {
        return this._db;
    }

    /**
     * To get corresponding type
     *
     * @param pAbstractType
     */
    _getTypes( pAbstractType:DbDataType) :string {
        switch (pAbstractType){
            case DbDataType.CHARACTER:
            case DbDataType.NVARCHAR:
            case DbDataType.NCHAR:
            case DbDataType.VARCHAR:
            case DbDataType.STRING:
            case DbDataType.CHAR:
                return 'TEXT';

            case DbDataType.BLOB:
                return 'BLOB';

            case DbDataType.BIGINT:
            case DbDataType.INT2:
            case DbDataType.INT8:
            case DbDataType.INT:
            case DbDataType.MEDIUMINT:
            case DbDataType.SMALLINT:
            case DbDataType.TINYINT:
            case DbDataType.UNSIGNED_BIG_INT:
            case DbDataType.INTEGER:
                return 'INTEGER';

            case DbDataType.DOUBLE:
            case DbDataType.DOUBLE_PRECISION:
            case DbDataType.FLOAT:
            case DbDataType.REAL:
                return 'REAL';

            case DbDataType.NUMERIC:
            case DbDataType.DECIMAL_10_5:
            case DbDataType.BOOLEAN:
            case DbDataType.DATE:
            case DbDataType.DATETIME:
                return 'NUMERIC';

            default:
                return null;
        }
    }


    _declareColumnStmt( vTPL:NodeProperty, vExtTPL:NodeProperty = null): string {
        let s:string = "";
        const t = this._getTypes( vExtTPL==null ? vTPL.getType() : vExtTPL.getType());
        const def = vExtTPL==null ? vTPL.getDefaultValue() : vExtTPL.getDefaultValue();

        if(vTPL.isKey()){
            if(vTPL.isPrimaryKey()){
                s += "PRIMARY KEY ";
            }/*
            // not supported by sqlite
            else if(vTPL.isForeignKey()) {
                s += "FOREIGN KEY ";
            }*/
        }

        if(vTPL.isUnique()){
            s += "UNIQUE "
        }

        if(def!==undefined){
            let b:string;

            if(t=='TEXT' && def!==null){
                b = `'${def}'`;
            }else{
                b = (def===null ? 'null' : def);
            }
            s+= `DEFAULT ${b} `;
        }

        if(vTPL.isNotNull()){
            s += "NOT NULL ";
        }

        return `"${vTPL.getName()}" ${t} ${s}`;
    }

    /**
     *
     * @param pTableName
     * @param pColumns
     * @param pOptions
     */
    _createTable(pTableName:string, pColumns:NodeProperty[], pOptions:any = {}):void{

        let c:string = "";
        let i = 0;
        let constraint = '';

        pColumns.map( (vTPL, vI:number) => {

            if(vTPL.isCompositeKey()){
                constraint += `"${vTPL.getName()}" ,`;;
            }

            if(vTPL.isNode()){
                if(!vTPL.isMultiple()){
                    c += this._declareColumnStmt(vTPL, vTPL.getNodeType().getPrimaryKey())+',';
                    i++;
                }
                return;
            }

            if(!vTPL.isVolatile()){
                c += this._declareColumnStmt(vTPL)+',';
                i++;
            }
        });

        if(i==0) throw new SqliteException("The table '"+pTableName+"' must have at least one column. ");

        c = c.slice(0, -1);

        const req = `CREATE TABLE ${pOptions.notExists? 'IF NOT EXISTS' : ''} "${pTableName}" ( ${c} ${constraint.length>0? ', PRIMARY KEY ('+constraint.slice(0,-1)+')': ''})`;


        Logger.debug('SqliteAPI : ',req);
        return this._db
            .exec(req);
    }


    _dropTable(pTableName:string, pOptions:any = {}):void{

        const req = `DROP TABLE ${pOptions.notExists? 'IF NOT EXISTS' : ''} "${pTableName}" `;

        Logger.debug('SqliteAPI : ',req);
        return this._db.exec(req);
    }

    /**
     *
     * @param pTableName
     * @param pColumns
     * @param pOptions
     */
    _alterTable(pTableName:string, pNewColumns:NodeProperty[],  pOptions:any = {add:true}):void{

        let c = "", col = "";
        let i = 0, o = -1;
        let ppt:NodeProperty = null;

        // diff properties
        for(let j=0; j<pNewColumns.length ; j++){
            ppt = pNewColumns[j];

            if(ppt.isCompositeKey()){
                // recreate table is required (flush data)
                this._dropTable( pTableName);
                this._createTable( pTableName, pNewColumns, pOptions);
                return;
            }

            if(pOptions.add){
                if(ppt.isNode()){
                    if(!ppt.isMultiple()){
                        col = this._declareColumnStmt(ppt, ppt.getNodeType().getPrimaryKey());
                    }
                }
                else if(!ppt.isVolatile()){
                    col = this._declareColumnStmt(ppt);
                }
                col = ` ADD COLUMN "${col}"`;
            }else{
                col = ` DROP COLUMN "${ppt.getName()}"`;
            }


            // add column
            c = `ALTER TABLE "${pTableName}" ${col}`;

            Logger.debug('SqliteAPI : ',c);
            this._db.exec(c);
        }
    }

    /**
     * To generate a prepare stamtent for insert
     *
     * @param pNodeType
     * @param pProperties
     * @private
     */
    _generateInsertSingle(pTableName:string,   pNodeType:NodeType, pProperties:string[] = []):string {
        let s:string = `INSERT INTO "${pTableName}" ( `;
        let p:string  = ' ) VALUES ( '
        let i = 0;
        pNodeType.getProperties().map( (vPpt:NodeProperty) => {

            if(vPpt.isVolatile() || vPpt.isMultiple()) return;

            if(pProperties.length>0){
                if(pProperties.indexOf(vPpt.getName())>-1){
                    i++
                    s += `"${vPpt.getName()}",`;
                    //p += '?,';
                    p += '@'+vPpt.getName()+','
                }
            }else{
                i++
                //p += '?,' ;
                p += '@'+vPpt.getName()+','
                s +=  `"${vPpt.getName()}",`;
            }
        });

        s = s.slice(0, -1);
        s = s+p.slice(0, -1)+' )';

        Logger.debug('SqliteAPI (_generateInsertSingle) : ',s);
        return s;
    }


    _extractKey( pObject:any, pNodeType:NodeType):any {
        if(pNodeType.hasCompositeKey()){
            const key = {};
            pNodeType.getCompositeKey().map( (p:NodeProperty, offset:number)=>{
                const pname = p.getName();
                if(p.isNode()){
                    key[pname] = pObject[pname];
                    if(key[pname] != null){
                        key[pname] = key[pname][p.getNodeType().getPrimaryKey().getName()];
                    }
                }else{
                    key[pname] = pObject[pname];
                }
            })
            return key;
        }else{
            return pObject[pNodeType.getPrimaryKey().getName()];
        }
    }

    _generateUpdateSingle(pTableName:string,  pNodeType:NodeType, pProperties:string[] = []):string {
        let s:string = `UPDATE  "${pTableName}" SET `;
        let i = 0;
        pNodeType.getProperties().map( (vPpt:NodeProperty) => {
            if(vPpt.isVolatile() || vPpt.isMultiple()) return;

            if(pProperties.length>0){
                if(pProperties.indexOf(vPpt.getName())>-1){
                    i++
                    s += `"${vPpt.getName()}" = @${vPpt.getName()} ,`; // vPpt.getName()+' = @'+vPpt.getName()+' ,';
                }
            }else{
                i++
                s +=  `"${vPpt.getName()}" = @${vPpt.getName()} ,`; // vPpt.getName()+' = @'+vPpt.getName()+' ,';
            }
        });
        s = s.slice(0,-1)+ ' WHERE '+this._generateWhereStmt(pNodeType);
        Logger.debug('SqliteAPI (_generateUpdateSingle) : ',s);
        return s;
    }

    /**
     *
     * @param pNodeType
     * @param pProperties
     * @param pAll
     * @private
     */
    _generateSelect(pTableName:string,  pNodeType:NodeType, pProperties:string[], pAll:boolean = false):string {
        let s:string = `SELECT `;
        let p:string  = ` FROM "${pTableName}" ${ !pAll ? 'WHERE '+this._generateWhereStmt(pNodeType):''} `;

        pNodeType.getProperties().map( (vPpt:NodeProperty) => {
            if(vPpt.isVolatile() || vPpt.isMultiple()) return;

            if(pProperties.length>0){
                if(pProperties.indexOf(vPpt.getName())>-1){
                    s +=  `"${vPpt.getName()}",`;
                }
            }else{
                s += `"${vPpt.getName()}",`;
            }
        });

        s = s.slice(0, -1)+p;

        Logger.debug('SqliteAPI (_generateSelect)('+(pAll?'all':'single')+') : ',s);
        return s;
    }

    /**
     * To generate a WHERE condition for the node keys
     *
     * @param pNodeType
     * @private
     */
    _generateWhereStmt(pNodeType:NodeType):string {
        let s:string = "";
        let keys:NodeProperty[] = []
        pNodeType.getProperties().map( (vPpt:NodeProperty) => {

            if(vPpt.isVolatile() || vPpt.isMultiple()) return;

            if(vPpt.isPrimaryKey()){
                keys.push(vPpt);
            }
            else if(vPpt.isCompositeKey()){
                keys[vPpt.getKeyOffset()] = vPpt;
            }
        });


        if(keys.length>0){

            for(let i=0; i<keys.length; i++ ){
                if(i>0) s += ' AND '
                s += `"${keys[i].getName()}" = @${keys[i].getName()}`; //keys[i].getName()+' = @'+keys[i].getName()+' ';
            }

        }else{
            throw new SqliteException("Remove using ROWID is not supported")
        }

        Logger.debug('SqliteAPI (where) : ',s);
        return s;
    }

    _generateRemoveSingle( pTableName:string, pNodeType:NodeType):string {
        return `DELETE FROM ${pTableName} WHERE ${this._generateWhereStmt(pNodeType)}`;
    }


    _generateSimplePreparedStmt( pTableName:string, pNodeType:NodeType):PreparedStatementList {
        const stmt:PreparedStatementList = {
            selectSingle: this._generateSelect(pTableName, pNodeType, [], false),
            selectAll: this._generateSelect(pTableName, pNodeType, [], true),
            insertSingle: this._generateInsertSingle(pTableName, pNodeType),
            removeSingle: this._generateRemoveSingle(pTableName, pNodeType),
            updateSingle: this._generateUpdateSingle(pTableName, pNodeType)
        }
        return stmt;
    }

    _generatePreparedStmt( pTableName:string, pNodeType:NodeType):PreparedStatementList {

        return this._generateSimplePreparedStmt( pTableName, pNodeType);
        /*
        if(pNodeType.hasExternalProperties()){
            const stmt:any = {
                selectSingle: {},
                selectAll: {},
                insertSingle: {},
                removeSingle: {},
                updateSingle: {},
            };

            pNodeType.getExternalProperties().map( (vPpt:NodeProperty)=>{
               const type = vPpt.getNodeType();
               stmt.selectSingle[vPpt.getName()] = this._generateSelect(type.getName(), type, [], false);
               stmt.selectAll[vPpt.getName()] = this._generateSelect(type.getName(), type, [], true);
                stmt.insertSingle[vPpt.getName()] = this._generateInsertSingle(type.getName(), type);
                stmt.removeSingle[vPpt.getName()] = this._generateRemoveSingle(type.getName(), type);
                stmt.updateSingle[vPpt.getName()] = this._generateUpdateSingle(type.getName(), type);
            });

            return stmt;
        }else{
            return this._generateSimplePreparedStmt( pTableName, pNodeType);
        }*/
    }

    /**
     * To insert save an instance of an object using its node type
     * definition and the template of the target table
     *
     * @param pInstance
     * @private
     */
    _insert(pInstance:any){

    }

    _execInsert( pStmt:any, pData:any):any{

        if(typeof pStmt === 'string'){

            Logger.debug("Exec _execInsert (simple) : "+pStmt+"\n"+JSON.stringify(pData));
            return this._db.prepare(pStmt).run(pData);
        }else{
            let res:any = {};
            for(const i in pStmt){
                Logger.debug("Exec _execInsert"+i+" (complex) : "+pStmt[i]+"\n"+JSON.stringify(pData[i]));
                res[i] = this._db.prepare(pStmt[i]).run(pData[i]);
            }
            return res;
        }
    }

    _execSelect( pStmt:any, pData:any):any {

        if(typeof pStmt === 'string'){

            Logger.debug("Exec _execSelect (simple) : "+pStmt+"\n"+JSON.stringify(pData));
            return this._db.prepare(pStmt).get(pData);
        }else{
            let res:any = {};
            for(const i in pStmt){
                Logger.debug("Exec _execSelect "+i+" (complex) : "+pStmt[i]+"\n"+JSON.stringify(pData[i]));
                res[i] = this._db.prepare(pStmt[i]).get(pData[i]);
            }
            return res;
        }
    }

    _execSelectAll( pStmt:any, pData:any):any {

        if(typeof pStmt === 'string'){

            Logger.debug("Exec _execSelectAll (simple) : "+pStmt+"\n");
            const d = this._db.prepare(pStmt).all();
            //Logger.info(JSON.stringify(d));
            return d;
        }else{
            let res:any = {};
            for(const i in pStmt){
                Logger.debug("Exec _execSelectAll "+i+" (complex) : "+pStmt[i]);
                res[i] = this._db.prepare(pStmt[i]).all();
            }
            return res;
        }
    }

    _execSelectAllNoData( pStmt:any):any {

        if(typeof pStmt === 'string'){

            Logger.debug("Exec _execSelectAllNoData (simple) : "+pStmt);
            return this._db.prepare(pStmt).all();
        }else{
            let res:any = {};
            for(const i in pStmt){
                Logger.debug("Exec _execSelectAllNoData"+i+" (complex) : "+pStmt[i]);
                res[i] = this._db.prepare(pStmt[i]).all();
            }
            return res;
        }
    }
}