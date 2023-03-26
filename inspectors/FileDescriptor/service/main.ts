import InspectorFrontController, {IFC_TYPE} from "../../../src/InspectorFrontController.js";
import DexcaliburProject from "../../../src/DexcaliburProject.js";

var Controller:InspectorFrontController =  new InspectorFrontController();

Controller.registerHandler(IFC_TYPE.GET, function(ctx:DexcaliburProject,req:any,res:any){
    console.log("GET", req.query);
    res.send({ msg:"ok" });
});

Controller.registerHandler(IFC_TYPE.POST, function(ctx:DexcaliburProject,req:any,res:any){
    console.log("POST", req.query);
    res.send({ msg:"ok" });
});


export default Controller;