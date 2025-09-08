import {
    Comparison, MerlinSearchRequest, NestedRequestOperationArgs,
    Operation,
    OperationType,
    SearchOperationArgs,
    TimeOperationArgs, WindowingOperationArgs
} from "../search/MerlinSearchRequest.js";
import Util from "../Utils.js";
import {IDbIndex, INode, NodeProperty, NodeType, TagUUID} from "@dexcalibur/dexcalibur-orm";
import {MongodbDbCollection, MongodbDbIndex} from "@dexcalibur/dexcalibur-orm-mongodb";
import {SearchRequestCondition} from "../search/SearchRequestCondition.js";
import {TagManager} from "../tags/TagManager.js";
import {NodeInternalTypeName, Nullable} from "@dexcalibur/dxc-core-api";
import {MerlinSearchRequestException} from "../search/error/MerlinSearchRequestException.js";
import {EngineDatabase} from "./EngineDatabase.js";
import {ProjectDatabase} from "./ProjectDatabase.js";
import ModelStringValue from "../ModelStringValue.js";


interface InternalJoinStep {
    type: NodeType,
    on: {
        type: NodeType,
        field: string,
        ppt: NodeProperty
    }
}

/**
 * Represent an unique backend to process Merlin request in index and collection
 * @class
 */
export class MongoDbMerlinBackend {

    private _tm:TagManager;
    private _db:EngineDatabase|ProjectDatabase;

    constructor(  pTagMgr:TagManager) {
        this._tm = pTagMgr;
    }

    setDB(pDB:EngineDatabase|ProjectDatabase):void {
        this._db = pDB;
    }

