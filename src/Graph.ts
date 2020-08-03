const CLASS = require("./CoreClass.js");
const AnalysisHelper = require("./AnalysisHelper.js");


function findSuper(method){
    if(method.enclosingClass != null){

    }
}

function isLooping(loop,method){
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
function findCallerLazy(method, depth=0, root=null, loop=null){
    if(root==null){
        root=method.__signature__;
        loop=[];
        loop.push(method.__signature__);  
    } 

    let cfg = { method:method.__signature__, depth:depth, callers:[] };

    if(method._callers != null){
        for(let i=0; i<method._callers.length; i++){
            if(isLooping(loop,method._callers[i])){
                //if(method._callers[i].__signature__ !== root){
                console.log(method._callers[i].__signature__);
                cfg.callers.push(findCallerLazy(method._callers[i], depth+1, root, loop));
            }
            else    {
                console.log(method._callers[i].__signature__);
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
function findCaller(method, depth=0, root=null){
    if(root==null) root=method.__signature__;

    let cfg = { method:method, depth:depth, callers:[] };

    if(method.callers != null){
        for(let i=0; i<method.callers.length; i++){
            if(method.callers[i].__signature__ !== root)
                cfg.callers.push(findCaller(method.callers[i], depth+1, root));
            else    
                cfg.callers.push({ method:null, loop:true, depth:depth+1, callers:null });
        }
    }
    return cfg;
}


function GraphMaker(ctx){
    this.context = ctx;
    return this;
}

/**
 * 
 * @param {Method} method  
 * @param {Boolean} lazy 
 * @param {Instruction} instruction

 */
GraphMaker.prototype.cfg = function(method, lazy=false, instruction=null){
    if(lazy)
        return findCallerLazy(method);
    else
        return findCaller(method);
}

/**
 * To get the call-graph of a method and return a ready to 
 * serializable lite result
 * 
 * @param {Method} method 
 * @param {Instruction} instruction 
 */
GraphMaker.prototype.cfgLazy = function(method, instruction=null){
    return this.cfg(method,true,instruction);
}
GraphMaker.prototype.method_htg = function(method, instruction=null){
    
}
GraphMaker.prototype.callgraph_from = function(obj, n=1, m=2){
    let tree={ 
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
    if(obj instanceof CLASS.Method){
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

    console.log(tree);

    return tree;
}

GraphMaker.prototype.callgraph_to = function(obj, n=1, m=2){
    let tree={ name:null, children:null };

    // call graph
    if(obj instanceof CLASS.Method){
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
GraphMaker.prototype.htg = function(obj){
    /*if(obj instanceof CLASS.Class){
        return this.class_htg(obj);
    }
    else*/ if(obj instanceof CLASS.Method){
        return this.method_htg(method);
    }
    return null;
}


module.exports = GraphMaker;