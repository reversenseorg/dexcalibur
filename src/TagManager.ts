
import DexcaliburProject from "./DexcaliburProject";
import {Tag} from "./Tag";
import {IDbCollection} from "./persist/orm/DbAbstraction";


export class TagManager {

    _db:IDbCollection;

    constructor(pContext:DexcaliburProject) {
        this._db = pContext.connector.getDB().getCollection("tags", null);
    }

    getTag( pName:string ):Tag {
        return this._db.getEntry(pName);
    }


    addTag( pTag:Tag):void {

        this._db.addEntry(pTag.label, pTag);
    }
}