    /**
     * To create a comparison function according to every conditions contained in to
     * a single phase
     *
     * @param {Operation[]} pOperations
     * @private
     */
    private async _executeSearchOrFilter(pOperations: Operation[], pType:string|NodeType): Promise<INode[]> {

        let type:NodeType;
        if(typeof pType==="string"){

            if(pType==="strings"){
                type = ModelStringValue.TYPE;
            }else{
                // search node
                type = NodeType.getTypeByName(pType);
            }

            //type = NodeType.getTypeByName(pType);
        }else{
            type = pType;
        }


        let i = 0;
        let op: Operation;
        let match = true;
        let searchArgs:SearchOperationArgs, timeArgs:TimeOperationArgs;

        let filter:any = {};
        let filters:Record<string,any> = {"$and":[]};
        let field:string, coll:MongodbDbCollection, join:InternalJoinStep, results:any[] = [];
        let parts:string[], currType:NodeType, currPpt:NodeProperty, joins:InternalJoinStep[], finalField:Nullable<string>;
        let cs:SearchRequestCondition;

        while (i < pOperations.length) {
            op = pOperations[i];
            //console.log(JSON.stringify(op));
            switch (op.type) {
                case OperationType.FILTER:
                case OperationType.SEARCH:
                    searchArgs = op.args as SearchOperationArgs;

                    // check if target property is property of current node
                    // or another node.

                    currType = type;
                    joins = [];
                    finalField = null;

                    cs = searchArgs.pattern[0];

                    if(cs.field!=null && cs.field!=""){
                        parts = cs.getFieldParts();

                        // search and execute required requests (join)
                        for(let i=0;i<parts.length;i++){
                            try{
                                currPpt = currType.getProperty(parts[i]);
                                if(currPpt.isNode()){
                                    // require inner-join-like request
                                    joins.push({
                                        type: currPpt.getNodeType(),
                                        on: {
                                            type: currType,
                                            field: parts[i],
                                            ppt: currPpt
                                        }
                                    });
                                    currType = currPpt.getNodeType();
                                }else{
                                    if(finalField==null)
                                        finalField = parts[i];
                                    else
                                        finalField += '.'+parts[i];
                                }
                            }catch(e){
                                console.error(e);
                            }
                        }
                        
                        // condition must be applied on mostly nested field, 
                        // results at initial depth is retrieved by successive innerjoin from previous result
                    }



                    // prepare filters
                    if(cs.hasTag()==true){
                        if(cs.isNested()){
                            field = /*cs.field*/finalField+"._tags";
                        }else{
                            field = "_tags";
                        }

                        filters["$and"].push({ [field]: {
                                $in: await this._tm.searchTags(cs.tagKey)
                            }
                        });

                        if(cs.isTagOnly()){
                            i++;
                            continue;
                        }
                    }

                    field = finalField; //cs.field;


                    if (cs.isRegExp()) {
                        //filters[cs.field].push({ [cs.field]: cs.pattern })


                        filters['$and'].push({ [field]: { $regex: cs.getRegExpPattern() }});
                        /*filter[cs.field] = {
                            [cs.field]: cs.pattern
                        };
                        /*match = match
                            && (Util.readValue(vData, cs.field)
                                === cs.pattern);*/
                    } else {
                        filters['$and'].push({ [field]: cs.pattern })
                        //match = match && cs.test(vData);
                        //filters[cs.field].push({ $regex: cs.getRegExpPattern() });

                    }


                    // example : method('enclosingClass.name:/toto/')
                    // 'enclosingClass' property from ModelMethod node is a ModelClass Node,
                    // and 'name' is a direct primitive property of ModelClass
                    // in this example, there are 2 requests :
                    //   - the 1st is search 'name:/toto/' on collection of ModelClass
                    //   - the 2nd is to search ModelMethod where the value of 'enclosingCLass' is a part of the list
                    //     of previously found ModelClass
                    // condition is applied on mostly nested fields
                    coll = this._db.getCollectionOf(currType.getType()) as MongodbDbCollection;
                    results = await coll.search({
                        filter: filters
                    },{ raw:true });


                    //
                    if(joins.length>0){
                        while((join = joins.pop())!=null){
                            coll = this._db.getCollectionOf(join.on.type.getType()) as MongodbDbCollection;
                            results = await coll.search({
                                filter: {
                                    [join.on.ppt.getName()]:  {
                                        $in: results.map(x => x.getUID())
                                    }
                                }
                            },{ raw:true });
                        }
                    }

                    i++;
                    continue;
                    break;
                case OperationType.TIME:
                    timeArgs = op.args as TimeOperationArgs;
                    switch (timeArgs.comparison) {
                        case Comparison.LTE:
                            filter[timeArgs.field] = { $lte: timeArgs.date  };
                            //match = match && ((new Date(vData[timeArgs.field])).getTime() <= timeArgs.date);
                            break;
                        case Comparison.GTE:
                            filter[timeArgs.field] = { $gte: timeArgs.date  };
                            //match = match && ((new Date(vData[timeArgs.field])).getTime() >= timeArgs.date);
                            break;
                        case Comparison.LT:
                            filter[timeArgs.field] = { $lt: timeArgs.date  };
                            //match = match && ((new Date(vData[timeArgs.field])).getTime() < timeArgs.date);
                            break;
                        case Comparison.GT:
                            filter[timeArgs.field] = { $gt: timeArgs.date  };
                            //match = match && ((new Date(vData[timeArgs.field])).getTime() > timeArgs.date);
                            break;
                        case Comparison.EQ:
                            filter[timeArgs.field] = { $eq: timeArgs.date  };
                            //match = match && ((new Date(vData[timeArgs.field])).getTime() == timeArgs.date);
                            break;
                    }
                    i++
                    break;
                default:
                    // stop comparison : that means non-compressible operation has been reach (aggregation, filter, limit, ...)
                    i = pOperations.length;
                    break;
            }
        }

        return results;
    }

