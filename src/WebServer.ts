import * as _path_ from 'path';
import * as _fs_ from 'fs';
import express, {
    Application as ExpressApplication,
    Request as ExpressRequest,
    Response as ExpressResponse
} from 'express';
import * as MIME from 'mime-types';
import * as _bodyparser_ from 'body-parser';
import * as _cookieParser_ from 'cookie-parser';
import * as _openidconnect_ from 'passport-openidconnect';
import WebTemplateEngine from "./WebTemplateEngine.js";
import DexcaliburProject from "./DexcaliburProject.js";
import DexcaliburEngine, {DexcaliburEngineMode} from "./DexcaliburEngine.js";
import Uploader from "./Uploader.js";
import PlatformManager from "./PlatformManager.js";
import InspectorManager from "./InspectorManager.js";
import Inspector from "./Inspector.js";
import {ConnectorFactory} from "./ConnectorFactory.js";
import DeviceManager from "./DeviceManager.js";
import {Device} from "./Device.js";
import * as Log from './Logger.js';
import StatusMessage from "./StatusMessage.js";
import Util from "./Utils.js";
import HookSet from "./HookSet.js";
import {Intent, IntentCommandFactory} from "./IntentFactory.js";
import {Workflow} from "./Workflow.js";
import {ValidationCapable} from "./Validator.js";
import {Settings} from "./Settings.js";
import {UserSession} from "./user/session/UserSession.js";
import {UserService} from "./user/UserService.js";

import {DEVICE_WEB_API} from "./webapi/device.web.api.js";
import {AUTH_WEB_API} from "./webapi/auth.web.api.js";
import {SETTINGS_WEB_API} from "./webapi/settings.web.api.js";
import {PROBE_SERVER_WEB_API} from "./webapi/probe-server.web.api.js";
import {APP_WEB_API} from "./webapi/app.web.api.js";
import {PROJECT_MGT_WEB_API} from "./webapi/proj-mgt.web.api.js";
import {PLATFORM_WEB_API} from "./webapi/platform.web.api.js";
import {PROJECT_WEB_API} from "./webapi/project.web.api.js";
import {CODE_WEB_API} from "./webapi/code.web.api.js";
import {ANDROID_WEB_API} from "./webapi/android.web.api.js";
import {NATIVE_WEB_API} from "./webapi/native.web.api.js";
import {FS_WEB_API} from "./webapi/fs.web.api.js";
import {USER_WEB_API} from "./webapi/user.web.api.js";
import {HOOK_WEB_API} from "./webapi/hook.web.api.js";
import {INSPECTOR_WEB_API} from "./webapi/inspectors.web.api.js";
import {KEYPOINT_WEB_API} from "./webapi/keypoint.web.api.js";
import {SCRIPT_WEB_API} from "./webapi/script.web.api.js";
import {HOOK_FRAGS_WEB_API} from "./webapi/hook-fragment.web.api.js";
import {TAG_MGT_WEB_API} from "./webapi/tag.web.api.js";
import {WebApiWindowing} from "./webapi/internals/WebApiWindowing.js";
import {PRIVACY_WEB_API} from "./webapi/privacy.web.api.js";
import {DelegateRequest, DelegateResponse, ExtraMiddlewareOptions} from "./webapi/DelegateWebApi.js";
import {AUDIT_WEB_API} from "./webapi/audit.web.api.js";
import {WebGuiConfiguration} from "./webserver/WebGuiConfiguration.js";
import {RuntimeSecurityException} from "./errors/RuntimeSecurityException.js";
//import {Client, Issuer, Strategy} from "openid-client";
import {Nullable} from "./core/IStringIndex.js";
import {Client} from "openid-client";
import {NODE_MGR_WEB_API} from "./webapi/node.web.api.js";

// @ts-ignore
const BodyParser = _bodyparser_.default;
const CookieParser = _cookieParser_.default;
const PassportOIDC = _openidconnect_.default;


let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export const HTTP_CODE_SUCCESS = 200;
export const HTTP_CODE_ERROR = 200;

export interface GuiMiddlewareOptions {
    after:any[],
    before:any[],
    auth?:any
}


/**
 * To formalize HTTP responses on errors
 *
 * @param pRes
 * @param pMessage
 * @param pOptions
 * @function
 */
function SEND_ERROR_RESPONSE( pRes:ExpressResponse, pMessage:string, pOptions:any=null):void{
    pRes.status(
        (pOptions!=null && pOptions.hasOwnProperty('httpCode'))? pOptions.httpCode : HTTP_CODE_ERROR
    ).send(JSON.stringify({
        success:false,
        msg: pMessage,
        data: (pOptions!=null &&  pOptions.hasOwnProperty('extra'))? pOptions.extra : null
    }));
}

/**
 * To formalize HTTP responses on successes
 *
 * @param {ExpressResponse} pRes
 * @param {any} pData
 * @param {any} pOptions
 * @function
 */
function SEND_SUCCESS_RESPONSE( pRes:ExpressResponse, pData:any, pOptions:any=null):void{
    let data:any = { success:true, data:pData };

    // weak comparison skips undefined and null values
    if(pOptions!=null && pOptions.extra!=null){
        Object.keys(pOptions.extra).map( x => data[x] = pOptions.extra[x]);
    }

    pRes.status(
        (pOptions!=null &&  pOptions.hasOwnProperty('httpCode'))? pOptions.httpCode : HTTP_CODE_SUCCESS
    ).send(JSON.stringify(data));
}

/**
 * @namespace WebServer.MimeHelper
 */
export class MimeHelper
{
    /**
     * To detect if the MIME type is a font
     *
     * @param {String} mime Mime type
     * @returns {Boolean} TRUE if the MIME type is a font
     * @function
     */
    static isFontFile(mime:string):boolean {
        let verdict = false;
        ["woff2", "woff", "ttf"].map(x => {
            if (mime.indexOf(x) > -1) {
                verdict = true;
            }
        });
        return verdict;
    }
}


interface ValidationCapableCtrl {
    [name:string] :ValidationCapable
}
/**
 * Class representing Dexcalibur's web server
 *
 * @class
 */
export default class WebServer
{

