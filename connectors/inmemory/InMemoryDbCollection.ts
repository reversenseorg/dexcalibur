/**
 * Represent a collection of object indexed by key
 *
 * @author Georges-B. MICHEL
 * @class
 */
import SerializedObject from "./SerializedObject.js";
import {IDbCollection, IDbIndex} from "../../src/persist/orm/DbAbstraction.js";
import {Comparison, MerlinSearchRequest, Operation, OperationType } from "../../src/search/MerlinSearchRequest.js";
import {SearchRequestCondition} from "../../src/search/SearchRequestCondition.js";


export default class InMemoryDbCollection implements IDbCollection
{
    static __type:string = "Collection";

    name:string = null;
    ctr:number = 0;
    values:any = {};
    _db:any;

    constructor(name:string = null){
        this.name = name;
        this.ctr = 0;
    }

    setEntry(key:string,value:any){
        if(!this.hasEntry(key)){
            this.ctr++;
        }
        this.values[key] = value;
    }

    addEntry(key:string,value:any){
        this.setEntry(key,value);
    }

    updateEntry(value:any):any{
        throw new Error('Update : Operation not supported.');
    }



    getEntry(key:string):any{
        return this.values[key];
    }


    getAsList():any[] {
        return Object.values(this.values);
    }

    getAll():any{
        return this.values;
    }

    hasEntry(key:string):boolean{
        return (this.values[key] !== undefined);
    }

    map(fn:any){
        for(let k in this.values){
            fn(k,this.values[k]);
        }
    }

    isCollection(){
        return true;
    }

    isIndex():boolean{
        return false;
    }

    size():number{
        return this.ctr;
    }


    removeEntry(key: any): boolean {
        return (delete this.values[key]);
    }

    toJsonObject():any{
        let o:any= {};

        o.name = this.name;
        o.ctr = this.ctr;
        o.values = {};
        for(let i in this.values){
            if(typeof this.values[i].toJsonObject === 'function')
                o.values[i]=this.values[i].toJsonObject();
            else
                o.values[i]=this.values[i];
        }

        return o;
    }


    private _createComparisonFunction(pOperations: Operation[]): ((pData: any) => boolean) {


        return (vData: any) => {

            console.log(vData);

            let i = 0;
            let op: Operation;
            let match = true;
            const fields = vData.fields;
            while (i < pOperations.length) {
                op = pOperations[i];
                switch (op.type) {
                    case OperationType.FILTER:
                    case OperationType.SEARCH:
                        if (op.args.opts.strict) {
                            match = match && (vData === op.args.pattern);
                        } else {
                            match = match && (op.args.pattern as SearchRequestCondition).test(vData);
                        }
                        break;
                    case OperationType.TIME:


                        switch (op.args.comparison) {
                            case Comparison.LTE:
                                match = match && ((new Date(fields[op.args.field])).getTime() <= op.args.date);
                                break;
                            case Comparison.GTE:
                                match = match && ((new Date(fields[op.args.field])).getTime() >= op.args.date);
                                break;
                            case Comparison.LT:
                                match = match && ((new Date(fields[op.args.field])).getTime() < op.args.date);
                                break;
                            case Comparison.GT:
                                match = match && ((new Date(fields[op.args.field])).getTime() > op.args.date);
                                break;
                            case Comparison.EQ:
                                match = match && ((new Date(fields[op.args.field])).getTime() == op.args.date);
                                break;
                        }
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

    private _searchInCacheStore(pRequest: MerlinSearchRequest, pResult: IDbIndex): any {

        const result: any = {
            completed: true,
            results: [],
            newLimit: -1
        };


        const phases = pRequest.getPhases();
        let matchFn: (v: any) => boolean;

        // walk over cache
        let phaseRes: any[] = [this.getAll()];

        for (let i = 0; i < phases.length; i++) {

            switch (phases[i][0].type) {
                case OperationType.UNION:
                    phaseRes[i] = this._searchInCacheStore(phases[i][0].args.request as MerlinSearchRequest, pResult);
                    phaseRes[i] = phaseRes[i - 1].concat(phaseRes[i]);
                    break;
                case OperationType.INTERSECT:
                    //throw CacheException.DENY_SEARCH_WITH_INTERSECT();
                    phaseRes[i] = this._searchInCacheStore(phases[i][0].args.request as MerlinSearchRequest, pResult);

                    break;
                case OperationType.JOIN:
                    //throw CacheException.DENY_SEARCH_WITH_JOIN();
                    phaseRes[i] = this._searchInCacheStore(phases[i][0].args.request as MerlinSearchRequest, pResult);
                    break;
                case OperationType.AGGR:
                    //throw CacheException.DENY_SEARCH_WITH_AGGREGATE();
                    break;
                case OperationType.SIZE:
                    if (phaseRes[i-1].length <= phases[i][0].args.limit) {
                        result.newLimit = phases[i][0].args.limit - phaseRes[i-1].length;
                        phaseRes[i] = phaseRes[i-1];
                    } else {
                        result.newLimit = 0;
                        phaseRes[i] = phaseRes[i-1].slice(0, phases[i][0].args.limit);
                    }
                    break;
                default:
                    matchFn = this._createComparisonFunction(phases[i]);
                    console.log(i,phaseRes.length,phaseRes[i]);
                    phaseRes[i] = phaseRes[i].map((vEntry: any) => {
                        return (matchFn.bind(vEntry));
                    });
                    break;
            }

        }
        result.results = phaseRes.pop();
        result.completed = true;


        return result;
    }

    search(pRequest: MerlinSearchRequest, pResult: IDbIndex): IDbIndex {

        // search is line in cache satisfies the request
        let result: any[] = [];
        let continueSearch = true;

        if (!pRequest.hasAggregate()) {
            const res = this._searchInCacheStore(pRequest, pResult);
            if (res.results.length > 0) {
                result = res.results;
            }
        }


        // update result index
        result.map((x: any, o: number) => {
            pResult.setEntry(o, x)
        });


        return  pResult;
    }

    // ======= serialize =======

    isSerializable():boolean{
        return true;
    }

    static unserialize(serialized_obj:any):IDbCollection{
        let self:InMemoryDbCollection = new InMemoryDbCollection(), o=null;
        self.name = serialized_obj.name;
        self.ctr = serialized_obj.ctr;
        self.values = {};
        for(let i in serialized_obj.values){

            if(SerializedObject.isUnserializable(serialized_obj.values[i])){
                o = new SerializedObject(serialized_obj.values[i])
                self.values[i]=o.unserialize();
            }
            else
                self.values[i]=serialized_obj.values[i];
        }
        return (self as IDbCollection);
    }

    serialize():any{
        let o:any= {};

        o.__type = InMemoryDbCollection.__type;
        o.name = this.name;
        o.ctr = this.ctr;
        o.values = {};

        for(let i in this.values){

            if(typeof this.values[i].serialize === 'function')
                o.values[i]=this.values[i].serialize();
            if(typeof this.values[i].toJsonObject === 'function')
                o.values[i]=this.values[i].toJsonObject();
            else
                o.values[i]=this.values[i];
        }

        return o;
    }
}
