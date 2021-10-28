import {DelegateWebApi} from "./DelegateWebApi";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer";
import {Request, Response} from "express";
import * as Log from "../Logger";
import DexcaliburProject from "../DexcaliburProject";
import {AuthenticationException} from "../errors/AuthenticationException";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException";
import ModelMethod from "../ModelMethod";
import Util from "../Utils";
import Simplifier from "../Simplifier";
import ModelClass from "../ModelClass";
import ModelField from "../ModelField";
import ModelPackage from "../ModelPackage";
import * as VM from "vm";
import {FinderResult} from "../FinderResult";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const CODE_WEB_API: DelegateWebApi = new DelegateWebApi();


/**
 * /api/application/cmp?type=[dex|ks|libs|strings] ...
 */
CODE_WEB_API.addAuthenticatedRoute(
    '/package',
    {
        'get': function (req:Request, res:Response):any {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            let format:any = req.query.hasOwnProperty('format')? req.query.format : 'list';
            let query:string = req.query.hasOwnProperty('query')? req.query.query : '.*';
            let filter:string = req.query.hasOwnProperty('filter')? req.query.filter : null;
            let filter2:string = req.query.hasOwnProperty('filter2')? req.query.filter2 : null;
            let fields:string[] = req.query.hasOwnProperty('fields')? req.query.fields.split(',') : ['name'];
            let data:FinderResult;


            try{

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }


                if(format=='tree'){
                    if(query=='.*')
                        data = project.find.package('name:^[^\\.]*$');
                    else
                        data = project.find.package('name:'+query);
                }else{
                    data = project.find.package('name:.*');
                }

                if(filter != null){
                    data = data.filter(filter);
                }

                if(filter2 != null && filter2.indexOf(':ds')>-1){
                    // replace all by tagged 'executable by target platform'
                    const d = project.find.file( 'type:ELF', project.dataAnalyzer.getScope('PKG'));
                    data = data.union(d);
                }

                fields.push('__');
                $.sendSuccess( res, data.toJsonObject(fields));
            }catch(err){
                Logger.error("[API][CODE] Content of package cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Content of package cannot be listed. Cause : " + err.message);
            }
        }
    }

);


CODE_WEB_API.addAuthenticatedRoute(
    '/method/simplify/:id',
    {
        'post': function (req:Request, res:Response):any {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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
                let dev:any = {};
                let method:ModelMethod = project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.id)));

                let simplifier:Simplifier = project.getSimplifier(); // Simplifier.getInstance($.project);

                // init body
                simplifier.setParametersValues(req.body.params);
                simplifier.setInitParentClass(req.body.clinit);
                simplifier.setMaxDepth(req.body.depth);

                let simplifyLvl:number = (req.body.level!=undefined)? req.body.level : 0;

                dev = simplifier.simplify(method, simplifyLvl);

                // ============= RESPONSE
                $.sendSuccess( res, dev);
            }catch(err){
                Logger.error("[API][CODE] Method cannot be simplified. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Method cannot be simplified. Cause : " + err.message);
            }
        }
    }
);



