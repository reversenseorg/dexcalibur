import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import ModelFile from "../ModelFile.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {ModelFunction} from "../ModelFunction.js";
import {FinderResult} from "../search/FinderResult.js";
import NativeAnalyzer from "../NativeAnalyzer.js";
import {NativeAnalyzerException} from "../errors/NativeAnalyzerException.js";
import {NativeAnalyzerCommands} from "../analyzer/NativeAnalyzerCommands.js";
import Util from "../Utils.js";
import {AbiManager} from "../binary/ABI.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export const NATIVE_WEB_API: DelegateWebApi = new DelegateWebApi();



NATIVE_WEB_API.addAsyncAuthenticatedRoute(
    '/func',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
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
                if(req.query['uid']==null){
                    throw new Error("[NATIVE::FUNC] #NAT_3 Invalid Function signature");
                }

                const fn:ModelFunction = project.find.get.func(
                    decodeURIComponent(req.query['uid'] as string)
                );

                if(fn==null){
                    throw new Error("[NATIVE::FUNC] #NAT_4 Function not found");
                }

                if(req.query['cmd']!=null){
                    const cmd = (req.query['cmd'] as string).split(':');

                    const file:FinderResult = await project.find.file('_uid:'+fn.getDeclaringFile());
                    if(file.count()==0){
                        throw new Error("[NATIVE::FUNC] #NAT_45 Declaring file not found");
                    }

                    let success = -1;
                    if(project.analyze.getNativeAnalyzer().requireAnalysis( file.get(0) as ModelFile, cmd, {fn:fn})){
                        Logger.info("Executing native analysis of func : ",cmd.join(':'));
                        success = await project.analyze.getNativeAnalyzer().scan( file.get(0) as ModelFile, cmd, { fn:fn });
                    }else{

                        Logger.info("Command(s) : "+cmd.join(':')+' already executed for '+fn.getSignature());
                        success = 1;
                    }

                    if(success>-1)
                        $.sendSuccess(res, fn.toJsonObject());
                    else
                        $.sendError(res,  fn.toJsonObject());


                }else{
                    $.sendSuccess(res, fn.toJsonObject());
                }

            }catch(err){
                Logger.error("[API][NATIVE] Fail to retrieve native function. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Fail to retrieve native function. Cause : " + err.message);
            }
        }
    }
);


NATIVE_WEB_API.addAuthenticatedRoute(
    '/func/:b64_uid',
    {
        'put': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;
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
                if(req.params['b64_uid']==null){
                    throw NativeAnalyzerException.INVALID_FUNC_SIGN();
                }

                const signature = decodeURIComponent(Util.b64_decode(decodeURIComponent(req.params['b64_uid'])));
                Logger.info('[API][NATIVE] Searching function : '+req.params['b64_uid'],'     ',decodeURIComponent(Util.b64_decode(req.params['b64_uid'])));

                const fn:ModelFunction = project.find.get.func(
                    signature
                );

                if(fn==null){
                    throw NativeAnalyzerException.UNKNOW_FUNC();
                }

                const alias:string = req.body['alias'];

                if(alias != null){

                    if(alias == fn.name){
                        throw NativeAnalyzerException.ALIAS_MUST_DIFFERS_FROM_NAME();
                    }


                    fn.setAlias(alias);
                    project.trigger({
                        type: "function.alias.update",
                        data: {
                            func:fn
                        },
                        func: fn
                    });
                }


                // ========== RESPONSE
                $.sendSuccess( res, {});


            }catch(err){
                Logger.error("[API][NATIVE] Fail to edit (alias) native function. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Fail to edit (alias) native function. Cause : " + err.message);
            }
        }
    }
);


NATIVE_WEB_API.addAuthenticatedRoute(
    '/analysis',
    {
        'get':  async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
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
                if(req.query['uid']==null){
                    throw new Error("[NATIVE::ANALYSIS] #NAT_1 Invalid File UID");
                }



                const search:FinderResult = await project.find.file('_uid:'+req.query['uid']);
                if(search==null || search.count()==0){
                    throw new Error("[NATIVE::ANALYSIS] #NAT_2 File not found");
                }

                const cmd = (req.query['cmd']!=null ?  (req.query['cmd'] as string).split(':') : ['*']);

                if(project.analyze.getNativeAnalyzer().requireAnalysis( search.get(0), cmd, null)){

                    Logger.info("Executing native analysis : ",cmd.join(':'));
                    project.analyze.getNativeAnalyzer().scan(search.get(0) as ModelFile, cmd);
                }

                $.sendSuccess( res, (search.get(0) as ModelFile).toJsonObject({extra:{ cmd:cmd }}));
            }catch(err){
                Logger.error("[API][NATIVE] Perform native analysis of function failed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Perform native analysis of function failed. Cause : " + err.message);
            }
        }
    }
);


