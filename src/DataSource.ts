import {NodeType} from "./persist/orm/NodeType.js";
import {DataSourceException} from "./errors/DataSourceException.js";
import DexcaliburProject from "./DexcaliburProject.js";
import * as Log from "./Logger.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class DataSource {

    name:string;
    private _fn:any = null;
    private _handlers:any = {};

    constructor( pName:string, pFind:any) {
        this.name = pName;
        this._fn = pFind;
    }

    getQueryFn():any {
        return this
    }

    /*
     *
     * @param pNodeType {string}
     * @private
     */
    /*private _getHandler( pNodeType:NodeType):any {
        const h = this._handlers[pNodeType.getName()];
        if(h == null){
            throw DataSourceException.NO_HANDLER_DEFINED(pNodeType.getName())
        }

        return h;
    }*/

    /**
     * To find instance for 1 node by using its UID
     *
     * @param pNodeType
     * @param pProject
     * @param pUID
     */
    find( pNodeType:NodeType, pProject:DexcaliburProject, pUID:any):any{
        if(pUID == null) return null;

        return this._fn.single.call( null, pProject, pNodeType, pUID);
    }


    /**
     * To find all instances with specified UIDs
     *
     * @param pNodeType
     * @param pProject
     * @param pUID
     */
    findMult( pNodeType:NodeType,  pProject:DexcaliburProject, pUID:any[]):any{

        if(pUID == null || pUID.length == 0) return [];

        if(this._fn.multi != null){
            return (this._fn.multi.call( null, pProject, pNodeType)).call( null, pUID);
        }else{
            const entries:any = [];
            const find1 = this._fn.single.call( null, pProject, pNodeType, pUID);

            pUID.map( (vUID:any)=>{
                entries.push( find1.call(null, vUID) );
            });

            return entries;
        }
    }

    register( pNodeType:NodeType, pExtra:any):void{
        this._handlers[pNodeType.getName()] = pExtra;
    }
}