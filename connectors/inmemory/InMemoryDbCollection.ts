/**
 * Represent a collection of object indexed by key
 *
 * @author Georges-B. MICHEL
 * @class
 */
import SerializedObject from "./SerializedObject.js";
import {
    Comparison, InnerjoinOperationArgs,
    MerlinSearchRequest, NestedRequestOperationArgs,
    Operation,
    OperationType,
    SearchOperationArgs, TimeOperationArgs, WindowingOperationArgs
} from "../../src/search/MerlinSearchRequest.js";
import {SearchRequestCondition} from "../../src/search/SearchRequestCondition.js";
import {InMemoryMerlinBackend} from "./InMemoryMerlinBackend.js";
import {IDbCollection, IDbIndex} from "@reversense/dexcalibur-orm";
import {InMemoryException} from "./error/InMemoryException.js";


export default class InMemoryDbCollection implements IDbCollection
{
    static __type:string = "Collection";

    name:string = null;
    ctr:number = 0;
    values:any = {};
    _db:any;

    merlinBackend:InMemoryMerlinBackend;

    constructor(name:string = null){
        this.name = name;
        this.ctr = 0;
        this.merlinBackend = new InMemoryMerlinBackend(this);
    }

    hasProxy():boolean {
        return false;
    }

    getProxy():any {
        throw  InMemoryException.NO_PROXY_AVAILABLE("getProxy", this.name);
    }

    async asyncAddEntry?(pKey:any, pValue:any): Promise<void> {
        return Promise.resolve(this.addEntry(pKey, pValue));
    }

    async asyncUpdateEntry(pValue:any): Promise<any> {
        return Promise.resolve(this.updateEntry( pValue));
    }

    async asyncGetEntry(pKey:any): Promise<any> {
        return Promise.resolve(this.getEntry( pKey));
    }

    async asyncHasEntry(pKey:any): Promise<any> {
        return Promise.resolve(this.hasEntry( pKey));
    }

    async asyncRemoveEntry(pKey:any): Promise<boolean> {
        return Promise.resolve(this.removeEntry( pKey));
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

    // ======


    search(pRequest: MerlinSearchRequest, pResult: IDbIndex): Promise<IDbIndex> {
        return Promise.resolve(this.merlinBackend.search(pRequest,pResult));
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
