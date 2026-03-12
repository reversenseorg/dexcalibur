import DexcaliburProject from "../DexcaliburProject.js";
import InspectorFactory, {InspectorFactoryOptions} from "../InspectorFactory.js";
import {UserAccount} from "../user/UserAccount.js";
import HookStrategy from "../hook/HookStrategy.js";

export class InspectorEditor {

    private _ctx:DexcaliburProject;

    constructor(pCtx:DexcaliburProject){
        this._ctx = pCtx;
    }

    async createInspectorFactory(pUser:UserAccount, pOptions:InspectorFactoryOptions):Promise<InspectorFactory>{
        const fact = new InspectorFactory(pOptions);
        //this._ctx.getContext().getInspectorManager().

        await this.save(fact);

        return fact;
    }

    async updateHookStrategy(pUser:UserAccount, pFactory:string, pStrat:HookStrategy):Promise<void>{

    }


    async save(pInspector:InspectorFactory):Promise<void>{
        await this._ctx.getProjectDB().getCollectionOf(InspectorFactory.TYPE.getType())
            .asyncAddEntry(pInspector.getUID(), pInspector);
    }
}