import {DelegateWebApi} from "./DelegateWebApi";
import {Device} from "../Device";
import WebServer, {HTTP_CODE_ERROR} from "../WebServer";
import DeviceManager from "../DeviceManager";
import FridaHelper from "../FridaHelper";
import {Router, Request, Response} from "express";
import * as Log from "../Logger";
import {IDbIndex} from "../persist/orm/DbAbstraction";
import DataScope from "../DataScope";
import * as _path_ from "path";
import ModelFile from "../ModelFile";
import {UserSession} from "../user/session/UserSession";
import DexcaliburProject from "../DexcaliburProject";
import {DexcaliburProjectMap} from "../DexcaliburEngine";
import Util from "../Utils";
import Platform from "../Platform";
import AccessControl from "../user/acl/AccessControl";
import {AccessZone} from "../user/acl/Zones";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol";
import * as _fs_ from "fs";
import {AuthenticationException} from "../errors/AuthenticationException";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PROJECT_WEB_API: DelegateWebApi = new DelegateWebApi();

/*
PROJECT_WEB_API.addAsyncAuthenticatedRoute(
    '/info/:project',
    {
        'get': async (req:Request, res:Response)=>{

            let device:Device = null;
            let $:WebServer = req.dxc.$;

            try{
                if(req.body['dev']){
                    device = DeviceManager.getInstance().getDevice(req.body['dev']);
                }else{
                    device = $.project.getDevice();
                }
                if(await FridaHelper.startServer( device, {
                    path: req.body['path'],
                    privileged: (req.body['privileged']=="true"? true: false)
                })){
                    $.sendSuccess(res, {});
                }else{
                    $.sendError(res, "Hook server cannot start");
                }
            }catch(err){
                Logger.error("[API][HOOK SERVER] Server cannot start : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "Hook server cannot start");
            }
        }
    }
)
*/


/*this.app.route('/api/project/:uid/app/info')
    .get(function (req:ExpressRequest, res:ExpressResponse):any {
        if(req.params.uid != "self"){
            // not supported
            res.status(404).send(JSON.stringify({ msg: 'Operation not supported (TODO)' }));
        }else{
            //$.project.getApplication();
            res.status(404).send(JSON.stringify({ msg: 'Operation not supported (TODO)' }));
        }
    });*/


PROJECT_WEB_API.addAuthenticatedRoute(
    '/active',
    {
        'get':  (req:Request, res:Response)=>{

            const $:WebServer = req.dxc.$;

            try{
                if(req.dxc==null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                const data:any[] = [];
                const proj = $.context.getActiveProjects(req.dxc.sess.getUserAccount());

                for(const i in proj) data.push( proj[i].toJsonObject());
                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][PROJECT] List of actives projects cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "List of actives projects cannot be retrieved. Cause : "+err.message);
            }
        },
        'post': (req:Request, res:Response)=>{

            const $:WebServer = req.dxc.$;

            // [EE] : On enterprise server, for multiple users, store active project into user session
            // [PE] : On professional, add auth but keep global active project
            // [CE] : On community ed, just change global active project
            let proj:DexcaliburProjectMap;
            let success = false;

            try{
                if(req.dxc==null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }


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
    '/close',
    {
        'post':  (req:Request, res:Response)=>{

            const $:WebServer = req.dxc.$;

            try{
                if(req.dxc==null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }


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

PROJECT_WEB_API.addAuthenticatedRoute(
    '/info/:uid',
    {
        'get': (req: Request, res: Response) => {

            const $: WebServer = req.dxc.$;

            try {
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                $.sendSuccess( res, DexcaliburProject.getInformationOf( $.context, req.params.uid, req.dxc.sess.getUserAccount()));
            } catch (err) {
                Logger.error("[API][PROJECT] Project meta data cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Project meta data cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);



PROJECT_WEB_API.addAuthenticatedRoute(
    '/device',
    {
        'get': (req: Request, res: Response) => {

            const $: WebServer = req.dxc.$;

            try {
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }
                if (req.dxc.project == null || !req.dxc.project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                const dev:Device = req.dxc.project.getDevice();
                if(dev!=null){
                    $.sendSuccess(res, dev.toJsonObject({}, {
                        bridge: {
                            path: false
                        }
                    }));
                }else{
                    $.sendSuccess(res, null);
                }
            } catch (err) {
                Logger.error("[API][PROJECT] Default target device cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Default target device cannot be retrieved. Cause : " + err.message);
            }
        },
        'post': (req: Request, res: Response) => {

            const $: WebServer = req.dxc.$;

            try {
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }
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
        'post': (req: Request, res: Response) => {

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
                    ProjectAccessControl.access.PROJ_SETTINGS_EDIT,
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
        'post': (req: Request, res: Response) => {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            let proj:DexcaliburProject[];
            let data:any[] = [];
            let target ="";
            let rpath = "";

            try {
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
        'get': (req: Request, res: Response) => {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try {
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

                // collect
                const data:any = [];
                const tagc:any = project.analyze.getTagCategories();
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

/*
            this.app.route('/api/projection')
                .get(function (req:ExpressRequest, res:ExpressResponse):any {


                    // 'cmpType' should be a valid index into the database
                    // 'cmpID' should be a valid ID into 'cmpType' index
                    // 'cmpProjType' the type of projection to apply
                    let cmpType = req.params.cmp;
                    let cmpID = req.params.id;
                    let cmpProjType = req.params.proj;

                    console.log(req.params);

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


