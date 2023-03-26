import HookStrategy from "./HookStrategy.js";


export default class HookTemplate {

    private _strategy: HookStrategy = null;

    private _tpl: string = null;

    private _cache: string = null;

    private _weight:number = -1;

    /**
     * Group of hook
     *
     * @param {*} config
     */
    constructor(pConfig:any=null){

        // this.requiresNode = [];
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];


    }


    setStrategy(pStrategy:HookStrategy):void {
        this._strategy = pStrategy;
    }

    getStrategy():HookStrategy {
        return this._strategy;
    }

    setCodeTemplate(pTpl:string):void {
        this._tpl = pTpl;
    }

    getCodeTemplate():string {
        return this._tpl;
    }

    /**
     *
     * @param pContext
     */
    generateCode( pContext:any ):string {
        let c = this._tpl;
        for(let i in pContext){
            while(c.indexOf(i)>-1){
                c = c.replaceAll(i, pContext[i]);
            }
        }
        this._cache = c;
        return this._cache;
    }
}