import * as _path_ from 'path';
import * as _fs_ from 'fs';
import * as Express from 'express';
import {Application as ExpressApplication, Request as ExpressRequest, Response as ExpressResponse} from 'express';
import * as MIME from 'mime-types';
import * as BodyParser from 'body-parser';


import WebTemplateEngine from "./WebTemplateEngine";
import DexcaliburProject from "./DexcaliburProject";
import DexcaliburEngine, {DexcaliburProjectMap} from "./DexcaliburEngine";
import Uploader from "./Uploader";
import PlatformManager from "./PlatformManager";
import InspectorManager from "./InspectorManager";
import Inspector from "./Inspector";
import {ConnectorFactory, IDbIndex} from "./ConnectorFactory";
import Platform from "./Platform";
import DeviceManager from "./DeviceManager";
import {Device} from "./Device";
import Downloader from "./Downloader";
import * as Log from './Logger';
import StatusMessage from "./StatusMessage";
import AppPackage from "./AppPackage";
import {IBridge} from "./Bridge";
import Hook from "./Hook";
import FridaHelper from "./FridaHelper";
import HookSession from "./HookSession";
import Util from "./Utils";
import ModelMethod from "./ModelMethod";
import AndroidActivity from "./android/AndroidActivity";
import AndroidReceiver from "./android/AndroidReceiver";
import AndroidProvider from "./android/AndroidProvider";
import AndroidService from "./android/AndroidService";
import ModelField from "./ModelField";
import HookSet from "./HookSet";
import * as VM from "vm";
import {FinderResult} from "./FinderResult";
import {Intent, IntentCommandFactory} from "./IntentFactory";
import Simplifier from "./Simplifier";
import ModelPackage from "./ModelPackage";
import ModelClass from "./ModelClass";
import ProjectWorkspace from "./ProjectWorkspace";
import ModelFile from "./ModelFile";
import DataScope, {DataScopePpts} from "./DataScope";
import {ModelFunction} from "./ModelFunction";
import HookMessage from "./HookMessage";
import {Workflow} from "./Workflow";
import {HookSetList} from "./HookManager";
import {Finder} from "./Finder";
import {ValidationCapable, Validator} from "./Validator";
import {Settings} from "./Settings";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


