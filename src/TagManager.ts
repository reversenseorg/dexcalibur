import {ConnectorDb, ConnectorFactory, IDatabase, IDatabaseAdapter, IDbCollection} from "./ConnectorFactory";
import DexcaliburProject from "./DexcaliburProject";
import {Tag} from "./Tag";


export class TagManager {

    _db:IDbCollection;

    constructor(pContext:DexcaliburProject) {
        this._db = pContext.connector.getDB().getCollection("tags");
    }

    getTag( pName:string ):Tag {
        return this._db.getEntry(pName);
    }


    addTag( pTag:Tag):void {

        this._db.addEntry(pTag.label, pTag);
    }
}