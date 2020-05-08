const Inspector = require("./Inspector");
const Hook = require("./HookManager");


class InspectorFactory
{
    constructor( pModel){
        this._config = pModel;
        this.step = pModel.startStep;
    }

    isStartAt(pStep){
        this.step = pStep;
    }


    /**
     * To create an Inspector from this prototype
     * 
     * @param {*} pProject 
     */
    createInstance( pProject){
        let ins = new Inspector.Inspector();
        let hs = null;
        let hooks = null;

        if(this._config.startStep != null){
            this.step = this._config.startStep;
            ins.setStartStep(this._config.startStep);
        }

        if(this._config.color != null){
            ins.color = this._config.color;
        }

        if(this._config.hookSet != null){



            hs = new Hook.HookSet({
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
            if(this._config.db.dbms=='inmemory'){

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

module.exports = InspectorFactory;