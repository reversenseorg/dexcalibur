export default class BusEvent<T>
{
    type:string = null;
    data:T = null;

    constructor(pConfig:any=null) {
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    getType():string{
        return this.type;
    }

    getData():T{
        return this.data;
    }
}
