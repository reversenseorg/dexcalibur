export default class BusEvent
{
    type:string = null;
    data:any = null;

    constructor(pConfig:any=null) {
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    getType():string{
        return this.type;
    }

    getData():any{
        return this.data;
    }
}
