import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import {Device} from "../Device.js";
import WebServer, {HTTP_CODE_ERROR} from "../WebServer.js";
import DeviceManager from "../DeviceManager.js";
import FridaHelper from "../FridaHelper.js";
import {Router, Request, Response} from "express";
import * as Log from "../Logger.js";
import {IDbIndex} from "../persist/orm/DbAbstraction.js";
import DataScope from "../DataScope.js";
import * as _path_ from "path";
import ModelFile from "../ModelFile.js";
import {UserSession} from "../user/session/UserSession.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {DexcaliburProjectMap} from "../DexcaliburEngine.js";
import Util from "../Utils.js";
import Platform from "../platform/Platform.js";
import AccessControl from "../user/acl/AccessControl.js";
import {AccessZone} from "../user/acl/Zones.js";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol.js";
import * as _fs_ from "fs";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {TagManager} from "../tags/TagManager.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {UserAccount} from "../user/UserAccount.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PROJECT_WEB_API: DelegateWebApi = new DelegateWebApi();



PROJECT_WEB_API.addAuthenticatedRoute(
    '/active',
    {
        'get':  (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{
                const data:any[] = [];
                const proj = $.context.getActiveProjects(req.dxc.sess.getUserAccount());

                for(const i in proj) data.push( proj[i].toJsonObject());
                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][PROJECT] List of actives projects cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "List of actives projects cannot be retrieved. Cause : "+err.message);
            }
        },
        'post': (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            // [EE] : On enterprise server, for multiple users, store active project into user session
            // [PE] : On professional, add auth but keep global active project
            // [CE] : On community ed, just change global active project
            let proj:DexcaliburProjectMap;
            let success = false;

            try{


                if(!req.body.hasOwnProperty('uid')
                    || (Util.isEmpty(req.body['uid'], Util.FLAG_WS | Util.FLAG_CR | Util.FLAG_TB))){
                    throw new Error("Invalid project UID.");
                }

                proj = $.context.getActiveProjects(req.dxc.sess.getUserAccount());
                for(const i in proj){
                    if(i===req.body.uid){
                        (req.dxc.sess as UserSession).setDefaultActiveProject(proj[i]);
                        success = true;
                        break;
                    }
                }


                if(success){
                    $.sendSuccess( res, {})
                }else{
                    throw DexcaliburProjectException.INVALID_NAME();
                }
            }catch(err){
                Logger.error("[API][PROJECT] Specified project cannot be set as default project. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "Specified project cannot be set as default project. Cause : "+err.message);
            }
        }
    }
)


PROJECT_WEB_API.addAuthenticatedRoute(
    '/list',
    {
        'get':  async (req:DelegateRequest, res:DelegateResponse):Promise<void>=>{

            const $:WebServer = req.dxc.$;

            try{


               /* $.context.listProjectsOf(req.session?.passport?.user as UserAccount)
                const projs:DexcaliburProject[] = await (req.session?.passport?.user as UserAccount)
                                                        .listProjects($.context);

                const list:any[] = [];

                projs.map(x => {
                    list.push( x.toJsonObject());
                });

                */
                const data:any[] = [];
                const projColl = ($.context.getEngineDB().getCollectionOf(DexcaliburProject.TYPE.getType()));
                const proj = await (projColl as MongodbDbCollection).getAsList();

                proj.map(x =>{
                    data.push( x.toJsonObject());
                });
                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][PROJECT] List of projects cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "List of projects cannot be retrieved. Cause : "+err.message);
            }
        }
    }
)


