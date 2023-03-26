
import {DXC_LIFECYCLE_EVENT} from "../CoreConst.js";

export const PATCHES = [
   {
        ev: DXC_LIFECYCLE_EVENT.OPEN_PROJECT,
        _code: function (pCtx:any):any{
            /*if(pCtx.PROJECT==null) return;

            const project:DexcaliburProject = pCtx.PROJECT;
            const hm:HookManager = project.getHookManager();
            hm.getDbAPI().fragments.map((vFrag:HookTemplateFragment)=>{
                if(vFrag.getStrategy() == null){
                    hm.get
                }
            })*/
        }
    }
]