    /**
     *
     */
    context:DexcaliburEngine = null;

    project:DexcaliburProject = null; //pProject;

    tplengine:WebTemplateEngine = null;
    app:ExpressApplication = null;
    httpServer:any = null;
    port:number = 8000;
//        root = Path.join(project.config.dexcaliburPath, "webserver", "public");
    // root = _path_.join( __dirname, "webserver", "public");
    root:string = "";

    logs:any = {
        access: []
    };

    uploader:Uploader = null;

    controller:((req:DelegateRequest,res:DelegateResponse)=>any)= null;

    /**
     * A map of web controllers, one per GUI
     */
    serveFuncs: { [name:string] :((req:DelegateRequest,res:DelegateResponse)=>any) } = {};

    validators:ValidationCapableCtrl = {};

    guiCfgs:WebGuiConfiguration[] = [];

    oidClient:Nullable<Client> = null;

    private _sso_enabled = false;
    private _checkAuthenticated: Nullable<(req, res, next) => any> = null;
    private oidClientCfg: any = {}

    /**
     *
     * @param {Project} pProject
     * @constructor
     */
    constructor( pWebRoot:string, pGuiCfgs:WebGuiConfiguration[]) {

        this.context = null;
        this.project = null; //pProject;

        this.tplengine = new WebTemplateEngine();
        this.app = express();
        this.port = 8000;

        this.guiCfgs = pGuiCfgs;
        this.root = pWebRoot;

        this.logs = {
            access: []
        };

        this.uploader = null;

        this.controller = null;
    }

    /**
     *
     * @param pRes
     * @param pData
     * @param pOptions
     */
    sendSuccess( pRes:ExpressResponse, pData:any, pOptions:any = null){
        SEND_SUCCESS_RESPONSE( pRes, pData, pOptions);
    }

    /**
     *
     * @param pRes
     * @param pMessage
     * @param pOptions
     */
    sendError( pRes:ExpressResponse, pMessage:any, pOptions:any = null){
        SEND_ERROR_RESPONSE( pRes, pMessage, pOptions);
    }


    /*
     * To create a new OpenID client instance using settings
     *
     * @param pSettings
     */
    /*async configureAuth(pSettings:AuthenticationSettings):Promise<boolean> {
        console.log("SSO : hasOidcSettings : ",pSettings.hasOidcSettings());

        if(pSettings.hasOidcSettings()){
            const issuer = await Issuer.discover(pSettings.getOidcDiscoverURI());
            console.log("SSO : Discovered issuer %s %O", issuer.issuer, issuer.metadata);
            const cfg:any = {
                client_id: pSettings.getOidcClientID(),
                redirect_uris: pSettings.getOidcRedirectUris(),
                post_logout_redirect_uris: pSettings.getOidcLogoutUris(),
                response_types: pSettings.getOidcResponseType()
            };

            if(pSettings.getOidcClientSecret()!= null){
                cfg.client_secret = pSettings.getOidcClientSecret();
            }
            cfg.issuer = pSettings.getOidcDiscoverURI();
            cfg.discoverUri = pSettings.getOidcDiscoverURI();

            this.oidClient = new issuer.Client(cfg);
            this.oidClientCfg = {
                issuer: issuer,
                settings: cfg
            };

            console.log("SSO : OID Client created");
            return true; //(this.oidClient != null);
        }

        return true;
    }*/

    /**
     * To set params value with settings from global settings
     *
     * @param {WebServerSettings} pSettings
     * @method
     * @since 1.0.0
     */
    configure( pSettings:Settings.WebServerSettings):void {
        this.port = pSettings.getHttpPort();
    }

    /**
     * To set the active project
     *
     *  TODO : add simultaneous project support
     *
     * @param {Project} pProject
     * @method
     */
    setProject( pProject:DexcaliburProject){
        this.project = pProject;
        this.registerValidator('project', pProject);
    }

    /**
     * To set Dexcalibur engine
     *
     * @param {DexcaliburEngine} pEngine
     * @method
     */
    setContext( pContext:DexcaliburEngine){
        this.context = pContext;

        // register validators
        this.registerValidator('engine', pContext);

        const authSvc = pContext.getUserService().getAuthenticationService();
        if(authSvc.isSsoEnbaled()){
            console.log("Deploy SSO over routes");
            this._sso_enabled = true;
            console.log(this.app);
            authSvc.protectRoutesWithSSO(this.app);
        }
    }

    /**
     * To get Express Application instance used by web server
     *
     * @returns {Express.Application} Instance of Express Application
     * @method
     */
    getApplication():ExpressApplication{
        return this.app;
    }

    /**
     *
     * @param pName
     * @param pValidator
     */
    registerValidator( pName:string, pValidator:ValidationCapable):void{
        this.validators[pName] = pValidator;
    }

    private _vsess:any[] = [];
    newValidationSess():number{
        return this._vsess.push({ valid:true, err:[]})-1;
    }


    getValidationSess( pSess:number ):any{
        return this._vsess[pSess];
    }


    removeValidationSess(pID:number):void{
        this._vsess = this._vsess.filter( (x,i) => (i!=pID) );
    }

    validateAs( pVSessID:number, pField:string, pValue:any):any {
        let sess:any = this._vsess[pVSessID];

        if(pField.indexOf(':')>-1){
            const t = pField.split(':');

            Logger.info("Search validation rule ["+t[1]+"] in ["+t[0]+"] ");
            if((this.validators.hasOwnProperty(t[0]) !=null)
                && (this.validators[t[0]].canValidate(t[1]))){

                Logger.info("Validation of ["+pValue+"] as ["+t[1]+"] in ["+t[0]+"] ");
                sess.valid = sess.valid && this.validators[t[0]].validate(t[1], pValue);
                if(!sess.valid) {
                    Logger.info("Validation of ["+pValue+"] as ["+t[1]+"] failed ");
                    sess.err.push(pField); //.concat(this.validators[v].getValidationErrors());
                }else{
                    Logger.info("Validation of ["+pValue+"] as ["+t[1]+"] success ");
                }
            }

        }else{
            for(let v in this.validators){
                Logger.debug("Scan with ["+v+"] validator : "+ this.validators[v].canValidate(pField));
                if(this.validators[v].canValidate(pField)){

                    Logger.debug("Validation of ["+pValue+"] as ["+pField+"] ");
                    sess.valid = sess.valid && this.validators[v].validate(pField, pValue);
                    if(!sess.valid) {

                        Logger.info("Validation of ["+pValue+"] as ["+pField+"] failed ");
                        sess.err.push(v+':'+pField); //.concat(this.validators[v].getValidationErrors());
                        break;
                    }else{

                        Logger.info("Validation of ["+pValue+"] as ["+pField+"] success ");
                    }
                }
            }
        }



        return sess.valid;
    }

