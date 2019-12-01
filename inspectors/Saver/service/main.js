const IFC = require("../../../src/InspectorFrontController.js");
var CONST = require("../../../src/CoreConst.js");
const UT = require("../../../src/Utils.js");
const FS = require("fs");
const Path = require("path");

var Controller =  new IFC.FrontController();


function collectAll(context){
    let db = {
        classes: {},
        fields: {},
        methods: {},
        length: {
            classes: 0,
            fields: 0,
            methods: 0
        }
    };


    context.analyze.db.classes.map((k,v)=>{
        if(v != null && v.alias != null){
            db.classes[k] = v.alias;
            db.length.classes++;
        }
    });

    
    context.analyze.db.fields.map((k,v)=>{
        if(v != null && v.alias != null){
            db.fields[k] = v.alias;
            db.length.fields++;
        }
    });

    context.analyze.db.methods.map((k,v)=>{
        // alias
        if(v != null && v.alias != null){
            db.methods[k] = {};
            db.methods[k].alias = v.alias;
        }

        // hooks
        hook = context.hook.getProbe(v);
        if(hook !== null){
            if(db.methods[k] == null) 
                db.methods[k] = {};

            db.methods[k].hook = hook.toJsonObject();
        }

        db.length.methods++;
    });


    return db;
}


function importAll(context,data){
    let o=null, s=null, WDB = context.analyze.db, ctr=0;

    let hm = context.hook;


    for(let k in data.classes){
        o = data.classes[k];
        s=WDB.classes.getEntry(k);

        if(s != null){
            s.setAlias(o);
            ctr++;
        }
    }

    
    for(let k in data.fields){
        o = data.fields[k];
        s=WDB.fields.getEntry(k);

        if(s != null){
            s.setAlias(o);
            ctr++;
        }
    }


    for(let k in data.methods){
        o = data.methods[k];
        meth=WDB.methods.getEntry(k);

        if(meth==null){
            console.log("[INSPECTOR::SAVER] Error : method "+k+" not found");
            continue;
        }

        // alias
        if(o != null && o.alias != null){
            meth.setAlias(o.alias);
        }

        // hooks
        // hook = context.hook.getProbe(o);
        if(o.hook != null){
            // search if the hook already exists
            hook = context.hook.getProbe(meth);
            
            // if thereis not hook, call the hook manager and generate one
            if(hook == null){
                hook = context.hook.probe(meth);
            }

            // update the current hook with the imported data
            hook.updateWith(o.hook, meth);
        }
        ctr++;
    }


    return true;
}


/*
function collectAll(context){
    let o=null, db = {
        classes: {},
        fields: {},
        methods: {},
        length: {
            classes: 0,
            fields: 0,
            methods: 0
        }
    };

    let hm = context.hook;

    for(let k in context.analyze.db.classes){
        o = context.analyze.db.classes[k];
        if(o != null && o.alias != null){
            db.classes[k] = o.alias;
            db.length.classes++;
        }
    }

    for(let k in context.analyze.db.fields){
        o = context.analyze.db.fields[k];
        if(o != null && o.alias != null){
            db.fields[k] = o.alias;
            db.length.fields++;
        }
    }

    for(let k in context.analyze.db.methods){
        o = context.analyze.db.methods[k];
        // alias
        if(o != null && o.alias != null){
            db.methods[k] = {};
            db.methods[k].alias = o.alias;
        }

        // hooks
        hook = context.hook.getProbe(o);
        if(hook !== null){
            if(db.methods[k] == null) 
                db.methods[k] = {};

            db.methods[k].hook = hook.toJsonObject();
        }

        db.length.methods++;
    }


    return db;
}


function importAll(context,data){
    let o=null, WDB = context.analyze.db, ctr=0;

    let hm = context.hook;

    for(let k in data.classes){
        o = data.classes[k];
        if(o != null){
            WDB.classes[k].setAlias(o);
            ctr++;
        }
    }

    for(let k in data.fields){
        o = data.fields[k];
        if(o != null){
            WDB.fields[k].setAlias(o);
            ctr++;
        }
    }

    for(let k in data.methods){
        o = data.methods[k];
        // alias
        if(o != null && o.alias != null){
            WDB.methods[k].setAlias(o.alias);
        }

        // hooks
        // hook = context.hook.getProbe(o);
        if(o.hook != null){
            // search if the hook already exists
            hook = context.hook.getProbe(WDB.methods[k]);
            
            // if thereis not hook, call the hook manager and generate one
            if(hook == null){
                hook = context.hook.probe(WDB.methods[k]);
            }

            // update the current hook with the imported data
            hook.updateWith(o.hook, WDB.methods[k]);
        }
        ctr++;
    }


    return true;
}*/


/*

A 
| \
C  |
| /
X

  Si la derniere instructions du bloc precedent est un goto vers le bloc courant  

*/
function save(context){
    
    let subject=null, bb=null, newbb=null, xref=null;

    // collect data to save
    let data = collectAll(context);

    // get the file wherre the data will eb write
    let file = Path.join(context.workspace.getSaveDir(),"save.json");

    // write data
    FS.writeFileSync(file, JSON.stringify(data));

    // verifiy 
    //console.log(FS.statSync(file));
    //let success = FS.existsSync(file);
    return { status:200, data:{ success:true }};
}


function open(context){

    console.log("Opening backup ...")

    let file = Path.join(context.workspace.getSaveDir(),"save.json");

    // check if the file exists
    if(!FS.existsSync(file)){
        return { status:404, data:{ success:false, error:"No backup file to open" } };
    }
    
    // read data
    let data = FS.readFileSync(file);

    importAll(context, JSON.parse(data));

    // verifiy 
    //console.log(FS.statSync(file));

    return { status:200, data:{ success:true }};
}

/**
 * 
 * @param {Project} pContext 
 * @param {String} pStatus  String representing auto-save status : "on" / "off". Default: "on" 
 */
function autosave(pContext, pStatus = "on"){
    pContext.trigger({ type: (pStatus=="on"? "save.autosave.start" : "save.autosave.stop") });

    return { status:200, data:{ success:true }};
}

function getAutosaveStatus(pContext){
    return { status:200, data:{ enable:pContext.saveManager.isEnabled() }};
}

/**
 * Delegate front controller
 */
Controller.registerHandler(IFC.HANDLER.GET, function(ctx,req,res){

    var action = req.query.action;
    var act ={
        status: 404,
        data: { error: "Action not found. "}
    };

    switch(action){
        case 'autosave':
            act = autosave(ctx, req.query.status);
            break;
        case 'autosave-status':
            act = getAutosaveStatus(ctx);
            break;
        case 'save':
            act = save(ctx);
            break;
        case 'open':
            act = open(ctx);
            break;
        case 'import':
            act = import(ctx);
            break;
    }

    res.status(act.status).send(act.data);
});

/*
Controller.registerHandler(IFC.HANDLER.POST, function(ctx,req,res){
    console.log("POST", req.query);
    res.send({ msg:"ok" });
});*/


module.exports = Controller;