const HTTP_CODE_SUCCESS = 200;
const HTTP_CODE_ERROR = 200;


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
        this.app = Express();
        this.port = 8000;
        this.root = pWebRoot;

        this.logs = {
            access: []
        };

        this.uploader = null;

        this.controller = null;
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
    getApplication():Express.Application{
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

        return function (req:Express.Request, res:Express.Response):void {

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

                    localPath = _path_.join( __dirname, "..", "inspectors");
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

        // define middleware
        this.app.use(BodyParser.urlencoded({ extended: false }));
        this.app.use(BodyParser.json());

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
        this.app.route('/api/platform/list')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {

                try{
                    SEND_SUCCESS_RESPONSE( res, {
                        platforms: PlatformManager.getInstance().getRemote()
                    });

                }catch(err){
                    Logger.error(err.message);
                    SEND_ERROR_RESPONSE( res, "An error occurred");
                }

                // collect
                /*let dev:any = {
                    platforms: PlatformManager.getInstance().getRemote()
                };

                res.status(200).send(JSON.stringify(dev));*/
            });

        this.app.route('/api/platform/install')
            .post(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {


                let mgr:PlatformManager, dev:any, platform:Platform;

                try{
                    dev = {
                        status: false
                    };

                    mgr = PlatformManager.getInstance();


                    platform = mgr.getRemotePlatform(req.body['uid']);

                    if(platform !== null){
                        dev.status = await mgr.install(platform);
                    }

                    SEND_SUCCESS_RESPONSE( res, dev);

                }catch(err){
                    Logger.error("[WEBSERVER][PLATFORM] Install : "+err.message);
                    SEND_ERROR_RESPONSE( res, "An error occurred");
                }
            });

        this.app.route('/api/workspace/upload')
            .post(function (req:ExpressRequest, res:ExpressResponse):any {
                $.uploader.newUpload( req, res, function( vId:string):any {
                    res.status(200).send(JSON.stringify({ success:true, upload:vId }));
                    res.end();
                });
            });

        this.app.route('/api/workspace/list')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {

                res.status(200).send(JSON.stringify({
                    projects: $.context.getProjects()
                }));
            });

        this.app.route('/api/workspace/new')
            .post(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {

                const PLATFORM_MODE = ['dev','min','max'];

                let project:DexcaliburProject = null;
                let dm:DeviceManager = null;
                let device:Device = null;
                let path:string = null;
                let platform:Platform = null;
                let success:boolean = true;
                let wf:Workflow = null;

                dm = DeviceManager.getInstance();
                await dm.scan();
                



                try{

                    if(req.body['dev'] != null){
                        device = dm.getDevice( req.body['dev']);
                        if(device == null || !device.isEnrolled()){
                            res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg:"Device unknow or not enrolled "}));
                            return;
                        }
                    }

                    if(req.body['name'] == null){
                        res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg:"Invalid project name"}));
                        return;
                    }

                    // init workflow
                    wf = $.context.newWorkflow(req.body['name']);




                    // first download remote application
                    // on error : ne‹ project will not create. 
                    switch(req.body['type'])
                    {
                        case 'select':
                            if(device == null){
                                res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false,  msg:"Device unknow or not enrolled "}));
                                res.end();
                            }
                            wf.pushStatus(new StatusMessage(5, "Get target platform"));
                            platform = device.getPlatform();
                            wf.pushStatus(new StatusMessage(10, "Pull application from device"));
                            path = device.pullTemp( req.body['path'] );
                            break;
                        case 'download':
                            if(PLATFORM_MODE.indexOf(req.body['platform'])==-1){
                                wf.pushStatus(new StatusMessage(5, "Set target platform"));
                                platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                            }
                            wf.pushStatus(new StatusMessage(10, "Download target application from remote location"));
                            path = await Downloader.downloadTemp(req.body['url'], { mode:0o666, encoding:'binary', force:true });
                            break;
                        case 'upload':
                            wf.pushStatus(new StatusMessage(5, "Set target platform"));
                            platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                            wf.pushStatus(new StatusMessage(10, "Select previously uploaded application"));
                            path = $.uploader.getPathOf(req.body['uploadid']);
                            break;
                        case 'fromfs':
                            wf.pushStatus(new StatusMessage(10, "Set target platform"));
                            platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                            path = req.body['path'];
                            break;
                        case 'fromfs':
                            throw new Error("Project type is invalid")
                            break;
                    }

                    // chcek if file exists an it is not empty
                    if( (!_fs_.existsSync(path)) || (false)){
                        wf.pushStatus(StatusMessage.newError("APK file not found"));
                        res.status(HTTP_CODE_ERROR).send(JSON.stringify({   success:false,  msg:"APK file not found "}));
                        return;
                    }

                    if(['min','max','dev'].indexOf(req.body['platform'])>-1){
                        platform = null;
                    }


                    Logger.info(
                        '[PROJECT][STEP 2] Detecting device  ... ',
                              device!==null?'[OK]':'[KO]',
                             ' Platform ... ',
                              platform!==null? '[OK]':'[KO]');
    
                    // create project : UID , APK [, Device]
                    Logger.info('[PROJECT][STEP 2] Creating new project ...');

                    wf.stepUp(15);

                    project = await $.context.newProject(req.body['name'], path, device);


                    if(project == null){
                        Logger.error('[PROJECT][STEP 2] Creating new project failed !');
                        throw new Error('[PROJECT][STEP 2] Creating new project failed !');
                    }


                    project.setWorkflow(wf);

                    // to set connector
                    Logger.info('[PROJECT][STEP 3] Setting connectors ...');

                    if(req.body['connector'] != null && req.body['connector'].length > 0){
                        project.setConnector(req.body['connector']);
                    }else
                        project.setConnector($.context.getWorkspace().getSettings().getDefaultConnector());


                    if(project != null){
                        Logger.info('[PROJECT][STEP 3.1] Configuring platform ...');
                        wf.pushStatus(new StatusMessage(10, "Synchronizing target platform with project"));
                        //platform = PlatformManager.getInstance().getDefaultPlatformFor();
                        // sync project platform with target platform or APK
                        success = await project.synchronizePlatform( platform.getUID());
                    }

                    Logger.info('[PROJECT][STEP 4] Analyzing application ...');
                    if(success){
                        wf.stepUp(15);
                        project = await project.fullscan();
                        success = project.isReady();
                        wf.pushStatus(StatusMessage.newSuccess("Project has been created successfully."))
                    }else{
                        wf.pushStatus(StatusMessage.newError("Project cannot be created. See logs for more details."))
                    }
                    
                    // collect
                    let dev = {
                        success: success, // project.isReady(),
                        data: {
                            uid: (project != null ? project.getUID() : null)
                        }
                    };

                    res.status(200).send(JSON.stringify(dev));
                }catch(err){

                    if(wf!=null){
                        wf.pushStatus(StatusMessage.newError(err.message))
                    }

                    Logger.error(err.message);

                    $.setProject(null);
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg:"An error occured while project initializing"}));
                }

                return ;
            });

        this.app.route('/api/workspace/open')
            .get(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {
                
                // refresh connected device
                await DeviceManager.getInstance().scan();
                let project:DexcaliburProject = null;
                let wf:Workflow;


                project = $.context.getProject( req.query.uid);



                if(project != null){
                    if($.project == null){
                        $.setProject( project);
                    }
                    else if($.project != null && $.project.getUID()!==req.query.uid){
                        $.setProject( project);
                    }

                    res.status(200).send(JSON.stringify({
                        success: project.isReady()
                    }));
                    return ;
                }


                // init workflow
                wf = $.context.newWorkflow( req.query.uid );


                wf.pushStatus(new StatusMessage(5, "Opening project"));

                project = await $.context.openProject( req.query.uid );


                res.status(200).send(JSON.stringify({
                    success: project.isReady()
                }));
            });


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

        this.app.route('/api/workspace/delete')
            .post(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {

                res.status(200).send(JSON.stringify({
                    success: $.context.deleteProject( req.body['uid'] )
                }));
            });

        this.app.route('/api/workspace/availability')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {

                let proj:string[] = null, availability:boolean = true;
                switch( req.query.field)
                {
                    case "project.uid":
                        proj = $.context.workspace.listProjects();
                        proj.map((vProject)=>{
                            if(vProject == req.query.value)
                                availability = false;
                        })
                        break;
                }

                
                res.status(200).send(JSON.stringify({
                    availability: availability
                }));
            });

        ;

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


        this.app.route('/api/device/fs/list')
            .get(async function(req:ExpressRequest, res:ExpressResponse):Promise<any> {
                let data:any[] = [];
                let target:string ="";
                let baseDir:string = "";
                let privileged:boolean = false;
                let dev:Device = null;

                try{
                    if( req.query.uid!=null ){
                        dev = $.context.getDeviceManager().getDevice(req.query.uid);
                    }
                    else if($.project !== null){
                        dev = $.project.getDevice();
                    }
                    else{
                        throw new Error('No active project');
                    }


                    if(dev==null){
                        throw new Error("Target device not found");
                    }

                    if(!dev.isConnected()){
                        throw  new Error("Device is offline");
                    }

                    switch(req.param.type){
                        case 'privileged':
                            privileged = true;
                            break;
                        case 'user':
                        case 'shell':
                        default:
                            privileged = false;
                            break;
                    }





                    if(req.query.app!=null){
                        baseDir = dev.getDataPathOf(decodeURIComponent(req.query.app))+"/";
                    }

                    if(req.query.path!=null){
                        baseDir += decodeURIComponent(req.query.path);
                    }

                    if(baseDir==""){
                        baseDir = "/";
                    }

                    res.status(200).send(JSON.stringify({
                        success:true,
                        data: await dev.getDefaultBridge().listFiles(baseDir, {
                            privileged: privileged
                        })
                    }));
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg: err.message }));
                }
            });

        this.app.route('/api/device/fs/content')
            .get(async function(req:ExpressRequest, res:ExpressResponse):Promise<any> {
                let data:any[] = [];
                let target:string ="";
                let baseDir:string = "";
                let privileged:boolean = false;
                let dev:Device = null;

                try{
                    if($.project == null){
                        throw new Error('No active project');
                    }

                    switch(req.query.type){
                        case 'privileged':
                            privileged = true;
                            break;
                        case 'user':
                        case 'shell':
                        default:
                            privileged = false;
                            break;
                    }

                    if(req.query.uid!=null){
                        dev = $.context.getDeviceManager().getDevice(req.query.uid);
                    }else{
                        dev = $.project.getDevice();
                    }

                    if(dev==null){
                        throw new Error("Target device not found");
                    }

                    if(!dev.isConnected()){
                        throw  new Error("Device is offline");
                    }


                    if(req.query.app!=null){
                        baseDir = dev.getDataPathOf(req.query.app)+"/";
                    }


                    if(req.query.path!=null){
                        baseDir += req.query.path;
                    }

                    if(baseDir==""){
                        throw new Error("Path is empty");
                    }

                    res.status(200).send(JSON.stringify({
                        success:true,
                        data: dev.getDefaultBridge().readFile(baseDir, {
                            privileged: privileged
                        })
                    }));
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg: err.message }));
                }
            });

        this.app.route('/api/device/connect')
            .post(async function(req:ExpressRequest, res:ExpressResponse):Promise<any>{
                let dm:DeviceManager = DeviceManager.getInstance();
                let ip:string = req.body['ip'];
                let port:string = req.body['port'];
                let device:Device = null;
                let data:any = null;

                try{
                    if(req.body['dev'] !== null){
                        device = dm.getDevice(req.body['dev']);

                        if(device != null)
                            Logger.debug('[WEBSERVER][/api/device/connect] Device selected : ',device.getUID());
                        else
                            Logger.debug('[WEBSERVER][/api/device/connect] Device not found.');

                        
                    }

                    if(ip=="" && port==""){
                        let b = device.getBridge('adb+tcp');
                        if( b!= null ){
                           data = await dm.connect( b.ip, b.port, device);
                        }
                    }else
                        data = await dm.connect(ip, port, device);


                    if(data){
                        dm.save();
                    }

                    data = { success: data };
                    if(data.success == false){
                        data.msg = 'An unknow error happened. See Dexcalibur logs/output for more details.';
                        res.status(500);
                    }else{
                        res.status(200);
                    }
                }catch(err){
                    data = { success:false, msg:err.message };
                    res.status(500)
                }

                res.send(JSON.stringify(data));
            });

        this.app.route('/api/device/clear/:deviceid')
            .post(function (req:ExpressRequest, res:ExpressResponse):any {
                let dm:DeviceManager = DeviceManager.getInstance();
                let deviceid:string = req.params['deviceid'];
                let dev:any;

                try{
                    dev = { success: dm.clear(deviceid) };
                    res.status(200);
                }catch(err){
                    dev = { success:false, msg:err.message };
                    res.status(500);
                }

                res.send(JSON.stringify(dev));
            });


        this.app.route('/api/device/clear')
            .post(function (req:ExpressRequest, res:ExpressResponse):any {
                let dm = DeviceManager.getInstance();
                let dev;

                try{
                    dev = { success: dm.clear( null) };
                    res.status(200);
                }catch(err){
                    dev = { success:false, msg:err.message };
                    res.status(500);
                }

                console.log(dev);
                res.send(JSON.stringify(dev));
            });

        this.app.route('/api/device/bridge/:name/kill')
            .post(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {
                let dm:DeviceManager = DeviceManager.getInstance();
                let dev:any;

                try{
                    dev = dm.getBridgeFactory(req.params['name'].toLowerCase()).newGenericWrapper();
                    dev = { success: await dev.kill() };
                }catch(err){
                    console.log(err);

                    dev = { success:false, msg:err };
                }

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/device/enroll')
            .post(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {
                let dm:DeviceManager = DeviceManager.getInstance();
                let dev:any;

                try{
                    Logger.raw(JSON.stringify(req.body));
                    dev = { success: await dm.enroll(req.body['uid'], req.body['opts']) };
                }catch(err){
                    Logger.error(err.message);

                    dev = { success:false, msg:err };
                }

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/device/enroll/status')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let dm:DeviceManager = DeviceManager.getInstance();
                //let uid:string = req.body['uid'];
                let status:StatusMessage;

                // TODO : dm.getEnrollStatus(uid);
                status = dm.getEnrollStatus();

                if(status == null){
                    res.status(200).send(JSON.stringify({
                        msg: null,
                        progress: null,
                        extra: null
                    }));
                }else{
                    res.status(200).send(JSON.stringify({
                        msg: status.getMessage(),
                        progress: status.getProgress(),
                        extra: status.getExtra()
                    }));
                }
            });

        this.app.route('/api/device')
            .get(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {
                // scan connected devices
                let dm:DeviceManager;

                dm = DeviceManager.getInstance();
                await dm.scan();
                dm.save();

                res.status(200).send(JSON.stringify({
                    devices: dm.toJsonObject(  {
                        device: {
                            profile: false,
                            frida: false,
                            bridge: {
                                path: false
                            }
                        }
                    })
                }));
            });


        this.app.route('/api/device/applications')
            .get(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {
                // scan connected devices
                let dev:Device, dm:DeviceManager, pkgs:AppPackage[], rep:any;

                dm = DeviceManager.getInstance();
                dev = dm.getDevice( req.query.uid );

                if(dev.isEnrolled() == false){
                    res.status(404).send(JSON.stringify({
                        msg: 'Device is not enrolled'
                    }));
                    return;
                }

                dev.updateInstalledApp();
                //pkgs = dev.getDefaultBridge().listPackages('-f');
                pkgs = dev.getInstalledApp();
                dm.save();
                //dev.updateCache('package',pkgs);

                rep = {
                    device: req.query.uid,
                    apps:[]
                };

                pkgs.map( (x:AppPackage)=>{
                    rep.apps.push(x.toJsonObject())
                });

                res.status(200).send(JSON.stringify(rep));
            });

        this.app.route('/api/device/application/pull')
            .post(function (req:ExpressRequest, res:ExpressResponse):any {
                let dm = DeviceManager.getInstance();
                let dev:Device = null, success:boolean = false, app:AppPackage = null;
                let rep:any =  {};

                try{
                    dev =dm.getDevice(req.body['uid']);

                    if(dev == null) throw new Error("Unknown device");
                    if(!dev.isConnected()) throw new Error("Target device is offline");
                    if(req.body['package'] == null) throw new Error("Package identifier not specified");

                    if(req.body['path']!=null) {
                        success = dev.pullPackage(req.body['package'], req.body['path']);
                        rep = { success:success, data:{}};
                    }else{
                        app = dev.getApplicationByID(req.body['package']);
                        if(app==null) throw new Error("Package not found");
                        rep = { success:true, data:{ tmp: dev.pullTemp(app.packagePath) }};
                    }

                    res.status(200);
                }catch(err){
                    rep = { success:false, msg:err.message };
                    res.status(200);
                }

                res.send(JSON.stringify(rep));
            });

        this.app.route('/api/device/setDefault')
            .post(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let uid:string = req.body["uid"];
                let dm:DeviceManager = DeviceManager.getInstance();
                let dev:Device = null;

                res.set('Content-Type', 'text/json');

                if(uid != null){
                    dev = dm.getDevice(uid);
                    if(dev==null){
                        res.status(404).send(JSON.stringify({
                            error: "Invalid device ID",
                            errcode: "DM2"
                        }));
                        return 1;
                    }

                    if($.project != null){
                        $.project.setDevice(dm.getDevice(uid));
                        $.project.save();
                    }
                    // TODO : change > defaultDevice => project
                    dm.setDefault(uid);

                    res.status(200).send(JSON.stringify({
                        msg: "Device <b>"+uid+"</b> is the new default device."
                    }));    
                    return 1;
                }else{
                    res.status(404).send(JSON.stringify({
                        error: "Invalid device ID",
                        errcode: "DM1"
                    }));
                    return 1;
                }
            });

        this.app.route('/api/device/:uid/bridge')
            .put(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {
                // scan connected devices
                let dev:Device=null, bridge:IBridge=null, dm:DeviceManager=null, result:boolean=false;

                try{
                    dm = DeviceManager.getInstance();
                    dev = dm.getDevice(req.params.uid);
                    bridge = dev.getBridge(req.body['name']);


                    if(bridge.up==false){
                        if(bridge.isNetworkTransport()){
                            //result = await dm.connect( bridge.ip, bridge.port, dev);
                            if(await dm.connect( bridge.ip, bridge.port, dev)){
                                dev.setDefaultBridge(req.body['name']);
                                dm.save();
                                res.status(200).send({ success: true });
                                return ;
                            }else{
                                res.status(500).send({ success: false, msg:'Connection over TCP failed.' });
                                return ;
                            }
                        }else{
                            res.status(500).send({ success: false, msg:'Please connect the device through USB and retry.' });
                            return ;
                        }
                    }else{
                        dev.setDefaultBridge(req.body['name']);
                        dm.save();
                        res.status(200).send({ success: true });

                        return; 
                    }

                }catch(err){
                    res.status(500).send({ success: false, msg:err.message });
                }
            });

        // todo : replace by device manager scan()
        /*this.app.route('/api/packageList')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // scan connected devices
                $.project.packagePatcher.scan();

                res.status(200).send(JSON.stringify({
                    data: $.project.packagePatcher.toJsonObject()
                }));
            });*/
    
        // todo : replace by splash/select app
        /*
        this.app.route('/api/changeWorkspace/:projectIdentifier')
            .get(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {

                // $.project.changeProject(req.params.projectIdentifier);

                let proj:DexcaliburProject = await $.context.openProject(req.params.projectIdentifier);
                // collect

                res.status(200).send(`{"status": "${proj!=null ? 'ok':'nok'}"}`);
            });

        // todo : replace by splash/select app
        this.app.route('/api/pullProject/:packageIdentifier')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // scan connected devices
                //console.log(req.params.packageIdentifier)
                $.project.packagePatcher.pullPackage(req.params.packageIdentifier);
                // collect
                $.project.changeProject(req.params.packageIdentifier);
                res.status(200).send(JSON.stringify({ message: "ok" }));
            });

        // not used
        this.app.route('/api/stats')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev = {
                    class: {
                        count: $.project.find.class().count()
                    },
                    method: {
                        count: $.project.find.method().count()
                    },
                    field: {
                        count: $.project.find.field().count()
                    },
                    calls: {
                        count: $.project.find.calls().count()
                    },
                    activity: {
                        count: $.project.find.nocase().class("name:activity$").count()
                    },
                    provider: {
                        count: $.project.find.nocase().class("name:provider$").count()
                    },
                    service: {
                        count: $.project.find.nocase().class("name:service$").count()
                    },
                    broadcast: {
                        count: $.project.find.nocase().class("name:broadcast$").count()
                    },
                    nfc_ctrl: {
                        count: $.project.find.nocase().class("name:nfccontroller").count()
                    },
                    mst_ctrl: {
                        count: $.project.find.nocase().class("name:mstcontroller").count()
                    }
                };
                res.status(200).send(JSON.stringify(dev));
            });
        /*
        this.app.route('/api/probe')
            .get(function(req,res){
                // collect
                let dev = {
                    data: $.project.find.class().toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });
        */

        /**
         * Useless, too heavy request
         *
         * @deprecated
         */
        this.app.route('/api/class')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev:any = {
                    data: $.project.find.class('name:.*').toJsonObject()
                };

                for (let i in dev.data) {
                    for (let k in dev.data[i].methods) {
                        if ($.project.hook.isProbing(dev.data[i].methods[k])) {
                            dev.data[i].methods[k].probing = true;
                        } else {
                            dev.data[i].methods[k].probing = false;
                        }
                    }
                }

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/probe')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {


                try{

                    if($.project == null){
                        throw new Error("#HM_0 There is not active project")
                    }



                    let hooks:Hook[] = $.project.hook.list();

                    let out:any = {success:false, data:[]};

                    if(req.query['t']!=null && req.query['s']!=null){
                        let unsafeSignature = decodeURIComponent(Util.b64_decode(decodeURIComponent(req.query['s'])));
                        switch(req.query['t']){
                            case "func":
                                hooks.map( (vHook:Hook) => {
                                    if(vHook.native){
                                        if(vHook.hasMethod() && (vHook.getMethod().signature()===unsafeSignature)){
                                            out.data.push(vHook.toJsonObject());
                                        }
                                    }
                                });
                                break;
                            case "meth":
                                hooks.map( (vHook:Hook) => {

                                    if(!vHook.native){
                                        if(vHook.hasMethod() && (vHook.getMethod().signature()===unsafeSignature)){
                                            out.data.push(vHook.toJsonObject());
                                        }
                                    }
                                });
                                break;
                        }
                    }else{

                        let hooksets:HookSetList = $.project.hook.getHookSets();

                        for(let i in hooksets){
                            out.data.push(hooksets[i].toJsonObject());
                        }
                    }


                    out.success = true;

                    res.status(200).send(JSON.stringify(out));

                }catch(err){
                    Logger.error("HookManager : get probe : "+err.message);
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, err:"Hook not found for the given object."}));
                }


            });

        this.app.route('/api/inspector')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // TODO : throw error if $.project is null (installing state, splash screen, ...)
                let insp:Inspector[] = InspectorManager.getInstance().getInspectorsOf($.project);

                let data:any  = { data: [] };
                for (let i in insp) {
                    data.data.push(insp[i].toJsonObject());
                }
                res.status(200).send(JSON.stringify(data));
            });

        this.app.route('/api/probe/server/start')
            .post(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {

                let device:Device = null;

                if(req.body['dev']){
                    device = DeviceManager.getInstance().getDevice(req.body['dev']);
                }else{
                    device = $.project.getDevice();
                }


                try{

                    // TODO : detect if frida connection works
                    res.status(200).send(JSON.stringify({
                        success: await FridaHelper.startServer( device, {
                            path: req.body['path'],
                            privileged: (req.body['privileged']=="true"? true: false)
                        })
                    }));
                }catch(err){
                    Logger.debugRAW(err);
                    Logger.raw(err);
                    res.status(200).send(JSON.stringify({
                        success: false
                    }));
                }
            });

        this.app.route('/api/probe/server/status')
            .get(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {

                let device:Device = null;

                if(req.param.dev){
                    device = DeviceManager.getInstance().getDevice(req.param.dev);
                }else{
                    device = $.project.getDevice();
                }

                try{
                    res.status(200).send(JSON.stringify({
                        success: await FridaHelper.getServerStatus( device)
                    }));
                }catch(err){
                    console.log(err);
                    res.status(200).send(JSON.stringify({
                        success: false
                    }));
                }
            });

        this.app.route('/api/probe/start')
            .post(function (req:ExpressRequest, res:ExpressResponse):any {

                let sess:HookSession = null;
                try{


                    sess = this.newSession();

                    switch(req.body.type){
                        case "spawn-self":
                            Logger.info(`[WEBSERVER] Start hooking [app=${$.project.getPackageName()}, type=spawn-self]`);
                            sess = $.project.hook.startBySpawn($.project.getPackageName(), sess);
                            res.status(200).send(JSON.stringify({ success: true, sessid: sess.getSessionID(), enable: true }));
                            break;
                        case "spawn":
                            Logger.info(`[WEBSERVER] Start hooking [app=${req.body.app}, type=spawn]`);
                            sess = $.project.hook.startBySpawn(req.body.app, sess);
                            res.status(200).send(JSON.stringify({ success: true, sessid: sess.getSessionID(), enable: true }));
                            break;
                        case "attach-gadget":
                            Logger.info(`[WEBSERVER] Start hooking [pid=Gadget, type=attach-gadget]`);
                            sess = $.project.hook.startByAttachToGadget(sess);
                            res.status(200).send(JSON.stringify({ success: true, sessid: sess.getSessionID(), enable: true }));
                            break;
                        case "attach-app-self":
                            Logger.info(`[WEBSERVER] Start hooking [app=${req.body.app}, type=attach-app-self]`);
                            sess = $.project.hook.startByAttachToApp($.project.getPackageName(), sess);
                            res.status(200).send(JSON.stringify({ success: true, sessid: sess.getSessionID(), enable: true }));
                            break;
                        case "attach-app":
                            Logger.info(`[WEBSERVER] Start hooking [app=${req.body.app}, type=attach-app-x]`);
                            sess = $.project.hook.startByAttachToApp(req.body.app, sess);
                            res.status(200).send(JSON.stringify({ success: true, sessid: sess.getSessionID(), enable: true }));
                            break;
                        case "attach-pid":
                            Logger.info(`[WEBSERVER] Start hooking [pid=${req.body.pid}, type=attach-to-pid`);
                            sess = $.project.hook.startByAttachTo(req.body.pid, sess);
                            res.status(200).send(JSON.stringify({ success: true, sessid: sess.getSessionID(), enable: true }));
                            break;
                        default:
                            res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, err: 'Invalid start type' }));
                            break;
                    }
                }catch(exception){
                    Logger.error(exception.message);
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, err: exception.message }));
                }

                
            });

        /**
         * To download the resulting Frida script 
         */
        this.app.route('/api/probe/download')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let script:string = $.project.hook.prepareHookScript();

                res.set('Content-Type', 'application/octet-stream');
                res.set('Content-Length', script.length);
                res.set('Content-Disposition', 'attachment; filename="hook.js"');
                res.set('Expires', '0');
                res.status(200).send(script);
            });


        this.app.route('/api/probe/sessions')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {

                try{
                    if($.project == null){
                        throw new Error("There is not active active project");
                    }

                    let sess:HookSession[] = $.project.hook.getSessions();
                    let data:any;
                    let signature:string = null;

                    if (sess.length == 0) {
                        res.status(HTTP_CODE_SUCCESS).send(JSON.stringify({ success:true, data:[] }));
                        return;
                    }


                    // collect only sessions containing messages for the given method/function
                    if(req.query.filter && req.query){
                        data.sess = [];
                        signature = decodeURIComponent(Util.b64_decode(decodeURIComponent(req.query.id)));
                        switch(req.query.filter){
                            case 'meth':
                            case 'func':
                                sess.map( (vHSess:HookSession)=>{
                                    if (!vHSess.hasMessages()) return;

                                    let s:any  = {msg:[]};
                                    vHSess.messages().map( (vMsg:HookMessage)=>{
                                        if(vMsg.msg===signature){
                                            s.msg.push(vMsg);
                                        }
                                    })

                                    if(s.msg.length>0){
                                        data.sess.push(s);
                                    }
                                });
                                break;
                        }
                    }else{
                        data.sess = [];
                    }



                    res.status(HTTP_CODE_SUCCESS).send(JSON.stringify({ success:true, data:data }));
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg:err.message }));
                }





                //let data = { data: sess.toJsonObject(parseInt(startAt,10), parseInt(size,10)) };
                //res.status(200).send(JSON.stringify(data));
            });

        this.app.route('/api/probe/msg')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                
                if($.project == null){
                    res.status(404).send(JSON.stringify({}));
                    return null;
                }


                let sess:HookSession = $.project.hook.lastSession();
                if (sess == null) {
                    res.status(404).send({ msg: "No session" });
                    return;
                }

                let startAt = req.query.startAt;
                let size = req.query.size;

                if (!sess.hasMessages(startAt)) {
                    res.status(404).send({ msg: "No messages" });
                    return;
                }

                let data = { data: sess.toJsonObject(parseInt(startAt,10), parseInt(size,10)) };
                res.status(200).send(JSON.stringify(data));
            });



        this.app.route('/api/probe/:method')
            .post(function (req:ExpressRequest, res:ExpressResponse):any {

                let meth:ModelMethod|ModelFunction;
                let probe:Hook;
                let file:any = null;
                let opts:any = {};
                try{
                    if((req.body['_t']!=null) && (req.body['_t']=='func')){
                        meth = $.project.find.get.func(Util.decodeURI(Util.b64_decode(req.params.method)));

                        file = $.project.find.file('_uid:'+meth.getDeclaringFile());
                        if(file.count()>0){
                            opts =  {
                                file: (file.get(0) as ModelFile).getName(),
                                onLeave: true,
                                onEnter: true,
                                ptr_mode: 'relative'
                            }
                        }else{
                            opts =  {
                                onLeave: true,
                                onEnter: true,
                                ptr_mode: 'addr'
                            }
                        }



                    }else{
                        meth = $.project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.method)));
                    }

                    if (meth == null) {
                        Logger.error("[API][PROBE::METHOD] Method or Function not found "+Util.decodeURI(Util.b64_decode(req.params.method)));
                        throw new Error("Method or Function not found");
                    }
                    if((meth instanceof ModelMethod) && (meth.name == "<clinit>")){
                        throw new Error("Static blocks (<clinit>) cannot be hooked");
                    }

                    probe = $.project.hook.getProbe(meth);
                    if (probe == null) {
                        probe = $.project.hook.probe(meth, opts);
                    }

                    //if(hook.enable)

                    /*
                    $.project.trigger({
                        type: "probe.new",
                        data: {
                            hook: probe,
                            method: meth
                        }
                    });*/

                    res.status(200).send(JSON.stringify({ success:true,
                        enable: probe.isEnable(),
                        data: { hookid: probe.getID() }
                    }));
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg: err.message}));
                }
            })
            .put(function (req:ExpressRequest, res:ExpressResponse):any {


                let meth:ModelMethod|ModelFunction;
                let hook:Hook;

                try{
                    if((req.body['_t']!=null) && (req.body['_t']=='func')){
                        meth = $.project.find.get.func(Util.decodeURI(Util.b64_decode(req.params.method)));
                    }else{
                        meth = $.project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.method)));
                    }

                    if (meth == null) {
                        Logger.error("[API][PROBE::METHOD] Method or Function not found "+Util.decodeURI(Util.b64_decode(req.params.method)));
                        throw new Error("Method or Function not found");
                    }
                    if((meth instanceof ModelMethod) && (meth.name == "<clinit>")){
                        throw new Error("Static blocks (<clinit>) cannot be hooked");
                    }

                    let status:string = req.query.enable;
                    if (status === undefined) {
                        throw new Error("Invalid hook status");
                    }

                    hook = $.project.hook.getProbe(meth);
                    if (status == "true")
                        hook.enable();
                    else
                        hook.disable();

                    res.status(200).send(JSON.stringify({ success:true, data: { enable: hook.isEnable() }}));
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg: err.message}));
                }

            });

        this.app.route('/api/hook/app/detach')
            .post(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {

                Logger.info("[REST] /api/hook/app/detach POST");

                // get hook instance by ID
                let session:HookSession = $.project.hook.lastSession();
                
                if (session.fridaScript == null) {
                    res.status(200).send({ success: false, error: "Invalid frida script" });
                }else{
                    let a:any = await session.fridaScript.unload();
                    res.status(200).send(JSON.stringify({ success: await session.fridaScript.unload(a) }));
                }         
            })

        this.app.route('/api/hook/app/kill')
            .post(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {

                Logger.info("[REST] /api/hook/app/kill POST");

                // get hook instance by ID
                let session:HookSession = $.project.hook.lastSession();

                if(session == null){
                    res.status(200).send({ success: false, error: "Unknow PID" });
                    return;
                }
                
                if (session.pid == null) {
                    res.status(200).send({ success: false, error: "Invalid PID" });
                }else{
                    let o = await $.project.getDevice().privilegedExecSync('kill '+session.pid, {detached:false});
                    res.status(200).send(JSON.stringify({ success: true }));
                }         
            })

        // TODO : review exec type
        this.app.route('/api/hook/frida/exec')
            .post(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {
                let newCode:string = req.body['code[]'].join("\n");
                let output:any = null;
                let dev:Device = $.project.getDevice();

                try{
                    switch(req.body.type){
                        case "spawn-self":
                            Logger.info(`[WEBSERVER] Start with frida console [app=${$.project.getPackageName()}, type=spawn-self]`);
                            output = await FridaHelper.exec(dev, newCode, FridaHelper.SPAWN, $.project.getPackageName());
                            break;
                        case "spawn":
                            Logger.info(`[WEBSERVER] Start with frida console [app=${req.body.app}, type=spawn]`);
                            output = await FridaHelper.exec(dev, newCode, FridaHelper.SPAWN, req.body.app);
                            break;
                        case "attach-gadget":
                            Logger.info(`[WEBSERVER] Start with frida console  [pid=Gadget, type=attach-gadget]`);
                            output = await FridaHelper.exec(dev, newCode, FridaHelper.ATTACH_BY_NAME, "Gadget");
                            break;
                        case "attach-app-self":
                            Logger.info(`[WEBSERVER] Start with frida console  [app=${req.body.app}, type=attach-app-self]`);
                            output = await FridaHelper.exec(dev, newCode, FridaHelper.ATTACH_BY_NAME, $.project.getPackageName());
                            break;
                        case "attach-app":
                            Logger.info(`[WEBSERVER] Start with frida console  [app=${req.body.app}, type=attach-app-x]`);
                            output = await FridaHelper.exec(dev, newCode, FridaHelper.ATTACH_BY_NAME, req.body.app);
                            break;
                        case "attach-pid":
                            Logger.info(`[WEBSERVER] Start with frida console  [pid=${req.body.pid}, type=attach-to-pid`);
                            output = await FridaHelper.exec(dev, newCode, FridaHelper.ATTACH_BY_PID, req.body.pid);
                            break;
                        default:
                            res.status(404).send(JSON.stringify({ err: 'Invalid start type' }));
                            return;
                            break;
                    }


                    res.status(200).send(JSON.stringify({ output: await output }));
                }catch(exception){
                    console.log(exception);
                    res.status(404).send(JSON.stringify({ err: exception }));
                }

            });

        this.app.route('/api/hook/:hookid')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {

                try{
                    Logger.info("[REST] /api/hook/:hookid GET");

                    // get hook instance by ID
                    let hook:Hook = $.project.hook.getHookByID(
                        req.params.hookid
                    );

                    if (hook == null) {
                        throw new Error("Invalid hook ID given");
                    }

                    let o:any = hook.toJsonObject();

                    if(hook.native){
                        o.method = $.project.find.get.func(o.method).toJsonObject();
                    }else{
                        o.method = $.project.find.get.method(o.method).toJsonObject();
                    }


                    res.status(200).send(JSON.stringify({ success: true, hook: o }));

                }catch(err){
                    res.status(HTTP_CODE_ERROR).send({ success: false, error: err.message });
                }

            })
            .put(function (req:ExpressRequest, res:ExpressResponse):any {
                Logger.info("[REST] /api/hook/:hookid EDIT");


                let hook:Hook = $.project.hook.getHookByID(
                    req.params.hookid
                );



                if (hook == null) {
                    res.status(404).send({ success: false, error: "Invalid hook ID given" });
                    return;
                }

                let newCode:string = req.body['code[]'].join("\n");
                //hook.script = newCode;
                hook.modifyScript(newCode);

                //let success = $.project.hook.removeHook(hook);            

                res.status(200).send(JSON.stringify({ success: true }));
            })
            .delete(function (req:ExpressRequest, res:ExpressResponse):any {

                let hook:Hook = $.project.hook.getHookByID(
                    //Util.b64_decode(req.params.hookid)
                    req.params.hookid
                );

                Logger.info("[REST] /api/hook/:hookid REMOVE");

                if (hook == null) {
                    res.status(404).send({ error: "No probe ID given" });
                    return;
                }

                let success:Hook = $.project.hook.removeHook(hook);


                res.status(200).send(JSON.stringify({ success: (success != null) ? true : false }));

            });

        this.app.route('/api/hook/enable/:hookid')
            .put(function (req:ExpressRequest, res:ExpressResponse):any {

                let dev:any={};

                if(req.params.hookid=="all"){

                    let hooks:Hook[] = $.project.hook.list();
                    for(let i in hooks){
                        hooks[i].enable();
                        dev[i] = {enable: hooks[i].isEnable() };
                    }
                }else {
                    let hook: Hook = $.project.hook.getHookByID(
                        req.params.hookid
                    );

                    hook.enable();
                    // collect
                    dev = {
                        enable: hook.isEnable()
                    };
                }

                res.status(200).send(JSON.stringify(dev));
            });

        
        this.app.route('/api/hook/disable/:hookid')
            .put(function (req:ExpressRequest, res:ExpressResponse):any {

                let dev:any={};
                
                if(req.params.hookid=="all"){
                    let hooks:Hook[] = $.project.hook.list();
                    for(let i in hooks){
                        hooks[i].disable();
                        dev[i] = {enable: hooks[i].isEnable() };
                    }
                }else{
                    let hook:Hook = $.project.hook.getHookByID(
                        req.params.hookid
                    );
    
                    hook.disable();
                    // collect
                    dev = {
                        enable: hook.isEnable()
                    };
                }
                

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/class/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {


                // collect
                let dev:any = {};
                let classRef:string;
                let cls:ModelClass;

                try{
                    classRef = Util.decodeURI(Util.b64_decode(req.params.id));
                    cls = $.project.find.get.class(classRef);

                    if (cls != null) {
                        dev = { success:true, data:cls.toJsonObject() };

                        dev.data.methods = [];
                        for(let k in cls.methods){
                            dev.data.methods.push( cls.methods[k].toJsonObject());
                        }

                        dev.data.fields = [];
                        for(let k in cls.fields){
                            dev.data.fields.push( cls.fields[k].toJsonObject());
                        }
                    }

                    res.status(HTTP_CODE_SUCCESS).send(JSON.stringify(dev));
                }catch(err){
                    Logger.error('[WEBSERVER] Class not found : '+err.message);
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, err:'[WEBSERVER] Method solving through reference not yet supported here'}));
                }

            })
            .put(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let obj = $.project.find.get.class(Util.decodeURI(Util.b64_decode(req.params.id)));
                let pkg: ModelPackage;

                if (obj == null) {
                    res.status(404).send(JSON.stringify({ error: "Class not found" }));
                    return;
                }

                let alias = req.body['alias'];

                //console.log(alias);
                if(alias != null){

                    if(alias == obj.simpleName){
                        res.status(200).send(JSON.stringify({
                            success: false,
                            msg: { type:'warn', msg:'Ignored because the alias not differs from name.'}
                        }));
                        return ;
                    }

                    pkg = obj.getPackage() as ModelPackage;
                    if(pkg!=null && pkg.hasAliasedClass(alias)){
                        res.status(200).send(JSON.stringify({
                            success: false,
                            msg: { type:'err', msg:'A conflict has been detected. Please choose another alias.'}
                        }));
                        return ;
                    }
                    obj.setAlias(alias);
                    $.project.trigger({
                        type: "class.alias.update",
                        cls: obj
                    });
                }
                res.status(200).send(JSON.stringify({ success: true }));
            });

        /*
        this.app.route('/api/class/implements/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev = {};
                let cls = $.project.find.get.class(Util.decodeURI(Util.b64_decode(req.params.id)));
                //                let clss = $.project.find.classImplementing(cls);

                res.status(200).send(JSON.stringify(dev));
            });*/

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



        // TODO : simplifier, vm, ...
        this.app.route('/api/method/simplify/:id')
            .post(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev:any = {};
                let method:ModelMethod = $.project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.id)));

                let simplifier:Simplifier = $.project.getSimplifier(); // Simplifier.getInstance($.project);

                // init body
                simplifier.setParametersValues(req.body.params);
                simplifier.setInitParentClass(req.body.clinit);
                simplifier.setMaxDepth(req.body.depth);

                let simplifyLvl:number = (req.body.level!=undefined)? req.body.level : 0;

                dev = simplifier.simplify(method, simplifyLvl);

                res.status(200).send(JSON.stringify(dev));
            });

        /**
         * To get full information about a method 
         */
        this.app.route('/api/method/disass/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev:any;
                let method:ModelMethod;

                try{
                    dev = { success:false };
                    method = $.project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.id)));

                    dev.disass = method.disass({ raw: true }, $.project.getDisassembler());
                    dev.success = true;

                    res.status(200).send(JSON.stringify(dev));
                }catch(err){

                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg:"Method cannot be disassembled. "}));
                }
            });

        /**
         * To enumerate exisiting categories and tags
         */
        this.app.route('/api/tags')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev:any = {
                    data: []
                };
                let tagc:any = $.project.analyze.getTagCategories();
                for (let i = 0; i < tagc.length; i++) {
                    dev.data.push(tagc[i].toJsonObject());
                }
                res.status(200).send(JSON.stringify(dev));
            });

        /**
         * Useless. Too heavy request
         */
        this.app.route('/api/method')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {

                res.status(200).send(JSON.stringify({
                    data: $.project.find.method('name:.*').toJsonObject()
                }));
            });

        /**
         * To get xref of a given method by its ID
         */
        this.app.route('/api/method/xref/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let type:string = req.query.type;

                // collect
                let method:ModelMethod = $.project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.id)));
                if (method == null) {
                    Logger.error("XRef to > Given method not found :",Util.decodeURI(Util.b64_decode(req.params.id)));
                    res.status(404).send(JSON.stringify({ err: "method not found" }))
                }

                let data:any = [], tmp:any = null, refs:(ModelMethod|string)[] = null, r2 = null;

                switch (type) {
                    case "from":
                        Object.keys(method.getMethodUsed()).forEach(function (x) {
                            let m:ModelMethod = $.project.find.get.method(x);
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

                        res.status(200).send(JSON.stringify({ data: data }));
                        break;
                    case "to":

                        refs = method.getCallers();
                        //console.log(refs);
                        for (let i:number = 0; i < refs.length; i++) {

                            //r2 = $.project.find.get.method(refs[i]);
                            r2 = refs[i];
                            if( (r2 instanceof ModelMethod) == false){
                                r2 = $.project.find.get.method(r2)
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

                        res.status(200).send(JSON.stringify({ data: data }));
                        break;
                    default:
                        res.status(500).send(JSON.stringify({ err: "type invalid" }));
                        break;
                }
            });

        this.app.route('/api/method/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev:any = {};
                let callers:(string|ModelMethod)[] = [];
                //console.log(Util.decodeURI(Util.b64_decode(req.params.id)));
                let methRef:string = Util.decodeURI(Util.b64_decode(req.params.id));
                let method:ModelMethod = $.project.find.get.method(methRef);

                if (method != null) {

                    if(req.query.probing){
                        method.setProbing($.project.hook.isProbing(method));
                    }

                    dev = method.toJsonObject();
                    dev.hooked = ($.project.hook.getProbe(method)!=null);
                    dev.disass = method.disass({ raw: true }, $.project.getDisassembler());
                } else {
                    Logger.error('[WEBSERVER] Method solving through reference not yet supported here');

                    res.status(500).send(JSON.stringify({ err:'[WEBSERVER] Method solving through reference not yet supported here'}));
                    return ;
                    /*method = $.project.analyze.resolveMethod(methRef);
                    if (method != null) {
                        dev = method.toJsonObject();
                        dev.disass = method.disass({ raw: true });
                    } else {
                        console.log("Error : unable to find " + methRef);
                        res.status(404).send(JSON.stringify(dev));
                        return null;
                    }*/
                }

                dev._callers = callers;

                res.status(200).send(JSON.stringify(dev));
            })
            .put(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let method:ModelMethod = $.project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.id)));
                let cls:ModelClass;

                if (method == null) {
                    res.status(404).send(JSON.stringify({ error: "Method not found" }));
                    return;
                }

                let alias:string = req.body['alias'];

                if(alias != null){

                    if(alias == method.name){
                        res.status(200).send(JSON.stringify({
                            success: false,
                            msg: { type:'warn', msg:'Ignored because the alias not differs from name.'}
                        }));
                        return ;
                    }

                    cls = method.getEnclosingClass();
                    if(cls!=null && cls.hasAliasedMethod(alias)){
                        res.status(200).send(JSON.stringify({
                            success: false,
                            msg: { type:'err', msg:'A conflict has been detected. Please choose another alias.'}
                        }));
                        return ;
                    }

                    method.setAlias(alias);
                    $.project.trigger({
                        type: "method.alias.update",
                        meth: method
                    });
                }

                res.status(200).send(JSON.stringify({ success: true }));
            })

        // TODO : Useless, too heavy request
        this.app.route('/api/package')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {

                let format:any = req.query.hasOwnProperty('format')? req.query.format : 'list';
                let query:string = req.query.hasOwnProperty('query')? req.query.query : '.*';
                let filter:string = req.query.hasOwnProperty('filter')? req.query.filter : null;
                let fields:string[] = req.query.hasOwnProperty('fields')? req.query.fields.split(',') : ['name'];
                let dev:any = {};


                try{
                    if(format=='tree'){
                        if(query=='.*')
                            dev.data = $.project.find.package('name:^[^\\.]*$');
                        else
                            dev.data = $.project.find.package('name:'+query);
                    }else{
                        dev.data = $.project.find.package('name:.*');
                    }

                    if(filter != null){
                        dev.data = dev.data.filter(filter);
                    }

                    dev.data = dev.data.toJsonObject(fields);
                    res.status(200).send(JSON.stringify(dev));
                }catch(err){
                    console.log(err);

                    dev = {
                        success: false
                    };
                    res.status(500).send(JSON.stringify(dev));
                }



            });


        this.app.route('/api/manifest/content')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev = {
                    data: $.project.getAppAnalyzer().dumpManifest()
                };
                res.status(200).send(JSON.stringify(dev));
            })
            .put(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                // TODO : manifest live edit
                let newCode:string = req.body['code[]'].join("\n");
                //hook.script = newCode;
                $.project.getAppAnalyzer().updateManifest(newCode);

                let dev:any = {};
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/manifest/activities')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev = {
                    data: $.project.find.activity('name:.*').toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/manifest/activity/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let name:string = Util.decodeURI(Util.b64_decode(req.params.id));

                let act:AndroidActivity = $.project.find.get.activity(name);

                // collect
                let dev = {
                    data: act.toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        // receivers 

        this.app.route('/api/manifest/receivers')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev = {
                    data: $.project.find.receiver('name:.*').toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/manifest/receiver/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let name:string = Util.decodeURI(Util.b64_decode(req.params.id));
                let act:AndroidReceiver = $.project.find.get.receiver(name);
                let dev:any = null;

                if (act instanceof AndroidReceiver) {
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

        this.app.route('/api/project/active')
            .get(function(req:ExpressRequest, res:ExpressResponse):any {
                let proj:DexcaliburProjectMap;
                let data:any[] = [];

                try{
                    proj = $.context.getActiveProjects();
                    for(let i in proj) data.push( proj[i].toJsonObject());
                    res.status(200).send(JSON.stringify({ success:true, data: data }));
                }catch(err){
                    res.status(200).send(JSON.stringify({ success:false, msg: err.message }));
                }
            })
            .post(function(req:ExpressRequest, res:ExpressResponse):any {
                // [EE] : On enterprise server, for multiple users, store active project into user session
                // [PE] : On professional, add auth but keep global active project
                // [CE] : On community ed, just change global active project
                let proj:DexcaliburProjectMap;
                let success:boolean = false;


                try{
                    if(!req.body.hasOwnProperty('uid')
                        || (Util.isEmpty(req.body['uid'], Util.FLAG_WS | Util.FLAG_CR | Util.FLAG_TB))){
                        throw new Error("Invalid project UID.");
                    }

                    proj = $.context.getActiveProjects();
                    for(let i in proj){
                        if(i==req.body.uid){
                            $.project = proj[i];
                            success = true;
                            break;
                        }
                    }
                    if(success)
                        SEND_SUCCESS_RESPONSE(res, null);
                    else
                        SEND_ERROR_RESPONSE(res, "Sorry. An error happened [#PM_01].");
                }catch(err){
                    Logger.error("[WEB SERVER] An error happened [#PM_02] : "+err.message);
                    SEND_ERROR_RESPONSE(res, "Sorry. An error happened [#PM_02].");
                }
            });


        this.app.route('/api/project/close')
            .post(function(req:ExpressRequest, res:ExpressResponse):any {
                let proj:DexcaliburProject = null;
                let data:any = null;
                try{
                   data = $.context.getActiveProjects();

                   for(let uid in data){
                        if(data[uid].uid == req.body.uid){
                             proj = data[uid];
                        }
                   }

                    $.project = null;

                    if(proj != null){
                        res.status(200).send(JSON.stringify({ success:$.context.closeProject(proj) }));
                    }else{
                        throw new Error("Unknown project");
                    }
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg: err.message }));
                }
            });

        this.app.route('/api/project/info/:uid')
            .get(function(req:ExpressRequest, res:ExpressResponse):any {
                let project:DexcaliburProject;

                try{
                    project = DexcaliburProject.getInformationOf( $.context, req.params.uid);
                    res.status(200).send(JSON.stringify({ success:true, data: project }));
                }catch(err){
                    res.status(200).send(JSON.stringify({ success:false, msg: err.message }));
                }
            });

        // to get defaukt device of active project
        this.app.route('/api/project/device')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                if($.project == null){
                    res.status(500).send({ success:false, msg:'No active project' });
                    return ;
                }

                let dev:Device = null;
                try{
                    dev = $.project.getDevice();
                    if(dev!=null){
                        res.status(200).send({ success:true, msg:dev.toJsonObject({}, {
                                bridge: {
                                    path: false
                                }
                            })
                        });
                    }else{
                        res.status(200).send({ success:true, msg:null });
                    }
                    
                }catch(excpt){
                    res.status(500).send({ success:false, msg:excpt.message });
                }
                return;
            })
            .post(function (req:ExpressRequest, res:ExpressResponse):any {
                if($.project == null){
                    res.status(500).send({ success:false, msg:'No active project' });
                    return ;
                }

                let dev:Device = null;
                let uid:string = null;

                try{
                    uid = req.body['device'];
                    dev = DeviceManager.getInstance().getDevice(uid);
                    if(dev != null){
                        $.project.setDevice(dev);
                        $.project.save();
                    }
                    res.status(200).send({ success:true });
                }catch(excpt){
                    res.status(500).send({ success:false, msg:excpt.message });
                }
                return;
            });

        // to get defaukt device of active project
        this.app.route('/api/project/settings')
            .post(function (req:ExpressRequest, res:ExpressResponse):any {
                if($.project == null){
                    res.status(500).send({ success:false, msg:'No active project' });
                    return ;
                }

                let dev:Device = null;
                let plt:Platform = null;
                let unsafe_UID:string = null;
                let unsafe_val:any = null;

                try{
                    unsafe_UID = req.body['project'];

                    if(req.body['device']!=null){
                        unsafe_val = req.body['device'];

                        dev = DeviceManager.getInstance().getDevice(unsafe_val);
                        if(dev != null){
                            $.project.setDevice(dev);
                            $.project.save();
                        }
                    }
                    if(req.body['platform']!=null){
                        unsafe_val = req.body['platform'];

                        $.project.synchronizePlatform(unsafe_val);
                        $.project.save();
                    }

                    res.status(200).send({ success:true });
                }catch(excpt){
                    res.status(500).send({ success:false, msg:excpt.message });
                }
                return;
            });


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

        this.app.route('/api/project/ws')
            .post(function(req:ExpressRequest, res:ExpressResponse):any {
                let proj:DexcaliburProject[];
                let data:any[] = [];
                let target:string ="";
                let unsafePath:string = null;

                try{
                    if($.project == null){
                        throw new Error('No active project');
                    }

                    target = $.project.getWorkspace().getPath();

                    if(req.body['path']!=null){

                        unsafePath = _path_.normalize(req.body['path']);
                        if(unsafePath.indexOf(target) !== 0){
                            throw new Error('[SECURITY] Path traversal is not allowed. ');
                        }else{
                            target = unsafePath;
                        }
                    }
                    /*
                    const baseDir = $.project.getWorkspace().getPath();
                    // prevent path traversal
                    target = _path_.join(baseDir, req.body['path']!=null?req.body['path']:'');
                    if(target.indexOf(baseDir) !== 0){
                        throw new Error('[SECURITY] Path traversal is not allowed. ');
                    }
*/
                    // replace by UUID
                    Logger.raw(JSON.stringify(_fs_.lstatSync(target)));
                    Logger.raw(JSON.stringify(_fs_.lstatSync(target).isDirectory()));

                    if(_fs_.lstatSync(target).isDirectory()==false){

                        Logger.raw(_fs_.readFileSync( target).toString());
                        data = [{
                            _t: 'c',
                            p: target,
                            n: _path_.basename(target),
                            ctn: _fs_.readFileSync( target, {encoding: "utf-8"})
                        }];
                    }else{

                        Logger.raw(target + " is a directory");
                        _fs_.readdirSync( target).map(( pName:string )=>{
                            const p = _path_.join(target,pName);
                            data.push({ n:pName, p:p, _t: (_fs_.lstatSync(p).isDirectory()?'d':'f') });
                        });
                    }


                    res.status(200).send(JSON.stringify({ success:true, data: data }));
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({ success:false, msg: err.message }));
                }
            });


        this.app.route('/api/application/package/content')
            .post(function(req:ExpressRequest, res:ExpressResponse):any {

                let pkgId:string = null, data:any[] = [];
                let target:string = "", apkBase:string = null;
                let files:string[];
                let unsafePath:string = null;

                try{
                    if($.project == null){
                        throw new Error('No active project');
                    }

                    /*if(req.body['pkgid']==null){
                        throw new Error('Package ID is not valid');
                    }*/

                    const SCOPE:DataScope = $.project.dataAnalyzer.getScope('PKG');

                    if(req.body['path']!=null){

                        unsafePath = _path_.normalize(req.body['path']);
                        if(unsafePath.indexOf(target) !== 0){
                            throw new Error('[SECURITY] Path traversal is not allowed. ');
                        }else{
                            target = unsafePath;
                        }
                    }else{
                        target = SCOPE.getBasePath();
                    }

                    const files:IDbIndex = $.project.dataAnalyzer.getIndex('PKG');

                    files.map( (vOffset:number, vFile:ModelFile)=>{
                        if(_path_.dirname(vFile.getPath())==target){
                            data.push({ _uid: vFile.getUID(), n:vFile.getName(), p:vFile.getPath(), _t: vFile._d, t:vFile.getType() });
                        }
                    });

//                    target = $.project.getWorkspace().getApkDir();



                    //target = req.body['path']==null? apkBase : _path_.join(apkBase, req.body['path']);

                    // prevent path traversal
                    /*if(target.indexOf(apkBase) !== 0){
                        throw new Error('[SECURITY] Path traversal is not allowed. ');
                    }*/

                    // replace by UUID
                    /*
                    if(_fs_.lstatSync(target).isDirectory()==false){
                        data = [{
                            _t: 'c',
                            p: target,
                            n: _path_.basename(target),
                            ctn: _fs_.readFileSync( target, {encoding: "utf-8"})
                        }];
                    }else{
                        _fs_.readdirSync( target).map(( pName:string )=>{
                            const p = _path_.join(target,pName);
                            data.push({ n:pName, p:p, _t: (_fs_.lstatSync(p).isDirectory()?'d':'f') });
                        });
                    }
*/


                    res.status(200).send(JSON.stringify({ success:true, data: data }));
                }catch(err){
                    res.status(200).send(JSON.stringify({ success:false, msg: err.message }));
                }
            });


        /**
         * /api/application/cmp?type=[dex|ks|libs|strings] ...
         */
        this.app.route('/api/application/cmp')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {

                try{
                    res.status(HTTP_CODE_SUCCESS).send(JSON.stringify({
                        success: true,
                        data: $.project.find.provider('name:.*').toJsonObject()
                    }));
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send(JSON.stringify({
                        success: false,
                        msg: err.message
                    }));
                }


            });

        this.app.route('/api/manifest/providers')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {


                res.status(200).send(JSON.stringify({
                    data: $.project.find.provider('name:.*').toJsonObject()
                }));
            });

        this.app.route('/api/manifest/provider/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let name:string = Util.decodeURI(Util.b64_decode(req.params.id));
                let act:AndroidProvider = $.project.find.get.provider(name);

                // collect
                let dev = {
                    data: act.toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });


        this.app.route('/api/manifest/services')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {

                res.status(200).send(JSON.stringify({
                    data: $.project.find.service('name:.*').toJsonObject()
                }));
            });

        this.app.route('/api/manifest/service/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let name:string = Util.decodeURI(Util.b64_decode(req.params.id));
                let act:AndroidService = $.project.find.get.service(name);

                res.status(200).send(JSON.stringify({
                    data: act.toJsonObject()
                }));
            });

        this.app.route('/api/manifest/permissions')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {

                res.status(200).send(JSON.stringify({
                    data: $.project.find.permission('name:.*').toJsonObject()
                }));
            });

        this.app.route('/api/manifest/permission/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let id:string = Util.b64_decode(req.params.id);
                // collect
                let dev:any = {
                    data: $.project.find.permission("name:" + Util.RegExpEscape(id)).toJsonObject()
                };

                res.set('Content-Type', 'text/json');
                res.status(200).send(JSON.stringify(dev.data[0]));
            });

        this.app.route('/api/field/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev:any = {};
                let sign:string = Util.decodeURI(Util.b64_decode(req.params.id));
                //console.log(sign);
                let field:ModelField = $.project.find.get.field(sign);

                dev = field.toJsonObject();
                //dev.sets = $.project.find.settersOf(sign);
                //dev.gets = $.project.find.gettersOf(sign);
                // dev.htg = $.project.graph.htg(method);
                //console.log(dev);
                res.status(200).send(JSON.stringify(dev));
            })
            .put(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let obj:ModelField = $.project.find.get.field(Util.decodeURI(Util.b64_decode(req.params.id)));
                let cls:ModelClass;

                if (obj == null) {
                    res.status(404).send(JSON.stringify({ error: "Field not found" }));
                    return;
                }

                let alias:string = req.body['alias'];

                
                if(alias != null){
                    if(alias == obj.name){
                        res.status(200).send(JSON.stringify({
                            success: false,
                            msg: { type:'warn', msg:'Ignored because the alias not differs from name.'}
                        }));
                        return ;
                    }

                    cls = obj.getEnclosingClass();
                    if(cls!=null && cls.hasAliasedField(alias)){
                        res.status(200).send(JSON.stringify({
                            success: false,
                            msg: { type:'warn', msg:'A conflict has been detected. Please choose another alias.'}
                        }));
                        return ;
                    }


                    obj.setAlias(alias);
                    $.project.trigger({
                        type: "field.alias.update",
                        field: obj
                    });
                }

                res.status(200).send(JSON.stringify({ success: true }));
            });

        this.app.route('/api/field/xref/:id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev:any = { data: [] };
                let field:ModelField = $.project.find.get.field(Util.decodeURI(Util.b64_decode(req.params.id)));

                if (field == null) res.status(404).send(JSON.stringify(dev));

                Object.values(field.getSetters()).forEach(function (x) {
                    dev.data.push({
                        s: x.signature(),
                        a: x.getAlias(),
                        t: 's',
                        tags: x.getTags()
                    });
                });


                Object.values(field.getGetters()).forEach(function (x) {
                    dev.data.push({
                        s: x.signature(),
                        a: x.getAlias(),
                        t: 'g',
                        tags: x.getTags()
                    });
                });

                res.status(200).send(JSON.stringify(dev));
            });

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

        this.app.route('/api/finder')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                let search:string = req.query.search;
                let dev:any = {};

                if (search == null) {
                    res.status(404).send({ error: "No search request" });
                }

                // decode the query
                let u:string = Util.decodeURI(search);
                Logger.info("[FINDER]: ", u);
                let u1:string = Util.b64_decode(u);
                Logger.info("[FINDER]: ", u1);
                let u2:string = Util.decodeURI(u1);
                Logger.info("[FINDER]: ", '$.project.find.' + u2 + ';');

                //search = Util.decodeURI(Util.b64_decode(search));
                Logger.info("[REST] /api/finder : ", u2);
                //Logger.info("[REST] /api/finder : ",search);

                // perform the requests (TODO: ajouter les erreur dans FinderResult)
                let results:any = VM.runInNewContext('$.project.find.' + u2 + ';', { $: $ });

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


                dev.data = results.toJsonObject();
                res.status(200).send(JSON.stringify(dev));
            });


        /*this.app.route('/api/file/list/:scope_id')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                try{
                    if(req.query['uid']==null){
                        throw new Error("[FORMAT::ANALYSIS] #FMT_1 Invalid File UID");
                    }

                    let search:FinderResult = $.project.find.file('scope:'+req.query['uid']);
                    if(search==null || search.count()==0){
                        throw new Error("[FORMAT::ANALYSIS] #FMT_2 File not found");
                    }else{
                        res.status(200).send({ success:true, data:search.toJsonObject()});
                    }
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send({ success:false, msg: err.message });
                }
            });*/



        this.app.route('/api/file/view')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                try{
                    if(req.query['uid']==null){
                        throw new Error("[FILE::VIEW] #FILE_1 Invalid File UID or Scope");
                    }

                    // TODO : validate $.project.dataAnalyzer.isValidScope(req.query['scope']);
                    //const scope = $.project.dataAnalyzer.getScope(req.query['scope']);

                    let search:FinderResult = $.project.find.file('_uid:'+req.query['uid']);
                    let data:any = [];

                    if(search==null || search.count()==0){
                        throw new Error("[FILE::VIEW] #FMT_2 File not found");
                    }else{

                        // TODO : ajouter ModelFile.read() dont le comportement depend du scope ModelFile.scope
                        const file = (search.get(0) as ModelFile);
                        let d:any;
                        if(_fs_.existsSync(file.getPath())){

                            if(file.isExecutable()){
                                d = file.toJsonObject({ cmd:'sections:f_list'});
                            }else{
                                d = file.toJsonObject();
                                d.ctn = _fs_.readFileSync( file.getPath(), {encoding: "utf-8"});
                            }

                            /*{
                                _t: 'c',
                                p: file.getPath(),
                                n: file.getName(),
                                _uid: file.getUID(),
                                t: file.getType(),
                                ctn: _fs_.readFileSync( target, {encoding: "utf-8"})
                            }];*/
                        }

                        res.status(200).send({ success:true, data:d});
                    }
                }catch(err){
                    res.status(HTTP_CODE_ERROR).send({ success:false, msg: err.message });
                }
            });


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


        this.app.route('/api/native/func')
            .get(async function (req:ExpressRequest, res:ExpressResponse):Promise<any> {
                try{
                    if(req.query['uid']==null){
                        throw new Error("[NATIVE::FUNC] #NAT_3 Invalid Function signature");
                    }

                    let fn:ModelFunction = $.project.find.get.func(
                        decodeURIComponent(req.query['uid'])
                    );
                    if(fn==null){
                        throw new Error("[NATIVE::FUNC] #NAT_4 Function not found");
                    }

                    if(req.query['cmd']!=null){
                        const cmd = req.query['cmd'].split(':');

                        let file:FinderResult = $.project.find.file('_uid:'+fn.getDeclaringFile());
                        if(file.count()==0){
                            throw new Error("[NATIVE::FUNC] #NAT_45 Declaring file not found");
                        }


                        if($.project.analyze.getNativeAnalyzer().requireAnalysis( file.get(0) as ModelFile, cmd, {fn:fn})){

                            Logger.info("Executing native analysis of func : ",cmd.join(':'));
                            const success = await $.project.analyze.getNativeAnalyzer().scan( file.get(0) as ModelFile, cmd, { fn:fn });

                            res.status(200).send({ success:(success>-1?true:false), data:fn.toJsonObject() });
                        }else{

                            Logger.info("Command(s) : "+cmd.join(':')+' already executed for '+fn.getSignature());
                            res.status(200).send({ success:true, data:fn.toJsonObject()});
                        }

                    }else{

                        res.status(200).send({ success:true, data:fn.toJsonObject()});
                    }



                }catch(err){
                    res.status(HTTP_CODE_ERROR).send({ success:false, msg: err.message });
                }
            });

        this.app.route('/api/native/analysis')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                try{
                    if(req.query['uid']==null){
                        throw new Error("[NATIVE::ANALYSIS] #NAT_1 Invalid File UID");
                    }

                    let search:FinderResult = $.project.find.file('_uid:'+req.query['uid']);
                    if(search==null || search.count()==0){
                        throw new Error("[NATIVE::ANALYSIS] #NAT_2 File not found");
                    }

                    const cmd = (req.query['cmd']!=null ?  req.query['cmd'].split(':') : ['*']);

                    if($.project.analyze.getNativeAnalyzer().requireAnalysis( search.get(0), cmd, null)){

                        Logger.info("Executing native analysis : ",cmd.join(':'));
                        $.project.analyze.getNativeAnalyzer().scan(search.get(0) as ModelFile, cmd);
                    }


                    let data:any = {};


                    data = (search.get(0) as ModelFile).toJsonObject({ cmd:cmd });

                    res.status(200).send({ success:true, data:data});

                }catch(err){
                    res.status(HTTP_CODE_ERROR).send({ success:false, msg: err.message });
                }
            });

        /*this.app.route('/api/settings')
            .get(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect
                let dev = {
                    cfg:nu
                    frida: null
                };
                let cfg: = $.project.getConfiguration();

                dev.cfg = cfg.toJsonObject();
                dev.frida = cfg.getLocalFridaVersion();
                res.status(200).send(JSON.stringify(dev));
            })
            .post(function (req:ExpressRequest, res:ExpressResponse):any {
                // collect

                let data = req.body;
                //console.log(data);

                let dev = { status:null, invalid:null, err:null };
                //let cfg = Configuration.from(data);

                let cfg = $.project.getConfiguration();

                // clone existing config
                cfg = cfg.clone();

                // import received data
                cfg.import( data,
                    false, // autocomplete OFF
                    true // override ON
                );

                // verifiy fields
                dev.invalid = cfg.verify();

                try{
                    if(dev.invalid.length === 0){
                        Logger.success("Save configuration changes ...")
                        // Ask to current configuration to backup new configuration
                        $.project.getConfiguration().save(cfg);
                    }else{
                        Logger.error(dev.invalid);
                    }
                }catch(err){
                    dev.err = err;
                    console.log(err);
                }
/*
                let dev = false;
                let cfg = $.project.getConfiguration();

                cfg = cfg.clone();

                // not autocomplete, force overwrite
                cfg.import( data,
                    false, // autocomplete
                    true // override
                )
                
*/
              /*  res.status(200).send(JSON.stringify(dev));
            });*/