    /**
     * To create a function - one for each GUI - that serve pages content
     *
     * @param {require('path')} pHome The path of the file containing home page
     * @method
     */
    newDispatcher( pHome:string, pDelegatedRoot = ""):((request:ExpressRequest, response:ExpressResponse)=>void){
        let $:WebServer = this;

        return function (req:DelegateRequest, res:DelegateResponse):void {

            // todo : detect path traversal in req.path

            let localPath:string = $.root + req.path, mime:string = null;

            if (req.path.endsWith("/"))
                localPath = _path_.join($.root, pHome);

            // redirect to inspector delegated controllers
            if (req.path.startsWith("/inspectors/")) {

                //console.log(req.path.substr(1,req.path.length-1))
                let inspector:string[] = req.path.substr(1, req.path.length - 1).split("/");

                let relPath:string = "";

                if (inspector.length > 1) {

                    for (let i = 2; i < inspector.length; i++)
                        relPath = _path_.join(relPath, inspector[i]);

                    localPath = _path_.join( Util.__dirname(import.meta.url), "..", "inspectors");
                    localPath = _path_.join(localPath, inspector[1], "web", relPath);

                    mime = MIME.lookup(_path_.basename(localPath));
                } else {
                    localPath = $.root + "/pages/inspectors?error=404";
                    mime = MIME.lookup(_path_.join($.root , "pages", "inspectors.html"));
                }
            } else
                mime = MIME.lookup(localPath.split("/").pop());

            if (localPath.endsWith("bootstrap.min.css.map")) {
                res.status(404).send("An error occured :");//+err.message);
                return;
            }


            Logger.info("[INFO][WEBSERVER] Open : ",localPath);

            //  todo : verify if localPath is a child of allowed folder
            _fs_.readFile(localPath, (err:any, data:any) => {

                // set good http headers into the response
                res.set('Access-Control-Allow-Origin', '*');
                if (err != null) {
                    $.logs.access.push("[404]:" + mime + " " + req.path + " => " + localPath+" " +err.message);
                    res.status(404).send("An error occured, file not found.");
                    return;
                }
                if (MimeHelper.isFontFile(mime)) {
                    res.set('accept-ranges', "bytes");
                    res.set('vary', 'Accept-Encoding');
                    res.set('Content-Type', mime);
                } else {
                    res.set('Content-Type', mime);
                    res.set('X-XSS-Protection', '0; mode=block');
                    res.set('X-Frame-Options', 'SAMEORIGIN');
                    res.set('X-Content-Type-Options', 'nosniff');
                }
                $.logs.access.push("[200]:" + mime + " " + req.path + " => " + localPath);

                // replace template tags
                if (localPath.endsWith(".html"))
                    data = $.tplengine.process(data);

                res.status(200).send(data);
            });
        }
    }

    /**
     * To create a function - one for each GUI - that serve pages content
     *
     * @param {string} pDelegatedRoot The path of the web root. This path is relative to global web root (src/webserver/www)
     * @param {string} pHome Optional. The relative path of the file containing home page. This path is relative to delegated web root
     * @method
     */
    newDelegatedDispatcher( pWebCfg:WebGuiConfiguration):((request:ExpressRequest, response:ExpressResponse)=>void){
        let $:WebServer = this;


        return function (vUnsafeReq:DelegateRequest, res:DelegateResponse):void {

            // every data from "req" object is unsafe
            // todo : detect path traversal in req.path

            const delegatedRoot = _path_.normalize(_path_.join($.root, pWebCfg.getRootFolder()));
            let localPath:string = $.root + vUnsafeReq.path, mime:string = null;


            Logger.info("[INFO][WEBSERVER][DelegatedDispatcher] URI : ",vUnsafeReq.path);

            //let unsafeURL = vUnsafeReq.path.split("/");

            // replace URI base by delegated web root, and compute file location
            let p:string[] = vUnsafeReq.path.split("/");
            do{ p.shift(); }while(p[0]!=pWebCfg.name);
            p.shift();
            p.unshift(delegatedRoot);
            let unsafePath = _path_.normalize(p.join(_path_.sep));

            Logger.debug("[INFO][WEBSERVER][DelegatedDispatcher] Unsafe URI : ",vUnsafeReq.path);
            Logger.debug("[INFO][WEBSERVER][DelegatedDispatcher] Unsafe Path : ",unsafePath);

            // detect path traversal
            if(unsafePath.indexOf(delegatedRoot)!=0){
                throw RuntimeSecurityException.PATH_TRAVERSAL_IS_FORBIDDEN();
            }

            // re-route to delegated home page
            if (vUnsafeReq.path == `/${pWebCfg.name}/`)
                localPath = _path_.join($.root, pWebCfg.getRootFolder(), pWebCfg.getHome());
            else{
                localPath = unsafePath;
            }

            // redirect to inspector delegated controllers
            // TODO : maybe deprecated => find a way to handle pkugins UI
            /*
            if (vUnsafeReq.path.startsWith("/inspectors/")) {

                //console.log(req.path.substr(1,req.path.length-1))
                let inspector:string[] = vUnsafeReq.path.substr(1, vUnsafeReq.path.length - 1).split("/");

                let relPath:string = "";

                if (inspector.length > 1) {

                    for (let i = 2; i < inspector.length; i++)
                        relPath = _path_.join(relPath, inspector[i]);

                    localPath = _path_.join( Util.__dirname(import.meta.url), "..", "inspectors");
                    localPath = _path_.join(localPath, inspector[1], "web", relPath);

                    mime = MIME.lookup(_path_.basename(localPath));
                } else {
                    localPath = $.root + "/pages/inspectors?error=404";
                    mime = MIME.lookup(_path_.join($.root , "pages", "inspectors.html"));
                }
            } else*/
            mime = MIME.lookup(localPath.split("/").pop());

            if (localPath.endsWith("bootstrap.min.css.map")) {
                res.status(404).send("An error occured :");//+err.message);
                return;
            }


            Logger.debug("[INFO][WEBSERVER][DelegatedDispatcher] Open : ",localPath);

            //  todo : verify if localPath is a child of allowed folder, add a  kind of WAF
            _fs_.readFile(localPath, (err:any, data:any) => {

                // set good http headers into the response
                res.set('Access-Control-Allow-Origin', '*');
                if (err != null) {
                    $.logs.access.push("[404]:" + mime + " " + vUnsafeReq.path + " => " + localPath+" " +err.message);
                    res.status(404).send("An error occured, file not found.");
                    return;
                }
                if (MimeHelper.isFontFile(mime)) {
                    res.set('accept-ranges', "bytes");
                    res.set('vary', 'Accept-Encoding');
                    res.set('Content-Type', mime);
                } else {
                    res.set('Content-Type', mime);
                    res.set('X-XSS-Protection', '0; mode=block');
                    res.set('X-Frame-Options', 'SAMEORIGIN');
                    res.set('X-Content-Type-Options', 'nosniff');
                }
                $.logs.access.push("[200]:" + mime + " " + vUnsafeReq.path + " => " + localPath);

                res.status(200).send(data);
            });
        }
    }


