import DexcaliburProject from "../../../src/DexcaliburProject";
import ModelClass from "../../../src/ModelClass";
import AndroidComponent from "../../../src/android/AndroidComponent";
import {NodeInternalType} from "../../../src/NodeInternalType";
import ModelMethod from "../../../src/ModelMethod";
import * as vm from "vm";


export interface MethodXref {
    method:ModelMethod,
    loc:any,
    from?:any
}

export default class ClassAnalyzer
{

    constructor(){
        //
    }

    static searchInternalDependenciesOld(_context_:DexcaliburProject, activity:any):boolean{
        if(activity==null) return false;

        const cls:ModelClass = activity.getImplementedBy();
        if(cls == null){
            return false;
        }

        const platformInternal_tag = _context_.getTagManager().getTag("discover.internal");
        let used=null, meth=null, cs=null;
        const dep = {};
        for(const idx in cls.methods){
            used = cls.methods[idx].getMethodUsed();

            for(const methSign in used){
                meth = _context_.find.get.method(methSign); 
                if(meth == null) continue;
                
                if(platformInternal_tag.match(meth)){
                    if(dep[meth.enclosingClass.name]==null)
                        dep[meth.enclosingClass.name] = {};

                    cs = meth.callSignature();
                    if(dep[meth.enclosingClass.name][cs]==null)
                        dep[meth.enclosingClass.name][cs] = [];
                    
                    // gather call location
                    dep[meth.enclosingClass.name][cs].push({
                        parent: methSign,
                        loc: used[methSign]
                    });
                    
                }
            }
        }
        

        activity.addNodeProperty("internals",dep);
        return true;
    }

    /**
     *  To execute a custom function for each method calleds
     *
     * @param pContext
     * @param pMeth
     * @param pMaxDepth
     * @param pCallback
     * @param pCurrentDepth
     * @param pLoop
     */
    static forEachXrefTo( pContext:DexcaliburProject, pMeth:ModelMethod, pMaxDepth:number, pCallback:any, pCurrentDepth = 0, pLoop = [] ) :any {
        const xrefTos = pMeth.getMethodUsed();

        let meth:ModelMethod;

        for(const uid in xrefTos){
            meth = pContext.find.get.method(uid);
            if(meth == null) continue;
            if(pLoop.indexOf(uid)>-1)
                continue;
            else
                pLoop.push(uid);

            if((pCallback)(pContext,{ method:meth, loc: xrefTos[uid], from:pMeth },pCurrentDepth)){
                ClassAnalyzer.forEachXrefTo( pContext, pMeth, pMaxDepth, pCallback, pCurrentDepth+1, pLoop);
            }
        }

        return true;
    }

    static searchClassInternalDependencies(pContext:DexcaliburProject, pClass:ModelClass):any{
        if(pClass==null) return false;

        let api={},  xrefs = [];

        const API_TAG = pContext.getTagManager().getTag("discover.internal");

        // browse all methods from target component
        const skip = Object.keys(pClass.methods);
        for(const idx in pClass.methods){

            ClassAnalyzer.forEachXrefTo(pContext, pClass.methods[idx], 1, (vCtx:DexcaliburProject, vMeth:MethodXref, vDept:number)=>{

                if(API_TAG.match(vMeth.method)){
                    const clsUID = vMeth.method.enclosingClass.name;

                    if(api[clsUID]==null)
                        api[clsUID] = {
                            __:NodeInternalType.CLASS,
                            uid: clsUID,
                            methods: {}
                        };

                    const cs = vMeth.method.callSignature();
                    if(api[clsUID].methods[cs]==null)
                        api[clsUID].methods[cs] = {
                            __:NodeInternalType.METHOD,
                            uid:vMeth.method.signature(),
                            short:cs,
                            xrefs: []
                        };

                    // gather call location
                    api[clsUID].methods[cs].xrefs.push({
                        parent: (vMeth.from as ModelMethod).signature(),
                        loc: vMeth.loc
                    });

                }
            }, 0, skip);

        }


        // flatten
        for(const k in api){
            api[k].methods = Object.values(api[k].methods);
        }

        api = Object.values(api);

        if(pClass instanceof AndroidComponent)
            pClass.addNodeProperty("internals", api );

        return api;
    }

    static searchInternalDependencies(_context_:DexcaliburProject, pNode:any):any{
        if(pNode==null) return false;


        switch(pNode.__){
            case NodeInternalType.CLASS:
                return ClassAnalyzer.searchClassInternalDependencies(_context_, pNode);
                break;
            case NodeInternalType.ANDROID_ACTIVITY:
            case NodeInternalType.ANDROID_SERVICE:
            case NodeInternalType.ANDROID_RECEIVER:
            case NodeInternalType.ANDROID_PROVIDER:
                return ClassAnalyzer.searchClassInternalDependencies(_context_, pNode.getImplementedBy());
                break;
        }


        return true;
    }
}
