const IFC = require("../../../src/InspectorFrontController.js");
var CONST = require("../../../src/CoreConst.js");
const Disassembler = require("../../../src/Disassembler.js");

var Controller =  new IFC.FrontController();

var DEBUG = false;


/*

*/
function getInvokedMethod(context){
    let meth = context.find.call("calleed.tags:invoked").select("calleed");
    return meth.toJsonObject();
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
        case 'refresh_reflect':
            act.data.data = getInvokedMethod(ctx);

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
