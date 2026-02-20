import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";
import KeyPointManager from "../hook/KeyPointManager.js";
import KeyPoint from "../hook/KeyPoint.js";
import {KeyPointManagerException} from "../errors/KeyPointManagerException.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AbstractHook} from "../hook/AbstractHook.js";
import {NodeUtils} from "@dexcalibur/dexcalibur-orm";
import {ProjectManagerException} from "../errors/ProjectManagerException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {MerlinSearchRequest} from "../search/MerlinSearchRequest.js";;

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const KEYPOINT_WEB_API: DelegateWebApi = new DelegateWebApi('KEYPOINTS');

KEYPOINT_WEB_API.addAsyncAuthenticatedRoute(
    '/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{

                if(req.project==null){
                    throw ProjectManagerException.PROJECT_IS_MANDATORY();
                }

                if(!req.project.isReady()) {
                    throw DexcaliburProjectException.PROJECT_NOT_READY(req.project.getUID());
                }

                // get hook instance by ID
                const kpm:KeyPointManager = req.project.getKeyPointManager();
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
        async: true
    }
);

KEYPOINT_WEB_API.addAsyncAuthenticatedRoute(
    '/new',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject;

            let kp:KeyPoint;

            try{
                if(req.query['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady())
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                if(req.project==null)
                    throw ProjectManagerException.PROJECT_IS_MANDATORY();
                if(!req.project.isReady())
                    throw DexcaliburProjectException.PROJECT_NOT_READY(req.project.getUID());
                if(!NodeUtils.isNodeRef(req.body['target']))
                    throw new Error("Invalid target node reference");


                // ========== LOGIC
                const result = (await (MerlinSearchRequest.getByRef({
                    __: req.body['target'].__,
                    _uid: req.body['target']._uid
                },project.getMerlinEngine() )).executePDB(project));

                if(result.count()==0){
                    throw new Error("Target node not found.");
                }

                kp = await ((req.project as DexcaliburProject)
                    .getKeyPointManager()
                    .createKeyPoint(
                        result.get(0),
                        req.body['opts']
                    ));

                (req.project as DexcaliburProject)
                    .getKeyPointManager().generate(kp)


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


KEYPOINT_WEB_API.addAsyncAuthenticatedRoute(
    '/edit/:uid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.project==null){
                    throw ProjectManagerException.PROJECT_IS_MANDATORY();
                }

                if(!req.project.isReady()) {
                    throw DexcaliburProjectException.PROJECT_NOT_READY(req.project.getUID());
                }

                $.sendSuccess(res, (await req.project.getKeyPointManager().getKeyPointByAttr({name:req.params['uid']})).toJsonObject());
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Point cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Point cannot be retrieved. Cause : " + err.message);
            }
        },
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{

                if(req.project==null){
                    throw ProjectManagerException.PROJECT_IS_MANDATORY();
                }

                if(!req.project.isReady()) {
                    throw DexcaliburProjectException.PROJECT_NOT_READY(req.project.getUID());
                }

                // get hook instance by ID
               // const uid =  KeyPoint.TYPE.getPrimaryKey().sanitize(req.param['uid']); //KeyPoint.TYPE.
                const kp:KeyPoint = await req.project.getKeyPointManager().getKeyPointByAttr({name:req.body.uid});
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


                await req.project.getKeyPointManager().update(kp);

                $.sendSuccess(res,  {});
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Point cannot be updated. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Point cannot be updated. Cause : " + err.message);
            }
        },
        'delete': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.project==null){
                    throw ProjectManagerException.PROJECT_IS_MANDATORY();
                }

                if(!req.project.isReady()) {
                    throw DexcaliburProjectException.PROJECT_NOT_READY(req.project.getUID());
                }
                // ========== LOGIC
                // get hook instance by ID
                const kpm:KeyPointManager = req.project.getKeyPointManager();
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
        async: true,
        readProject: true
    }
);


KEYPOINT_WEB_API.addAsyncAuthenticatedRoute(
    '/remove/token',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.project==null){
                    throw ProjectManagerException.PROJECT_IS_MANDATORY();
                }

                if(!req.project.isReady()) {
                    throw DexcaliburProjectException.PROJECT_NOT_READY(req.project.getUID());
                }

                // ========== LOGIC
                const kpm:KeyPointManager = req.project.getKeyPointManager();
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
        async: true,
        readProject: true
    }
);



KEYPOINT_WEB_API.addAsyncAuthenticatedRoute(
    '/enable',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.project==null){
                    throw ProjectManagerException.PROJECT_IS_MANDATORY();
                }

                if(!req.project.isReady()) {
                    throw DexcaliburProjectException.PROJECT_NOT_READY(req.project.getUID());
                }

                const unsafeKeypointID = req.body['kp'];
                const unsafeEnable = parseInt(req.body['enable'], 10);
                const project:DexcaliburProject = req.project;

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
        async: true,
        readProject: true
    }
);


KEYPOINT_WEB_API.addAsyncAuthenticatedRoute(
    '/attach/hook',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.project==null){
                    throw ProjectManagerException.PROJECT_IS_MANDATORY();
                }

                if(!req.project.isReady()) {
                    throw DexcaliburProjectException.PROJECT_NOT_READY(req.project.getUID());
                }

                const kpm:KeyPointManager = req.project.getKeyPointManager();
                const unsafeHookID = req.body['hook'];
                const unsafeKeypointID = req.body['kp'];
                const unsafeHookAction = req.body['type'];
                const project:DexcaliburProject = req.project;

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


