import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import DataScope from "../DataScope.js";
import * as _path_ from "path";
import ModelFile from "../ModelFile.js";
import DexcaliburProject from "../DexcaliburProject.js";
import * as path from "path";
import {IDbCollection} from "@dexcalibur/dexcalibur-orm";
import Util from "../Utils.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const APP_WEB_API: DelegateWebApi = new DelegateWebApi();


/**
 * /api/application/cmp?type=[dex|ks|libs|strings] ...
 */
APP_WEB_API.addAuthenticatedRoute(
    '/cmp',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {


            try{
                if(req.dxc.project == null){
                    throw new Error("Project UID is missing or you have not right privileges.")
                }

                req.dxc.$.sendSuccess( res, req.dxc.project.find.provider('name:.*').toJsonObject());
                /*
                res.status(HTTP_CODE_SUCCESS).send(JSON.stringify({
                    success: true,
                    data: $.project.find.provider('name:.*').toJsonObject()
                }));*/
            }catch(err){

                req.dxc.$.sendError( res, err.message);
                /*res.status(HTTP_CODE_ERROR).send(JSON.stringify({
                    success: false,
                    msg: err.message
                }));*/
            }


        }
    }

);

APP_WEB_API.addAuthenticatedRoute(
    '/package/content',
    {
        'get': async function(req:DelegateRequest, res:DelegateResponse):Promise<any> {


            const $:WebServer = req.dxc.$;
            let proj:DexcaliburProject = null;

            const data:any[] = [];
            let target = "";
            let unsafeNomalizedPath:string = null;


            try{
                if(req.dxc.project == null){
                    throw new Error("Project cannot be opened");
                }

                proj = req.dxc.project;
                const SCOPE:DataScope = proj.dataAnalyzer.getScope('PKG');

                if(req.query.path!=null && req.query.path!="null"){

                    unsafeNomalizedPath = Util.trim(_path_.normalize(req.query.path as string));
                    if((unsafeNomalizedPath!='.') && (unsafeNomalizedPath !== req.query.path)){
                        throw new Error('[SECURITY] Path traversal is not allowed. ');
                    }

                    if(/^\.+$/.test(unsafeNomalizedPath)){
                        unsafeNomalizedPath = _path_.sep;
                    }
                    else if (unsafeNomalizedPath[0]!=_path_.sep){
                        unsafeNomalizedPath = _path_.sep+unsafeNomalizedPath;
                    }

                    target = unsafeNomalizedPath;

                }else{
                    target = ".";//_path_.sep;//SCOPE.getBasePath();
                }

                const files:IDbCollection = await proj.dataAnalyzer.getIndex('PKG');

                files.map( (vOffset:number, vFile:ModelFile)=>{
                    //Logger.info(vFile.getRelativePath()+" =?= "+target+" > "+vFile.hasRelDir(target));
                    if(vFile.hasRelDir(target)){
                        data.push({ _uid: vFile.getUID(), n:vFile.getName(), _r:vFile.getRelativePath(),  _t: vFile._d, t:vFile.getType() });
                    }
                });

                $.sendSuccess( res, data);
            }catch(err){
                Logger.error("[API][APP] Package content cannot be read : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "Package content cannot be read ");
            }
        }
    }
);

