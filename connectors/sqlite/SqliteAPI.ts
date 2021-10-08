import {Database} from "better-sqlite3";
import SqliteDbCollection from "./SqliteDbCollection";
import {DbColumnTemplate} from "../../src/persist/orm/DbColumnTemplate";
import {DbDataType} from "../../src/persist/orm/DbAbstraction";
import {NodeProperty} from "../../src/persist/orm/NodeProperty";


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
            c += this._declareColumnStmt(vTPL)+',';
        })

        return this._db
            .prepare(`CREATE TABLE ${pOptions.notExists? 'IF NOT EXISTS' : ''} ${pTableName} ( ${c} )`)
            .run();
    }
}