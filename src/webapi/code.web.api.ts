import {DelegateRequest, DelegateResponse, DelegateWebApi, HTTP_VERB} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import ModelMethod from "../ModelMethod.js";
import Util from "../Utils.js";
import Simplifier from "../Simplifier.js";
import ModelClass from "../ModelClass.js";
import ModelField from "../ModelField.js";
import ModelPackage from "../ModelPackage.js";
import * as VM from "vm";
import {FinderResult} from "../search/FinderResult.js";
import DataScope from "../DataScope.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import AndroidAppAnalyzer from "../android/AndroidAppAnalyzer.js";
import {AndroidApiClassXrefList, AndroidCodeAnalyzer} from "../android/analyzer/AndroidCodeAnalyzer.js";
import {AndroidAnalyzerException} from "../errors/android/AndroidAnalyzerException.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {MerlinSearchRequest, OperationType} from "../search/MerlinSearchRequest.js";
import {DexcaliburEngineMode} from "../DexcaliburEngineMode.js";
import {NodeType, ValidationRule} from "@dexcalibur/dexcalibur-orm";
import ModelCall from "../ModelCall.js";
import {NodePurpose} from "../core/EngineNode.js";
import {ElixirUtils} from "../elixir/ElixirUtils.js";
import {ScanOrder} from "../audit/common/ScanOrder.js";
import AssuranceModel from "../audit/common/AssuranceModel.js";
import AiHelper from "../core/ai/AiHelper.js";

;

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const CODE_WEB_API: DelegateWebApi = new DelegateWebApi();


/**
 * /api/application/cmp?type=[dex|ks|libs|strings] ...
 */
CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/package',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            let format:any = req.query.hasOwnProperty('format')? req.query.format as string : 'list';
            let query:string = req.query.hasOwnProperty('query')? req.query.query as string : '.*';
            let filter:string = req.query.hasOwnProperty('filter')? req.query.filter as string : null;
            let filter2:string = req.query.hasOwnProperty('filter2')? req.query.filter2 as string : null;
            let fields:string[] = req.query.hasOwnProperty('fields')? (req.query.fields as string).split(',') : ['name'];
            let data:FinderResult;


            try{

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }


                await project.resetIdleTime();

                if(format=='tree'){
                    if(query=='.*')
                        data = project.find.package('name:/^[^\\.]*$/');
                    else
                        data = project.find.package('name:/'+query+'/');
                }else{
                    data = project.find.package('name:/.*/');
                }

                if(filter != null){
                    data = data.filter(filter);
                }

                if(!req.query.hasOwnProperty('query') && filter2 != null && filter2.indexOf(':ds')>-1){
                    const scope:DataScope = project.dataAnalyzer.getScope('PKG')
                    // replace all by tagged 'executable by target platform'
                    //const d = project.find.file( 'type:ELF', scope);
                    // filter d by analyzed files
                    const analyzed = project.getAnalyzer().getNativeAnalyzer().getAnalyzableFiles(scope);

                    //console.log("before union of results : ",analyzed)
                    //FinderResult
                    data = data.unionWithList(analyzed);
                    //console.log("after union of results : ",data);
                }

                fields.push('__');
                $.sendSuccess( res, data.toJsonObject({ include:fields }));
            }catch(err){
                Logger.error("[API][CODE] Content of package cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Content of package cannot be listed. Cause : " + err.message);
            }
        }
    }

);




CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/method/simplify/:id',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS
                project = req.dxc.project;
                /*
                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }*/

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC

                // collect
                let dev:any = {};
                // TODO : use Merlin and data from DB instead
                let method:ModelMethod = project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.id)));

                let simplifier:Simplifier = project.getSimplifier(); // Simplifier.getInstance($.project);
                const mcpInfo = AiHelper.getInstance().getInfo("Simplifier");

                // init body
                simplifier.setParametersValues(req.body.params);
                simplifier.setInitParentClass(req.body.clinit===true);
                simplifier.setMaxDepth(req.body.depth);

                let simplifyLvl:number = (req.body.level!=undefined)? req.body.level : 0;

                dev = simplifier.simplify(method, simplifyLvl);

                // ============= RESPONSE
                $.sendSuccess( res, dev);
            }catch(err){
                Logger.error("[API][CODE] Method cannot be simplified. Cause : " + err.message + "\n\t" + err.stack);
                $.sendErrorAfterException(res, "Method cannot be simplified. Cause : ", err.message, err, {
                    context: err.extra
                });
            }
        }
    },{
        mcp:{
            [HTTP_VERB.POST]: {
                name:'code-simplify',
                uri: '/method/simplify/{methodUUID}',
                summary: `Simplify the bytecode or instructions of the method by code lifting.`,
                parameters: [{
                    name: 'methodUUID',
                    required: true,
                    description: "The UUID of the method (a ModelMethod node) to simplify.",
                    schema: {type:"string"} // ModelMethod.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: `Pseudocode of the simplified method.`,
                    schema: { type:"object" }
                }]
            }
        }
    }
);



CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/method/disass/:id',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                await project.resetIdleTime();

                // ========== LOGIC

                const data:any = { success:false };
                const method:ModelMethod = project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.id)));

                data.disass = method.disass({ raw: true }, project.getDisassembler());
                data.success = true;

                // ============= RESPONSE
                $.sendSuccess( res, data);
            }catch(err){
                Logger.error("[API][CODE] Method cannot be disassemnbled. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Method cannot be simplified. Cause : " + err.message);
            }
        }
    }
);








/*
Useless. Too much results
 */
CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/method',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS



                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                await project.resetIdleTime();
                // ========== LOGIC +  RESPONSE
                $.sendSuccess( res, project.find.method('name:/.*/').toJsonObject({}));
            }catch(err){
                Logger.error("[API][CODE] Method cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Method cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);

CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/android/xref/:type/:uid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;
                const anal = (project.getAppAnalyzer() as AndroidAppAnalyzer);
                const unsafeUID = Util.decodeURI(Util.b64_decode(req.params.uid));
                let depth:number;
                let data:AndroidApiClassXrefList = null;

                if(req.query.depth != null){
                    const unsafeDepth = parseInt( req.query.depth as string, 10 );
                    depth = (unsafeDepth >= -1 && unsafeDepth < Infinity)? unsafeDepth : AndroidCodeAnalyzer.XREF_MAX_DEPTH;
                }else{
                    depth = AndroidCodeAnalyzer.XREF_MAX_DEPTH;
                }

                switch (parseInt(req.params.type as string)){
                    case NodeInternalType.CLASS:
                        data = anal.scanClassXrefToAPI(project.find.get.class(unsafeUID), depth, false)
                        break;
                    case NodeInternalType.METHOD:
                        const meth = project.find.get.method(unsafeUID)
                        data = anal.scanMethodXrefToAPI(meth, depth, false);
                        break;
                    case NodeInternalType.FUNC:
                        // todo
                        break;
                }
                if(data!=null){
                    $.sendSuccess( res, AndroidCodeAnalyzer.classXrefListToJson(data));
                }else{
                    throw AndroidAnalyzerException.ANDROID_XREF_NOT_PROCESSED(unsafeUID);
                }

            }catch(err){
                Logger.error("[API][CODE] Method cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Method cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/xref/:node/:nodeuid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                const nodeType = req.params.node;
                const nodeUID = decodeURI(Util.b64_decode(req.params.nodeuid));
                const puid = req.query._puid as string;

                if(!ValidationRule.uuid().test(puid)){
                    throw new Error("Invalid project UID");
                }

                let project:DexcaliburProject;
                if(req.dxc.project!=null && req.dxc.project.getUID()==puid){
                    project = req.dxc.project;


                    /*if(project == null || !project.isReady()) {
                        throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                    }*/

                    await project.resetIdleTime();
                }else{
                    project = (await $.context.getProjectManager().preloadForDirect(req.user, puid));
                }

                let result:Nullable<FinderResult> = null;

                switch (req.query.dir){
                    case "from":
                        result = await project.getMerlinEngine()
                            .call({ _caller: { _uid: nodeUID, __: parseInt(nodeType,10) } })
                            .executePDB(project);
                        break;
                    case "to":
                        result = await project.getMerlinEngine()
                            .call({ _called: { _uid: nodeUID, __: parseInt(nodeType,10) } })
                            .executePDB(project);
                        break;
                }
                // TODO
                /*const result = (await (MerlinSearchRequest.getByRef({
                    __:parseInt(nodeType,10),
                    _uid:nodeUID
                },project.getMerlinEngine() )).executePDB(project));*/


                if(result==null || result.count()==0){
                    throw new Error("No XRef found.");
                }

                // ========== LOGIC
                /*
                const type:string = req.query.dir as string;
                const root = result.get(0);

                const data:any = [];
                let tmp:any = null, refs:(ModelMethod|string)[] = null, r2 = null;

                let xrefs:FinderResult;

                switch (type) {
                    case "from":
                        xrefs = await (MerlinSearchRequest.fromCondition(
                            project.merlin, ModelCall.TYPE,
                            {
                                _caller: {
                                    __: ModelMethod.TYPE.getType(),
                                    _uid: root.getUID()
                                }
                            }, {
                                strict: true,
                                not: false
                            }
                        )).executePDB(project);

                        for (let i:number = 0; i < xrefs.count(); i++) {
                            const tags:number[] = [];


                            //r2 = $.project.find.get.method(refs[i]);
                            r2 = xrefs.get(i);

                            //if( (r2 instanceof ModelMethod) == false){
                            //    r2 = project.find.get.method(r2)
                            //}

                            tmp = {
                                // method signature
                                s: r2.signature(),
                                // aliased signature
                                a: r2.__aliasedCallSignature__,
                                // return type signature
                                r: (r2.getReturnType() != null ? r2.getReturnType().signature() : null),
                                // tags
                                tags: r2.getTags()
                            };


                            // args signatures
                            tmp.p = [];
                            if (r2.hasArgs())
                                r2.getArgsType().map(x => tmp.p.push(x.signature()));

                            data.push(tmp);
                        }



                        break;
                    case "to":

                        xrefs = await (MerlinSearchRequest.fromCondition(
                                project.merlin, ModelMethod.TYPE,
                                {
                                    "_called._uid": root.getUID()
                                }, {
                                    strict: true,
                                    not: false
                                }
                            )
                            .select(ModelCall.TYPE.getProperty("called"))
                        ).executePDB(project);

                        //project.merlin.call("calleed")



                        //refs = root.getCallers();
                        //console.log(refs);
                        for (let i:number = 0; i < xrefs.count(); i++) {
                            const tags:number[] = [];


                            //r2 = $.project.find.get.method(refs[i]);
                            r2 = xrefs.get(i);

                            //if( (r2 instanceof ModelMethod) == false){
                            //    r2 = project.find.get.method(r2)
                            //}

                            tmp = {
                                // method signature
                                s: r2.signature(),
                                // aliased signature
                                a: r2.__aliasedCallSignature__,
                                // return type signature
                                r: (r2.getReturnType() != null ? r2.getReturnType().signature() : null),
                                // tags
                                tags: r2.getTags()
                            };

                            // args signatures
                            tmp.p = [];
                            if (r2.hasArgs())
                                r2.getArgsType().map(x => tmp.p.push(x.signature()));

                            data.push(tmp);
                        }

                        break;
                    default:
                        throw  new Error("Invalid Xref type")
                        break;
                }*/

                // RESPONSE
                $.sendSuccess( res, result ? result.toJsonObject({include:[]}) : []);
            }catch(err){
                Logger.error("[API][CODE] Xref cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Xref cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: true,
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);


CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/method/:id',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {


            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // ========== LOGIC
                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }
                await project.resetIdleTime();


                // collect
                let dev:any = {};
                const callers:(string|ModelMethod)[] = [];
                //console.log(Util.decodeURI(Util.b64_decode(req.params.id)));
                const methRef:string = Util.decodeURI(Util.b64_decode(req.params.id));
                const method:ModelMethod = project.find.get.method(methRef);

                if (method != null) {

                    if(req.query.probing){
                        method.setProbing(project.hook.isProbing(method));
                    }

                    dev = method.toJsonObject({});
                    dev.hooked = (project.hook.getProbe(method)!=null);
                    dev.disass = method.disass({ raw: true }, project.getDisassembler());
                } else {
                    throw new Error('[API][CODE] Method solving through reference not yet supported here');
                }

                dev._callers = callers;

                // ========== RESPONSE
                $.sendSuccess( res, dev);
            }catch(err){
                Logger.error("[API][CODE] Method cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Method cannot be retrieved. Cause : " + err.message);
            }
        },
        'put': async (req:DelegateRequest, res:DelegateResponse) => {


            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                project = req.dxc.project;

                // ========== LOGIC
// collect
                const method:ModelMethod = project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.id)));
                let cls:ModelClass;
                let data:any;

                if (method == null) {
                    throw  new Error("Method not found.");
                }

                const alias:string = req.body['alias'];

                if(alias != null){

                    if(alias == method.name){
                        $.sendError( res, {
                            success: false,
                            msg: { type:'warn', msg:'Ignored because the alias not differs from name.'}
                        });
                        return;
                    }

                    cls = method.getEnclosingClass();
                    if(cls!=null && cls.hasAliasedMethod(alias)){
                        $.sendError( res, {
                            success: false,
                            msg: { type:'err', msg:'A conflict has been detected. Please choose another alias.'}
                        });
                        return;
                    }

                    method.setAlias(alias);
                    project.trigger({
                        type: "method.alias.update",
                        data: {
                          meth: method
                        },
                        meth: method
                    });
                }


                // ========== RESPONSE
                $.sendSuccess( res, {});
            }catch(err){
                Logger.error("[API][CODE] Method cannot be aliased. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Method cannot be aliased. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);




CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/field/:id',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }


                await project.resetIdleTime();

                // ========== LOGIC +  RESPONSE
                const sign:string = Util.decodeURI(Util.b64_decode(req.params.id));
                const field:ModelField = project.find.get.field(sign);

                if(field==null){
                    throw new Error("Field not found : "+sign);
                }

                $.sendSuccess( res, field.toJsonObject({include:[]}));
            }catch(err){
                Logger.error("[API][CODE] Field cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Field cannot be retrieved. Cause : " + err.message);
            }
        },

        'put': async (req:DelegateRequest, res:DelegateResponse) => {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC +  RESPONSE

                // collect
                const sign:string = Util.decodeURI(Util.b64_decode(req.params.id));
                const obj:ModelField = project.find.get.field(sign);
                const alias:string = req.body['alias'];
                let cls:ModelClass;


                if(obj==null){
                    throw new Error("Field not found : "+sign);
                }


                if(alias != null){
                    if(alias == obj.name){
                        $.sendError(res, {
                            success: false,
                            msg: { type:'warn', msg:'Ignored because the alias not differs from name.'}
                        });
                        return ;
                    }

                    cls = obj.getEnclosingClass();
                    if(cls!=null && cls.hasAliasedField(alias)){
                        $.sendError(res, {
                            success: false,
                            msg: { type:'warn', msg:'A conflict has been detected. Please choose another alias.'}
                        });
                        return ;
                    }


                    obj.setAlias(alias);
                    project.trigger({
                        type: "field.alias.update",
                        data: {
                            field: obj
                        },
                        field: obj
                    });
                }

                $.sendSuccess( res, {});
            }catch(err){
                Logger.error("[API][CODE] Field cannot be aliased. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Field cannot be aliased. Cause : " + err.message);
            }
        }
    }
);


CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/field/xref/:id',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS



                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC
                const data:any = [];
                const sign:string = Util.decodeURI(Util.b64_decode(req.params.id));
                const field:ModelField = project.find.get.field(sign);

                if(field==null){
                    throw new Error("Field not found : "+sign);
                }

                Object.values(field.getSetters()).forEach(function (x) {
                    data.push({
                        s: x.signature(),
                        a: x.getAlias(),
                        t: 's',
                        tags: x.getTags()
                    });
                });


                Object.values(field.getGetters()).forEach(function (x) {
                    data.push({
                        s: x.signature(),
                        a: x.getAlias(),
                        t: 'g',
                        tags: x.getTags()
                    });
                });


                // ========== RESPONSE
                $.sendSuccess( res, data);
            }catch(err){
                Logger.error("[API][CODE] Field cross-references cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Field cross-references cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);



CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/class',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }


                await project.resetIdleTime();

                // ========== LOGIC
                // collect
                const data:any = project.find.class('name:/.*/').toJsonObject({include:[]});

                for (const i in data) {
                    for (const k in data[i].methods) {
                        if (project.hook.isProbing(data[i].methods[k])) {
                            data[i].methods[k].probing = true;
                        } else {
                            data[i].methods[k].probing = false;
                        }
                    }
                }

                // ========== RESPONSE
                $.sendSuccess( res, data);
            }catch(err){
                Logger.error("[API][CODE] Class cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Class cannot be listed. Cause : " + err.message);
            }
        }
    }
);




CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/class/:id',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC
                const classRef = Util.decodeURI(Util.b64_decode(req.params.id));
                const cls = project.find.get.class(classRef);
                let data:any = null;

                if (cls != null) {
                    data = cls.toJsonObject({exclude:{}});

                    data.methods = [];
                    for(const k in cls.methods){
                        data.methods.push( cls.methods[k].toJsonObject({exclude:{}}));
                    }

                    data.fields = [];
                    for(const k in cls.fields){
                        data.fields.push( cls.fields[k].toJsonObject({exclude:{}}));
                    }
                }else{
                    throw new Error("Class not found : "+classRef);
                }


                // ========== RESPONSE
                $.sendSuccess( res, data);
            }catch(err){
                Logger.error("[API][CODE] Class cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Class cannot be retrieved. Cause : " + err.message);
            }
        },
        'put': async (req:DelegateRequest, res:DelegateResponse) => {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS



                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC
                // collect
                const sign:string = Util.decodeURI(Util.b64_decode(req.params.id));
                const obj:ModelClass = project.find.get.class(sign);
                const alias:string = req.body['alias'];
                let pkg: ModelPackage;

                if (obj == null) {
                    throw new Error("Class not found");
                }

                //console.log(alias);
                if(alias != null){

                    if(alias == obj.simpleName){
                        $.sendError(res, {
                            success: false,
                            msg: { type:'warn', msg:'Ignored because the alias not differs from name.'}
                        });
                        return ;
                    }

                    pkg = obj.getPackage() as ModelPackage;
                    if(pkg!=null && pkg.hasAliasedClass(alias)){
                        $.sendError(res, {
                            success: false,
                            msg: { type:'err', msg:'A conflict has been detected. Please choose another alias.'}
                        });
                        return ;
                    }
                    obj.setAlias(alias);
                    project.trigger({
                        type: "class.alias.update",
                        data: {
                            cls:obj
                        },
                        cls: obj
                    });


                    // ========== RESPONSE
                    $.sendSuccess( res, {});
                }else{
                    throw new Error("Alias not specified");
                }

            }catch(err){
                Logger.error("[API][CODE] Class cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Class cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);


CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/finder',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS
                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }


                await project.resetIdleTime();

                // ========== LOGIC
                const search:string = req.query.search as string;
                const dev:any = {};

                if (search == null) {
                    throw new Error("No search request");
                }

                // decode the query
                const u:string = Util.decodeURI(search);
                const u1:string = Util.b64_decode(u);
                const u2:string = Util.decodeURI(u1);
                Logger.info("[API][CODE][FINDER]: ", 'project.find.' + u2 + ';');

                //search = Util.decodeURI(Util.b64_decode(search));
                //Logger.info("[REST] /api/finder : ", u2);
                //Logger.info("[REST] /api/finder : ",search);

                // perform the requests (TODO: ajouter les erreur dans FinderResult)
                //const results:any = VM.runInNewContext('project.find.' + u2 + ';', { project: project });

                let results:any;

                try{
                    results = VM.runInNewContext('project.find.' + u2 + ';', { project: project });
                    //results = await VM.runInNewContext('(project.merlin.' + u2 + ').execute(project);', { project: project });

                }catch(err){
                    Logger.error('[API][CODE][FINDER] '+err.message+"\n"+err.stack);
                    throw new Error("No results");
                }

                /*
                if(req.query.hasOwnProperty('type')
                    && req.query.type as string .length>0){
                    dev.data = [];
                    switch(req.query.type){
                        case 'm':
                            // when a terminal node is an ID
                            if(results instanceof FinderResult){
                                (results as FinderResult).foreach( function(v){
                                    if(v instanceof ModelMethod){
                                        dev.data.push(v.toJsonObject())
                                    }else{
                                        Logger.info(v);
                                        const mm=$.project.find.get.method(v);
                                        if(mm!=null){
                                            if(mm.toJsonObject != null)
                                                dev.data.push(mm.toJsonObject());
                                            else
                                                dev.data.push(mm);
                                        }

                                    }
                                })
                            }else{
                                dev.data = results;
                            }
                            break;
                    }

                }else{
                    // collect
                }*/


                // ========== RESPONSE
                $.sendSuccess( res, results.toJsonObject({}));
            }catch(err){
                Logger.error("[API][CODE] Search query failed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Search query failed. Cause : " + err.message);
            }
        }
    }
);




CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/libraries',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject;

            try{
                if(req.query['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                $.sendSuccess( res,
                    (await project.getProgramManager().listProjectLibraries(req.user))
                        .map(x => x.toJsonObject({}, SecurityZone.PUBLIC))
                );
            }catch(err){
                Logger.error("[API][CODE] Content of package cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Content of package cannot be listed. Cause : " + err.message);
            }
        }
    }

);



CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/merlin/search',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject;

            try{
                if(req.query['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                const request = MerlinSearchRequest.fromJsonObject(
                    project.getMerlinEngine(),
                    req.body.request
                );

                const data = await request.executePDB(req.project, { nolink:true });

                const json = data.getData().map(x => {
                    if(x!=null){
                        return x.toJsonObject();
                    }else{
                        return null;
                    }
                })

                $.sendSuccess( res,json );


            }catch(err){
                Logger.error("[API][CODE] Search failure. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Search failure. Cause : " + err.message);
            }
        }
    },{
        mcp: {
            [HTTP_VERB.POST]: {
                name:'code-merlin-search',
                uri: '/merlin/search',
                summary: `To search any kind of data from universal representation. The universal representation from Reversense
                contains any token of data from binary code, any files, memory from target process, and so on.
                
                A full list of node types is available in the documentation are listed below:
                ${Object.values(NodeType.ALL).map(x => "- "+x.getName()+":"+x.getDescr()).join("\n")}
                
                Merlin is the name of the search engine used to retrieve data from universal representation.
                The universal representation is generated a graph database generated by Dexcalibur.
                 
                Merlin language can be used textually or through a JSON object to request set of nodes matching a given criteria.
                Critiria are expressed as a set of conditions. Each condition is composed of a field name, 
                a comparison operator and a value. Some condition are constraints related to node properties or adjacent nodes and relationship.
                But as the merlin language manipulate group of matching nodes, some algebric operations common to SQL are available.
                
                Such as : "union", "intersect", "join"
                
                The language is described below :
                
                `,
                parameters: [{
                    name: 'project',
                    required: false,
                    description: "Optional but recommended, it is the UUID of the project. "+DexcaliburProject.TYPE.getPrimaryKey()._dscr,
                    schema: DexcaliburProject.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'request',
                    required: true,
                    description: `Serialized JSON object containing the Merlin request. 
                    
                    The request is composed of a set of conditions.
                    
                    Possible values are : ${Object.values(NodePurpose).join(',')}.`,
                    schema: { type:"string", enum: Object.values(NodePurpose) as NodePurpose[] }
                }],
                responses: [{
                    description:`Returns the status of the project opening operation with various options.
                    Response have following properties :
                    - **ready** : TRUE if the project has been opened successfully, false otherwise.
                    - **node** : the UUID of the engine node used to open the project.
                    - **wf** : the UUID of the workflow used to open the project. Workflow is null if the project has been opened successfully.
                    - **createErr** : true if an error occurred during the project opening process, false otherwise.
                    - **msg** : Optional, a message describing the error.`,
                    schema: {
                        type: 'object',
                        properties: {
                            ready: {type:'boolean'},
                            node: {type:'string'},
                            wf: {type:'string'},
                            createErr: {type:'string'},
                            msg: {type:'string'}
                        },
                        required: ['ready','node']
                    }
                }]
            }
        }
    }
);



CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/preload',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            let $: WebServer = req.dxc.$;

            try{
                const proj = (await $.context.getProjectManager().preloadForDirect(req.user, req.body.pid));

                if(proj != null ){
                    $.sendSuccess( res, true);
                }else{
                    $.sendSuccess( res, false);
                }
            }catch(err){
                //Logger.error("[API][CODE] Search failure from node ref. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Search failure from node ref. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);


CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/direct/:pid/:nodetype/search',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {


            let $: WebServer = req.dxc.$;

            try{

                const nodeType = req.params.nodetype;
                const nodeUID = req.body.nodeuid;

                const proj = (await $.context.getProjectManager().preloadForDirect(req.user, req.params.pid));

                // TODO
                const result = (await (MerlinSearchRequest.getByRef({
                    __:parseInt(nodeType,10),
                    _uid:nodeUID
                },proj.getMerlinEngine() )).executePDB(proj));


                if(result.count()>0){
                    $.sendSuccess( res, result.get(0).toJsonObject());
                }else{
                    $.sendSuccess( res, null);
                }


            }catch(err){
                //Logger.error("[API][CODE] Search failure from node ref. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Search failure from node ref. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);




CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/direct/:puid/:nodetype/disass',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {


            let $: WebServer = req.dxc.$;

            try{

                const nodeType = req.params.nodetype;
                const nodeUID = req.body.nodeuid;


                const proj = (await $.context.getProjectManager().preloadForDirect(req.user, req.params.puid));

                const result = (await (MerlinSearchRequest.getByRef({
                    __:parseInt(nodeType,10),
                    _uid:nodeUID
                },proj.getMerlinEngine() )).executePDB(proj));

                if(result.count()>0){
                    if(result.get(0).disass==null){
                        throw new Error("This node cannot be disassembled.");
                    }

                    $.sendSuccess( res, {
                        disass: (result.get(0) as any).disass({ raw: true }, proj.getDisassembler())
                    });
                }else{
                    throw new Error("Node not found");
                }


            }catch(err){
                Logger.error("[API][CODE] Disassembly failure from node ref. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Disassembly failure from node ref. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);



CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/analysis/sca',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {

            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                let compo = await project.getAnalyzer().performSca({
                    duplex: true
                });

                $.sendSuccess( res, compo);

            }catch(err){
                Logger.error("[API][CODE] Disassembly failure from node ref. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Disassembly failure from node ref. Cause : " + err.message);
            }
        }
    }
);


CODE_WEB_API.addAsyncAuthenticatedRoute(
    '/nodeinfo/:type',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {

            let $: WebServer = req.dxc.$;

            try{
                // ========== SECURITY CHECKS

                $.sendSuccess( res, ElixirUtils.exportNodeInfo(
                    parseInt(req.params.type,10)
                    , SecurityZone.PUBLIC));

            }catch(err){
                //Logger.error("[API][CODE] Disassembly failure from node ref. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Disassembly failure from node ref. Cause : " + err.message);
            }
        }
    }
);


