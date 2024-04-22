

// ===== INIT =====

import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import {DelegateRequest, DelegateResponse, DelegateWebApi} from "../../src/webapi/DelegateWebApi.js";
import WebServer from "../../src/WebServer.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import {AuthenticationException} from "../../src/errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../../src/errors/DexcaliburProjectException.js";
import ModelMethod from "../../src/ModelMethod.js";
import Util from "../../src/Utils.js";

import {Request, Response} from "express";
import {Rules} from "./src/Rules.js";
import * as Log from "../../src/Logger.js";

const PLUGIN_WEB_API: DelegateWebApi = new DelegateWebApi();

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 * /api/application/cmp?type=[dex|ks|libs|strings] ...
 */
PLUGIN_WEB_API.addAuthenticatedRoute(
    '/:action',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

               /* if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }*/

                // ========== LOGIC
                const action:string = req.params.action;
                let act:any ={
                    status: 200,
                    data: { success:false, error: "Action not found. "}
                };

                let meth:ModelMethod = null;
                if(req.query.meth){
                    const n = Util.decodeURI(Util.b64_decode(Util.decodeURI(req.query.meth as string)));
                    meth = project.find.get.method(n);
                }

                switch(action){
                    case 'nop_count':
                        act = Rules.nopCount(project, meth);
                        break;
                    case 'nop_clean':
                        act = Rules.nopClean(project, meth);
                        break;
                    case 'wrap_clean':
                        act = Rules.wrapClean(project, meth);
                        break;
                }

                $.sendSuccess(res, act.data);

            }catch(err){
                Logger.error("[INSPECTOR][BytecodeCleaner] Operation cannot be done. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "[BytecodeCleaner] Operation cannot be done. Cause : " + err.message);
            }


        }
    }

);

export default new InspectorFactory({
    id: "BytecodeCleaner",
    name: "Bytecode cleaner",

    version: "1.0.0",
    description: "It offers several cleanup solution : remove NOP, replace goto, detect wrapper, detect duplicate function ...",

    startStep: INSPECTOR_TYPE.BOOT,

    useGUI: true,

    hookSet: {
        id: "BytecodeCleaner",
        name: "Bytecode cleaner",
        description: "It offers several cleanup solution : remove NOP, replace goto, detect wrapper, detect duplicate function ...",
        strategies:[]
    },

    //webapi: PLUGIN_WEB_API
});



