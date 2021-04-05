
export interface DataScopeMap {
    [name:string] :DataScope
}

export enum DataScopePpts {
    PATH="p",
    OTHER="o"
}

export default class DataScope {
    _n:string = null;
    _p:any = null;

    constructor( pName:string, pOpts:any={}){
        this._n = pName;
        this._p = pOpts;
    }

    getName():string {
        return this._n;
    }

    setPpts( pType:DataScopePpts, pValue:any):DataScope {
        this._p[pType] = pValue;

        return this;
    }

    getBasePath():string {
        return this._p[DataScopePpts.PATH];
    }

    equals( pScope:DataScope):boolean {
        if(pScope==null) return false;

        return (pScope.getName()===this.getName());
    }
}