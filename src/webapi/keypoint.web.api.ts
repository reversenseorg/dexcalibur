import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import KeyPointManager from "../hook/KeyPointManager.js";
import KeyPoint, {KeyPointLifecycleEventType} from "../hook/KeyPoint.js";
import {KeyPointManagerException} from "../errors/KeyPointManagerException.js";
import {NodeInternalType, NodeInternalTypeName}
from "@dexcalibur/dxc-core-api";;
import {KeyPointOptions} from "../hook/KeyPointGenerator.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AbstractHook} from "../hook/AbstractHook.js";
import {INode, NodeType} from "@dexcalibur/dexcalibur-orm";
import { Node } from "../INode.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const KEYPOINT_WEB_API: DelegateWebApi = new DelegateWebApi();

/*
KEYPOINT_WEB_API.addAuthenticatedRoute(
    '/search',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;
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

                // get hook instance by ID
                const kpm:KeyPointManager = project.getKeyPointManager();
                const o:KeyPoint[] = [];

                kpm.getKeyPoints().map( (x:KeyPoint)=>{
                    o.push(x.toJsonObject());
                })
                $.sendSuccess(res,  o);
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Points cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Points cannot be listed. Cause : " + err.message);
            }
        }
    }
);*/


KEYPOINT_WEB_API.addAuthenticatedRoute(
    '/list',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                // get hook instance by ID
                const kpm:KeyPointManager = req.dxc.project.getKeyPointManager();
                const o:KeyPoint[] = [];

                (await kpm.getKeyPoints()).map( (x:KeyPoint)=>{
                    o.push(x.toJsonObject());
                })
                $.sendSuccess(res,  o);
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Points cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Points cannot be listed. Cause : " + err.message);
            }
        }
    },{
        readProject: true,
        readProjectStrict: true
    }
);

KEYPOINT_WEB_API.addAuthenticatedRoute(
    '/new',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            let kp:KeyPoint;

            try{
                // ========== LOGIC
                // get hook instance by ID
                // const uid =  KeyPoint.TYPE.getPrimaryKey().sanitize(req.params['uid']); //KeyPoint.TYPE.
                const targetNodeType = NodeType.getByID(req.body['target'].__);
                const node = new (targetNodeType.getBuilder())({});
                targetNodeType.setPrimaryKeyValueOf(node, req.body['target']._uid)

                kp = await ((req.dxc.project as DexcaliburProject)
                    .getKeyPointManager()
                    .createKeyPoint(
                        node,
                        req.body['opts']
                    ));

                console.log(kp);

                $.sendSuccess(res,  kp.toJsonObject());
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Point cannot be created. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Point cannot be created. Cause : " + err.message);
            }
        },
    },{
        readProject: true
    }
);


KEYPOINT_WEB_API.addAuthenticatedRoute(
    '/edit/:uid',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                $.sendSuccess(res, (await req.dxc.project.getKeyPointManager().getKeyPointByAttr({name:req.params['uid']})).toJsonObject());
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Point cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Point cannot be retrieved. Cause : " + err.message);
            }
        },
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC
                // get hook instance by ID
               // const uid =  KeyPoint.TYPE.getPrimaryKey().sanitize(req.param['uid']); //KeyPoint.TYPE.
                const kp:KeyPoint = await req.dxc.project.getKeyPointManager().getKeyPointByAttr({name:req.body.uid});
                const unsafeData = req.body.opts

                for(const unsafePPT in unsafeData){
                    switch (unsafePPT){
                        case 'name':
                            kp.setName(unsafeData[unsafePPT]);
                            break;
                        case 'token':
                            kp.setToken(unsafeData[unsafePPT]);
                            break;
                        case 'description':
                            kp.setDescription(unsafeData[unsafePPT]);
                            break;
                        case 'code':
                            kp.code = unsafeData[unsafePPT];
                            break;
                        case 'generator':
                            break;
                        case 'condition':
                            kp.setCondition(unsafeData[unsafePPT]);
                            break;
                        case 'weight':
                            kp.setWeight(unsafeData[unsafePPT]);
                            break;
                        case 'type':
                            kp.setKeypointType(unsafeData[unsafePPT]);
                            break;
                        default:
                            throw KeyPointManagerException.INVALID_KEYPOINT_PPT(unsafePPT);
                            break;
                    }
                }


                await req.dxc.project.getKeyPointManager().update(kp);

                $.sendSuccess(res,  {});
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Point cannot be updated. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Point cannot be updated. Cause : " + err.message);
            }
        },
        'delete': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC
                // get hook instance by ID
                const kpm:KeyPointManager = req.dxc.project.getKeyPointManager();
                let removedCtr:number;

                const kp:KeyPoint = await kpm.getKeyPointByAttr({name:req.params['uid']});
                if( kp != null){
                    await kpm.remove(kp);
                    removedCtr = 1;
                }else{
                    removedCtr = await kpm.removeByToken(kp.getToken());
                    if(removedCtr==0){
                        throw KeyPointManagerException.UNKNOW_KEYPOINT(req.params['uid']);
                    }
                }

                $.sendSuccess(res,  { removed: removedCtr });
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Point cannot be removed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Point cannot be removed. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