NATIVE_WEB_API.addAsyncAuthenticatedRoute(
    '/disass/func',
    {
        'get':  async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
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
                if(req.query['uid']==null){
                    throw new Error("Function UID is missing");
                }

                const fn_uid = req.query['uid']  as string;
                const fn:ModelFunction = project.find.get.func(fn_uid); // .func.get('_uid:'+req.query['uid']);
                if(fn == null){
                    throw new Error("Function ("+fn_uid+") not found ");
                }

/*
                let file:any = fn.getDeclaringFile();
                if(typeof file === 'string'){
                    Logger.info("[NATIVE ANALYZER] Declaring file is a string : "+file);
                    const f:ModelFile = project.find.get.files(file);
                    file = f ;
                    Logger.info("[NATIVE ANALYZER] Declaring file has been retrieved from DB : "+f.getUID());
                }else{
                    Logger.info("[NATIVE ANALYZER] Relative path of declaring file of target fn is : "+file.getRelativePath());
                }
            */


                const natAnal:NativeAnalyzer = project.analyze.getNativeAnalyzer();
                let commands:string[];
                if(req.query['cmd']!=null){
                    commands = NativeAnalyzerCommands.getFuncCmd(req.query['cmd']  as string);
                }else{
                    commands = [NativeAnalyzerCommands.FUNC_CMD.DISASS];
                }

                /*if(natAnal.requireAnalysis( file as ModelFile, commands, null)){
                    //Logger.error('[ANTIVEZ ANALYZER] Already analyzed files : '+Object.keys(natAnal.r2factory.helpers).join(' : '));
                    throw NativeAnalyzerException.ANALYSIS_REQUIRED((file as ModelFile).getRelativePath());
                }*/

                Logger.info("[NATIVE ANALYZER] Commands : ",commands.join(', '))
                const success = await natAnal.analyzeFunction(fn, commands, null);

                if(success)
                    $.sendSuccess( res,fn.toJsonObjectWithCmd(commands));
                else
                    $.sendError(res, " Disassembly of function failed without errors :( Please file an issue, if this error occurs.");
            }catch(err){
                Logger.error("[API][NATIVE] Disassembly of function failed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Disassembly of function failed. Cause : " + err.message);
            }
        }
    }
);


NATIVE_WEB_API.addAsyncAuthenticatedRoute(
    '/analyze/:type',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
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
                if(req.body['uid']==null){
                    throw NativeAnalyzerException.MISSING_FILE("<null>");
                }

                if(['file'].indexOf(req.params['type'])==-1){
                    throw new Error("Data type not supported");
                }

                switch (req.params['type']){
                    case 'file':
                        const sanitizedUID = ModelFile.TYPE.sanitize( '_uid', req.body['uid']);
                        const file:ModelFile = project.find.get.files(sanitizedUID.getValue());
                        if(file==null){
                            throw new Error("[NATIVE::ANALYSIS] #NAT_2 File not found");
                        }

                        const cmd = (req.body['cmd']!=null ?  req.body['cmd'].split(':') : ['*']);

                        if(project.analyze.getNativeAnalyzer().requireAnalysis( file, cmd, null) || (req.body['force']===true)){
                            const n = await project.analyze.getNativeAnalyzer().scan( file, cmd);
                            if(n>-1){
                                $.sendSuccess( res, file.toJsonObject({ extra:{ cmd:cmd.join(':') }}));
                            }else{
                                throw new Error('Analysis failed');
                            }
                        }else{
                            throw new Error('File already analyzed (cache response)');
                        }

                        break;
                }

            }catch(err){
                Logger.error("[API][NATIVE] Perform native analysis failed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Perform native analysis failed. Cause : " + err.message);
            }
        }
    }
);

NATIVE_WEB_API.addPublicRoute(
    '/public/settings/abi',
    {
        'get':  async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                $.sendSuccess( res, AbiManager.ABI);
            }catch(err){
                Logger.error("[API][NATIVE] List of ABI supported cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " List of ABI supported cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);



