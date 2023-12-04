export interface BusEventOptions<T> {
    type?:string;
    data?:T;
    interceptors?:string[];
}


export default class BusEvent<T>
{
    type:string = null;
    data:T = null;
    interceptors:string[] = [];

    constructor(pConfig:BusEventOptions<T> = {}) {
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    getType():string{
        return this.type;
    }

    setType(pType:string):void {
        this.type = pType;
        this.interceptors.push(pType);
    }

    getData():T{
        return this.data;
    }
}
