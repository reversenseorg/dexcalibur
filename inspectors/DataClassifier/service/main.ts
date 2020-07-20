import {IFC_TYPE} from "../../../dist/src/InspectorFrontController";
import InspectorFrontController from "../../../src/InspectorFrontController";

export var Controller =  new InspectorFrontController();

Controller.registerHandler(IFC_TYPE.GET, function(ctx,req,res){
    console.log("GET", req.query);
    res.send({ msg:"ok" });
});

Controller.registerHandler(IFC_TYPE.POST, function(ctx,req,res){
    console.log("POST", req.query);
    res.send({ msg:"ok" });
});

