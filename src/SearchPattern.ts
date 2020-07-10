export default class SearchPattern
{
    fn:any = null;
    pattern:string = null;
    field:string = null;
    isModifier:boolean = false;
    isStructField:boolean = false;
    isDeepSearch:boolean = false;
    hasTag:boolean = false;

    constructor(pConfig:any=null){
        if(pConfig!==undefined)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    serialize():any{
        let o:any = new Object();
        o.isModifier = this.isModifier;
        o.isStructField = this.isStructField;
        o.isDeepSearch = this.isDeepSearch;
        o.field = this.field;
        o.pattern = this.pattern;

        return o;
    }
}