/*
            this.app.route('/api/util/mkdir')
                .post(function (req:ExpressRequest, res:ExpressResponse):any {
                    // collect
                    let dev:any = { created:null, err:null };
                    let data:any = req.body;
                    console.log(data);

                    try{
                        if(_fs_.existsSync(data.path)==false){
                            _fs_.mkdirSync(data.path)
                            dev.created = _fs_.existsSync(data.path);
                        }else{
                            console.log("path exists");
                        }
                    }catch(err){
                        console.log(err);
                        dev.err = err;
                    }

                    res.status(200).send(JSON.stringify(dev));
                })*/

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
                    res.set('Content-Type', 'text/json');
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
            '/api/probe',
            '/api/find',
            '/api/intent',
            '/api/scanner',
            '/api/field',
            '/api/method',
            '/api/class',
            '/api/finder',
            '/api/package',
            '/api/tags',
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

        /**
         * Redirect to /pages/splash.html if there is no project initialized
         */
        this.app.use(function(req:ExpressRequest, res:ExpressResponse, next:any){
            let f = false;

            // TODO : make CORS parameter as env var
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS, PUT');
            res.set('Access-Control-Allow-Headers', 'Content-Type');

            if(self.project != null){ next(); return; }
            if(!req.url.startsWith('/pages/') && !req.url.startsWith('/api/') && !req.url.startsWith('/inspectors/')){ next(); return; }


            for(let i=0; i<projectDependentPath.length; i++){

                if(req.url.startsWith(projectDependentPath[i])) {
                    f = true;
                    break;
                }
            }

            if(f==false){ next(); return; }
            if(!self.context.isIpcWaitMode()) {
                res.redirect('/pages/splash.html');
                res.send();
            }

            return;
        });



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

        let wwwPort = this.port;

        this.context.printWebBanner(wwwPort);


        this.registerValidator('device', DeviceManager.getInstance());
        this.registerValidator('platform', PlatformManager.getInstance());

        this.httpServer = this.app.listen(wwwPort, function () {
            Logger.success('Server started on : ' + wwwPort);
        });
    }
}




