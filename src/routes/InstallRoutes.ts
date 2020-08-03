import * as _fs_ from 'fs';
import * as _express_ from 'express';
import DexcaliburEngine from "../DexcaliburEngine";
import WebServer from "../WebServer";
import Configuration from "../Configuration";
import StatusMessage from "../StatusMessage";
import Installer from "../Installer";

export const _router_ = _express_.Router();

/*
 * WebServer instance
 */
var $:WebServer = DexcaliburEngine.getInstance().getWebserver();


// path configuration
_router_.post('/step1', function (req:_express_.Request, res:_express_.Response):any {
    // collect

    let data:any = req.body;
    let verif:any = null;

    let dev:any = { status:null, invalid:[], err:null };
    //let cfg = Configuration.from(data);

    let cfg:Configuration = $.context.getConfiguration();

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
_router_.post('/step2', function (req:_express_.Request, res:_express_.Response):any{
        // collect

        let data:any = req.body;

        let dev:any = { status:null, invalid:[], err:null };

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
_router_.get('/step2/status', function (req:_express_.Request, res:_express_.Response):any {
        // collect
        
        let status:StatusMessage = $.context.getInstallerStatus();
        
        res.status(200).send(JSON.stringify({
            msg: status.getMessage(),
            progress: status.getProgress(),
            extra: status.getExtra()
        }));
    });

// restart
// deprecated ?
_router_.post('/step3', function (req:_express_.Request, res:_express_.Response):any {
        // collect
        let data:any = req.body;
        let verif:any = null;

        let dev:any = { status:null, invalid:[], err:null };
        //let cfg = Configuration.from(data);

        let cfg:Configuration = $.context.getConfiguration();

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


_router_.post('/verify', function (req:_express_.Request, res:_express_.Response):any {
         // collect

        let data:any = req.body;
        let verif:any = null;

        let dev:any = { status:null, invalid:[], err:null };

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

_router_.get('/', function (req:_express_.Request, res:_express_.Response):any {
    // collect
    let dev:any = {
        cfg:null,
        frida: null,
        invalid:[]
    };

    let cfg:Configuration = $.context.getConfiguration() ;

    dev.cfg = cfg.toJsonObject();
    //dev.frida = cfg.getLocalFridaVersion();
    //dev.invalid.push( Configuration.verifyField( "workspacePath", $.context.getDefaultWorkspace() ) )
    res.status(200).send(JSON.stringify(dev));
});

_router_.post('/api/settings', function (req, res) {
    // collect

    let data:any = req.body;
    let verif:any = null;

    let dev:any = { status:null, invalid:[], err:null };
    //let cfg = Configuration.from(data);

    let cfg:Configuration = $.context.getConfiguration();

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
            $.context.getWorkspace().saveConfiguration(cfg);
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

/*
_router_.post('/api/util/mkdir', function (req:_express_.Request, res:_express_.Response):any {
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
*/


