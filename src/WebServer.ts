import * as _path_ from 'path';
import * as _fs_ from 'fs';
import express from 'express';
import {Application as ExpressApplication, Request as ExpressRequest, Response as ExpressResponse} from 'express';
import * as MIME from 'mime-types';
import * as _bodyparser_ from 'body-parser';
import * as _cookieParser_ from 'cookie-parser';
const BodyParser = _bodyparser_.default;
const CookieParser = _cookieParser_.default;


import WebTemplateEngine from "./WebTemplateEngine.js";
import DexcaliburProject from "./DexcaliburProject.js";
import DexcaliburEngine, {DexcaliburProjectMap} from "./DexcaliburEngine.js";
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
import {ValidationCapable, Validator} from "./Validator.js";
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

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export const HTTP_CODE_SUCCESS = 200;
export const HTTP_CODE_ERROR = 200;


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

    controller:Function= null;

    validators:ValidationCapableCtrl = {};

    /**
     *
     * @param {Project} pProject
     * @constructor
     */
    constructor( pWebRoot:string) {

        this.context = null;
        this.project = null; //pProject;

        this.tplengine = new WebTemplateEngine();
        this.app = express();
        this.port = 8000;
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
     *
     * @param {require('path')} pHome The path of the file containing home page
     * @method
     */
    newDispatcher( pHome:string):Function{
        let $:WebServer = this;

        return function (req:ExpressRequest, res:ExpressResponse):void {

            let localPath:string = $.root + req.path, mime:string = null;

            if (req.path.endsWith("/"))
                localPath = _path_.join($.root, pHome);

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

            _fs_.readFile(localPath, (err:any, data:any) => {

                // set good http headers into the response
                res.set('Access-Control-Allow-Origin', '*');
                if (err != null) {
                    $.logs.access.push("[404]:" + mime + " " + req.path + " => " + localPath);
                    res.status(404).send("An error occured :" + err.message);
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
                    //res.set('Content-Security-Policy', 'nosniff');
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
     * To init routes to static content
     *
     * @method
     */
    initStaticRoutes(){


        // start server
        this.app.get('/', this.controller);
        this.app.get('/pages/*', this.controller);
        this.app.get('/dist/*', this.controller);
        this.app.get('/data/*', this.controller);
        this.app.get('/js/*', this.controller);
        this.app.get('/less/*', this.controller);
        this.app.get('/vendor/*', this.controller);
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
    initRoutes() {
        let $ = this;

        this.controller = this.newDispatcher("index.html");

        // init routes serving static contents
        this.initStaticRoutes();


        this.app.get('/index.html', this.controller);
        this.app.get('/inspectors/*', this.controller);

        // Inspector frontController
        this.app.route('/api/inspectors/:inspectorID')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let insp:Inspector = InspectorManager.getInstance().getEnabledInspector( $.project, req.params.inspectorID);


                if (insp == null) {
                    res.status(404).send(JSON.stringify({ msg: "Inspector cannot be retrieved" }));
                    return false;
                }

                insp.performGet(req, res);
            })
            .post(function (req:ExpressRequest, res:ExpressResponse):any {
                let insp:Inspector = InspectorManager.getInstance().getEnabledInspector( $.project, req.params.inspectorID);

                if (insp == null) {
                    res.status(404).send(JSON.stringify({ msg: "Inspector cannot be retrieved" }));
                    return false;
                }

                insp.performPost(req, res);
            })

        // Connectors
        this.app.route('/api/connectors')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                res.status(200).send(
                    JSON.stringify(
                        ConnectorFactory.getInstance().toJsonObject()
                    )
                );
            });

        // API routes





        this.app.route('/api/status')
            .get(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {
                //let uid:string = req.body['uid'];
                let status:StatusMessage = null;
                let wf:Workflow = null;

                try{
                    switch(req.query.op){
                        case 'project':
                            if(req.query.opts){
                                wf = $.context.getWorkflow(req.query.opts);
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
            .get(function (req:ExpressRequest, res:ExpressResponse):any {

                try{
                    if(req.query.field==null){
                        throw new Error("Field to validate is missing");
                    }
                    if(req.query.hasOwnProperty('val')){
                        throw new Error("Value to validate is missing");
                    }

                    let unsafe_field = req.query.field;
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
            .post(function (req:ExpressRequest, res:ExpressResponse):any {

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
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let data = {}, ret = null, from = null;
                let graphType = {
                    cgfrom: "callgraph_from",
                    cgto: "callgraph_to"
                };
                let gtype = null;
                let depth = (req.query.depth != null) ? parseInt(req.query.depth, 10) : null;

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
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let o:any = [];
                //$.project.hook.refreshScanner();
                /*for (let i in $.project.hook.scanners) {
                    o.push($.project.hook.scanners[i].toJsonObject());
                }*/

                res.status(200).send(JSON.stringify({ data: o }));
            })
            .post(function (req:ExpressRequest, res:ExpressResponse):any {
                /*let dev = {
                    data: $.dbm.getScannerDB().toJsonList()
                };*/

                res.status(404).send({ error: "Service unavailable" });
            });

        this.app.route('/api/scanner/run')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let scannerId:string = req.query.id
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
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let scannerId:string = req.query.id
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
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
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
            .post(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {
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
                                { maxAge: 7*24*60, expires: 0  }
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
            .post(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {
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

    /**
     * To use routes of production mode
     *
     * @method
     */
    useProductionMode():void{
        const projectDependentPath:string[] = [
            '/api/hook',
            '/api/hook_frag',
            '/api/probe',
            '/api/find',
            '/api/intent',
            '/api/scanner',
            '/api/code',
            '/api/field',
            '/api/method',
            '/api/class',
            '/api/finder',
            '/api/package',
            '/api/tags',
            '/api/remote',
            '/pages/index',
            '/pages/finder',
            '/pages/inspectors',
            '/pages/probelog',
            '/pages/probe',
            '/pages/scanner',
            '/pages/devicemanager',
            '/inspectors/'
        ];

        let self:WebServer = this;
        let usr_svc:UserService = self.context.getUserService();


        // define middleware
        this.app.use(BodyParser.urlencoded({ extended: false }));
        this.app.use(BodyParser.json());

        /**
         * Redirect to /pages/splash.html if there is no project initialized
         */
        this.app.use(function(req:ExpressRequest, res:ExpressResponse, next:any){

            // TODO : make CORS parameter as env var
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS, PUT');
            res.set('Access-Control-Allow-Headers', 'Content-Type');

            if(req.url.startsWith('/api/')){
                res.set('Content-Type', 'text/json');
            }

            req.dxc = {};

            next();
        });


        /**
         * Gather cookie
         */

        this.app.use(CookieParser());

        /**
         * Open session and attach to request
         */
        this.app.use(function(req:ExpressRequest, res:ExpressResponse, next:any){
            Logger.info("[API][SESSION] Processing request : "+req.originalUrl);

            if(!req.url.startsWith('/api/') && !req.url.startsWith('/inspectors/')){ next(); return; }

            try{
                Logger.info("[SESSION] Query param : "+JSON.stringify(Object.keys(req.query))+" , "+usr_svc.getQueryParam());
                if(req.cookies!=null && req.cookies[usr_svc.getCookieName()] != null){
                    Logger.info("[SESSION] Opening session from cookie ...");
                    req.dxc = {
                        sess: usr_svc.openSession(req.cookies[usr_svc.getCookieName()])
                    };
                    Logger.info("[SESSION] Opening session from cookie : Done");


                    if(req.query._puid != null && req.dxc.sess != null){
                        //if(self.context.)
                        req.dxc.project = (req.dxc.sess as UserSession)
                            .getActiveProjectByUID(self.context, req.query._puid);
                    }
                }
                else if(req.query[usr_svc.getQueryParam()]!=null){

                    Logger.info("[SESSION] Opening session from query ...");
                    req.dxc = {
                        sess: usr_svc.openSession(req.query[usr_svc.getQueryParam()])
                    };
                    Logger.info("[SESSION] Opening session from query : Done");

                    if(req.query._puid != null && req.dxc.sess != null){
                        //if(self.context.)
                        req.dxc.project = (req.dxc.sess as UserSession)
                            .getActiveProjectByUID(self.context, req.query._puid);
                    }
                }
                else{
                    if(!req.hasOwnProperty('dxc')) req.dxc = {};
                    if(!req.dxc.hasOwnProperty('sess')) req.dxc.sess = null;
                    Logger.error("[SESSION] Cookie/token not found");
                }
            }catch(err){
                Logger.error("[SESSION] Cookie/token value cannot be retrieved \n"+err.messgae+"\n"+err.stack)
            }

            next();
            return;
        });


        /**
         * Parse windowing options
         */
        this.app.use(function(req:ExpressRequest, res:ExpressResponse, next:any){

            if(!req.url.startsWith('/api/') && !req.url.startsWith('/inspectors/')){ next(); return; }



            try{

                if(!req.dxc.hasOwnProperty('filt')){
                    if(req.query.hasOwnProperty('__f'))
                        req.dxc = { filt: JSON.parse(req.query.__f) } ;
                    else if(req.body.hasOwnProperty('__f'))
                        req.dxc = { filt: JSON.parse(req.body.__f) } ;

                    if(req.dxc.filt!=null){
                        req.dxc.filt = WebApiWindowing.parse(req.dxc.filt);
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
        });




        DEVICE_WEB_API.injectServer(this);
        AUTH_WEB_API.injectServer(this);
        SETTINGS_WEB_API.injectServer(this);
        PROBE_SERVER_WEB_API.injectServer(this);
        APP_WEB_API.injectServer(this);
        PROJECT_MGT_WEB_API.injectServer(this);
        PLATFORM_WEB_API.injectServer(this);
        PROJECT_WEB_API.injectServer(this);
        CODE_WEB_API.injectServer(this);
        ANDROID_WEB_API.injectServer(this);
        NATIVE_WEB_API.injectServer(this);
        FS_WEB_API.injectServer(this);
        USER_WEB_API.injectServer(this);
        HOOK_WEB_API.injectServer(this);
        HOOK_FRAGS_WEB_API.injectServer(this);
        INSPECTOR_WEB_API.injectServer(this);
        KEYPOINT_WEB_API.injectServer(this);
        TAG_MGT_WEB_API.injectServer(this);


        this.app.use('/api/device', DEVICE_WEB_API.getRouter());
        this.app.use('/api/remote', AUTH_WEB_API.getRouter());
        this.app.use('/api/settings', SETTINGS_WEB_API.getRouter());
        this.app.use('/api/hookserver', PROBE_SERVER_WEB_API.getRouter());
        this.app.use('/api/application', APP_WEB_API.getRouter());
        this.app.use('/api/workspace', PROJECT_MGT_WEB_API.getRouter());
        this.app.use('/api/platform', PLATFORM_WEB_API.getRouter());
        this.app.use('/api/project', PROJECT_WEB_API.getRouter());
        this.app.use('/api/code', CODE_WEB_API.getRouter());
        this.app.use('/api/android', ANDROID_WEB_API.getRouter());
        this.app.use('/api/scripts', SCRIPT_WEB_API.getRouter());
        this.app.use('/api/native', NATIVE_WEB_API.getRouter());
        this.app.use('/api/file', FS_WEB_API.getRouter());
        this.app.use('/api/user', USER_WEB_API.getRouter());
        this.app.use('/api/hook', HOOK_WEB_API.getRouter());
        this.app.use('/api/hook_frag', HOOK_FRAGS_WEB_API.getRouter());
        this.app.use('/api/plugin', INSPECTOR_WEB_API.getRouter());
        this.app.use('/api/keypoint', KEYPOINT_WEB_API.getRouter());
        this.app.use('/api/tag', TAG_MGT_WEB_API.getRouter());
        /**
         * Redirect to /pages/splash.html if there is no project initialized
         */
        /*
        this.app.use(function(req:ExpressRequest, res:ExpressResponse, next:any){
            let f = false;


            Logger.info("[API][REDIRECT] Processing request : "+req.originalUrl);

            if(self.project != null){ next(); return; }
            if(!req.url.startsWith('/pages/') && !req.url.startsWith('/api/') && !req.url.startsWith('/inspectors/')){ next(); return; }


            for(let i=0; i<projectDependentPath.length; i++){

                if(req.url.startsWith(projectDependentPath[i])) {
                    f = true;
                    break;
                }
            }

            if(f==false){
                next();
            }else if(!self.context.isIpcWaitMode()) {
                Logger.info("[API][REDIRECT] Processing request (not IPC wait mode): "+req.originalUrl);
                res.redirect('/pages/splash.html');
                res.send();
                return ;
            }else{
                Logger.error("[API][REDIRECT] Processing request (not IPC wait mode): "+req.originalUrl);
                //   next();
            }
        });

         */




        this.initRoutes();

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

        this.httpServer = this.app.listen(wwwPort, function () {
            Logger.success('Server started on : ' + wwwPort);
        });
    }
}




