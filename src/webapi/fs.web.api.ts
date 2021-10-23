import {DelegateWebApi} from "./DelegateWebApi";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer";
import {Request, Response} from "express";
import * as Log from "../Logger";
import ModelFile from "../ModelFile";
import DexcaliburProject from "../DexcaliburProject";
import {AuthenticationException} from "../errors/AuthenticationException";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException";
import {FinderResult} from "../FinderResult";
import * as _fs_ from "fs";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const FS_WEB_API: DelegateWebApi = new DelegateWebApi();



FS_WEB_API.addAuthenticatedRoute(
    '/view',
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
                if(req.query['uid']==null){
                    throw new Error("[FILE::VIEW] #FILE_1 Invalid File UID or Scope");
                }

                // TODO : validate $.project.dataAnalyzer.isValidScope(req.query['scope']);
                //const scope = $.project.dataAnalyzer.getScope(req.query['scope']);

                const search:FinderResult = project.find.file('_uid:'+req.query['uid']);

                if(search==null || search.count()==0){
                    throw new Error("[FILE::VIEW] #FMT_2 File not found");
                }

                // TODO : ajouter ModelFile.read() dont le comportement depend du scope ModelFile.scope
                const file = (search.get(0) as ModelFile);
                let d:any;
                if(_fs_.existsSync(file.getPath())){

                    if(file.isExecutable()){
                        d = file.toJsonObject({ cmd:'sections:f_list'});
                    }else{
                        d = file.toJsonObject();
                        d.ctn = _fs_.readFileSync( file.getPath(), {encoding: "utf-8"});
                    }

                    /*{
                        _t: 'c',
                        p: file.getPath(),
                        n: file.getName(),
                        _uid: file.getUID(),
                        t: file.getType(),
                        ctn: _fs_.readFileSync( target, {encoding: "utf-8"})
                    }];*/
                }


                // ========== RESPONSE
                $.sendSuccess( res, d);
            }catch(err){
                Logger.error("[API][FILE] File cannot be viewed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "File cannot be viewed. Cause : " + err.message);
            }
        }
    }
);


