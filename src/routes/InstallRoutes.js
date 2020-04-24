const _fs_ = require("fs");
const _express_ = require("express");
const _router_ = _express_.Router();

const DexcaliburEngine = require("../DexcaliburEngine");
const Configuration = require("../Configuration");
const Installer = require('../Installer').Installer;

/*
 * WebServer instance
 */
var $ = DexcaliburEngine.getInstance().getWebserver();


// path configuration
_router_.post('/step1', function (req, res) {
    // collect

    let data = req.body;
    let verif = null;

    let dev = { status:null, invalid:[], err:null };
    //let cfg = Configuration.from(data);

    let cfg = $.context.getConfiguration();

    // clone existing config
    //cfg = cfg.clone();

    for(let i in data){

        if( i != "workspacePath"){
            verif = Configuration.verifyField(i, data[i]);
            if(verif != null){
                dev.invalid.push({ name:i, msg:verif });
            }else{
                cfg.setParameter( i, data[i]);
            }
        }
    }

    try{
        if(dev.invalid.length === 0){
            $.context.createWorkspace( data.workspacePath );
            dev.status = "success";

        }else{
            console.log(dev.invalid);
            dev.status = "error";
        }
    }catch(err){
        dev.err = err;
        console.log(err);
        dev.status = "error";
    }

    res.status(200).send(JSON.stringify(dev));
});

// start dependencies download & install
_router_.post('/step2', function (req, res) {
        // collect

        let data = req.body;
        let verif = null;
        console.log(data);

        let dev = { status:null, invalid:[], err:null };

        try{
            $.context.initInstaller();
            $.context.startInstall();
        }catch(err){
            dev.err = err;
            console.log("INSTALLER",err);
        }

        res.status(200).send(JSON.stringify(dev));
    });

//this.app.route('/api/settings/step2/status')
_router_.get('/step2/status', function (req, res) {
        // collect
        
        let status = $.context.getInstallerStatus();
        
        res.status(200).send(JSON.stringify({
            msg: status.getMessage(),
            progress: status.getProgress(),
            extra: status.getExtra()
        }));
    });

// restart        
_router_.post('/step3', function (req, res) {
        // collect
        let data = req.body;
        let verif = null;
        console.log(data);

        let dev = { status:null, invalid:[], err:null };
        //let cfg = Configuration.from(data);

        let cfg = $.context.getConfiguration();

        // clone existing config
        //cfg = cfg.clone();

        for(let i in data){
            
            verif = Configuration.verifyField(i, data[i]);
            if(verif != null){
                dev.invalid.push({ name:i, msg:verif });
            }else{
                cfg.setParameter( i, data[i]);
            }
        }

        try{
            if(dev.invalid.length === 0){
                $.context.createWorkspace( data.workspace );
            }else{
                console.log(dev.invalid);
            }
        }catch(err){
            dev.err = err;
            console.log(err);
        }

        res.status(200).send(JSON.stringify(dev));
    });


_router_.post('/verify', function (req, res) {
         // collect

        let data = req.body;
        let verif = null;

        let dev = { status:null, invalid:[], err:null };

        for(let i in data){
            if( i != "workspacePath"){
                verif = Configuration.verifyField(i, data[i]);
                if(verif != null){
                    dev.invalid.push({ name:i, msg:verif });
                }
            }
            else{
                verif = Installer.verifyWorkspacePath( data[i]);
                if(verif != null){
                    dev.invalid.push({ name:i, msg:verif+" It will be created automatically !" });
                }
            }
        }

        res.status(200).send(JSON.stringify(dev));
    });

_router_.get('/', function (req, res) {
    // collect
    let dev = {
        cfg:null,
        frida: null,
        invalid:[]
    };

    let cfg = $.context.getConfiguration() ;

    dev.cfg = cfg.toJsonObject();
    //dev.frida = cfg.getLocalFridaVersion();
    //dev.invalid.push( Configuration.verifyField( "workspacePath", $.context.getDefaultWorkspace() ) )
    res.status(200).send(JSON.stringify(dev));
});

_router_.post('/api/settings', function (req, res) {
    // collect

    let data = req.body;
    let verif = null;
    console.log(data);

    let dev = { status:null, invalid:[], err:null };
    //let cfg = Configuration.from(data);

    let cfg = $.context.getConfiguration();

    // clone existing config
    //cfg = cfg.clone();

    for(let i in data){
        verif = Configuration.verifyField(i, data[i]);
        if(verif != null){
            dev.invalid.push({ name:i, msg:verif });
        }
    }

    try{
        if(dev.invalid.length === 0){
            console.log("Save configuration changes ...")
             // import received data
            cfg.import( data,
                false, // autocomplete OFF
                true // override ON
            );
            
            // Ask to current configuration to backup new configuration
            $.context.saveConfiguration(cfg);
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

_router_.post('/api/util/mkdir', function (req, res) {
    // collect
    let dev = { created:null, err:null };
    let data = req.body;
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
});


module.exports = _router_;