CODE_WEB_API.addAuthenticatedRoute(
    '/method/disass/:id',
    {
        'get': function (req:Request, res:Response):any {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

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
CODE_WEB_API.addAuthenticatedRoute(
    '/method',
    {
        'get': function (req:Request, res:Response):any {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC +  RESPONSE
                $.sendSuccess( res, project.find.method('name:.*').toJsonObject());
            }catch(err){
                Logger.error("[API][CODE] Method cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Method cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);


CODE_WEB_API.addAuthenticatedRoute(
    '/method/xref/:id',
    {
        'get': function (req:Request, res:Response):any {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC
                const type:string = req.query.type;

                // collect
                const  method:ModelMethod = project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.id)));

                if (method == null) {
                    throw new Error("XRef to > Specified method not found : "+Util.decodeURI(Util.b64_decode(req.params.id)))
                }

                const data:any = [];
                let tmp:any = null, refs:(ModelMethod|string)[] = null, r2 = null;

                switch (type) {
                    case "from":
                        Object.keys(method.getMethodUsed()).forEach(function (x) {
                            let m:ModelMethod = project.find.get.method(x);
                            tmp = {
                                // method signature
                                s: m.signature(),
                                // aliased signature
                                a: m.__aliasedCallSignature__,
                                // return type signature
                                r: (m.getReturnType() != null ? m.getReturnType().signature() : null),
                                // tags
                                tags: m.getTags()
                            };
                            // args signatures
                            tmp.p = [];
                            if (m.hasArgs())
                                m.getArgsType().map(x => tmp.p.push(x.signature()));
                            data.push(tmp);
                        });
                        /*
                        Object.keys(method.getClassUsed()).forEach( x => data.push({
                            // method signature
                            s: x,
                            // type
                            t: "c"
                        }));*/
                        Object.keys(method.getFieldUsed()).forEach(x => data.push({
                            // method signature
                            s: x,
                            // type
                            t: "f"
                        }));

                        break;
                    case "to":

                        refs = method.getCallers();
                        //console.log(refs);
                        for (let i:number = 0; i < refs.length; i++) {

                            //r2 = $.project.find.get.method(refs[i]);
                            r2 = refs[i];
                            if( (r2 instanceof ModelMethod) == false){
                                r2 = project.find.get.method(r2)
                            }

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
                }

                // RESPONSE
                $.sendSuccess( res, data);
            }catch(err){
                Logger.error("[API][CODE] Xref cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Xref cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);


CODE_WEB_API.addAuthenticatedRoute(
    '/method/:id',
    {
        'get': function (req:Request, res:Response):any {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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
                let dev:any = {};
                const callers:(string|ModelMethod)[] = [];
                //console.log(Util.decodeURI(Util.b64_decode(req.params.id)));
                const methRef:string = Util.decodeURI(Util.b64_decode(req.params.id));
                const method:ModelMethod = project.find.get.method(methRef);

                if (method != null) {

                    if(req.query.probing){
                        method.setProbing(project.hook.isProbing(method));
                    }

                    dev = method.toJsonObject();
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
        'put': function (req:Request, res:Response):any {


            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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
    }
);




CODE_WEB_API.addAuthenticatedRoute(
    '/field/:id',
    {
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC +  RESPONSE
                const sign:string = Util.decodeURI(Util.b64_decode(req.params.id));
                const field:ModelField = project.find.get.field(sign);

                if(field==null){
                    throw new Error("Field not found : "+sign);
                }

                $.sendSuccess( res, field.toJsonObject());
            }catch(err){
                Logger.error("[API][CODE] Field cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Field cannot be retrieved. Cause : " + err.message);
            }
        },

        'put': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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


CODE_WEB_API.addAuthenticatedRoute(
    '/field/xref/:id',
    {
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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



CODE_WEB_API.addAuthenticatedRoute(
    '/class',
    {
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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
                const data:any = project.find.class('name:.*').toJsonObject();

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




CODE_WEB_API.addAuthenticatedRoute(
    '/class/:id',
    {
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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
                    data = cls.toJsonObject();

                    data.methods = [];
                    for(const k in cls.methods){
                        data.methods.push( cls.methods[k].toJsonObject());
                    }

                    data.fields = [];
                    for(const k in cls.fields){
                        data.fields.push( cls.fields[k].toJsonObject());
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
        'put': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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


CODE_WEB_API.addAuthenticatedRoute(
    '/finder',
    {
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC
                const search:string = req.query.search;
                const dev:any = {};

                if (search == null) {
                    throw new Error("No search request");
                }

                // decode the query
                const u:string = Util.decodeURI(search);
                Logger.info("[FINDER]: ", u);
                const u1:string = Util.b64_decode(u);
                Logger.info("[FINDER]: ", u1);
                const u2:string = Util.decodeURI(u1);
                Logger.info("[FINDER]: ", 'project.find.' + u2 + ';');

                //search = Util.decodeURI(Util.b64_decode(search));
                Logger.info("[REST] /api/finder : ", u2);
                //Logger.info("[REST] /api/finder : ",search);

                // perform the requests (TODO: ajouter les erreur dans FinderResult)
                const results:any = VM.runInNewContext('project.find.' + u2 + ';', { project: project });

                /*
                if(req.query.hasOwnProperty('type')
                    && req.query.type.length>0){
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
                $.sendSuccess( res, results.toJsonObject());
            }catch(err){
                Logger.error("[API][CODE] Search query failed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Search query failed. Cause : " + err.message);
            }
        }
    }
);


/*this.app.route('/api/field/:id/setters')
    .get(function(req,res){
        // collect
        let dev = {};
        //let sign = Util.decodeURI(Util.b64_decode(req.params.id));
        let field = $.project.find.get.field(Util.decodeURI(Util.b64_decode(req.params.id)));
        setters = field.getSetters();
        getters = field.getGetters();

        for(let i=0; i<setters.length; i++)
            dev.setters = setters[i].toJsonObject();
        for(let i=0; i<getters.length; i++)
            dev.getters = getters[i].toJsonObject();

        //dev = field.toJsonObject(["__setters"]);
        // dev.htg = $.project.graph.htg(method);

        res.status(200).send(JSON.stringify(dev));
    });*/




