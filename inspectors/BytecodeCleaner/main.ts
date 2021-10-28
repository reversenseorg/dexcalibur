

// ===== INIT =====

import InspectorFactory from "../../src/InspectorFactory";
import {INSPECTOR_TYPE} from "../../src/Inspector";
import {DelegateWebApi} from "../../src/webapi/DelegateWebApi";
import WebServer from "../../src/WebServer";
import DexcaliburProject from "../../src/DexcaliburProject";
import {AuthenticationException} from "../../src/errors/AuthenticationException";
import {DexcaliburProjectException} from "../../src/errors/DexcaliburProjectException";
import ModelMethod from "../../src/ModelMethod";
import Util from "../../src/Utils";

import {Request, Response} from "express";
import {Rules} from "./src/Rules";
import * as Log from "../../src/Logger";

const PLUGIN_WEB_API: DelegateWebApi = new DelegateWebApi();

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 * /api/application/cmp?type=[dex|ks|libs|strings] ...
 */
PLUGIN_WEB_API.addAuthenticatedRoute(
    '/:action',
    {
        'get': function (req:Request, res:Response):any {

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
                let act:any ={
                    status: 200,
                    data: { success:false, error: "Action not found. "}
                };

                let meth:ModelMethod = null;
                if(req.query.meth){
                    const n = Util.decodeURI(Util.b64_decode(Util.decodeURI(req.query.meth)));
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
    description: "It offers several cleanup solution : remove NOP, replace goto, detect wrapper, detect duplicate function ...",

    startStep: INSPECTOR_TYPE.BOOT,

    useGUI: true,

    hookSet: {
        id: "BytecodeCleaner",
        name: "Bytecode cleaner",
        description: "It offers several cleanup solution : remove NOP, replace goto, detect wrapper, detect duplicate function ..."
    },

    webapi: PLUGIN_WEB_API
});



