import {
    Comparison, InnerjoinOperationArgs, MerlinSearchRequest, NestedRequestOperationArgs,
    Operation,
    OperationType,
    SearchOperationArgs,
    TimeOperationArgs, WindowingOperationArgs
} from "../../src/search/MerlinSearchRequest.js";
import InMemoryDbCollection from "./InMemoryDbCollection.js";
import InMemoryDbIndex from "./InMemoryDbIndex.js";
import {IDbIndex} from "@dexcalibur/dexcalibur-orm";
import Util from "../../src/Utils.js";

/**
 * Represent an unique backend to process Merlin request in index and collection
 * @class
 */
export class InMemoryMerlinBackend {

    dataset:InMemoryDbCollection|InMemoryDbIndex;

    constructor( pDataSet:InMemoryDbCollection|InMemoryDbIndex) {
        this.dataset = pDataSet;
    }

    /**
     * To create a comparison function according to every conditions contained in to
     * a single phase
     *
     * @param {Operation[]} pOperations
     * @private
     */
    private _createComparisonFunction(pOperations: Operation[]): ((pData: any) => boolean) {


        return (vData: any) => {

            let i = 0;
            let op: Operation;
            let match = true;
            let searchArgs:SearchOperationArgs, timeArgs:TimeOperationArgs;


            while (i < pOperations.length) {
                op = pOperations[i];
                //console.log(JSON.stringify(op));
                switch (op.type) {
                    case OperationType.FILTER:
                    case OperationType.SEARCH:
                        searchArgs = op.args as SearchOperationArgs;
                        if (searchArgs.pattern.opts?.strict) {
                            match = match
                                && (Util.readValue(vData, searchArgs.pattern.field)
                                    === searchArgs.pattern.pattern);
                        } else {
                            match = match && searchArgs.pattern.test(vData);
                        }
                        i++
                        break;
                    case OperationType.TIME:
                        timeArgs = op.args as TimeOperationArgs;
                        switch (timeArgs.comparison) {
                            case Comparison.LTE:
                                match = match && ((new Date(vData[timeArgs.field])).getTime() <= timeArgs.date);
                                break;
                            case Comparison.GTE:
                                match = match && ((new Date(vData[timeArgs.field])).getTime() >= timeArgs.date);
                                break;
                            case Comparison.LT:
                                match = match && ((new Date(vData[timeArgs.field])).getTime() < timeArgs.date);
                                break;
                            case Comparison.GT:
                                match = match && ((new Date(vData[timeArgs.field])).getTime() > timeArgs.date);
                                break;
                            case Comparison.EQ:
                                match = match && ((new Date(vData[timeArgs.field])).getTime() == timeArgs.date);
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
            return match;
        }
    }

    /**
     * Perform a Merlin request over the collection of node
     *
     * @param {MerlinSearchRequest} pRequest
     * @param pResult
     * @private
     */
    private _search(pRequest: MerlinSearchRequest, pResult: IDbIndex): any {

        const result: any = {
            completed: true,
            results: [],
            newLimit: -1
        };


        const phases = pRequest.getPhases();
        let matchFn: (v: any) => boolean;

        let phaseRes: any[] = [this.dataset.getAsList()];
        let tmpRes:any[];
        for (let i = 0; i < phases.length; i++) {

            switch (phases[i][0].type) {
                case OperationType.UNION:
                    phaseRes[i] = this._search((phases[i][0].args as NestedRequestOperationArgs).request as MerlinSearchRequest, pResult);
                    phaseRes[i] = phaseRes[i - 1].concat(phaseRes[i]);
                    break;
                case OperationType.INTERSECT:
                    phaseRes[i] = this._search((phases[i][0].args as NestedRequestOperationArgs).request as MerlinSearchRequest, pResult);

                    break;
                case OperationType.JOIN:
                    phaseRes[i] = this._search((phases[i][0].args as NestedRequestOperationArgs).request as MerlinSearchRequest, pResult);
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
                    matchFn = this._createComparisonFunction(phases[i]);
                    tmpRes = [];

                    if(phaseRes[i]!=null){
                        phaseRes[i].map((vEntry: any) => {
                            if(matchFn.call(null,vEntry)){
                                tmpRes.push(vEntry);
                            }
                        });
                    }

                    phaseRes[i] = tmpRes;
                    break;
            }

        }
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
    search(pRequest: MerlinSearchRequest, pResult: IDbIndex): IDbIndex {

        // search is line in cache satisfies the request
        let result: any[] = [];
        let continueSearch = true;

        const res = this._search(pRequest, pResult);
        if (res.results.length > 0) {
            result = res.results;
        }

        // update result index
        result.map((x: any, o: number) => {
            pResult.setEntry(o, x)
        });

        return  pResult;
    }
}