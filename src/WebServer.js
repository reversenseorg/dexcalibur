const Express = require("express");
const fs = require("fs");
const MIME = require("mime-types");
const Chalk = require("chalk");
const VM = require("vm");
const BodyParser = require("body-parser");

const UT = require("./Utils.js");
const Logger = require("./Logger.js");
const CLASS = require("./CoreClass.js");
const UTF8 = require("./UTF8.js");

const MimeHelper = {
    isFontFile: function(mime){
        let verdict = false;
        ["woff2","woff","ttf"].map(x=>{
            if(mime.indexOf(x)>-1){ 
                verdict = true;
            }
        });
        return verdict;
    }
}

function decodeURI(uri){
    return decodeURIComponent(uri);
}

// Replace 'pattern' by 'replace" in 'source' buffer and 
// return the new buffer
function BufferReplace(source, pattern, replace){
    let bo = Buffer.alloc(source.length+replace.length-pattern.length);
    let off = source.indexOf(pattern);
    //console.log("offset :",off);

    console.log("BufferReplace : ",source,pattern);

    source.copy(bo, 0, 0, off);
    //console.log(bo);

    let rep = Buffer.from(replace,'binary');
    rep.copy(bo, off, 0, replace.length);
    //console.log(bo);

    //source.copy(bo, off+replace.length, off+pattern.length, source.length-pattern.length);
    source.copy(bo, off+replace.length, off+pattern.length, source.length);
    
    //console.log(bo);
    return bo;
}


class TemplateEngine {
    
    constructor(project){
        this.project = project;
        this.tokenRE = new RegExp("<!--##\\s*(.+)\\s+##-->");
        this.tokens = {};
        this.root = project.config.dexcaliburPath+"/webserver/public/";
    }
  
    /**
     * To replace token by the corresponding file content  before
     * to send the HTTP response to the client.
     * 
     * Token should take the form <!--## file/path/to/tpl.html ##-->
     * 
     * @param {*} data 
     */
    process(data){
        let m = null, tpl=null, match=false;
        do {
            m = this.tokenRE.exec(data);
            //console.log(m);
        
            if(m == null || m.length < 2){
                break;
            }
            tpl = fs.readFileSync(this.root+m[1],'binary');
            // console.log(this.root+m[1],tpl);

            // data = data.replace(m[0], fs.readFileSync(this.root+m[1]));
            data = BufferReplace(data, m[0], tpl);
            match = true;
        }while(this.tokenRE.test(data));
        
        if(match)
            return data.toString('utf8');//('ascii'); 
        else
            return data;
    }
}


class WebServer {
    
    constructor(project){
        this.project = project;
        this.tplengine = new TemplateEngine(project);
        this.app = Express();
        this.port = 8000;
        this.root = this.project.config.dexcaliburPath+"webserver/public";
        this.logs = {
            access: []   
        };
    }

