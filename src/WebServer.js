const Express = require("express");
const fs = require("fs");
const MIME = require("mime-types");
const Chalk = require("chalk");
const VM = require("vm");
const BodyParser = require("body-parser");
const Path = require("path");

const _busboy_ = require('busboy');

const AnalysisHelper = require("./AnalysisHelper.js");
const Decompiler = require("./Decompiler.js");
const Configuration = require("./Configuration.js");
const Uploader = require('./Uploader');
const Downloader = require('./Downloader');
const UT = require("./Utils.js");
const Logger = require("./Logger.js")();
const CLASS = require("./CoreClass.js");
const UTF8 = require("./UTF8.js");
const ANDROID = require("./AndroidAppComponents.js");
const INTENT = require("./IntentFactory.js");
const Simplifier = require("./Simplifier.js");
const WebTemplateEngine = require('./WebTemplateEngine');
const Installer = require('./Installer').Installer;
const PlatformManager = require('./PlatformManager');
const DeviceManager = require('./DeviceManager');
const InspectorManager = require('./InspectorManager');
const FridaHelper = require('./FridaHelper');
const ApkHelper = require('./ApkHelper');

/**
 * @namespace WebServer.MimeHelper
 */
const MimeHelper = {
    /**
     * To detect if the MIME type is a font
     * 
     * @param {String} mime Mime type
     * @returns {Boolean} TRUE if the MIME type is a font
     * @function
     */
    isFontFile: function (mime) {
        let verdict = false;
        ["woff2", "woff", "ttf"].map(x => {
            if (mime.indexOf(x) > -1) {
                verdict = true;
            }
        });
        return verdict;
    }
}



/**
 * Class representing Dexcalibur's web server
 * 
 * @class
 */
class WebServer {

    /**
     * 
     * @param {Project} pProject 
     * @constructor
     */
    constructor() {
        
        this.context = null; 
        this.project = null; //pProject;

        this.tplengine = new WebTemplateEngine();
        this.app = Express();
        this.port = 8000;
//        this.root = Path.join(this.project.config.dexcaliburPath, "webserver", "public");
        this.root = Path.join( __dirname, "webserver", "public");

        this.logs = {
            access: []
        };

        this.uploader = null;

        this.controller = null;
    }

    /**
     * To set the active project
     *  
     * @param {Project} pProject 
     * @method
     */
    setProject( pProject){
        this.project = pProject;
    }

    /**
     * To set Dexcalibur engine 
     * 
     * @param {DexcaliburEngine} pEngine 
     * @method
     */
    setContext( pContext){
        this.context = pContext;
    }

    /**
     * To get Express Application instance used by web server  
     * 
     * @returns {Express.Application} Instance of Express Application
     * @method
     */
    getApplication(){
        return this.app;
    }