    /**
     * To init routes to static content
     *
     * @method
     */
    initStaticRoutes(pOptions:GuiMiddlewareOptions){

        function ensureLoggedIn(req, res, next) {
            console.log(req.originalUrl," > ",req.isAuthenticated());
            console.log(req.session.passport.user);
            if (req.isAuthenticated()) {
                return next();
            }

            res.redirect('/login')
        }

        //this.app.get("/api/*", ensureLoggedIn);

        const mw = pOptions.before.concat((pOptions.auth!=null ? pOptions.auth : [ensureLoggedIn]).concat(pOptions.after) );

        for( let base in this.serveFuncs){
            console.log("map tha path : "+base+"   ",this.serveFuncs[base])
            //this.app.get("/"+base, passport.authenticate('openidconnect', {failureRedirect:'/login'}), this.serveFuncs[base]);
            this.app.get("/"+base+"/*", mw, this.serveFuncs[base]);
        }

        // start server
        /*
        this.app.get('/', this.controller);
        this.app.get('/pages/*', this.controller);
        this.app.get('/dist/*', this.controller);
        this.app.get('/data/*', this.controller);
        this.app.get('/js/*', this.controller);
        this.app.get('/less/*', this.controller);
        this.app.get('/vendor/*', this.controller);
        */
    }

    /**
     * To init routes when Dexcalibur runs install mode
     *
     * @method
     */
    initInstallRoutes(){

        //this.controller = this.newDispatcher( _path_.join("pages","install.html"));

        // init routes serving static contents
        //this.initStaticRoutes();

        //this.app.use('/api/settings', require("./routes/InstallRoutes"));
    }

