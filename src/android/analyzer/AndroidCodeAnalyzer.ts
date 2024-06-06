import DexcaliburProject from "../../DexcaliburProject.js";
import ModelMethod from "../../ModelMethod.js";
import ModelClass from "../../ModelClass.js";
import {NodeInternalType} from "../../NodeInternalType.js";
import AndroidComponent from "../AndroidComponent.js";



export interface MethodXref {
    method:ModelMethod,
    loc:any,
    from?:any
}

export interface XrefLocation {
    bb: number, // basic block
    i: number // instruction offset
}

export interface AndroidXrefInfo {
    parent: ModelMethod | string,
    loc: XrefLocation[],
    tags?: any
}

export interface AndroidMethodXref {
    __: NodeInternalType,
    uid: string,
    short: string,
    xrefs: AndroidXrefInfo[]
}


export interface AndroidApiMethXrefList {
    [methodUID:string] :AndroidMethodXref
}

export interface AndroidClassXref {
    __: NodeInternalType,
    uid: string,
    methods: AndroidApiMethXrefList
}

export interface AndroidApiClassXrefList {
    [classUID:string] :AndroidClassXref
}


const DEFAULT_XREF_DEPTH = -2;

/**
 * The aim of this class is to be a toolkit to perform some operation over AST
 *
 * This class replaces ClassAnalyzer from ApplicationTopology inspector.
 *
 * @class
 * @since 1.1.0
 */
export class AndroidCodeAnalyzer {

    static XREF_MAX_DEPTH = 1;

    constructor(){
        //
    }


    /**
     * To create the function making xref list
     *
     * @param pContext
     * @param pApiList
     * @return {any}
     */
    static newRecursiveXrefListFunction( pContext:DexcaliburProject, pApiList:AndroidApiClassXrefList):any {

        const API_TAG = pContext.getTagManager().getTag("discover.internal");

        return ((vCtx: DexcaliburProject, vMeth: MethodXref, vDept: number) => {

            if (API_TAG.match(vMeth.method)) {
                const clsUID = vMeth.method.enclosingClass.name;

                if (pApiList[clsUID] == null) {
                    pApiList[clsUID] = {
                        __: NodeInternalType.CLASS,
                        uid: clsUID,
                        methods: {}
                    };
                }

                const cs = vMeth.method.callSignature();
                if (pApiList[clsUID].methods[cs] == null){
                    pApiList[clsUID].methods[cs] = {
                        __: NodeInternalType.METHOD,
                        uid: vMeth.method.signature(),
                        short: cs,
                        xrefs: []
                    };
                }

                // TODO prevent duplicate
                // gather call location
                pApiList[clsUID].methods[cs].xrefs.push({
                    parent: (vMeth.from as ModelMethod).signature(),
                    loc: vMeth.loc
                });

            }
        });
    }

    /**
     * To prepare a list of xrefs to be serialized to json
     *
     * @param {AndroidApiClassXrefList} pXrefs
     * @return {any} Object ready to be serialized to JSON notation
     * @method
     * @since 1.1.0
     */
    static classXrefListToJson( pXrefs:AndroidApiClassXrefList ):any {
        const data:any = pXrefs;

        for (const k in data) {
            data[k].methods = Object.values(data[k].methods);
        }

        return Object.values(data);
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
                AndroidCodeAnalyzer.forEachXrefTo( pContext, pMeth, pMaxDepth, pCallback, pCurrentDepth+1, pLoop);
            }
        }

        return true;
    }

    /**
     *
     * @param pContext
     * @param pClass
     * @param pUpdateNode
     */
    static searchClassInternalDependencies(pContext:DexcaliburProject, pClass:ModelClass, pDeth:number = DEFAULT_XREF_DEPTH,  pUpdateNode = false):AndroidApiClassXrefList {
        if (pClass == null) return null;

        const api:AndroidApiClassXrefList = {};

        if(pDeth === DEFAULT_XREF_DEPTH){
            pDeth = AndroidCodeAnalyzer.XREF_MAX_DEPTH;
        }

        // browse all methods from target component
        const skip = Object.keys(pClass.methods);
        const xrefAnalysisFn = AndroidCodeAnalyzer.newRecursiveXrefListFunction( pContext, api);

        for (const idx in pClass.methods) {
            AndroidCodeAnalyzer.forEachXrefTo( pContext,pClass.methods[idx],pDeth,xrefAnalysisFn,0,skip);
        }

        if (pUpdateNode) {
            if (pClass instanceof AndroidComponent)
                pClass.addNodeProperty("internals", AndroidCodeAnalyzer.classXrefListToJson(api));
        }

        return api;
    }



    /**
     * To search xref to android API from a method
     *
     * @param pContext
     * @param pMethod
     */
    static searchMethodInternalDependencies(pContext: DexcaliburProject, pMethod: ModelMethod, pDeth:number = DEFAULT_XREF_DEPTH, pUpdate=false):AndroidApiClassXrefList {
        const api:AndroidApiClassXrefList = {};

        if(pDeth === DEFAULT_XREF_DEPTH){
            pDeth = AndroidCodeAnalyzer.XREF_MAX_DEPTH;
        }

        const xrefAnalysisFn = AndroidCodeAnalyzer.newRecursiveXrefListFunction( pContext, api);

        AndroidCodeAnalyzer.forEachXrefTo(pContext, pMethod, pDeth, xrefAnalysisFn, 0, [pMethod.getUID()]);

        return api;
    }

    /**
     * To search all xrefs of a node from AST to Android API
     *
     * @param {DexcaliburProject} pContext
     * @param {any} pNode INode
     */
    static searchInternalDependencies(pContext:DexcaliburProject, pNode:any, pDeth:number = DEFAULT_XREF_DEPTH):AndroidApiClassXrefList{
        if(pNode==null) return null;

        if(pDeth === DEFAULT_XREF_DEPTH){
            pDeth = AndroidCodeAnalyzer.XREF_MAX_DEPTH;
        }

        switch(pNode.__){
            case NodeInternalType.CLASS:
                return AndroidCodeAnalyzer.searchClassInternalDependencies(pContext, pNode, pDeth);
                break;
            case NodeInternalType.METHOD:
                return AndroidCodeAnalyzer.searchMethodInternalDependencies(pContext, pNode, pDeth);
                break;
            case NodeInternalType.ANDROID_ACTIVITY:
            case NodeInternalType.ANDROID_SERVICE:
            case NodeInternalType.ANDROID_RECEIVER:
            case NodeInternalType.ANDROID_PROVIDER:
                return AndroidCodeAnalyzer.searchClassInternalDependencies(pContext, pNode.getImplementedBy(), pDeth);
                break;
        }


        return null;
    }
}