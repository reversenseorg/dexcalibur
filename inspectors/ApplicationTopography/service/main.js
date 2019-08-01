const IFC = require("../../../src/InspectorFrontController.js");

var Controller =  new IFC.FrontController();



/*
Controller.registerHandler(IFC.HANDLER.GET, function(ctx,req,res){

});

/*
Controller.registerHandler(IFC.HANDLER.POST, function(ctx,req,res){
    console.log("POST", req.query);
    res.send({ msg:"ok" });
});*/


module.exports = Controller;
