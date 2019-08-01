const IFC = require("../../../src/InspectorFrontController.js");
var CONST = require("../../../src/CoreConst.js");
var AH = require("../../../src/AnalysisHelper.js");
const Disassembler = require("../../../src/Disassembler.js");
const Fs = require("fs");

var Controller =  new IFC.FrontController();

var DEBUG = false;


/*
Controller.registerHandler(IFC.HANDLER.GET, function(ctx,req,res){

});

/*
Controller.registerHandler(IFC.HANDLER.POST, function(ctx,req,res){
    console.log("POST", req.query);
    res.send({ msg:"ok" });
});*/


module.exports = Controller;
