import Inspector, {INSPECTOR_TYPE} from "./Inspector";
import DexcaliburProject from "./DexcaliburProject";
import HookSet from "./HookSet";
import Hook from "./Hook";


export default class InspectorFactory
{
    _config:any = null;
    step:INSPECTOR_TYPE = null;

    constructor( pModel:any ){
        this._config = pModel;
        this.step = pModel.startStep;
    }

    isStartAt(pStep:INSPECTOR_TYPE):boolean{
        return this.step === pStep;
    }


    /**
     * To create an Inspector from this prototype
     * 
     * @param {*} pProject 
     */
    createInstance( pProject:DexcaliburProject):Inspector{
        let ins:Inspector = new Inspector();
        let hs:HookSet = null;
        let hooks:Hook[] = null;

        if(this._config.id != null) ins.id = this._config.id;
        if(this._config.name != null) ins.name = this._config.name;
        if(this._config.description != null) ins.description = this._config.description;

        if(this._config.startStep != null){
            this.step = this._config.startStep;
            ins.setStartStep(this._config.startStep);
        }

        if(this._config.color != null){
            ins.color = this._config.color;
        }

        if(this._config.hookSet != null){



            hs = new HookSet({
                id: (this._config.id!=null ? this._config.id : this._config.hookSet.id),
                name: (this._config.name!=null ? this._config.name : this._config.hookSet.name),
                description: (this._config.description!=null ? this._config.description : this._config.hookSet.description),
                color: this._config.color
            });

            hooks = this._config.hookSet.hooks;

            if(hooks != null){
                hooks.map((vHookCfg)=>{
                    hs.addIntercept(vHookCfg);
                });
            }

            if(this._config.hookSet.hookShare != null){
                hs.addHookShare(this._config.hookSet.hookShare);
            }

            if(this._config.hookSet.require != null){
                this._config.hookSet.require.map((k,v)=>{
                    hs.require(k);
                });
            }

            ins.setHookSet(hs);
        }

        if(this._config.db != null){
            if(this._config.db.dbms==='inmemory'){

                ins.useMemoryDB();

                switch(this._config.db.type){
                    case 'index':
                        ins.getDB().newIndex(this._config.db.name);
                        break;
                    case 'collection':
                        ins.getDB().newCollection(this._config.db.name);
                        break;
                }
            }   
        }

        if(this._config.tags != null){
            for(let i in this._config.tags){
                ins.registerTagCategory(i, this._config.tags[i]);
            }  
        }

        if(this._config.useGUI === true){
            ins.useGUI();
        }

        if(this._config.eventListeners != null){
            for(let i in this._config.eventListeners){
                ins.on(i, {
                    task: this._config.eventListeners[i]
                });
            }
        }

        ins.injectContext(pProject);

        return ins;
    }
}