    /**
     * To initialize routes of the web server
     *
     * @method
     */
    initRoutes(pOptionsMW:GuiMiddlewareOptions = {before:[],after:[]}) {
        let $ = this;

        // TODO : depends of path and GUI config
        if(this.guiCfgs.length>0){
            this.guiCfgs.map( vWebGui => {
                this.serveFuncs[vWebGui.name] = this.newDelegatedDispatcher(vWebGui);
                vWebGui.started = true;
            })
        }

        // deprecated
        // this.controller = this.newDispatcher("index.html");

        // init routes serving static contents
        this.initStaticRoutes(pOptionsMW);


        // deprecated
        // this.app.get('/index.html', this.controller);
        // this.app.get('/inspectors/*', this.controller);

        // Inspector frontController
        this.app.route('/api/inspectors/:inspectorID')
            .get(function (req:DelegateRequest, res:DelegateResponse):any {
                let insp:Inspector = InspectorManager.getInstance().getEnabledInspector( $.project, req.params.inspectorID);


                if (insp == null) {
                    res.status(404).send(JSON.stringify({ msg: "Inspector cannot be retrieved" }));
                    return false;
                }

                insp.performGet(req, res);
            })
            .post(function (req:DelegateRequest, res:DelegateResponse):any {
                let insp:Inspector = InspectorManager.getInstance().getEnabledInspector( $.project, req.params.inspectorID);

                if (insp == null) {
                    res.status(404).send(JSON.stringify({ msg: "Inspector cannot be retrieved" }));
                    return false;
                }

                insp.performPost(req, res);
            })

        // Connectors
        this.app.route('/api/connectors')
            .get(function (req:DelegateRequest, res:DelegateResponse):any {
                res.status(200).send(
                    JSON.stringify(
                        ConnectorFactory.getInstance().toJsonObject()
                    )
                );
            });

        // API routes





        this.app.route('/api/status')
            .get(async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
                //let uid:string = req.body['uid'];
                let status:StatusMessage = null;
                let wf:Workflow = null;

                try{
                    switch(req.query.op){
                        case 'project':
                            if(req.query.opts){
                                wf = $.context.getWorkflow(req.query.opts as string);
                                status = wf.getLastStatus();
                            }
                            break;
                        default:
                            throw new Error("Invalid operation");
                            break;
                    }


                    if(status == null){
                        res.status(HTTP_CODE_SUCCESS).send(JSON.stringify({
                            success: false,
                            data: null
                        }));
                    }else{
                        res.status(HTTP_CODE_SUCCESS).send(JSON.stringify({
                            success: true,
                            data: status.toJsonObject()
                        }));
                    }
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({
                        success:false,
                        msg: err.message
                    }));
                    return ;
                }


            });


        this.app.route('/api/validation')
            .get(function (req:DelegateRequest, res:DelegateResponse):any {

                try{
                    if(req.query.field==null){
                        throw new Error("Field to validate is missing");
                    }
                    if(req.query.hasOwnProperty('val')){
                        throw new Error("Value to validate is missing");
                    }

                    let unsafe_field = req.query.field  as string;
                    let unsafe_val = req.query.val;
                    let valid:boolean = true;
                    let err:any[] = [];

                    let vss:number = $.newValidationSess();

                    // local validation
                    // each case is like a macro-validation involving multiple sub validation
                    switch(unsafe_field){
                        case 'project.uid.new':
                            // a valid project name for a new project must be unique
                            valid = valid && $.validateAs(vss, 'engine:project.uid', unsafe_val);
                            valid = valid && $.validateAs(vss, 'engine:project.uid.new', unsafe_val);
                            break;
                        case 'device.uid.target':
                            // a target device must be enrolled first
                            valid = valid && $.validateAs(vss, 'device:uid', unsafe_val);
                            valid = valid && $.validateAs(vss, 'device:uid.target', unsafe_val);
                            break;
                        case 'platform.uid.target':
                            // a target platform must be available
                            valid = valid && $.validateAs(vss, 'platform:uid', unsafe_val);
                            valid = valid && $.validateAs(vss, 'platform:uid.target', unsafe_val);
                            break;
                        default:
                            valid = valid && $.validateAs(vss, unsafe_field, unsafe_val);
                            break;
                    }

                    if(!valid){
                        valid = false;
                        err = $.getValidationSess(vss).err;
                        $.removeValidationSess(vss);
                    }

                    SEND_SUCCESS_RESPONSE(res, {valid:valid, err:err});

                }catch(err){
                    SEND_ERROR_RESPONSE(res, "Validation failed");
                }
            })
            .post(function (req:DelegateRequest, res:DelegateResponse):any {

                try{
                    if(req.body['field']==null){
                        throw new Error("Field to validate is missing");
                    }
                    if(req.body['val']==null){
                        throw new Error("Value to validate is missing");
                    }

                    let unsafe_field = req.body.field;
                    let unsafe_val = req.body.val;
                    let valid:boolean = true;
                    let err:any[] = [];

                    let vss:number = $.newValidationSess();

                    // local validation
                    switch(unsafe_field){
                        case 'project.uid.new':
                            valid = valid && $.validateAs(vss, 'project.uid', unsafe_val);
                            valid = valid && $.validateAs(vss, 'project.uid.new', unsafe_val);
                            break;
                        default:
                            valid = valid && $.validateAs(vss, unsafe_field, unsafe_val);
                            break;
                    }

                    if(!valid){
                        valid = false;
                        err = $.getValidationSess(vss).err;
                        $.removeValidationSess(vss);
                    }

                    SEND_SUCCESS_RESPONSE(res, {valid:valid, err:err});

                }catch(err){
                    Logger.error("[WEBSERVER][VALIDATION] Error : "+err.message);
                    SEND_ERROR_RESPONSE(res, "Validation failed");
                }
            });




        this.app.route('/api/graph/:graph_type/:type/:id')
            .get(function (req:DelegateRequest, res:DelegateResponse):any {
                let data = {}, ret = null, from = null;
                let graphType = {
                    cgfrom: "callgraph_from",
                    cgto: "callgraph_to"
                };
                let gtype = null;
                let depth = (req.query.depth != null) ? parseInt(req.query.depth as string, 10) : null;

                for (let k in graphType)
                    if (req.params.graph_type === k) {
                        gtype = graphType[k];
                        break;
                    }

                if (gtype === null) {

                    res.status(404).send(JSON.stringify({ status: 404, msg: { err: "Graph type not found" } }))
                    return;
                }

                switch (req.params.type) {
                    case 'method':
                        // retrieve the method
                        from = $.project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.id)));
                        if (from == null) {
                            ret = { status: 404, msg: { err: "Given method not found" } };
                            break;
                        }

                        // compute graph data
                        if (depth !== null)
                            ret = { status: 200, msg: { data: $.project.graph[gtype](from, 1, depth) } };
                        else
                            ret = { status: 200, msg: { data: $.project.graph[gtype](from, 1) } };

                        break;
                    default:
                        ret = { status: 404, msg: { err: "Unknow Type" } };
                        break;
                }

                res.status(ret.status).send(JSON.stringify(ret.msg))
            })





        this.app.route('/api/scanner')
            .get(function (req:DelegateRequest, res:DelegateResponse):any {
                let o:any = [];
                //$.project.hook.refreshScanner();
                /*for (let i in $.project.hook.scanners) {
                    o.push($.project.hook.scanners[i].toJsonObject());
                }*/

                res.status(200).send(JSON.stringify({ data: o }));
            })
            .post(function (req:DelegateRequest, res:DelegateResponse):any {
                /*let dev = {
                    data: $.dbm.getScannerDB().toJsonList()
                };*/

                res.status(404).send({ error: "Service unavailable" });
            });

        this.app.route('/api/scanner/run')
            .get(function (req:DelegateRequest, res:DelegateResponse):any {
                let scannerId:string = req.query.id as string;
                if (scannerId == null) {
                    res.status(404).send(JSON.stringify({ data: null, err: "Invalid Hookset ID" }));
                    return;
                }


                let hookset:HookSet = $.project.hook.getHookSet(Util.decodeURI(Util.b64_decode(scannerId)));
                if (hookset == null) {
                    res.status(404).send(JSON.stringify({ data: null, err: "Hookset not found" }));
                    return;
                }

                hookset.deploy();
                //hookset.run();
                res.status(200).send(JSON.stringify({ data: { running: true }, err: null }));
            });

        this.app.route('/api/scanner/load')
            .get(function (req:DelegateRequest, res:DelegateResponse):any {
                let scannerId:string = req.query.id as string;
                if (scannerId == null) {
                    res.status(404).send(JSON.stringify({ data: null, err: "Invalid Hookset ID" }));
                    return;
                }


                let hookset:HookSet = $.project.hook.getHookSet(Util.decodeURI(Util.b64_decode(scannerId)));
                if (hookset == null) {
                    res.status(404).send(JSON.stringify({ data: null, err: "Hookset not found" }));
                    return;
                }

                hookset.deploy();
                res.status(200).send(JSON.stringify({ data: { running: true }, err: null }));
            })

