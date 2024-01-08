import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import ModelFile from "../ModelFile.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {FinderResult} from "../search/FinderResult.js";
import * as _fs_ from "fs";
import {MerlinSearchRequest} from "../search/MerlinSearchRequest.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const FS_WEB_API: DelegateWebApi = new DelegateWebApi();



FS_WEB_API.addAuthenticatedRoute(
    '/view',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{


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

                let file:ModelFile;
                if(req.query['scope']!=null
                    && Object.keys(project.dataAnalyzer.scopes).indexOf(req.query.scope as string)>-1){

                    const scope = project.dataAnalyzer.getScope(req.query['scope'] as string);

                    //const res = (await project.dataAnalyzer.getIndex(scope));
                    file = await project.dataAnalyzer.getFile(req.query['path'] as string, scope); // res.getEntry(req.query['path']  as string);

                    //project.dataAnalyzer.free(res);
                }else{

                    const mreq = new MerlinSearchRequest(
                        null,
                        ModelFile.TYPE,
                        []
                    );
                    mreq.search('_uid:'+req.query['uid']);

                    const files = (await mreq.execute(project)).getData();
                    if(files.length>0){
                        file = files[0];
                    }else{
                        throw new Error("[FILE::VIEW] #FMT_2 File not found");
                    }

                    /*
                    console.log(files);

                    const search:FinderResult = await project.find.file('_uid:'+req.query['uid']);

                    if(search==null || search.count()==0){
                        throw new Error("[FILE::VIEW] #FMT_2 File not found");
                    }

                    // TODO : ajouter ModelFile.read() dont le comportement depend du scope ModelFile.scope
                    file = (search.get(0) as ModelFile);*/
                }




                let d:any;

                // TODO replace by file content stored with object (depends of scope)
                // replace path by local path (for remote file)
                if(_fs_.existsSync(file.getPath())){

                    Logger.raw(file.__p.f_list)
                    if(file.isExecutable()){
                        d = file.toJsonObject({extra:{ cmd:'sections:f_list'}});
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



FS_WEB_API.addAuthenticatedRoute(
    '/search',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }


                // TODO : validate $.project.dataAnalyzer.isValidScope(req.query['scope']);

                let files:ModelFile[];
                if(req.query['scope']!=null
                    && Object.keys(project.dataAnalyzer.scopes).indexOf(req.query.scope as string)>-1){

                    const scope = project.dataAnalyzer.getScope(req.query['scope'] as string);

                    const filter:any = {
                        scope: req.query['scope']
                    };

                    const mreq = new MerlinSearchRequest(
                        null,
                        ModelFile.TYPE,
                        []
                    );
                    mreq.search('type:'+req.query['type']);
                    mreq.filter( 'scope:'+req.query['scope']);

                    if(req.query['type']!=null){
                        filter.type = req.query['type'];
                    }

                    files = (await mreq.execute(project)).getData();
                    console.log(files);

                    //files = await (await project.dataAnalyzer.getIndex(scope)).search( filter);
                }



                let d:any[] = [];
                // replace path by local path (for remote file)
                files.map(f => {
                    if(_fs_.existsSync(f.getPath())){

                        Logger.raw(f.__p.f_list)
                        if(f.isExecutable()){
                            d.push(f.toJsonObject({extra:{ cmd:'sections:f_list'}}));
                        }else{
                            const ff =  f.toJsonObject();
                            ff.ctn = _fs_.readFileSync( f.getPath(), {encoding: "utf-8"});

                            d.push(ff);
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
                })



                // ========== RESPONSE
                $.sendSuccess( res, d);
            }catch(err){
                Logger.error("[API][FILE] File cannot be found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "File cannot be found. Cause : " + err.message);
            }
        }
    }
);

