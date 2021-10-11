import {Database} from "better-sqlite3";
import SqliteDbCollection from "./SqliteDbCollection";
import {DbColumnTemplate} from "../../src/persist/orm/DbColumnTemplate";
import {DbDataType} from "../../src/persist/orm/DbAbstraction";
import {NodeProperty} from "../../src/persist/orm/NodeProperty";
import {NodeType} from "../../src/persist/orm/NodeType";
import {SqliteException} from "./SqliteException";

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
                b = `"${def}"`;
            }else{
                b = (def===null ? 'null' : def);
            }
            s+= `DEFAULT "${b}" `;
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

        pColumns.map( (vTPL) => {
            if(!vTPL.isVolatile()){
                c += this._declareColumnStmt(vTPL)+',';
            }
        })

        return this._db
            .prepare(`CREATE TABLE ${pOptions.notExists? 'IF NOT EXISTS' : ''} ${pTableName} ( ${c} )`)
            .run();
    }

    /**
     * To generate a prepare stamtent for insert
     *
     * @param pNodeType
     * @param pProperties
     * @private
     */
    _generateInsertSingle(pTableName:string,   pNodeType:NodeType, pProperties:string[] = []):string {
        let s:string = `INSERT INTO ${pTableName} ( `;
        let p:string  = ') VALUES ( '
        let i = 0;
        pNodeType.getProperties().map( (vPpt:NodeProperty) => {

            if(vPpt.isVolatile()) return;

            if(pProperties.length>0){
                if(pProperties.indexOf(vPpt.getName())>-1){
                    i++
                    s += vPpt.getName()+(i<pProperties.length ? ', ' : ' ');
                    p += (i<pProperties.length ? '? , ' : '? ');
                }
            }else{
                i++
                p += (i<pProperties.length ? '? , ' : '? ');
                s += vPpt.getName()+(i<pNodeType.getProperties().length ? ', ' : ' ');
            }
        });
        return s+p+')';
    }

    _generateUpdateSingle(pTableName:string,  pNodeType:NodeType, pProperties:string[] = []):string {
        let s:string = `UPDATE  ${pTableName} SET `;
        let p:string  = ') VALUES ( '
        let i = 0;
        pNodeType.getProperties().map( (vPpt:NodeProperty) => {
            if(vPpt.isVolatile()) return;

            if(pProperties.length>0){
                if(pProperties.indexOf(vPpt.getName())>-1){
                    i++
                    s += vPpt.getName()+(i<pProperties.length ? ' = ? , ' : ' = ? ');
                }
            }else{
                i++
                s += vPpt.getName()+(i<pNodeType.getProperties().length ? ' = ? , ' : ' = ? ');
            }
        });
        return s+' WHERE '+this._generateWhereStmt(pNodeType);
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
        let p:string  = ` FROM ${pTableName} ${pAll ? 'WHERE '+this._generateWhereStmt(pNodeType):''} `;

        let i = 0;
        pNodeType.getProperties().map( (vPpt:NodeProperty) => {
            if(vPpt.isVolatile()) return;

            if(pProperties.length>0){
                if(pProperties.indexOf(vPpt.getName())>-1){
                    i++
                    s += vPpt.getName()+(i<pProperties.length ? ', ' : ' ');
                }
            }else{
                i++
                s += vPpt.getName()+(i<pNodeType.getProperties().length ? ', ' : ' ');
            }
        });
        return s+p;
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
                s += keys[i].getName()+' = ? ';
            }

        }else{
            throw new SqliteException("Remove using ROWID is not supported")
        }
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
        return this._db.prepare(pStmt).run(pData);
    }

    _execSelect( pStmt:string, pData:any):any {
        return this._db.prepare(pStmt).get(pData);
    }

    _execSelectAll( pStmt:string, pData:any):any {
        this._db.prepare(pStmt).all(pData)
    }
}