KEYPOINT_WEB_API.addAuthenticatedRoute(
    '/remove/token',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const kpm:KeyPointManager = req.dxc.project.getKeyPointManager();
                const unsafeToken = req.body['token'];

                const nb = await kpm.removeByToken(unsafeToken);
                if(nb>0){
                    $.sendSuccess(res,  { removed:nb });
                }else{
                    throw KeyPointManagerException.UNKNOW_TOKEN(unsafeToken);
                }
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Point cannot be removed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Point cannot be removed. Cause : " + err.message);
            }
        },
    },{
        readProject: true
    }
);



KEYPOINT_WEB_API.addAuthenticatedRoute(
    '/enable',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const unsafeKeypointID = req.body['kp'];
                const unsafeEnable = parseInt(req.body['enable'], 10);
                const project:DexcaliburProject = req.dxc.project;

                if( unsafeEnable > 1 || unsafeEnable < 0){
                    throw new KeyPointManagerException("Key point status not supported. Value : 1 or 0");
                }

                const kp:KeyPoint = await  project.getKeyPointManager().getKeyPointByAttr({name:unsafeKeypointID});
                kp.active( unsafeEnable===1? true : false);
                await project.getKeyPointManager().update(kp);

                $.sendSuccess(res,  kp.toJsonObject());
            }catch(err){
                Logger.error("[API][KEY POINTS] Status of Key Point cannot be changed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Status of Key Point cannot be changed. Cause : " + err.message);
            }
        },
    },{
        readProject: true
    }
);


KEYPOINT_WEB_API.addAuthenticatedRoute(
    '/attach/hook',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const kpm:KeyPointManager = req.dxc.project.getKeyPointManager();
                const unsafeHookID = req.body['hook'];
                const unsafeKeypointID = req.body['kp'];
                const unsafeHookAction = req.body['type'];
                const project:DexcaliburProject = req.dxc.project;

                if( ['load','unload'].indexOf(unsafeHookAction) == -1){
                    throw new KeyPointManagerException("Type of hook action not supported. Value : load/unload")
                }

                const hk:AbstractHook = project.getHookManager().getHookByID(unsafeHookID);
                const kp:KeyPoint = await project.getKeyPointManager().getKeyPointByAttr({name:unsafeKeypointID});

                if(hk.hasKeyPointFor(unsafeHookAction)){
                    hk.detachKeyPoint(unsafeHookAction);
                    hk.attachKeyPoint(unsafeHookAction, kp);
                }else{
                    hk.attachKeyPoint(unsafeHookAction, kp);
                }

                await project.getHookManager().save(hk);

                $.sendSuccess(res,  null);
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Point cannot be removed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Point cannot be removed. Cause : " + err.message);
            }
        },
    },{
        readProject: true
    }
);


