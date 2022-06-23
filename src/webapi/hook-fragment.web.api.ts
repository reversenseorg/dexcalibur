import * as Log from "../Logger";
import {DelegateWebApi} from "./DelegateWebApi";
import WebServer from "../WebServer";
import DexcaliburProject from "../DexcaliburProject";
import HookSession from "../HookSession";
import {Request, Response} from "express";
import {AbstractHook} from "../hook/AbstractHook";
import {HookManagerException} from "../errors/HookManagerException";
import HookTemplateFragment from "../hook/HookTemplateFragment";
import Util from "../Utils";
import {NodeInternalType} from "../NodeInternalType";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const HOOK_FRAGS_WEB_API: DelegateWebApi = new DelegateWebApi();


HOOK_FRAGS_WEB_API.addAuthenticatedRoute(
    '/hook_frag/:hookid',
    {
        'get': function (req:Request, res:Response) {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // get hook instance by ID
                const hook:AbstractHook = project.hook.getHookByID(
                    req.params.hookid
                );

                if (hook == null) {
                    throw new Error("Invalid hook ID given : "+req.params.hookid);
                }

                const f:HookTemplateFragment = hook.getFragment(req.query.frag_uid);

                if(f == null){
                    throw HookManagerException.HOOK_FRAGMENT_NOT_FOUND();
                }

                $.sendSuccess( res, f.toJsonObject());

            }catch(err){
                Logger.error("[API][HOOK] Hook cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hook cannot be retrieved. Cause : " + err.message);
            }
        },
        'post': function (req:Request, res:Response) {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                const hook: AbstractHook = project.hook.getHookByID(
                    req.params.hookid
                )

                if(hook == null){
                    throw HookManagerException.HOOK_NOT_FOUND(req.params.hookid);
                }

                if(req.body.pos == null){
                    throw HookManagerException.UNKNOW_HOOK_FRAGMENT_POS();
                }

                let frag:HookTemplateFragment = new HookTemplateFragment();
                frag.weight = req.body.weight;
                frag.name =  req.body.name;
                frag.description =  req.body.descr;

                if(req.body.code != null && req.body.code.length>0){
                    frag.setCodeTemplate( req.body.code);
                }

                hook.addExtraFragment( req.body.pos, frag);

                $.sendSuccess(res, frag.toJsonObject());

            }catch(err){
                Logger.error("[API][HOOK FRAGMENT] Hook fragment cannot be created . Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hook fragment cannot be created . Cause : " + err.message);
            }
        },
        'put': function (req:Request, res:Response) {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                if(req.params.hookid == null || req.body.frag_uid == null){
                    throw HookManagerException.HOOK_FRAGMENT_NOT_FOUND();
                }

                const hook: AbstractHook = project.hook.getHookByID(
                    req.params.hookid
                );

                const frag:HookTemplateFragment = hook.getFragment(req.body.frag_uid);

                if(frag == null){
                    throw HookManagerException.HOOK_FRAGMENT_NOT_FOUND();
                }

                if(req.body.weight) frag.weight = req.body.weight;
                if(req.body.descr) frag.description = req.body.descr;
                if(req.body.code){
                    frag.setCodeTemplate( req.body.code);
                    project.getHookManager().save(frag);
                    hook.build(project);
                }else{
                    project.getHookManager().save(frag);
                }

                project.getHookManager().save(hook);

                $.sendSuccess(res, frag.toJsonObject());

            }catch(err){
                Logger.error("[API][HOOK] Hook fragment cannot be edited . Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hook fragment cannot be edited . Cause : " + err.message);
            }
        },
        'delete': async function (req:Request, res:Response):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                if(req.params.hookid == null || req.query.frag_uid == null){
                    throw HookManagerException.HOOK_FRAGMENT_NOT_FOUND();
                }

                const hook: AbstractHook = project.hook.getHookByID(
                    req.params.hookid
                );


                if(hook == null){
                    throw HookManagerException.HOOK_NOT_FOUND(req.params.hookid) ;
                }

                // find, remove, update
                const frag:HookTemplateFragment = hook.removeFragment(req.query.frag_uid);

                $.sendSuccess(res, { hook: hook.toJsonObject(), frag:frag });

            }catch(err){
                Logger.error("[API][HOOK] Hook fragment cannot be removed . Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hook fragment cannot be removed . Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);
