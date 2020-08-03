import DexcaliburProject from "./DexcaliburProject";
import ModelMethod from "./ModelMethod";
import * as Log from "./Logger";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export default class GraphMaker
{
    context:DexcaliburProject = null;


    static isLooping(loop:any, method:ModelMethod):boolean{
         for(let i=0; i<loop.length; i++){
            if(loop[i]==method.__signature__){
                return true;
            }
        }
        loop.push(method.__signature__);
        return false;
    }

    /**
     * To get the call graph from a method.
     *
     * Lazy : Only the signature of the method is kept in the node
     *
     * @param {*} method
     * @param {*} depth
     * @param {*} root
     */
    static findCallerLazy(method:ModelMethod, depth:number=0, root:string=null, loop:string[]=null):any{
        let rootSignature:string = method.signature();
        let cfg:any = { method:rootSignature, depth:depth, callers:[] };
        let callers:ModelMethod[] = (method.getCallers() as ModelMethod[]);

        if(root==null){
            root=rootSignature;
            loop=[];
            loop.push(rootSignature);
        }


        if(callers.length > 0){
            for(let i:number=0; i<callers.length; i++){
                if(GraphMaker.isLooping(loop, callers[i] as ModelMethod)){ //_callers
                    cfg.callers.push(GraphMaker.findCallerLazy(callers[i], depth+1, root, loop));
                }
                else{
                    cfg.callers.push({ method:null, loop:true, depth:depth+1, callers:null });
                }
            }
        }
        return cfg;
    }

    /**
     * To get the call graph from a method.
     *
     * @param {*} method
     * @param {*} depth
     * @param {*} root
     */
    static findCaller(method:ModelMethod, depth:number=0, root:string=null):any{
        let rootSignature:string = null;
        let cfg:any = { method:method, depth:depth, callers:[] };
        let callers:ModelMethod[] = (method.getCallers() as ModelMethod[]);

        if(root==null) root=method.signature();


        if(callers != null){
            for(let i:number=0; i<callers.length; i++){
                if(callers[i].signature() !== root)
                    cfg.callers.push(GraphMaker.findCaller(callers[i], depth+1, root));
                else
                    cfg.callers.push({ method:null, loop:true, depth:depth+1, callers:null });
            }
        }
        return cfg;
    }

    /**
     * @constructor
     * @param pContext
     */
    constructor(pContext:DexcaliburProject){
        this.context = pContext;
    }

    /**
     *
     * @param {Method} method
     * @param {Boolean} lazy
     * @param {Instruction} instruction

     */
    cfg(method:ModelMethod, lazy:boolean=false, instruction:any=null):any{
        if(lazy)
            return GraphMaker.findCallerLazy(method);
        else
            return GraphMaker.findCaller(method);
    }

    /**
     * To get the call-graph of a method and return a ready to
     * serializable lite result
     *
     * @param {Method} method
     * @param {Instruction} instruction
     */
    cfgLazy(method, instruction=null):any{
        return this.cfg(method,true,instruction);
    }

    method_htg(method:ModelMethod, instruction:any=null):any{
        return null;
    }

    callgraph_from(obj:ModelMethod, n:number=1, m:number=2):any{
        let tree:any={
            fqcn:obj.signature(),
            tags: obj.tags,
            //internal:obj.hasTag(AnalysisHelper.TAG.Discover.Internal),
            class:obj.enclosingClass.name,
            classname: obj.enclosingClass.simpleName,
            name:obj.name,
            callsignature: (obj.getAlias()!= null)? obj.__aliasedCallSignature__ : obj.__callSignature__  };

        //{ name:null, children:null };
        let meth = null;

        // call graph
        if(obj instanceof ModelMethod){
            //tree.name = obj.signature();
            if(obj._useMethodCtr>0){
                tree.children = [];
                for(let i in obj._useMethod){
                    meth = this.context.find.get.method(i);

                    if(n<m)
                        tree.children.push(this.callgraph_from(this.context.find.get.method(i),n+1));
                    else
                        tree.children.push({
                            fqcn:i,
                            tags: meth.getTags(),
                            //internal:meth.hasTag(AnalysisHelper.TAG.Discover.Internal),
                            class:meth.enclosingClass.name,
                            classname: meth.enclosingClass.simpleName,
                            name:meth.name,
                            callsignature: (meth.getAlias()!= null)? meth.__aliasedCallSignature__ : meth.__callSignature__  });
                }
            }
        }

        Logger.debugRAW(tree);

        return tree;
    }

    callgraph_to(obj:ModelMethod, n:number=1, m:number=2):any{
        let tree:any={ name:null, children:null };

        // call graph
        if(obj instanceof ModelMethod){
            tree.name = obj.signature();
            if(obj._useMethodCtr>0){
                tree.children = [];
                for(let i in obj._useMethod){
                    if(n<m)
                        tree.children.push(this.callgraph_to(this.context.find.get.method(i),n+1));
                    else
                        tree.children.push({ name:i });
                }
            }
        }

        console.log(tree);

        return tree;
    }

    htg(obj:ModelMethod):any{
        /*if(obj instanceof CLASS.Class){
            return this.class_htg(obj);
        }
        else*/ if(obj instanceof ModelMethod){
            return this.method_htg(obj);
        }
        return null;
    }

}
