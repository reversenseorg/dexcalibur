import InspectorFrontController, {IFC_TYPE} from "../../../src/InspectorFrontController";
import {TAG} from "../../../src/AnalysisHelper";
import DexcaliburProject from "../../../src/DexcaliburProject";
import * as _fs_ from 'fs';
import {IDbIndex} from "../../../src/persist/orm/DbAbstraction";
import {FinderResult} from "../../../src/FinderResult";
import BusEvent from "../../../src/BusEvent";

var Controller:InspectorFrontController =  new InspectorFrontController();



/*

*/
function getInvokedMethod(context:DexcaliburProject):any{
    let meth:FinderResult = context.find.method("has."+context.getTagManager().getTag("code.call.dynamic"));
    return meth.toJsonObject();
}

function getExternalDex(context:DexcaliburProject):any{
    let files:IDbIndex = context.getInspector("DynamicLoader").getDB().getIndex("dex",null);

    return files.toJsonObject();
}

function getElementsDiscovered(context:DexcaliburProject):any{
    let cls:FinderResult = context.find.class("tags:^"+context.getTagManager().getTag("code.call.dynamic")+"$");
    return cls.toJsonObject();
}

function cleanupSavedDex(context:DexcaliburProject):any{
    let files:IDbIndex = context.getInspector("DynamicLoader").getDB().getIndex("dex",null);

    files.map(function(k,v){
        try{
            _fs_.unlinkSync(v.getPath());
            context.bus.send(new BusEvent({
                type: "file.del",
                data: v.getUID()
            }));
            v = null;
        }catch(err){}
    });

    context.getInspector("DynamicLoader").getDB().newIndex("dex",null);


    return true;
}

/**
 * Delegate front controller
 */
Controller.registerHandler(IFC_TYPE.GET, function(ctx:DexcaliburProject,req:any,res:any):any{

    let action:string = req.query.action;
    let act:any ={
        status: 404,
        data: { error: "Action not found. "}
    };

    switch(action){
        case 'refresh_reflect':
            act.status = 200;
            act.data.error = null;
            act.data.data = getInvokedMethod(ctx);
            break;
        case 'refresh_dex':
            act.status = 200;
            act.data.error = null;
            act.data.data = getExternalDex(ctx);
            break;
        case 'refresh_discover':
            act.status = 200;
            act.data.error = null;
            act.data.data = getElementsDiscovered(ctx);
            break;
        case 'cleanup':
            act.status = 200;
            act.data.error = null;
            act.data.data = cleanupSavedDex(ctx);
            break;
    }

    res.status(act.status).send(act.data);
});

export default Controller;