    /**
     * 
     * @param {require('path')} pHome The path of the file containing home page
     * @method
     */
    newDispatcher( pHome){
        let $ = this;

        return function (req, res) {
            //console.log(req.path);

            let localPath = $.root + req.path, mime = null;

            if (req.path.endsWith("/"))
                localPath = Path.join($.root, pHome);

            if (req.path.startsWith("/inspectors/")) {

                //console.log(req.path.substr(1,req.path.length-1))
                let inspector = req.path.substr(1, req.path.length - 1).split("/");

                let relPath = "";
                let iid = null;
                if (inspector.length > 1) {
                    iid = inspector[1];

                    //console.log(inspector)

                    //relPath = inspector.pop();
                    for (let i = 2; i < inspector.length; i++)
                        relPath = Path.join(relPath, inspector[i]);

                    //console.log(relPath);

                    //localPath = inspector[1]+"/web/"+localPath
                    localPath = Path.join( __dirname, "..", "inspectors");
                    localPath = Path.join(localPath, iid, "web", relPath);

                    //console.log("[WebServer::inspectors] Path = "+localPath);


                    //localPath = $.project.getInspector(inspector).getPath();
                    mime = MIME.lookup(Path.basename(localPath));
                } else {
                    // redirect to /pages/inspectors?error=404
                    localPath = $.root + "/pages/inspectors?error=404";
                    mime = MIME.lookup($.root + "/pages/inspectors.html");
                }
            } else
                mime = MIME.lookup(localPath.split("/").pop());

            if (localPath.endsWith("bootstrap.min.css.map")) {
                res.status(404).send("An error occured :");//+err.message);
                return;
            }

            fs.readFile(localPath, (err, data) => {

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

        let $ = this;

        this.controller = this.newDispatcher( Path.join("pages","install.html"));

        // init routes serving static contents
        this.initStaticRoutes();

        this.app.use('/api/settings', require("./routes/InstallRoutes"));        
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
            .get(function (req, res) {
                let insp = InspectorManager.getInstance().getEnabledInspector( $.project, req.params.inspectorID);


                if (insp == false) {
                    res.status(404).send(JSON.stringify({ msg: "Inspector cannot be retrieved" }));
                    return false;
                }
                
                insp.performGet(req, res);
            })
            .post(function (req, res) {
                let insp = InspectorManager.getInstance().getEnabledInspector( $.project, req.params.inspectorID);

                if (insp === false) {
                    res.status(404).send(JSON.stringify({ msg: "Inspector cannot be retrieved" }));
                    return false;
                }

                insp.performPost(req, res);
            })


        // API routes 
        this.app.route('/api/platform/list')
            .get(function (req, res) {

                // collect
                let dev = {
                    platforms: PlatformManager.getInstance().getRemote()
                };

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/platform/install')
            .post(async function (req, res) {

                let mgr, dev, platform;

                dev = {
                    status: false
                };

                mgr = PlatformManager.getInstance();
                platform = mgr.getRemotePlatform(req.body['uid']);

                if(platform !== null){
                    dev.status = await mgr.install(platform);
                }

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/workspace/upload')
            .post(function (req,res){
                $.uploader.newUpload( req, res, function( vId) {
                    res.status(200).send(JSON.stringify({ success:true, upload:vId }));
                    res.end();
                });
            });

        this.app.route('/api/workspace/list')
            .get(function (req, res) {

                // collect
                let dev = {
                    projects: $.context.getProjects()
                };

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/workspace/new')
            .post(async function (req, res) {

                const PLATFORM_MODE = ['dev','min','max'];

                let engine = $.context;
                let project = null;
                let dm = null;
                let device = null;
                let path = null;
                let platform = null;
                let success = false;

                dm = DeviceManager.getInstance();
                dm.scan();
                
                if(req.body['dev'] != null){
                    device = dm.getDevice( req.body['dev']);
                    if(device == null || !device.isEnrolled()){
                        res.status(404).send(JSON.stringify({ success:false, msg:"Device unknow or not enrolled "}));
                        return;
                    }
                }

                if(req.body['name'] == null){
                    res.status(404).send(JSON.stringify({ success:false, msg:"Invalid project name"}));
                    return;
                }


                try{
                    
    
                    // first download remote application
                    // on error : ne‹ project will not create. 
                    switch(req.body['type'])
                    {
                        case 'select':
                            if(device == null){
                                res.status(404).send(JSON.stringify({ success:false,  msg:"Device unknow or not enrolled "}));
                                res.end();
                            }
                            platform = device.getPlatform();
                            path = device.pullTemp( req.body['path'] );
                            break;
                        case 'download':
                            if(PLATFORM_MODE)
                            platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                            path = await Downloader.downloadTemp(req.body['url'], { mode:0o666, encoding:'binary', force:true });
                            break;
                        case 'upload':
                            platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                            path = $.uploader.getPathOf(req.body['uploadid']);
                            break;
                        case 'fromfs':
                            platform = PlatformManager.getInstance().getPlatform( req.body['platform']);
                            path = req.body['path'];
                            break;
                    }
    

                    

                    // chcek if file exists an it is not empty
                    if( (!fs.existsSync(path)) || (false)){
                        res.status(404).send(JSON.stringify({   success:false,  msg:"APK file not found "}));
                        return;
                    }
    
                    // create project : UID , APK [, Device]
                    project = await $.context.newProject(req.body['name'], path, device);


                    if(project != null){
                        // sync project platform with target platform or APK
                        success = project.synchronizePlatform( platform);
                    }
                    
                    if(success){
                        project = await project.fullscan();
                        success = project.isReady();
                    }
                    
                    // collect
                    let dev = {
                        success: success // project.isReady()
                    };
                    
                    res.status(200).send(JSON.stringify(dev));
                }catch(err){
                    console.log(err);
                    $.setProject(null);
                    res.status(500).send(JSON.stringify({ msg:"An error occured while project initializing"}));
                }
               
                return ;
            });

        this.app.route('/api/workspace/open')
            .get(async function (req, res) {
                
                // refresh connected device
                DeviceManager.getInstance().scan();
                let project = null;
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

                //$.project = 
                project = await $.context.openProject( req.query.uid );

                // collect
                let dev = {
                    success: project.isReady()
                };
                
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/workspace/delete')
            .post(async function (req, res) {

                // collect
                let dev = {
                    success: $.context.deleteProject( req.body['uid'] )
                };
                
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/workspace/availability')
            .get(function (req, res) {

                let proj = null, availability = true;
                switch( req.query.field)
                {   
                    case "project.uid":
                        proj = $.context.workspace.listProjects();
                        proj.map((vProject)=>{
                            console.log(vProject,req.query.value);
                            if(vProject == req.query.value)
                                availability = false;
                        })
                        break;
                }


                // collect
                let dev = {
                    availability: availability
                };
                
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/device/enroll')
            .post(async function(req, res){
                let dm = DeviceManager.getInstance();
                let uid = req.body['uid'];
                let opts = req.body['opts'];
                let dev;

                try{
                    dev = { success: await dm.enroll(uid, opts) };
                }catch(err){
                    console.log(err);

                    dev = { success:false, msg:err };
                }

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/device/enroll/status')
            .get(function(req, res){
                let dm = DeviceManager.getInstance();
                let uid = req.body['uid'];
                let  status;

                status = dm.getEnrollStatus(uid);

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
            .get(async function (req, res) {
                // scan connected devices
                let dm;

                dm = DeviceManager.getInstance();
                dm.scan();
                dm.save();

                res.status(200).send(JSON.stringify({
                    devices: dm.toJsonObject()
                }));
            });

        this.app.route('/api/device/applications')
            .get(async function (req, res) {
                // scan connected devices
                let dev, dm, opts='-f';

                dm = DeviceManager.getInstance();
                dev = dm.getDevice( req.query.uid );

                if(dev.isEnrolled() == false){
                    res.status(404).send(JSON.stringify({
                        msg: 'Device is not enrolled'
                    }));
                    return;
                }

                dm = dev.getBridge().listPackages(opts);
                dev = [];

                dm.map( (x)=>{
                    dev.push(x.toJsonObject())
                });

                res.status(200).send(JSON.stringify({
                    device: req.query.uid,
                    apps:dev
                }));
            });

        this.app.route('/api/device/setDefault')
            .post(function (req, res) {
                // collect
                let uid = req.body["uid"];
                let dm = DeviceManager.getInstance();
                let dev = null;

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

        // todo : replace by device manager scan()
        this.app.route('/api/packageList')
            .get(function (req, res) {
                // scan connected devices
                $.project.packagePatcher.scan();
                // collect
                let packages = {
                    data: $.project.packagePatcher.toJsonObject()
                };
                res.status(200).send(JSON.stringify(packages));
            });
    
        // todo : replace by splash/select app        
        this.app.route('/api/changeWorkspace/:projectIdentifier')
            .get(function (req, res) {
                // scan connected devices
                $.project.changeProject(req.params.projectIdentifier);
                // collect

                res.status(200).send("{\"status\": \"ok\"}");
            });

        // todo : replace by splash/select app
        this.app.route('/api/pullProject/:packageIdentifier')
            .get(function (req, res) {
                // scan connected devices
                //console.log(req.params.packageIdentifier)
                $.project.packagePatcher.pullPackage(req.params.packageIdentifier);
                // collect
                $.project.changeProject(req.params.packageIdentifier);
                res.status(200).send(JSON.stringify({ message: "ok" }));
            });

        // not used
        this.app.route('/api/stats')
            .get(function (req, res) {
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
        this.app.route('/api/class')
            .get(function (req, res) {
                // collect
                let dev = {
                    data: $.project.find.class().toJsonObject()
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
            .get(function (req, res) {
                let hooks = $.project.hook.list();
                let data = { data: [] };
                for (let i in hooks) {
                    data.data.push(hooks[i].toJsonObject());
                }
                res.status(200).send(JSON.stringify(data));
            });

        this.app.route('/api/inspector')
            .get(function (req, res) {
                let insp = InspectorManager.getInstance().getInspectorsOf($.project);

                let data = { data: [] };
                for (let i in insp) {
                    data.data.push(insp[i].toJsonObject());
                }
                res.status(200).send(JSON.stringify(data));
            });

        this.app.route('/api/probe/server/start')
            .post(async function (req, res) {

                let device = null;

                if(req.body['dev']){
                    device = DeviceManager.getInstance().getDevice(req.param.dev);
                }else{
                    device = $.project.getDevice();
                }

                try{
                    res.status(200).send(JSON.stringify({
                        success: await FridaHelper.startServer( device, {
                            path: req.body['path'],
                            privileged: (req.body['privileged']=="true"? true: false)
                        })
                    }));
                }catch(err){
                    console.log(err);
                    res.status(200).send(JSON.stringify({
                        success: false
                    }));
                }
            });

        this.app.route('/api/probe/server/status')
            .get(async function (req, res) {

                let device = null;

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
            .post(function (req, res) {
               
                try{
                    switch(req.body.type){
                        case "spawn-self":
                            Logger.info(`[WEBSERVER] Start hooking [app=${$.project.getPackageName()}, type=spawn-self]`);
                            $.project.hook.startBySpawn($.project.getPackageName());
                            res.status(200).send(JSON.stringify({ enable: true }));
                            break;
                        case "spawn":
                            Logger.info(`[WEBSERVER] Start hooking [app=${req.body.app}, type=spawn]`);
                            $.project.hook.startBySpawn(req.body.app);
                            res.status(200).send(JSON.stringify({ enable: true }));
                            break;
                        case "attach-gadget":
                            Logger.info(`[WEBSERVER] Start hooking [pid=Gadget, type=attach-gadget]`);
                            $.project.hook.startByAttachToGadget();
                            res.status(200).send(JSON.stringify({ enable: true }));
                            break;
                        case "attach-app-self":
                            Logger.info(`[WEBSERVER] Start hooking [app=${req.body.app}, type=attach-app-self]`);
                            $.project.hook.startByAttachToApp($.project.getPackageName());
                            res.status(200).send(JSON.stringify({ enable: true }));
                            break;
                        case "attach-app":
                            Logger.info(`[WEBSERVER] Start hooking [app=${req.body.app}, type=attach-app-x]`);
                            $.project.hook.startByAttachToApp(req.body.app);
                            res.status(200).send(JSON.stringify({ enable: true }));
                            break;
                        case "attach-pid":
                            Logger.info(`[WEBSERVER] Start hooking [pid=${req.body.pid}, type=attach-to-pid`);
                            $.project.hook.startByAttachTo(req.body.pid);
                            res.status(200).send(JSON.stringify({ enable: true }));
                            break;
                        default:
                            res.status(404).send(JSON.stringify({ err: 'Invalid start type' }));
                            break;
                    }
                }catch(exception){
                    console.log(exception);
                    res.status(404).send(JSON.stringify({ err: exception }));
                }

                
            });

        /**
         * To download the resulting Frida script 
         */
        this.app.route('/api/probe/download')
            .get(function (req, res) {
                let script = $.project.hook.prepareHookScript();

                res.set('Content-Type', 'application/octet-stream');
                res.set('Content-Length', script.length);
                res.set('Content-Disposition', 'attachment; filename="hook.js"');
                res.set('Expires', '0');
                res.status(200).send(script);
            });

        this.app.route('/api/probe/msg')
            .get(function (req, res) {
                if($.project == null){
                    res.status(404).send(JSON.stringify({}));
                    return null;
                }


                let sess = $.project.hook.lastSession();
                if (sess == null) {
                    res.status(404).send({ msg: "No session" });
                    return;
                }

                if (!sess.hasMessages()) {
                    res.status(404).send({ msg: "No messages" });
                    return;
                }

                let data = { data: sess.toJsonObject() };
                res.status(200).send(JSON.stringify(data));
            });

        this.app.route('/api/probe/:method')
            .post(function (req, res) {
                let meth = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.method)));
                if (meth == null) {
                    console.log(UT.decodeURI(UT.b64_decode(req.params.method)));
                    res.status(404).send(JSON.stringify({ msg: "Method not found" }));
                    return;
                }
                if (meth.name == "<clinit>") {
                    res.status(404).send(JSON.stringify({ msg: "Static blocks (<clinit>) cannot be hooked" }));
                    return;
                }
                let probe = $.project.hook.getProbe(meth);
                if (probe == null) {
                    probe = $.project.hook.probe(meth);
                }

                // collect
                let dev = {
                    enable: probe.isEnable()
                };
                //if(hook.enable)
                $.project.trigger({
                    type: "probe.new",
                    data: {
                        hook: probe,
                        method: meth
                    } 
                });

                res.status(200).send(JSON.stringify(dev));
                /*else
                    res.status(403).send(JSON.stringify(dev));*/
            })
            .put(function (req, res) {
                let meth = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.method)));
                if (meth == null) {
                    res.status(404).send({ error: "No probe ID given" });
                    return;
                }
                let status = req.query.enable;
                Logger.info(status, req.query);
                if (status === undefined) {
                    res.status(404).send({ error: "No search request" });
                    return;
                }

                let hook = $.project.hook.getProbe(meth);
                if (status == "true")
                    hook.setEnable(true);
                else
                    hook.setEnable(false);

                // collect
                let dev = {
                    enable: hook.isEnable()
                };

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/hook/app/detach')
            .post(async function (req, res) {

                Logger.info("[REST] /api/hook/app/detach POST");

                // get hook instance by ID
                let session = $.project.hook.lastSession();
                
                if (session.fridaScript == null) {
                    res.status(200).send({ success: false, error: "Invalid frida script" });
                }else{
                    let a = await session.fridaScript.unload();
                    res.status(200).send(JSON.stringify({ success: await session.fridaScript.unload(a) }));
                }         
            })

        this.app.route('/api/hook/app/kill')
            .post(async function (req, res) {

                Logger.info("[REST] /api/hook/frida/kill POST");

                // get hook instance by ID
                let session = $.project.hook.lastSession();

                
                if (session.pid == null) {
                    res.status(200).send({ success: false, error: "Invalid PID" });
                }else{
                    let o = await $.project.getDevice().privilegedExecSync('kill '+session.pid, {detached:false});
                    res.status(200).send(JSON.stringify({ success: true }));
                }         
            })
            
        this.app.route('/api/hook/frida/exec')
            .post(async function(req, res){
                let newCode = req.body['code[]'].join("\n");
                let output = null;

                try{
                    switch(req.body.type){
                        case "spawn-self":
                            Logger.info(`[WEBSERVER] Start with frida console [app=${$.project.getPackageName()}, type=spawn-self]`);
                            output = await FridaHelper.exec(newCode, FridaHelper.SPAWN, $.project.getPackageName());
                            break;
                        case "spawn":
                            Logger.info(`[WEBSERVER] Start with frida console [app=${req.body.app}, type=spawn]`);
                            output = await FridaHelper.exec(newCode, FridaHelper.SPAWN, req.body.app);
                            break;
                        case "attach-gadget":
                            Logger.info(`[WEBSERVER] Start with frida console  [pid=Gadget, type=attach-gadget]`);
                            output = await FridaHelper.exec(newCode, FridaHelper.ATTACH_BY_NAME, "Gadget");
                            break;
                        case "attach-app-self":
                            Logger.info(`[WEBSERVER] Start with frida console  [app=${req.body.app}, type=attach-app-self]`);
                            output = await FridaHelper.exec(newCode, FridaHelper.ATTACH_BY_NAME, $.project.getPackageName());
                            break;
                        case "attach-app":
                            Logger.info(`[WEBSERVER] Start with frida console  [app=${req.body.app}, type=attach-app-x]`);
                            output = await FridaHelper.exec(newCode, FridaHelper.ATTACH_BY_NAME, req.body.app);
                            break;
                        case "attach-pid":
                            Logger.info(`[WEBSERVER] Start with frida console  [pid=${req.body.pid}, type=attach-to-pid`);
                            output = await FridaHelper.exec(newCode, FridaHelper.ATTACH_BY_PID, req.body.pid);
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
            .get(function (req, res) {

                Logger.info("[REST] /api/hook/:hookid GET");

                // get hook instance by ID
                let hook = $.project.hook.getHookByID(
                    req.params.hookid
                );

                if (hook == null) {
                    res.status(404).send({ success: false, error: "Invalid hook ID given" });
                }else{
                    res.status(200).send(JSON.stringify({ success: true, hook: hook.toJsonObject() }));
                }         
            })
            .put(function (req, res) {
                Logger.info("[REST] /api/hook/:hookid EDIT");


                let hook = $.project.hook.getHookByID(
                    req.params.hookid
                );



                if (hook == null) {
                    res.status(404).send({ success: false, error: "Invalid hook ID given" });
                    return;
                }

                let newCode = req.body['code[]'].join("\n");
                //hook.script = newCode;
                hook.modifyScript(newCode);

                //let success = $.project.hook.removeHook(hook);            

                res.status(200).send(JSON.stringify({ success: true }));
            })
            .delete(function (req, res) {

                let hook = $.project.hook.getHookByID(
                    //UT.b64_decode(req.params.hookid)
                    req.params.hookid
                );

                Logger.info("[REST] /api/hook/:hookid REMOVE");

                if (hook == null) {
                    res.status(404).send({ error: "No probe ID given" });
                    return;
                }

                let success = $.project.hook.removeHook(hook);


                res.status(200).send(JSON.stringify({ success: (success != null) ? true : false }));

            });

        this.app.route('/api/hook/enable/:hookid')
            .put(function(req, res){

                let dev={}, hook=null;

                if(req.params.hookid=="all"){
                    hook = $.project.hook.list();
                    for(let i in hook){
                        hook[i].enable();
                        dev[i] = {enable: hook[i].isEnable() };
                    }
                }else{
                    hook = $.project.hook.getHookByID(
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
            .put(function(req, res){

                let dev={}, hook=null;
                
                if(req.params.hookid=="all"){
                    hook = $.project.hook.list();
                    for(let i in hook){
                        hook[i].disable();
                        dev[i] = {enable: hook[i].isEnable() };
                    }
                }else{
                    hook = $.project.hook.getHookByID(
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
            .put(function (req, res) {
                // collect
                let obj = $.project.find.get.class(UT.decodeURI(UT.b64_decode(req.params.id)));

                if (obj == null) {
                    res.status(404).send(JSON.stringify({ error: "Class not found" }));
                    return;
                }

                let alias = req.body['alias'];

                //console.log(alias);
                if(alias != null){
                    obj.setAlias(alias);
                    $.project.trigger({
                        type: "class.alias.update",
                        cls: obj
                    });
                }
                res.status(200).send(JSON.stringify({ success: true }));
            });

        this.app.route('/api/class/implements/:id')
            .get(function (req, res) {
                // collect
                let dev = {};
                let cls = $.project.find.get.class(UT.decodeURI(UT.b64_decode(req.params.id)));
                //                let clss = $.project.find.classImplementing(cls);

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/graph/:graph_type/:type/:id')
            .get(function (req, res) {
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
                        from = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.id)));
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

         /**
         * To get full information about a method 
         */
        this.app.route('/api/method/decompile/:id')
        .get(function (req, res) {
            // collect
            let dev = {};
            let method = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.id)));

            let decompiler = Decompiler.getInstance($);

            let simplifyLvl = (req.query.level!=undefined)? req.query.level : 0;
            dev = decompiler.decompile(method, simplifyLvl);

            res.status(200).send(JSON.stringify(dev));
        });

        this.app.route('/api/method/simplify/:id')
        .post(function (req, res) {
            // collect
            let dev = {};
            let method = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.id)));

            let simplifier = Simplifier.getInstance($.project);
            
            // init body 
            simplifier.setParametersValues(req.body.params);
            simplifier.setInitParentClass(req.body.clinit);
            simplifier.setMaxDepth(req.body.depth);

            let simplifyLvl = (req.body.level!=undefined)? req.body.level : 0;

            dev = simplifier.simplify(method, simplifyLvl);

            res.status(200).send(JSON.stringify(dev));
        });

        /**
         * To get full information about a method 
         */
        this.app.route('/api/method/disass/:id')
            .get(function (req, res) {
                // collect
                let dev = {};
                let method = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.id)));

                dev.disass = method.disass({ raw: true });

                res.status(200).send(JSON.stringify(dev));
            });

        /**
         * To enumerate exisiting categories and tags
         */
        this.app.route('/api/tags')
            .get(function (req, res) {
                // collect
                let dev = {
                    data: []
                };
                let tagc = $.project.analyze.getTagCategories();
                for (let i = 0; i < tagc.length; i++) {
                    dev.data.push(tagc[i].toJsonObject());
                }
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/method')
            .get(function (req, res) {
                // collect
                let dev = {
                    data: $.project.find.method().toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        /**
         * To get xref of a given method by its ID
         */
        this.app.route('/api/method/xref/:id')
            .get(function (req, res) {
                let type = req.query.type;

                // collect
                let method = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.id)));
                if (method == null) {
                    Logger.error("XRef to > Given method not found :",UT.decodeURI(UT.b64_decode(req.params.id)));
                    res.status(404).send(JSON.stringify({ err: "method not found" }))
                }

                let data = [], tmp = null, refs = null, r2 = null;

                switch (type) {
                    case "from":
                        Object.keys(method.getMethodUsed()).forEach(function (x) {
                            let m = $.project.find.get.method(x);
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
                        for (let i = 0; i < refs.length; i++) {

                            //r2 = $.project.find.get.method(refs[i]);
                            r2 = refs[i];
                            if( (r2 instanceof CLASS.Method) == false){
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
            .get(function (req, res) {
                // collect
                let dev = {};
                let callers = [];
                //console.log(UT.decodeURI(UT.b64_decode(req.params.id)));
                let methRef = UT.decodeURI(UT.b64_decode(req.params.id));
                let method = $.project.find.get.method(methRef);

                if (method != null) {
                    dev = method.toJsonObject();
                    dev.disass = method.disass({ raw: true });
                } else {
                    method = $.project.analyze.resolveMethod(methRef);
                    if (method != null) {
                        dev = method.toJsonObject();
                        dev.disass = method.disass({ raw: true });
                    } else {
                        console.log("Error : unable to find " + methRef);
                        res.status(404).send(JSON.stringify(dev));
                        return null;
                    }
                }

                dev._callers = callers;

                res.status(200).send(JSON.stringify(dev));
            })
            .put(function (req, res) {
                // collect
                let method = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.id)));

                if (method == null) {
                    res.status(404).send(JSON.stringify({ error: "Method not found" }));
                    return;
                }

                let alias = req.body['alias'];

                if(alias != null){
                    method.setAlias(alias);
                    $.project.trigger({
                        type: "method.alias.update",
                        meth: method
                    });
                }

                res.status(200).send(JSON.stringify({ success: true }));
            })

        this.app.route('/api/package')
            .get(function (req, res) {
                // collect
                let dev = {
                    data: $.project.find.package().toJsonObject(["name"])
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/manifest/content')
            .get(function (req, res) {
                // collect
                let dev = {
                    data: $.project.getAppAnalyzer().dumpManifest()
                };
                res.status(200).send(JSON.stringify(dev));
            })
            .put(function (req, res) {
                // collect

                let newCode = req.body['code[]'].join("\n");
                //hook.script = newCode;
                $.project.getAppAnalyzer().updateManifest(newCode);

                let dev = {};
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/manifest/activities')
            .get(function (req, res) {
                // collect
                let dev = {
                    data: $.project.find.activity().toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/manifest/activity/:id')
            .get(function (req, res) {
                let name = UT.decodeURI(UT.b64_decode(req.params.id));

                let act = $.project.find.get.activity(name);

                // collect
                let dev = {
                    data: act.toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        // receivers 

        this.app.route('/api/manifest/receivers')
            .get(function (req, res) {
                // collect
                let dev = {
                    data: $.project.find.receiver().toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/manifest/receiver/:id')
            .get(function (req, res) {
                let name = UT.decodeURI(UT.b64_decode(req.params.id));
                let act = $.project.find.get.receiver(name);
                let dev = null;

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
        
        this.app.route('/api/project/:uid/app/info')
            .get(function(req, res){
                if(req.params.uid != "self"){
                    // not supported
                    res.status(404).send(JSON.stringify({ msg: 'Operation not supported (TODO)' }));
                }else{
                    $.project.getApplication();
                    res.status(404).send(JSON.stringify({ msg: 'Operation not supported (TODO)' }));
                }
            })
/*
            this.app.route('/api/projection')
                .get(function (req, res) {

                    
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

                    let name = UT.decodeURI(UT.b64_decode(req.params.id));
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

        this.app.route('/api/manifest/providers')
            .get(function (req, res) {
                // collect
                let dev = {
                    data: $.project.find.provider().toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/manifest/provider/:id')
            .get(function (req, res) {
                let name = UT.decodeURI(UT.b64_decode(req.params.id));
                let act = $.project.find.get.provider(name);

                // collect
                let dev = {
                    data: act.toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });


        this.app.route('/api/manifest/services')
            .get(function (req, res) {
                // collect
                let dev = {
                    data: $.project.find.service().toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/manifest/service/:id')
            .get(function (req, res) {
                let name = UT.decodeURI(UT.b64_decode(req.params.id));
                let act = $.project.find.get.service(name);

                // collect
                let dev = {
                    data: act.toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/manifest/permissions')
            .get(function (req, res) {
                // collect
                let dev = {
                    data: $.project.find.permission().toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/manifest/permission/:id')
            .get(function (req, res) {
                let id = UT.b64_decode(req.params.id);
                // collect
                let dev = {
                    data: $.project.find.permission("name:" + UT.RegExpEscape(id)).toJsonObject()
                };

                res.set('Content-Type', 'text/json');
                res.status(200).send(JSON.stringify(dev.data[0]));
            });

        this.app.route('/api/field/:id')
            .get(function (req, res) {
                // collect
                let dev = {};
                let sign = UT.decodeURI(UT.b64_decode(req.params.id));
                //console.log(sign);
                let field = $.project.find.get.field(sign);

                dev = field.toJsonObject();
                //dev.sets = $.project.find.settersOf(sign);
                //dev.gets = $.project.find.gettersOf(sign);
                // dev.htg = $.project.graph.htg(method);
                //console.log(dev);
                res.status(200).send(JSON.stringify(dev));
            })
            .put(function (req, res) {
                // collect
                let obj = $.project.find.get.field(UT.decodeURI(UT.b64_decode(req.params.id)));

                if (obj == null) {
                    res.status(404).send(JSON.stringify({ error: "Field not found" }));
                    return;
                }

                let alias = req.body['alias'];

                
                if(alias != null){
                    obj.setAlias(alias);
                    $.project.trigger({
                        type: "field.alias.update",
                        field: obj
                    });
                }

                res.status(200).send(JSON.stringify({ success: true }));
            });

        this.app.route('/api/field/xref/:id')
            .get(function (req, res) {
                // collect
                let dev = { data: [] };
                let field = $.project.find.get.field(UT.decodeURI(UT.b64_decode(req.params.id)));

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
                //let sign = UT.decodeURI(UT.b64_decode(req.params.id));
                let field = $.project.find.get.field(UT.decodeURI(UT.b64_decode(req.params.id)));
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
            .get(function (req, res) {
                let o = [];
                $.project.hook.refreshScanner();
                for (let i in $.project.hook.scanners) {
                    o.push($.project.hook.scanners[i].toJsonObject());
                }

                res.status(200).send(JSON.stringify({ data: o }));
            })
            .post(function (req, res) {
                /*let dev = {
                    data: $.dbm.getScannerDB().toJsonList()
                };*/

                res.status(404).send({ error: "Service unavailable" });
            });

        this.app.route('/api/scanner/run')
            .get(function (req, res) {
                let scannerId = req.query.id
                if (scannerId == null) {
                    res.status(404).send(JSON.stringify({ data: null, err: "Invalid Hookset ID" }));
                    return;
                }


                let hookset = $.project.hook.getHookSet(UT.decodeURI(UT.b64_decode(scannerId)));
                if (hookset == null) {
                    res.status(404).send(JSON.stringify({ data: null, err: "Hookset not found" }));
                    return;
                }

                hookset.deploy();
                hook.run();
                res.status(200).send(JSON.stringify({ data: { running: true }, err: null }));
            });

        this.app.route('/api/scanner/load')
            .get(function (req, res) {
                let scannerId = req.query.id
                if (scannerId == null) {
                    res.status(404).send(JSON.stringify({ data: null, err: "Invalid Hookset ID" }));
                    return;
                }


                let hookset = $.project.hook.getHookSet(UT.decodeURI(UT.b64_decode(scannerId)));
                if (hookset == null) {
                    res.status(404).send(JSON.stringify({ data: null, err: "Hookset not found" }));
                    return;
                }

                hookset.deploy();
                res.status(200).send(JSON.stringify({ data: { running: true }, err: null }));
            })

        this.app.route('/api/finder')
            .get(function (req, res) {
                let search = req.query.search;
                if (search == null) {
                    res.status(404).send({ error: "No search request" });
                }

                // decode the query
                let u = UT.decodeURI(search);
                Logger.info("[FINDER]: ", u);
                let u1 = UT.b64_decode(u);
                Logger.info("[FINDER]: ", u1);
                let u2 = UT.decodeURI(u1);
                Logger.info("[FINDER]: ", '$.project.find.' + u2 + ';');

                //search = UT.decodeURI(UT.b64_decode(search));
                Logger.info("[REST] /api/finder : ", u2);
                //Logger.info("[REST] /api/finder : ",search);

                // perform the requests (TODO: ajouter les erreur dans FinderResult)
                let results = VM.runInNewContext('$.project.find.' + u2 + ';', { $: $ });

                // collect
                let dev = {
                    data: results.toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/settings')
            .get(function (req, res) {
                // collect
                let dev = {
                    cfg:null,
                    frida: null
                };
                let cfg = $.project.getConfiguration();

                dev.cfg = cfg.toJsonObject();
                dev.frida = cfg.getLocalFridaVersion();
                res.status(200).send(JSON.stringify(dev));
            })
            .post(function (req, res) {
                // collect

                let data = req.body;
                console.log(data);

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
                        console.log("Save configuration changes ...")
                        // Ask to current configuration to backup new configuration
                        $.project.getConfiguration().save(cfg);
                    }else{
                        console.log(dev.invalid);
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
                res.status(200).send(JSON.stringify(dev));
            });

            this.app.route('/api/util/mkdir')
                .post(function (req, res) {
                    // collect
                    let dev = { created:null, err:null };
                    let data = req.body;
                    console.log(data);

                    try{
                        if(fs.existsSync(data.path)==false){
                            fs.mkdirSync(data.path)
                            dev.created = fs.existsSync(data.path);
                        }else{
                            console.log("path exists");
                        }
                    }catch(err){
                        console.log(err);
                        dev.err = err;
                    }

                    res.status(200).send(JSON.stringify(dev));
                })

        /*
         * Send an intent to to the default device
         */
        this.app.route('/api/intent/send')
            .post(function (req, res) {
                // collect
                let uid = req.body["uid"];
                let typeIntent = req.body["type"];
                let extraAdb = req.body["extraAdb"];
                let factory = null;
                let app;

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
                DeviceManager.getInstance().scan();
                let device = $.project.getDevice(); // devices.getDefault();
                console.log(device);
                if(device == null){
                    //DeviceManager.getInstance().scan();
                    //$.project.devices.scan();
                    //device = $.project.devices.getDefault();

                    
                }

                console.log(device);

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

                let callbacks = function(err, stdout, stderr){
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
                factory = new INTENT.IntentCommandFactory(
                    typeIntent, 
                    app,
                    extraAdb);

                device.exec(
                    factory.getIntentCommand(
                        new INTENT.Intent({
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
        for (let i = 0; this.logs.access.length; i++) {
            code = this.logs.access[i].substr(0, 2);
            if (code == "[4")
                console.log(Chalk.red(this.logs.access[i]));
            else
                console.log(Chalk.green(this.logs.access[i]));
        }
    }

    /**
     * To use routes of install mode
     * 
     * @method
     */
    useInstallMode(){
        this.initInstallRoutes();
    }

    /**
     * To use routes of production mode
     * 
     * @method
     */
    useProductionMode(){
        const projectDependentPath = [
            '/api/hook',
            '/api/probe',
            '/api/find',
            '/api/intent',
            '/api/scanner',
            '/api/field',
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

        let self = this;

        /**
         * Redirect to /pages/splash.html if there is no project initialized
         */
        this.app.use(function(req, res, next){
            let f = false;
            if(self.project != null){ next(); return; }
            if(!req.url.startsWith('/pages/') && !req.url.startsWith('/inspectors/')){ next(); return; }


            for(let i=0; i<projectDependentPath.length; i++){
                if(req.url.startsWith(projectDependentPath[i])) {
                    f = true;
                    break;
                }
            }

            if(f==false){ next(); return; }
            
            res.redirect('/pages/splash.html');
            res.send();
            
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
    start(port) {
        
        if (port == null) {
            this.port = this.context.getConfiguration().getWebPort(); //project.config.web_port;
        } else {
            this.port = port;
        }

        let wwwPort = this.port;

        this.context.printWebBanner(wwwPort);

        this.app.listen(wwwPort, function () {
            console.log(Chalk.bold.green('Server started on : ' + wwwPort));
        });
    }
}


module.exports = WebServer;




