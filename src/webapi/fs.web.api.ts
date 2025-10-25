import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";
import ModelFile from "../ModelFile.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import * as _fs_ from "fs";
import {MerlinSearchRequest, OperationType} from "../search/MerlinSearchRequest.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {SafetyCheck} from "../security/SafetyCheck.js";
import {SecurityCheck} from "../security/SecurityCheck.js";
import {ProjectManagerException} from "../errors/ProjectManagerException.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const FS_WEB_API: DelegateWebApi = new DelegateWebApi();



FS_WEB_API.addAsyncAuthenticatedRoute(
    '/view',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{

                if(req.project==null){
                    throw ProjectManagerException.PROJECT_IS_MANDATORY();
                }

                if(!req.project.isReady()) {
                    throw DexcaliburProjectException.PROJECT_NOT_READY(req.project.getUID());
                }

                // ========== LOGIC
                /*if(req.query['uid']==null){
                    throw new Error("[FILE::VIEW] #FILE_1 Invalid File UID or Scope");
                }*/

                // TODO : validate $.project.dataAnalyzer.isValidScope(req.query['scope']);

                let file:ModelFile;
                /*if(req.query['scope']!=null
                    && Object.keys(req.project.dataAnalyzer.scopes).indexOf(req.query.scope as string)>-1){

                    const scope = req.project.dataAnalyzer.getScope(req.query['scope'] as string);

                    //const res = (await project.dataAnalyzer.getIndex(scope));
                    file = await req.project.dataAnalyzer.getFile(req.query['path'] as string, scope); // res.getEntry(req.query['path']  as string);

                    //project.dataAnalyzer.free(res);
                }else{*/

                    const mreq = new MerlinSearchRequest(
                        (req.project as DexcaliburProject).getMerlinEngine(),
                        ModelFile.TYPE, [{
                            type:OperationType.SEARCH,
                            args:{
                                pattern: MerlinSearchRequest.parseObjectCondition({
                                    _uid: req.query['uid']
                                },{ not:false })
                            }
                        }]
                    );

                    const files = (await mreq.execute(req.project)).getData();

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
                //}





                // TODO replace by file content stored with object (depends of scope)
                // replace path by local path (for remote file)
                let d:any;
                if(_fs_.existsSync(file.getPath())){

                    //Logger.raw(file.__p.f_list)
                    /* if(file.isExecutable()){
                        d = file.toJsonObject({extra:{ cmd:'sections:f_list'}});
                    }else{*/
                        d = file.toJsonObject();
                        d.ctn = _fs_.readFileSync( file.getPath(), {encoding: "utf-8"});
                    //}

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



FS_WEB_API.addAsyncAuthenticatedRoute(
    '/search',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{


                if(req.project==null){
                    throw ProjectManagerException.PROJECT_IS_MANDATORY();
                }

                if(!req.project.isReady()) {
                    throw DexcaliburProjectException.PROJECT_NOT_READY(req.project.getUID());
                }


                // TODO : validate $.project.dataAnalyzer.isValidScope(req.query['scope']);

                let files:ModelFile[];

                // check scope
                const scope = req.project.dataAnalyzer.getScope(req.query['scope'] as string);

                SafetyCheck.assertNotNull(scope);
                SecurityCheck.allowedInPublicZone(scope);

                // check file type
                const unsafeType = req.query['type'];

                SafetyCheck.assertNotNull(unsafeType);
                SafetyCheck.assertIsString(unsafeType);

                // perform search
                files = await req.project.getDataAnalyzer().getFilesFromScope(scope, { type:unsafeType})


                /*
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

                files = (await mreq.execute(project)).getData();*/


                console.log(files);

                //files = await (await project.dataAnalyzer.getIndex(scope)).search( filter);




                let d:any[] = [];

                // replace path by local path (for remote file)
                files.map(f => {

                    if(f.isExecutable()){
                        d.push(f.toJsonObject({extra:{ cmd:'sections:f_list'}}, SecurityZone.PUBLIC));
                    }else{
                        const ff =  f.toJsonObject({extra:{}}, SecurityZone.PUBLIC);
                        //ff.ctn = _fs_.readFileSync( f.getPath(), {encoding: "utf-8"});

                        d.push(ff);
                    }


                    /*
                    d.push(f.toJsonObject(+))
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
                        }];
                    }*/
                });

                console.log(d);



                // ========== RESPONSE
                $.sendSuccess( res, d);
            }catch(err){
                Logger.error("[API][FILE] File cannot be found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "File cannot be found. Cause : " + err.message);
            }
        }
    }
);