    /**
     * Perform a Merlin request over the collection of node
     *
     * @param {MerlinSearchRequest} pRequest
     * @param pResult
     * @private
     */
    private async  _search(pRequest: MerlinSearchRequest, pResult: IDbIndex): Promise<any> {

        const result: any = {
            request: null,
            completed: true,
            results: [],
            newLimit: -1
        };


        const phases = pRequest.getPhases();
        let matchFilter: any;

        let phaseRes: any[] = [];

        let tmpRes:any;
        for (let i = 0; i < phases.length; i++) {

            switch (phases[i][0].type) {
                case OperationType.UNION:
                    phaseRes[i] = await this._search((phases[i][0].args as NestedRequestOperationArgs).request as MerlinSearchRequest, pResult);
                    phaseRes[i] = phaseRes[i - 1].concat(phaseRes[i]);
                    break;
                case OperationType.INTERSECT:
                    phaseRes[i] = await this._search((phases[i][0].args as NestedRequestOperationArgs).request as MerlinSearchRequest, pResult);

                    break;
                case OperationType.JOIN:
                    phaseRes[i] = await this._search((phases[i][0].args as NestedRequestOperationArgs).request as MerlinSearchRequest, pResult);

                    break;
                case OperationType.INNERJOIN:
                    phaseRes[i] = [];

                    phaseRes[i-1].map(x => {
                        let ppt:string;

                        if(typeof (phases[i][0].args as any).on=="string" ){
                            ppt = (phases[i][0].args as any).on;
                        }else{
                            ppt = (phases[i][0].args as any).on.getName();
                        }



                        const children = x[ppt];
                        if(children!=null){
                            if(Array.isArray(children)){
                                phaseRes[i] = phaseRes[i].concat(children);
                            }else{
                                phaseRes[i].push(children);
                            }
                        }
                    });
                    break;
                case OperationType.AGGR:
                    //throw CacheException.DENY_SEARCH_WITH_AGGREGATE();
                    break;
                case OperationType.SIZE:
                    if((phases[i][0].args as WindowingOperationArgs ).offset>0){
                        phaseRes[i] = phaseRes[i-1].slice((phases[i][0].args as WindowingOperationArgs ).offset);
                    }else{
                        phaseRes[i] = phaseRes[i-1];
                    }

                    phaseRes[i] = phaseRes[i].slice(0, (phases[i][0].args as WindowingOperationArgs ).limit);
                    break;
                default:
                    phaseRes[i] = await this._executeSearchOrFilter(phases[i], pRequest.getNode());
                    /*
                    tmpRes = {};

                    if(phaseRes[i]!=null){
                        if(phaseRes[i].filter==null){
                            phaseRes[i].filter = {};
                        }
                        for(let k in matchFilter){
                            phaseRes[i].filter[k] = matchFilter[k];
                        }
                    }else{
                        phaseRes[i] = {filter: matchFilter};
                    }*/
                    break;
            }



        }

        console.log(pRequest.toSearchString());
        //console.log(JSON.stringify(phaseRes));

        result.request = phaseRes;
        result.results = phaseRes.pop();
        result.completed = true;


        return result;
    }

    /**
     * To perform search over the dataset using Merlin requests
     *
     * @param pRequest
     * @param pResult
     */
    async search(pRequest: MerlinSearchRequest, pResult: IDbIndex): Promise<IDbIndex> {

        // search is line in cache satisfies the request
        let result: any[] = [];
        let continueSearch = true;

        const res = await this._search(pRequest, pResult);
        if (res.results.length > 0) {
            result = res.results;
        }

        // update result index
        result.map((x: any, o: number)  => {
            pResult.setEntry(o, x)
        });

        return  pResult;
    }

    private async _executeRequests(pType: NodeType, pFieldPath: string, pFilter:Record<string,any[]>) {

        const parts = pFieldPath.split(SearchRequestCondition.FIELD_TOK);
        let localPath:string[] = [];
        let steps:{ node:NodeType, path:string }[] = [];
        let ppt:NodeProperty;

        for(let i=0; i<parts.length; i++){
            ppt = pType.getProperty(parts[i]);
            if(ppt==null){
                throw MerlinSearchRequestException.INVALID_NODE_PPT(parts[i], pType);
            }
            if(!ppt.isNode() || ppt.isEmbedded()){
                localPath.push(parts[i]);
            }else{
                steps.push({
                    node: ppt.getNodeType(),
                    path:localPath.join('.')
                });
                localPath = [];
            }
        }

        let res:INode[];
        for(let i=steps.length-1; i>=0; i--){
            if(i==0){
                res = await this._db.getCollectionOf(steps[i].node.getType()).search({
                    filter: {
                        [steps[i].path]: pFilter[steps[i].path]
                    }
                },{raw:true,merlin:false});
            }else if(res.length>0){
                res = await this._db.getCollectionOf(steps[i].node.getType()).search({
                    filter: {
                        [steps[i].path]: { $in: res.map(x => x.getUID()) }
                    }
                });
            }
        }

        return res;
    }
}