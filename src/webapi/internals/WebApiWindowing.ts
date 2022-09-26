

export class WebApiWindowing {

    static defaultStart = 0;
    static defaultLength = 100;

    start:number = WebApiWindowing.defaultStart;
    length:number = WebApiWindowing.defaultLength;

    constructor(pStart = 0,pSize = 100) {
        this.start = pStart;
        this.length = pSize;
    }

    static parse( pConfig:any):WebApiWindowing {
        const cfg = new WebApiWindowing();
        if(pConfig.start!=null) cfg.start = pConfig.start;
        if(pConfig.length!=null) cfg.length = pConfig.length;
        return cfg;
    }

    getLength():number{
        return this.length
    }

    getStartOffset():number {
        return this.start;
    }

    and( pOptions):WebApiWindowing {
        return new WebApiWindowing(
            (pOptions.start ? this.start+pOptions.start : this.start),
            (pOptions.length ? this.length+pOptions.length : this.length)
        )
    }

    toJsonObject() {
        return {
            start:this.start,
            length:this.length};
    }
}