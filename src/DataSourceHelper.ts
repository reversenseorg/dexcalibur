import {DataSource} from "./DataSource.js";
import DexcaliburProject from "./DexcaliburProject.js";
import {NodeType} from "./persist/orm/NodeType.js";
import * as Log from "./Logger.js";
import {NodeInternalType} from "./NodeInternalType.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export class DataSourceHelper {

    static MEM:DataSource = (new DataSource("mem",{
        single: function(pProject:DexcaliburProject, pNodeType:NodeType, pUID:any):any{
            Logger.debug("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
            const o = pProject.getSearchEngine().get[pNodeType.getSourceAlias()](pUID);

            /*
            if(o == null && pNodeType.getType()===NodeInternalType.FUNC){
                // function not exists because r2 must be re-opened
                if(/^[A-Z]+:[0-9a-f]+:.+$/.test(pUID)){
                    pProject.getAnalyzer().getNativeAnalyzer().analyzeFile(
                         pProject.getSearchEngine().get.files( pUID.substr(0, pUID.lastIndexOf(':'))),
                    )
                }
            }*/

            Logger.debug("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
            return o;
        }
    }));

    static FILE:DataSource = new DataSource("fs",{
        single: function(pProject:DexcaliburProject, pNodeType:NodeType, pUID:any):any{
            Logger.debug("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
            const o = pProject.getDB().getCollection(pNodeType.getSourceAlias(),pNodeType).getEntry(pUID);
            Logger.debug("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
            return o;
        }
    });
}