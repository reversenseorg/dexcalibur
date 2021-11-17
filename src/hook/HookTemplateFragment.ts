import HookStrategy from "./HookStrategy";


export default class HookTemplateFragment {

    private _strategy: HookStrategy = null;

    private _descr:string = null;

    private _tpl: string = null;

    private _w:number = -1;

    private _cache:string = null;

    private _preproc:boolean = true;

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

    set description(pDescr:string) {
        this._descr = pDescr;
    }

    get description():string {
        return this._descr
    }


    set weight(pWeight:number) {
        this._w = pWeight;
    }

    get weight():number {
        return this._w
    }


    set template(pTpl:string) {
        this._tpl = pTpl;
    }

    get template():string {
        return this._tpl
    }


    set strategy(pStrat:HookStrategy) {
        this._strategy = pStrat;
    }

    get strategy():HookStrategy {
        return this._strategy
    }

    isPreProcessed():boolean {
        return this._preproc;
    }

    enablePreproc( pBool = true){
        this._preproc = pBool;
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

    getGeneratedCode():string {
        return this._cache;
    }
}