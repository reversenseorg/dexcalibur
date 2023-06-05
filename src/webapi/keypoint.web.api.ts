import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import KeyPointManager from "../hook/KeyPointManager.js";
import KeyPoint, {KeyPointLifecycleEventType} from "../hook/KeyPoint.js";
import {KeyPointManagerException} from "../errors/KeyPointManagerException.js";
import {NodeInternalType, NodeInternalTypeName} from "../NodeInternalType.js";
import {KeyPointOptions} from "../hook/KeyPointGenerator.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {INode} from "../INode.js";
import {AbstractHook} from "../hook/AbstractHook.js";

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
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                // get hook instance by ID
                const kpm:KeyPointManager = req.dxc.project.getKeyPointManager();
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
    },{
        readProject: true
    }
);

KEYPOINT_WEB_API.addAuthenticatedRoute(
    '/new',
    {
        'post': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                // get hook instance by ID
                // const uid =  KeyPoint.TYPE.getPrimaryKey().sanitize(req.params['uid']); //KeyPoint.TYPE.
                const kp:KeyPoint = new KeyPoint();
                const target:any = req.body['target'];
                const opts:KeyPointOptions = new KeyPointOptions(req.body['opts']);
                const KPM:KeyPointManager = (req.dxc.project as DexcaliburProject).getKeyPointManager();

                Logger.debug(JSON.stringify(target));
                Logger.debug(JSON.stringify(opts));

                const node:any = req.dxc.project.getAnalyzer().searchNode( target.__, target.uid)

                if(node == null){
                    throw KeyPointManagerException.INVALID_TARGET_NODE(target.__, target.uid);
                }else{
                    kp.addNode(node as INode);
                }

                if(opts.hasOwnProperty('condition')) kp.setCondition(opts.condition);

                if(target.hasOwnProperty('name')){
                    kp.setName(target.name);
                }else{
                    // x.name = "core."+x.condition+(x.node.lengt>0 ? "."+x.node[0].uid : "");
                    kp.setName("user."+NodeInternalTypeName[node.__]+"."+opts.getConditionName()+"."+node.getUID());
                }
                if(target.hasOwnProperty('token')) kp.setToken(target.token);
                if(target.hasOwnProperty('descr')) kp.setDescription(target.descr);
                if(target.hasOwnProperty('weight')) kp.setWeight(parseInt(target.weight,10) );
                if(target.hasOwnProperty('type')) kp.setKeypointType(target.type);

                if(kp.getToken()==null){
                    kp.setToken( KPM.generateToken( kp, opts));
                }

                KPM.addKeyPoint( kp);

                Logger.debug(JSON.stringify(kp.toJsonObject()))
                $.sendSuccess(res,  req.dxc.project.getKeyPointManager().getKeyPoint(kp.getName()).toJsonObject());
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
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                // get hook instance by ID

                //const uid =  KeyPoint.TYPE.getPrimaryKey().sanitize(req.params['uid']); //KeyPoint.TYPE.

                $.sendSuccess(res,  req.dxc.project.getKeyPointManager().getKeyPoint(req.params['uid']).toJsonObject());
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Point cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Point cannot be retrieved. Cause : " + err.message);
            }
        },
        'post': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC
                // get hook instance by ID
               // const uid =  KeyPoint.TYPE.getPrimaryKey().sanitize(req.param['uid']); //KeyPoint.TYPE.
                const kp:KeyPoint = req.dxc.project.getKeyPointManager().getKeyPoint(req.body.uid);
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


                req.dxc.project.getKeyPointManager().update(kp);

                $.sendSuccess(res,  {});
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Point cannot be updated. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Point cannot be updated. Cause : " + err.message);
            }
        },
        'delete': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC
                // get hook instance by ID
                const kpm:KeyPointManager = req.dxc.project.getKeyPointManager();

                const kp:KeyPoint = kpm.getKeyPoint(req.params['uid']);
                if( kp != null){
                    kpm.remove(kp);
                    $.sendSuccess(res,  null);
                }else{
                    if(!kpm.removeByToken(kp.getToken())){
                        throw KeyPointManagerException.UNKNOW_KEYPOINT(req.params['uid']);
                    }
                }
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
        'post': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const kpm:KeyPointManager = req.dxc.project.getKeyPointManager();
                const unsafeToken = req.body['token'];

                if(kpm.removeByToken(unsafeToken)){
                    $.sendSuccess(res,  null);
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
        'post': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const unsafeKeypointID = req.body['kp'];
                const unsafeEnable = parseInt(req.body['enable'], 10);
                const project:DexcaliburProject = req.dxc.project;

                if( unsafeEnable > 1 || unsafeEnable < 0){
                    throw new KeyPointManagerException("Key point status not supported. Value : 1 or 0");
                }

                const kp:KeyPoint = project.getKeyPointManager().getKeyPoint(unsafeKeypointID);
                kp.active( unsafeEnable===1? true : false);
                project.getKeyPointManager().update(kp);

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
        'post': function (req:DelegateRequest, res:DelegateResponse):any {
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
                const kp:KeyPoint = project.getKeyPointManager().getKeyPoint(unsafeKeypointID);

                if(hk.hasKeyPointFor(unsafeHookAction)){
                    hk.detachKeyPoint(unsafeHookAction);
                    hk.attachKeyPoint(unsafeHookAction, kp);
                }else{
                    hk.attachKeyPoint(unsafeHookAction, kp);
                }

                project.getHookManager().save(hk);

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