PROJECT_WEB_API.addAuthenticatedRoute(
    '/close',
    {
        'post':  (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{

                if(req.body.hasOwnProperty('uid')){
                    const proj:DexcaliburProjectMap = $.context.getActiveProjects(req.dxc.sess.getUserAccount());
                    if(proj.hasOwnProperty(req.body.uid)){
                        if($.context.closeProject( req.dxc.sess.getUserAccount(), proj[req.body.uid])){
                            req.dxc.sess.refreshActiveProject($.context);
                            $.sendSuccess( res, {});
                        }else{
                            throw  DexcaliburProjectException.CLOSE_PROJECT_FAILURE();
                        }
                    }
                }
                else if(req.dxc.project != null){
                    if($.context.closeProject( req.dxc.sess.getUserAccount(), req.dxc.project)){
                        req.dxc.sess.refreshActiveProject($.context);
                        $.sendSuccess( res, {});
                    }else{
                        throw  DexcaliburProjectException.CLOSE_PROJECT_FAILURE();
                    }
                }
                else{
                    throw DexcaliburProjectException.INVALID_OR_NOT_ACTIVE();
                }

            }catch(err){
                Logger.error("[API][PROJECT] Project cannot be closed. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "Project cannot be closed. Cause : "+err.message);
            }
        }
    }
)

const IGNORE_UIDS = "-";
PROJECT_WEB_API.addAuthenticatedRoute(
    '/info/:uid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse):Promise<void> => {
            const $: WebServer = req.dxc.$;
            try {
                // skip '-' project, it is a placeholder to load DxSecurity
                if(req.params.uid.localeCompare(IGNORE_UIDS)==0){
                    $.sendSuccess( res, { });
                    return;
                }

                $.sendSuccess( res, await DexcaliburProject.getInformationOf( $.context, req.params.uid, req.dxc.sess.getUserAccount()));
            } catch (err) {
                Logger.error("[API][PROJECT][project="+req.params.uid+"] Project meta data cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Project meta data cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);



PROJECT_WEB_API.addAuthenticatedRoute(
    '/device',
    {
        'get': (req:DelegateRequest, res:DelegateResponse) => {

            const $: WebServer = req.dxc.$;

            try {
                if (req.dxc.project == null || !req.dxc.project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                const dev:Device = req.dxc.project.getDevice();
                if(dev!=null){
                    $.sendSuccess(res, dev.toJsonObject({extra:{
                        bridge: {
                            path: false
                        }
                    }}));
                }else{
                    $.sendSuccess(res, null);
                }
            } catch (err) {
                Logger.error("[API][PROJECT] Default target device cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Default target device cannot be retrieved. Cause : " + err.message);
            }
        },
        'post': (req:DelegateRequest, res:DelegateResponse) => {

            const $: WebServer = req.dxc.$;

            try {
                if (req.dxc.project == null || !req.dxc.project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                const dev:Device = DeviceManager.getInstance().getDevice(req.body['device']);
                if(dev != null){
                    req.dxc.project.setDevice(dev);
                    req.dxc.project.save();
                }

                $.sendSuccess( res, {});

            } catch (err) {
                Logger.error("[API][PROJECT] Default target device cannot be selected. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Default target device cannot be selected. Cause : " + err.message);
            }
        },
    }
);


PROJECT_WEB_API.addAuthenticatedRoute(
    '/settings',
    {
        'post': (req:DelegateRequest, res:DelegateResponse) => {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            let dev:Device = null;
            let unsafe_val:any = null;

            try {
                // valid only after authentication
                project =  req.dxc.project;

                // check if the current user can edit settings of this project
                AccessControl.check(
                    AccessZone.PROJECT,
                    AccessControl.access.PROJ_SETTINGS_EDIT,
                    req.dxc.project,
                    req.dxc.sess.getUserAccount()
                );

                if(req.body['device']!=null){
                    unsafe_val = req.body['device'];

                    dev = DeviceManager.getInstance().getDevice(unsafe_val);
                    if(dev != null){
                        project.setDevice(dev);
                        project.save();
                    }
                }

                if(req.body['platform']!=null){
                    unsafe_val = req.body['platform'];

                    project.synchronizePlatform(unsafe_val);
                    project.save();
                }

                $.sendSuccess( res, {});

            } catch (err) {
                Logger.error("[API][PROJECT] Project settings cannot be edited. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Project settings cannot be edited. Cause : " + err.message);
            }
        },
    },{
        readProject: true
    }
);


PROJECT_WEB_API.addAuthenticatedRoute(
    '/ws',
    {
        'post': (req:DelegateRequest, res:DelegateResponse) => {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            let proj:DexcaliburProject[];
            let data:any[] = [];
            let target ="";
            let rpath = "";

            try {
                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                target = project.getWorkspace().getPath();

                if(req.body['path']!=null){
                    target = project.getWorkspace().join(req.body['path']);
                    rpath = req.body['path'];
                }else{
                    rpath = "";
                }

                //Logger.raw(JSON.stringify(_fs_.lstatSync(target)));
                //Logger.raw(JSON.stringify(_fs_.lstatSync(target).isDirectory()));

                // TODO : work only with local project

                if(_fs_.lstatSync(target).isDirectory()==false){

                    Logger.raw(_fs_.readFileSync( target).toString());
                    data = [{
                        _t: 'c',
                        p: req.body['path'], // target
                        n: _path_.basename(target),
                        ctn: _fs_.readFileSync( target, {encoding: "utf-8"})
                    }];
                }else{

                    Logger.raw(target + " is a directory");
                    _fs_.readdirSync( target).map(( pName:string )=>{
                        const p = _path_.join(target,pName);
                        data.push({ n:pName, p:_path_.join(rpath,pName), _t: (_fs_.lstatSync(p).isDirectory()?'d':'f') });
                    });
                }

                $.sendSuccess( res, data);
            } catch (err) {
                Logger.error("[API][PROJECT] Project workspace cannot be browsed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Project workspace cannot be browsed. Cause : " + err.message);
            }
        },
    }
);


/**
 * To enumerate exisiting categories and tags
 */
PROJECT_WEB_API.addAuthenticatedRoute(
    '/tags',
    {
        'get': (req:DelegateRequest, res:DelegateResponse) => {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try {
                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // collect
                const data:any = [];

                const tmgr:TagManager = project.getTagManager();
                const tagc:any = tmgr.getCategories();
                for (let i = 0; i < tagc.length; i++) {
                    data.push(tagc[i].toJsonObject());
                }

                $.sendSuccess( res, data);

            } catch (err) {
                Logger.error("[API][PROJECT] Tag categories cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Tag categories cannot be retrieved. Cause : " + err.message);
            }
        },
    }
);





/**
 * To get some statistics
 */
PROJECT_WEB_API.addAuthenticatedRoute(
    '/runtime/events',
    {
        'get': (req:DelegateRequest, res:DelegateResponse) => {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try {
                if(req.dxc.project==null){
                    throw new Error("Project is missing");
                }

                // gather message
                let data:any[] = [];

                $.sendSuccess( res, data);

            } catch (err) {
                Logger.error("[API][PROJECT] Tag categories cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Tag categories cannot be retrieved. Cause : " + err.message);
            }
        },
    },{
        readProject: true
    }
);

/**
 * To get some statistics
 */
PROJECT_WEB_API.addAuthenticatedRoute(
    '/stats',
    {
        'get': (req:DelegateRequest, res:DelegateResponse) => {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try {

                // collect
                const data:any = req.dxc.project.getStatistics();

                const tmgr:TagManager = project.getTagManager();
                const tagc:any = tmgr.getCategories();
                for (let i = 0; i < tagc.length; i++) {
                    data.push(tagc[i].toJsonObject());
                }

                $.sendSuccess( res, data);

            } catch (err) {
                Logger.error("[API][PROJECT] Tag categories cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Tag categories cannot be retrieved. Cause : " + err.message);
            }
        },
    },{
        readProject: true
    }
);
/*
            this.app.route('/api/projection')
                .get(function (req:ExpressRequest, res:ExpressResponse):any {


                    // 'cmpType' should be a valid index into the database
                    // 'cmpID' should be a valid ID into 'cmpType' index
                    // 'cmpProjType' the type of projection to apply
                    let cmpType = req.params.cmp;
                    let cmpID = req.params.id;
                    let cmpProjType = req.params.proj;

                    if(cmpID==null || cmpProjType==null || cmpType==null){
                        res.status(404);
                        res.send(JSON.stringify({ err: "Invalid params" }));
                        return;
                    }

                    if($.project.find.get[cmpType]==null){
                        res.status(404);
                        res.send(JSON.stringify({ err: "Invalid component type." }));
                        return;
                    }

                    let name = Util.decodeURI(Util.b64_decode(req.params.id));
                    let act = $.project.find.get[cmpType](name);
                    let dev = null;

                    let proj = $.project.analyze.getProjection(cmpProjType);

                    proj.process(act);


                    if (act instanceof ANDROID.Receiver) {
                        dev = {
                            data: act.toJsonObject()
                        };
                        res.status(200);
                    } else {
                        dev = {
                            err: "Receiver not found for the given ID",
                            errCode: null
                        }
                        res.status(404);
                    }
                    res.send(JSON.stringify(dev));
                });
                */