/*

        this.app.route('/api/format/analysis')
            .get(function (req:DelegateRequest, res:DelegateResponse):any {
                try{
                    if(req.query['uid']==null){
                        throw new Error("[FORMAT::ANALYSIS] #FMT_1 Invalid File UID");
                    }

                    let search:FinderResult = $.project.find.file('_uid:'+req.query['uid']);
                    if(search==null || search.count()==0){
                        throw new Error("[FORMAT::ANALYSIS] #FMT_2 File not found");
                    }else{
                        res.status(200).send({ success:true, data:search.toJsonObject()});
                    }
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send({ success:false, msg: err.message });
                }
            });
*/

        this.app.route('/api/auth/:type')
            .post(async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
                try{
                    switch(req.params.type){
                        case 'pwd':
                            // TODO : sanitize input
                            let sess:UserSession = $.context
                                                        .getUserService()
                                                        .do1StepPasswordAuthentication(
                                                            req.body["login"],
                                                            req.body["pwd"]
                                                        );

                            res.cookie(
                                $.context.getUserService().getCookieName(),
                                sess.getSessUID(),
                                { maxAge: 7*24*60} //, expires: 0  }
                            );
                            SEND_SUCCESS_RESPONSE(res, { success:true, token:sess.getSessUID() });
                            break;
                        default:
                            SEND_ERROR_RESPONSE( res, "Authentication type not supported");
                            break;
                    }
                }catch(err){
                    SEND_ERROR_RESPONSE( res, "Authentication error : "+err.message);
                }
            });

        /*
         * Send an intent to to the default device
         */
        this.app.route('/api/intent/send')
            .post(async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
                // collect
                let uid = req.body["uid"];
                let typeIntent:string = req.body["type"];
                let extraAdb:string = req.body["extraAdb"];
                let factory:any = null;
                let app:any;


                res.set('Content-Type', 'text/json');

                // if(req.body["custom"] == 1) custom=true;

                // get intent filter
                /*let intentFilter = $.project.getAppAnalyzer().getIntentFilter(req.body["type"],req.body["name"],uid);
                if(intentFilter == null){
                    Logger.error("[WEBSERVER] IntentFilter not found for the given UID");
                    res.set('Content-Type', 'text/json');
                    res.status(404).send(JSON.stringify({ data: null, err: { err:"IntentFilter not found for the given UID", stderr: null} }));
                    return null;
                }*/

                // get default device
                // resfresh dev
                await DeviceManager.getInstance().scan();
                let device:Device = $.project.getDevice(); // devices.getDefault();


                if(device == null || !device.isConnected()){
                    Logger.error("[WEBSERVER] Device not connected");
                    res.status(404).send(JSON.stringify({ data: null, err: { err:"Device not connected" , stderr: null} }));
                    return null;
                }

                // init cb
                /*let callbacks = {
                    stderr: function(err){
                        Logger.error("[WEBSERVER] An error occured (stderr): "+err);
                        res.set('Content-Type', 'text/json');
                        res.status(404).send(JSON.stringify({ data: null, err:{ err:"An error occured", stderr: err}  }));
                        return ;
                    },
                    error: function(err){
                        Logger.error("[WEBSERVER] An error occured (err): "+err);
                        res.set('Content-Type', 'text/json');
                        res.status(404).send(JSON.stringify({ data: null, err:{ err:"An error occured", stderr: err}  }));
                        return ;
                    },
                    stdout: function(out){
                        Logger.info("[WEBSERVER] Intent sent");
                        res.set('Content-Type', 'text/json');
                        res.status(200).send(JSON.stringify({ data: out, err:null }));
                        return ;
                    }
                }*/

                let callbacks:Function = function(err:any, stdout:any, stderr:any):void{
                    if(err){
                        Logger.error("[WEBSERVER] An error occured (err): "+err);
                        res.set('Content-Type', 'text/json');
                        res.status(404).send(JSON.stringify({ data: null, err:{ err:"An error occured", stderr: err, msg:''+err}  }));
                        return ;
                    }

                    if(stderr){
                        Logger.error("[WEBSERVER] An error occured (stderr): "+stderr);
                        res.set('Content-Type', 'text/json');
                        res.status(404).send(JSON.stringify({ data: null, err:{ err:"An error occured", stderr: stderr}  }));
                        return ;
                    }else{
                        Logger.info("[WEBSERVER] Intent sent");
                        res.set('Content-Type', 'text/json');
                        res.status(200).send(JSON.stringify({ data: stdout, err:null }));
                        return ;
                    }
                };

                if(req.body["app"]==null)
                    app=null;

                if (req.body["app"] != null && req.body["app"].length > 0){
                    if(req.body["app"] === "self")
                        app = $.project.getPackageName();
                    else
                        app = req.body["app"];
                }else{
                    app = null;
                }

                // prepare intent
                Logger.info("[WEBSERVER] Send intent whith data");
                factory = new IntentCommandFactory(
                    typeIntent,
                    app,
                    extraAdb);

                device.exec(
                    factory.getIntentCommand(
                        new Intent({
                            action: (req.body["action"]==null? null : req.body["action"]),
                            data_uri: (req.body["data_uri"]==null? null : req.body["data_uri"]),
                            mime_type: (req.body["mime_type"]==null? null : req.body["mime_type"]),
                            category: (req.body["category"]==null? null : req.body["category"]),
                            flags: (req.body["flags"]==null? null : req.body["flags"]),
                            extra_keys: (req.body["extraKeys"]==null? null : req.body["extraKeys"]),
                            extra_opts: (req.body["extraOpts"]==null? null : req.body["extraOpts"])
                        })
                    ),
                    callbacks
                );

                // send command
                //try{
                /*
                    if(!custom){
                        Logger.info("[WEBSERVER] Send intent whith data");
                        msg = device.sendIntent({
                                data: (intentFilter.hasData()? data : null),
                                app: $.project.getPackageName()
                            },callbacks,intentFilter);
                    }else{

                        Logger.info("[WEBSERVER] Send custom intent");
                        // custom intent
                        msg = device.sendIntent({
                            data: data,
                            category: categ,
                            action: action,
                            app: $.project.getPackageName()
                        },callbacks,intentFilter);
                    }
                    Logger.info("[WEBSERVER] Intent sent (#2)");
/*                  }
                    if(msg.stderr!==null)
                       else
                        res.status(200).send(JSON.stringify({ data: msg.stdout, err:null  }));
                */

                /*}catch(excp){
                    Logger.error("[WEBSERVER] Intent exception : ",excp);
                    res.set('Content-Type', 'text/json');
                    res.status(404).send(JSON.stringify({ data: null, err: excp.messgae }));
                }*/
            });



    }

    /**
     * @method
     */
    showAccessLogs() {
        let code:string;
        for (let i = 0; this.logs.access.length; i++) {
            code = this.logs.access[i].substr(0, 2);
            if (code == "[4")
                Logger.error(this.logs.access[i]);
            else
                Logger.success(this.logs.access[i]);
        }
    }

    /**
     * To use routes of install mode
     *
     * DO NOT REMOVE : Subject to change
     *
     * @deprecated since 1.0.0
     * @method
     */
    useInstallMode():void{
       // this.initInstallRoutes();
    }

    hasSsoAuthentication():boolean {
        return this._sso_enabled;
    }

    getSsoCheckFunction():((req, res, next) => any){
        return this._checkAuthenticated;
    }

    /**
     * To use initialize routers and middleware
     * for any HTTP endpoints
     *
     * @method
     */
    useProductionMode():void{


        let self:WebServer = this;
        let usr_svc:UserService = self.context.getUserService();

        // setup passport middleware)
        //this._setupOpenIdStrategy();


        // define middleware
        this.app.use(BodyParser.urlencoded({ extended: false }));
        this.app.use(BodyParser.json());

        /**
         * Setup CORS, context-specific headers and inject `dxc` context in DelegateResponse object
         */

        const dxcCorsMiddleware = function(req:DelegateRequest, res:DelegateResponse, next:any){

            // TODO : make CORS parameter as env var
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS, PUT');
            res.set('Access-Control-Allow-Headers', 'Content-Type, authorization');

            if(req.url.startsWith('/api/')){
                res.set('Content-Type', 'text/json');

                req.dxc = {
                    $: self
                };
            }else{
                req.dxc = {};
            }

            next();
        };

        this.app.use(dxcCorsMiddleware);


        /**
         * Gather cookies
         */
        this.app.use(CookieParser());

        /**
         * Open session and attach to request
         * Only for /api/* routes
         */
        const dxcSessionMiddleware = function(req:DelegateRequest, res:DelegateResponse, next:any){

            //if(!req.url.startsWith('/api/') && !req.url.startsWith('/inspectors/')){ next(); return; }

            Logger.debug("[API][SESSION] Processing request : "+req.originalUrl);
            Logger.debug("[API][SESSION] user info : ",(req as any).sess);

            try{
                if(req.session?.passport?.user?.dxcSessID==null){
                    Logger.error("[SESSION] Session cannot be restored not found");
                    return;
                }

                if(req.dxc == null) req.dxc = {};
                // re-open session by using dxc internal session ID encapsulated into passport session
                req.dxc.sess = usr_svc.openSession(req.session.passport.user.dxcSessID);

                if(req.query._puid != null && req.dxc.sess != null){
                    //if(self.context.)
                    req.dxc.project = (req.dxc.sess as UserSession)
                        .getActiveProjectByUID(self.context, req.query._puid as string);
                }

                /*
                Logger.info("[SESSION] Query param : "+JSON.stringify(Object.keys(req.query))+" , "+usr_svc.getQueryParam());
                if(req.cookies!=null && req.cookies[usr_svc.getCookieName()] != null){
                    Logger.debug("[SESSION] Opening session from cookie ...");
                    req.dxc = {
                        sess: usr_svc.openSession(req.cookies[usr_svc.getCookieName()])
                    };
                    Logger.debug("[SESSION] Opening session from cookie : Done");


                    if(req.query._puid != null && req.dxc.sess != null){
                        //if(self.context.)
                        req.dxc.project = (req.dxc.sess as UserSession)
                            .getActiveProjectByUID(self.context, req.query._puid as string);
                    }
                }
                else if(req.query[usr_svc.getQueryParam()]!=null){

                    Logger.debug("[SESSION] Opening session from query ...");
                    req.dxc = {
                        sess: usr_svc.openSession(req.query[usr_svc.getQueryParam()] as string)
                    };
                    Logger.debug("[SESSION] Opening session from query : Done");

                    if(req.query._puid != null && req.dxc.sess != null){
                        //if(self.context.)
                        req.dxc.project = (req.dxc.sess as UserSession)
                            .getActiveProjectByUID(self.context, req.query._puid as string);
                    }
                }
                else{
                    if(!req.hasOwnProperty('dxc')) req.dxc = {};
                    if(!req.dxc.hasOwnProperty('sess')) req.dxc.sess = null;
                    Logger.error("[SESSION] Cookie/token not found");
                }*/
                next();
            }catch(err){
                Logger.error("[SESSION] Cookie/token value cannot be retrieved \n"+err.messgae+"\n"+err.stack);
                self.sendError(res, "Access denied");
            }

            return;
        }

        const dxcWindowingMiddleware =function(req:DelegateRequest, res:DelegateResponse, next:any){

            if(!req.url.startsWith('/api/') && !req.url.startsWith('/inspectors/')){ next(); return; }



            try{

                if(!req.dxc.hasOwnProperty('filt')){
                    if(req.query.hasOwnProperty('__f'))
                        req.dxc = { filt: JSON.parse(req.query.__f as string) } ;
                    else if(req.body.hasOwnProperty('__f'))
                        req.dxc = { filt: JSON.parse(req.body.__f as string) } ;


                    if(req.dxc.filt!=null){
                        req.dxc.filt = WebApiWindowing.parse(req.dxc.filt as string);
                    }else{
                        req.dxc.filt = new WebApiWindowing();
                    }
                }


                Logger.info("[WEBSERVER][HTTP] Parse windowing options : "+JSON.stringify(req.dxc.filt));

            }catch(err){
                Logger.error("[WEBSERVER][HTTP] Parse windowing options cannot be retrieved \n"+err.messgae+"\n"+err.stack)
            }

            next();
            return;
        }

        // TODO : remove bypass
        const isSlave = this.context.isSlaveNode();

        function ensureApiLoggedIn(req, res, next) {
            if(isSlave) next();

            console.log("API "+req.originalUrl," > ",req.isAuthenticated());
            if (req.isAuthenticated()) {
                return next();
            }

            self.sendError(res, "Access denied");
        }

        function ensureGuiLoggedIn(req, res, next) {
            console.log("GUI "+req," > ");//req.isAuthenticated);
            if (req.isAuthenticated()) {
                return next();
            }

            res.redirect('/login');
        }


        const securedRoutes:ExtraMiddlewareOptions = {
            beforeAuth:[],
            afterAuth:[dxcSessionMiddleware, dxcWindowingMiddleware],
            public:[],
            auth:ensureApiLoggedIn }

        // , {beforeAuth:[], afterAuth:[], public:[], auth:ensureLoggedIn }
        NODE_MGR_WEB_API.injectServer(this, "/api/node", securedRoutes);
        DEVICE_WEB_API.injectServer(this, "/api/device", securedRoutes);
        AUTH_WEB_API.injectServer(this, "/api/remote", securedRoutes); // TODO : replace remote by auth ? , remote should be reserved to p2p auth
        AUTH_WEB_API.injectServer(this, "/api/auth", securedRoutes);
        SETTINGS_WEB_API.injectServer(this, "/api/settings", securedRoutes);
        PROBE_SERVER_WEB_API.injectServer(this, "/api/hookserver", securedRoutes);
        APP_WEB_API.injectServer(this, "/api/application", securedRoutes);
        PROJECT_MGT_WEB_API.injectServer(this, "/api/workspace", securedRoutes);
        PLATFORM_WEB_API.injectServer(this, "/api/platform", securedRoutes);
        PROJECT_WEB_API.injectServer(this, "/api/project", securedRoutes);
        CODE_WEB_API.injectServer(this, "/api/code", securedRoutes);
        ANDROID_WEB_API.injectServer(this, "/api/android", securedRoutes);
        SCRIPT_WEB_API.injectServer(this, "/api/scripts", securedRoutes);
        NATIVE_WEB_API.injectServer(this, "/api/native", securedRoutes);
        FS_WEB_API.injectServer(this, "/api/file", securedRoutes);
        USER_WEB_API.injectServer(this, "/api/user", securedRoutes);
        HOOK_WEB_API.injectServer(this, "/api/hook", securedRoutes);
        HOOK_FRAGS_WEB_API.injectServer(this, "/api/hook_frag", securedRoutes);
        INSPECTOR_WEB_API.injectServer(this, "/api/plugin", securedRoutes);
        KEYPOINT_WEB_API.injectServer(this, "/api/keypoint", securedRoutes);
        TAG_MGT_WEB_API.injectServer(this, "/api/tag", securedRoutes);
        PRIVACY_WEB_API.injectServer(this, "/api/privacy", securedRoutes);
        AUDIT_WEB_API.injectServer(this, "/api/audit", securedRoutes);

        /*
        this.app.use('/api/device',  DEVICE_WEB_API.getRouter());
        this.app.use('/api/remote',  AUTH_WEB_API.getRouter());
        this.app.use('/api/settings',  SETTINGS_WEB_API.getRouter());
        this.app.use('/api/hookserver',  PROBE_SERVER_WEB_API.getRouter());
        this.app.use('/api/application',  APP_WEB_API.getRouter());
        this.app.use('/api/workspace',  PROJECT_MGT_WEB_API.getRouter());
        this.app.use('/api/platform',  PLATFORM_WEB_API.getRouter());
        this.app.use('/api/project',  PROJECT_WEB_API.getRouter());
        this.app.use('/api/code',  CODE_WEB_API.getRouter());
        this.app.use('/api/android',  ANDROID_WEB_API.getRouter());
        this.app.use('/api/scripts',  SCRIPT_WEB_API.getRouter());
        this.app.use('/api/native',  NATIVE_WEB_API.getRouter());
        this.app.use('/api/file',  FS_WEB_API.getRouter());
        this.app.use('/api/user',  USER_WEB_API.getRouter());
        this.app.use('/api/hook',  HOOK_WEB_API.getRouter());
        this.app.use('/api/hook_frag',  HOOK_FRAGS_WEB_API.getRouter());
        this.app.use('/api/plugin',  INSPECTOR_WEB_API.getRouter());
        this.app.use('/api/keypoint',  KEYPOINT_WEB_API.getRouter());
        this.app.use('/api/tag',  TAG_MGT_WEB_API.getRouter());
        this.app.use('/api/privacy',  PRIVACY_WEB_API.getRouter());
        this.app.use('/api/audit',  AUDIT_WEB_API.getRouter());
        */
        // init routers

        this.initRoutes({
            auth: [ensureGuiLoggedIn], //ensureGuiLoggedIn],
            after: [dxcSessionMiddleware],
            before: []
        });

        this.uploader = Uploader.getInstance();
    }

    /**
     * To start the web server
     *
     * @param {Integer} port Port number
     * @method
     */
    start(port:number = null) {

        if (port !== null) {
            this.port = port;
        }

        const wwwPort = this.port;

        this.context.printWebBanner(wwwPort);


        this.registerValidator('device', DeviceManager.getInstance());
        this.registerValidator('platform', PlatformManager.getInstance());

        this.httpServer = this.app.listen(wwwPort,  ()=> {
            Logger.success('Server started on : ' + wwwPort);

            if(this.guiCfgs.length>0){
                Logger.info("[GUI] "+this.guiCfgs.length+" Graphical UIs are exposed :");
                this.guiCfgs.map( vCfg => {
                    if( vCfg.isStarted()){
                        Logger.info("\t - "+vCfg.name+" "+vCfg.raw);
                    }else{
                        Logger.info("\t x NOT STARTED "+vCfg+" "+vCfg.raw);
                    }
                })
            }else{
                Logger.info("[GUI] Headless mode, only /api/ endpoints are exposed");
            }


        });
    }
}




