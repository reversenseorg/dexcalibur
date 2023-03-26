import InspectorFrontController, {IFC_TYPE} from "../../../src/InspectorFrontController.js";

 var Controller:InspectorFrontController =  new InspectorFrontController();

Controller.registerHandler(IFC_TYPE.GET, function(ctx,req,res){
    console.log("GET", req.query);
    res.send({ msg:"ok" });
});

Controller.registerHandler(IFC_TYPE.POST, function(ctx,req,res){
    console.log("POST", req.query);
    res.send({ msg:"ok" });
});

export default Controller;