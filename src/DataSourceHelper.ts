import {DataSource} from "./DataSource.js";
import DexcaliburProject from "./DexcaliburProject.js";
import {NodeType} from "@dexcalibur/dexcalibur-orm";
import * as Log from "./Logger.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export class DataSourceHelper {

    static MEM:DataSource = (new DataSource("mem",{
        single: function(pProject:DexcaliburProject, pNodeType:NodeType, pUID:any):any{
            Logger.debug("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
            const o = pProject.getSearchEngine().get[pNodeType.getSourceAlias()](pUID);

            Logger.debug("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
            return o;
        }
    }));

    static FILE:DataSource = new DataSource("fs",{
        single: function(pProject:DexcaliburProject, pNodeType:NodeType, pUID:any):any{
            throw new Error("FILE datasource is deprecated. ");

            Logger.debug("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
            const o = pProject.getDB().getCollectionOf(pNodeType.getType()).getEntry(pUID);
            Logger.debug("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
            return o;
        }
    });
}