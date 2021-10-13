import {Database} from "better-sqlite3";
import {DbDataType, DbSerialize} from "../../src/persist/orm/DbAbstraction";
import {NodeProperty} from "../../src/persist/orm/NodeProperty";
import {NodeType} from "../../src/persist/orm/NodeType";
import {SqliteException} from "./SqliteException";
import * as Log from "../../src/Logger";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface PreparedStatementList {
    selectSingle :string,
    selectAll :string,
    insertSingle :string,
    updateSingle :string,
    removeSingle :string,
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
     * To extract a list of bind params from a node instance
     *
     * @param pObject
     * @param pProperties
     * @param pSubset
     * @private
     */
    _extractParams( pObject:any, pProperties:NodeProperty[], pSubset:string[] = null):any{

        const pars:any = {};
        pProperties.map( (vPPT:NodeProperty) => {
            if(vPPT.isVolatile()) return;
            if(pSubset != null && pSubset.indexOf(vPPT.getName())==-1) return;

            const name = vPPT.getName();
            if(vPPT.isNode()){
                if(! vPPT.isMultiple()){
                    if(pObject[name] != null){
                        pars[name] = pObject[name][
                            vPPT.getNodeType()
                                .getPrimaryKey()
                                .getName()];
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
                }else{
                    pars[name] = pObject[name];
                }
            }
        });

        return pars;
    }

    /**
     * To get the list of existing tables
     *
     * @return {any[]} A list of table names
     * @method
     */
    _getTables():any[] {
        return this._db
            .prepare("SELECT name FROM sqlite_master WHERE type =? AND name NOT LIKE ?")
            .all('table','sqlite_%');
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


    _declareColumnStmt( vTPL:NodeProperty): string {
        let s:string = "";
        const t = this._getTypes(vTPL.getType());
        const def = vTPL.getDefaultValue();

        if(vTPL.isKey()){
            if(vTPL.isPrimaryKey()){
                s += "PRIMARY KEY ";
            }else if(vTPL.isForeignKey()) {
                s += "FOREIGN KEY ";
            }
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

        return `${vTPL.getName()} ${this._getTypes(vTPL.getType())} ${s}`;
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

        pColumns.map( (vTPL, vI:number) => {
            if(!vTPL.isVolatile()){
                c += this._declareColumnStmt(vTPL)+',';
                i++;
            }
        })

        if(i==0) throw new SqliteException("The table '"+pTableName+"' must have at least one column. ");

        c = c.slice(0, -1);

        const req = `CREATE TABLE ${pOptions.notExists? 'IF NOT EXISTS' : ''} "${pTableName}" ( ${c} )`;


        Logger.debug('SqliteAPI : ',req);
        return this._db
            .exec(req);
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

            if(vPpt.isVolatile()) return;

            if(pProperties.length>0){
                if(pProperties.indexOf(vPpt.getName())>-1){
                    i++
                    s += vPpt.getName()+',';
                    //p += '?,';
                    p += '@'+vPpt.getName()+','
                }
            }else{
                i++
                //p += '?,' ;
                p += '@'+vPpt.getName()+','
                s += vPpt.getName()+',';
            }
        });

        s = s.slice(0, -1);
        s = s+p.slice(0, -1)+' )';

        Logger.debug('SqliteAPI (_generateInsertSingle) : ',s);
        return s;
    }

    _generateUpdateSingle(pTableName:string,  pNodeType:NodeType, pProperties:string[] = []):string {
        let s:string = `UPDATE  "${pTableName}" SET `;
        let i = 0;
        pNodeType.getProperties().map( (vPpt:NodeProperty) => {
            if(vPpt.isVolatile()) return;

            if(pProperties.length>0){
                if(pProperties.indexOf(vPpt.getName())>-1){
                    i++
                    s += vPpt.getName()+' = @'+vPpt.getName()+' ,';
                }
            }else{
                i++
                s += vPpt.getName()+' = @'+vPpt.getName()+' ,';
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
            if(vPpt.isVolatile()) return;

            if(pProperties.length>0){
                if(pProperties.indexOf(vPpt.getName())>-1){
                    s += vPpt.getName()+',';
                }
            }else{
                s += vPpt.getName()+',';
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

            if(vPpt.isVolatile()) return;

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
                s += keys[i].getName()+' = @'+keys[i].getName()+' ';
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

    _generatePreparedStmt( pTableName:string, pNodeType:NodeType):PreparedStatementList {
        const stmt:PreparedStatementList = {
            selectSingle: this._generateSelect(pTableName, pNodeType, [], false),
            selectAll: this._generateSelect(pTableName, pNodeType, [], true),
            insertSingle: this._generateInsertSingle(pTableName, pNodeType),
            removeSingle: this._generateRemoveSingle(pTableName, pNodeType),
            updateSingle: this._generateUpdateSingle(pTableName, pNodeType)
        }
        return stmt;
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

    _execInsert( pStmt:string, pData:any):any{
        Logger.debug("Exec _execInsert : "+pStmt+"\n"+JSON.stringify(pData));
        return this._db.prepare(pStmt).run(pData);
    }

    _execSelect( pStmt:string, pData:any):any {
        Logger.debug("Exec _execSelect : "+pStmt+"\n"+JSON.stringify(pData));
        return this._db.prepare(pStmt).get(pData);
    }

    _execSelectAll( pStmt:string, pData:any):any {
        Logger.debug("Exec _execSelectAll : "+pStmt+"\n"+JSON.stringify(pData));
        this._db.prepare(pStmt).all(pData)
    }

    _execSelectAllNoData( pStmt:string):any {
        Logger.debug("Exec _execSelectAllNoData : "+pStmt+"\n");
        this._db.prepare(pStmt).all()
    }
}