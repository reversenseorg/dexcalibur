import DexcaliburProject from "../../../src/DexcaliburProject";
import {TAG} from "../../../src/AnalysisHelper";


export default class ClassAnalyzer
{

    constructor(){
    }

    static searchInternalDependencies(_context_:DexcaliburProject, activity:any):boolean{
        if(activity==null) return false;

        let cls = activity.getImplementedBy();
        if(cls == null){
            //throw new Error("Class implementing the given activity is not found ");
            return false;
        }

        let used=null, dep = {}, meth=null, cs=null;
        for(let i in cls.methods){
            used = cls.methods[i].getMethodUsed();

            for(let methSign in used){
                meth = _context_.find.get.method(methSign); 
                if(meth == null) continue;
                
                if(meth.hasTag(TAG.Discover.Internal)){
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
}