    initRoute(){
        let $ = this;

        let serveFile = function(req,res){
            //console.log(req.path);
    
            let localPath = $.root+req.path, mime=null;
    
            if(req.path.endsWith("/"))
                localPath = $.root+"/index.html";

            if(req.path.startsWith("/inspectors/")){

                //console.log(req.path.substr(1,req.path.length-1))
                let inspector = req.path.substr(1,req.path.length-1).split("/");

                let relPath = "";
                let iid = null;
                if(inspector.length>1){
                    iid = inspector[1];

                    console.log(inspector)

                    //relPath = inspector.pop();
                    for(let i=2; i<inspector.length; i++)
                        relPath += "/"+inspector[i];

                    console.log(relPath);
                    
                    //localPath = inspector[1]+"/web/"+localPath
                    localPath = $.project.config.getDexcaliburPath()+"../inspectors/";
                    localPath += iid+"/web/"+relPath;

                    console.log("[WebServer::inspectors] Path = "+localPath);
                

                    //localPath = $.project.getInspector(inspector).getPath();
                }else{
                    // redirect to /pages/inspectors?error=404
                    localPath = $.root+"/pages/inspectors?error=404";
                }
                mime = MIME.lookup(localPath.split("/").pop());
            }else
                mime = MIME.lookup(localPath.split("/").pop());
        
            if(localPath.endsWith("bootstrap.min.css.map")){
                res.status(404).send("An error occured :");//+err.message);
                return;
            }
        
            fs.readFile(localPath, (err,data)=>{
                
                // set good http headers into the response
                res.set('Access-Control-Allow-Origin','*');
                if(err != null) {
                    $.logs.access.push("[404]:"+mime+" "+req.path+" => "+localPath);
                    res.status(404).send("An error occured :"+err.message);
                    return;
                }
                if(MimeHelper.isFontFile(mime)){
                    res.set('accept-ranges', "bytes");
                    res.set('vary','Accept-Encoding');
                    res.set('Content-Type', mime);
                }else{
                    res.set('Content-Type', mime);
                    res.set('X-XSS-Protection', '0; mode=block');
                    res.set('X-Frame-Options', 'SAMEORIGIN');
                    res.set('X-Content-Type-Options', 'nosniff');
                    //res.set('Content-Security-Policy', 'nosniff');
                }
                $.logs.access.push("[200]:"+mime+" "+req.path+" => "+localPath);
                
                // replace template tags
                if(localPath.endsWith(".html"))
                    data = $.tplengine.process(data);

                res.status(200).send(data);
            });
        }
        // define middleware
        this.app.use(BodyParser.urlencoded({ extended: false }));
        this.app.use(BodyParser.json());

        // start server
        this.app.get('/', serveFile);
        this.app.get('/index.html', serveFile);
        this.app.get('/inspectors/*', serveFile);
        this.app.get('/pages/*', serveFile);
        this.app.get('/dist/*', serveFile);
        this.app.get('/data/*', serveFile);
        this.app.get('/js/*', serveFile);
        this.app.get('/less/*', serveFile);
        this.app.get('/vendor/*', serveFile);

        // Inspector frontController
        this.app.route('/api/inspectors/:inspectorID')
            .get(function(req,res){
                let insp = $.project.inspectors.get(req.params.inspectorID);
                
                if(insp==false){
                    res.status(404).send(JSON.stringify({ msg:$.project.inspectors.lastError() }));
                    return false;
                }
                
                insp.performGet(req,res);
            })
            .post(function(req,res){
                let insp = $.project.inspectors.get(req.params.inspectorID);
                if(insp===false){
                    res.status(404).send(JSON.stringify({ msg:$.project.inspectors.lastError() }));
                    return false;
                }
            
                insp.performPost(req,res);
            })


        // API routes 
        this.app.route('/api/device')
            .get(function(req,res){
                // scan connected devices
                $.project.devices.scan();
                // collect
                let dev = {
                    data: $.project.devices.toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        // not used
        this.app.route('/api/stats')
            .get(function(req,res){
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
            .get(function(req,res){
                // collect
                let dev = {
                    data: $.project.find.class().toJsonObject()
                };
                for(let i in dev.data){
                    for(let k in dev.data[i].methods){
                        if($.project.hook.isProbing(dev.data[i].methods[k])){
                            dev.data[i].methods[k].probing = true;
                        }else{
                            dev.data[i].methods[k].probing = false;
                        }
                    }
                }
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/probe')
            .get(function(req,res){
                let hooks = $.project.hook.list();
                let data = { data:[] };
                for(let i in hooks){
                    data.data.push(hooks[i].toJsonObject());
                }
                res.status(200).send(JSON.stringify(data));
            });

        this.app.route('/api/inspector')
            .get(function(req,res){
                let insp = $.project.inspectors.list();
                let data = { data:[] };
                for(let i in insp){
                    data.data.push(insp[i].toJsonObject());
                }
                res.status(200).send(JSON.stringify(data));
            });

        this.app.route('/api/probe/start')
            .post(function(req,res){
                let hooks = $.project.hook.start();
                res.status(200).send(JSON.stringify({ enable: true }));
            });

        this.app.route('/api/probe/msg')
            .get(function(req,res){
                let sess = $.project.hook.lastSession();
                if(sess==null){
                    res.status(404).send({ msg:"No session" });
                    return ;
                }

                if(!sess.hasMessages()){
                    res.status(404).send({ msg:"No messages" });
                    return ;
                }

                let data = { data:sess.toJsonObject() };
                res.status(200).send(JSON.stringify(data));
            });

        this.app.route('/api/probe/:method')
            .post(function(req,res){
                let meth = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.method)));
                if(meth == null){
                    res.status(404).send(JSON.stringify(dev));
                    return;
                }

                let probe = $.project.hook.getProbe(meth); 
                if(probe == null){
                    probe = $.project.hook.probe(meth);
                }

                // collect
                let dev = {
                    enable: probe.isEnable()
                };
                //if(hook.enable)
                    res.status(200).send(JSON.stringify(dev));
                /*else
                    res.status(403).send(JSON.stringify(dev));*/
            })
            .put(function(req,res){
                let meth = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.method)));
                if(meth == null){
                    res.status(404).send({ error:"No probe ID given" });
                    return;
                }
                let status = req.query.enable;
                Logger.info(status,req.query);
                if(status === undefined){
                    res.status(404).send({ error:"No search request" });
                    return;
                }

                let hook = $.project.hook.getProbe(meth);
                if(status=="true")
                    hook.setEnable(true);
                else
                    hook.setEnable(false);

                // collect
                let dev = {
                    enable: hook.isEnable()
                };

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/hook/:hookid')
            .put (function(req,res){
                let hook = $.project.hook.getHookByID(
                    req.params.hookid
                );

                Logger.info("[REST] /api/hook/:hookid EDIT");
                
                
                if(hook == null){
                    res.status(404).send({ success:false, error:"Invalid hook ID given" });
                    return;
                }

                let newCode = req.body['code[]'].join("\n");
                //hook.script = newCode;
                hook.modifyScript(newCode);
                
                   //let success = $.project.hook.removeHook(hook);            

                res.status(200).send(JSON.stringify({ success: true }));
            })
            .delete(function(req,res){

                let hook = $.project.hook.getHookByID(
                    //UT.b64_decode(req.params.hookid)
                    req.params.hookid
                );

                Logger.info("[REST] /api/hook/:hookid REMOVE");

                if(hook == null){
                    res.status(404).send({ error:"No probe ID given" });
                    return;
                }

                let success = $.project.hook.removeHook(hook);
            

                res.status(200).send(JSON.stringify({ success:(success!=null)?true:false }));
                                            
            });

        this.app.route('/api/class/implements/:id')
            .get(function(req,res){
                // collect
                let dev = {};
                let cls = $.project.find.get.class(UT.decodeURI(UT.b64_decode(req.params.id)));
//                let clss = $.project.find.classImplementing(cls);

                res.status(200).send(JSON.stringify(dev));
            });

        /**
         * To get full information about a method 
         */
        this.app.route('/api/method/disass/:id')
            .get(function(req,res){
                // collect
                let dev = {};
                let method = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.id)));
                
                dev.disass = method.disass({ raw: true });

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/method')
            .get(function(req,res){
                // collect
                let dev = {
                    data: $.project.find.method().toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/method/xref/to/:id')
            .get(function(req,res){
                // collect
                let method = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.id)));
                if(method == null){
                    res.status(404).send(JSON.stringify({ err:"method not found"}))
                }

                let dev = {
                    data: method.toJsonObject()._callers
                };

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/method/:id')
            .get(function(req,res){
                // collect
                let dev = {};
                let callers = [];
                console.log(req.params.id, UT.b64_decode(req.params.id));
                console.log(UT.decodeURI(UT.b64_decode(req.params.id)));
                let method = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.id)));
                
                dev = method.toJsonObject();
                dev.disass = method.disass({ raw: true });
                //dev.cfg = $.project.graph.cfgLazy(method);
                // dev.htg = $.project.graph.htg(method);


                for(let k=0; k<dev._callers.length; k++){
                    if($.project.hook.isProbing(dev._callers[k])){
                        callers.push({ id:dev._callers[k], probing:true });
                    }else{
                        callers.push({ id:dev._callers[k], probing:false });
                    }
                }
                dev._callers = callers;

                res.status(200).send(JSON.stringify(dev));
            })
            .put(function(req,res){
                // collect
                let dev = {};
                let callers = [];
                console.log(req.params.id, UT.b64_decode(req.params.id));
                console.log(UT.decodeURI(UT.b64_decode(req.params.id)));
                let method = $.project.find.get.method(UT.decodeURI(UT.b64_decode(req.params.id)));
                
                if(method==null){
                    res.status(404).send(JSON.stringify({ error:"Method not found" }));
                    return;
                }

                let alias = req.body['alias'];

                method.setAlias(alias);

                //console.log(newCode);
                //hook.script = newCode;
                //hook.modifyScript(newCode);
                
                   //let success = $.project.hook.removeHook(hook);            

                res.status(200).send(JSON.stringify({ success: true }));
       
            })

        this.app.route('/api/package')
            .get(function(req,res){
                // collect
                let dev = {
                    data: $.project.find.package().toJsonObject(["name"])
                };
                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/field/:id')
            .get(function(req,res){
                // collect
                let dev = {};
                let sign = UT.decodeURI(UT.b64_decode(req.params.id));
                console.log(sign);
                let field = $.project.find.get.field(sign);
                
                dev = field.toJsonObject();
                dev.sets = $.project.find.settersOf(sign);
                dev.gets = $.project.find.gettersOf(sign);
                // dev.htg = $.project.graph.htg(method);

                res.status(200).send(JSON.stringify(dev));
            });

        this.app.route('/api/scanner')
            .get(function(req,res){
                let o = [];
                $.project.hook.refreshScanner();
                for(let i in $.project.hook.scanners){
                    o.push($.project.hook.scanners[i].toJsonObject());
                }

                res.status(200).send(JSON.stringify({ data:o }));
            })
            .post(function(req,res){
                /*let dev = {
                    data: $.dbm.getScannerDB().toJsonList()
                };*/

                res.status(404).send({ error:"Service unavailable"});
            });
        
        this.app.route('/api/scanner/run')
            .get(function(req,res){
                let scannerId = req.query.id
                if(scannerId == null){
                    res.status(404).send(JSON.stringify({ data: null, err:"Invalid Hookset ID" }));
                    return;                    
                }

                
                let hookset = $.project.hook.getHookSet(UT.decodeURI(UT.b64_decode(scannerId)));
                if(hookset == null){
                    res.status(404).send(JSON.stringify({ data: null, err:"Hookset not found" }));
                    return;                    
                }

                hookset.deploy();
                hook.run();
                res.status(200).send(JSON.stringify({ data:{ running:true }, err:null }));
            });
        
        this.app.route('/api/scanner/load')
            .get(function(req,res){
                let scannerId = req.query.id
                if(scannerId == null){
                    res.status(404).send(JSON.stringify({ data: null, err:"Invalid Hookset ID" }));
                    return;                    
                }

                
                let hookset = $.project.hook.getHookSet(UT.decodeURI(UT.b64_decode(scannerId)));
                if(hookset == null){
                    res.status(404).send(JSON.stringify({ data: null, err:"Hookset not found" }));
                    return;                    
                }

                hookset.deploy();
                res.status(200).send(JSON.stringify({ data:{ running:true }, err:null }));
            })

        this.app.route('/api/finder')
            .get(function(req,res){
                let search = req.query.search;
                if(search == null){
                    res.status(404).send({ error:"No search request" });
                }

                // decode the query
                let u = UT.decodeURI(search);
                Logger.info("[FINDER]: ",u);
                let u1 = UT.b64_decode(u);
                Logger.info("[FINDER]: ",u1);
                let u2 = UT.decodeURI(u1);
                Logger.info("[FINDER]: ",'$.project.find.'+u2+';');
                
                //search = UT.decodeURI(UT.b64_decode(search));
                Logger.info("[REST] /api/finder : ",u2);
                //Logger.info("[REST] /api/finder : ",search);

                // perform the requests (TODO: ajouter les erreur dans FinderResult)
                //console.log($);
                //Logger.info(u);
                let results = VM.runInNewContext('$.project.find.'+u2+';',{ $:$ });

                if(u2.substr(0,3)=="get"){
                    //console.log(results);
                    Logger.info("[FINDER][GET] "+results.toJsonObject());
                }

                // collect
                let dev = {
                    data: results.toJsonObject()
                };
                res.status(200).send(JSON.stringify(dev));
            });
    }

    showAccessLogs(){
        for(let i=0; this.logs.access.length; i++){
            code = this.logs.access[i].substr(0,2);
            if(code=="[4")
                console.log(Chalk.red(this.logs.access[i]));
            else
                console.log(Chalk.green(this.logs.access[i]));
        }
    }

    start(port){
        this.initRoute();

        if(port == null){
            this.port = this.project.config.web_port;
        }else{
            this.port = port;
        }

        let wwwPort = this.port;
        this.app.listen(wwwPort, function () {
            console.log(Chalk.bold.green('Server started on : '+wwwPort));
        });
    }
}

module.exports = WebServer;




