


/*

*/
import DexcaliburProject from "../../../src/DexcaliburProject.js";
import {FinderResult} from "../../../src/search/FinderResult.js";
import {IDbIndex} from "../../../src/persist/orm/DbAbstraction.js";
import * as _fs_ from "fs";
import BusEvent from "../../../src/BusEvent.js";
import {DelegateRequest, DelegateResponse, DelegateWebApi} from "../../../src/webapi/DelegateWebApi.js";
import WebServer from "../../../src/WebServer.js";
import {AuthenticationException} from "../../../src/errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../../../src/errors/DexcaliburProjectException.js";
import ModelMethod from "../../../src/ModelMethod.js";
import Util from "../../../src/Utils.js";
import {Request, Response} from "express";
import * as Log from "../../../src/Logger.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

class Rules {
    static getInvokedMethod(context:DexcaliburProject):any{
        const meth:FinderResult = context.find.method("has."+context.getTagManager().getTag("code.call.dynamic"));
        return meth.toJsonObject();
    }

    static getExternalDex(context:DexcaliburProject):any{
        const files:IDbIndex = context.getInspector("DynamicLoader").getDB().getIndex("dex",null);

        return files.toJsonObject();
    }

    static getElementsDiscovered(context:DexcaliburProject):any{
        const cls:FinderResult = context.find.class("tags:^"+context.getTagManager().getTag("code.call.dynamic")+"$");
        return cls.toJsonObject();
    }

    static cleanupSavedDex(context:DexcaliburProject):any{
        const files:IDbIndex = context.getInspector("DynamicLoader").getDB().getIndex("dex",null);

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
}




export const DYNAMICLOADER_WEB_API: DelegateWebApi = new DelegateWebApi();


/**
 * /api/application/cmp?type=[dex|ks|libs|strings] ...
 */
DYNAMICLOADER_WEB_API.addPublicRoute(
    '/info',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {

            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                $.sendSuccess(res, {
                    deployed:true
                });

            }catch(err){
                Logger.error("[INSPECTOR][DynamicLoader] Operation cannot be done. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "[DynamicLoader] Operation cannot be done. Cause : " + err.message);
            }


        }
    }

);


/**
 * /api/application/cmp?type=[dex|ks|libs|strings] ...
 */
DYNAMICLOADER_WEB_API.addAuthenticatedRoute(
    '/show/:action',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC
                const action:string = req.params.action;
                let data:any ={};

                let meth:ModelMethod = null;
                if(req.query.meth){
                    const n = Util.decodeURI(Util.b64_decode(Util.decodeURI(req.query.meth as string)));
                    meth = project.find.get.method(n);
                }


                switch(action){
                    case 'reflected_meth':
                        data = Rules.getInvokedMethod(project);
                        break;
                    case 'refresh_dyndex':
                        data = Rules.getExternalDex(project);
                        break;
                    case 'refresh_discover':
                        data = Rules.getElementsDiscovered(project);
                        break;
                    case 'cleanup':
                        data = Rules.cleanupSavedDex(project);
                        break;
                    default:
                        throw new Error("Action not found. ");
                }

                $.sendSuccess(res, data);

            }catch(err){
                Logger.error("[INSPECTOR][DynamicLoader] Operation cannot be done. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "[DynamicLoader] Operation cannot be done. Cause : " + err.message);
            }


        }
    }

);

