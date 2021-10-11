import {DelegateWebApi} from "./DelegateWebApi";
import {Device} from "../Device";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer";
import DeviceManager from "../DeviceManager";
import {Request, Response} from "express";
import * as Log from "../Logger";
import DataScope from "../DataScope";
import * as _path_ from "path";
import {IDbIndex} from "../persist/orm/DbAbstraction";
import ModelFile from "../ModelFile";
import DexcaliburProject from "../DexcaliburProject";
import * as path from "path";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const APP_WEB_API: DelegateWebApi = new DelegateWebApi();


/**
 * /api/application/cmp?type=[dex|ks|libs|strings] ...
 */
APP_WEB_API.addAuthenticatedRoute(
    '/cmp',
    {
        'get': function (req:Request, res:Response):any {


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
        'get': function(req:Request, res:Response):any {


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

                    unsafeNomalizedPath = _path_.normalize(req.query.path);
                    if(unsafeNomalizedPath !== req.query.path){
                        throw new Error('[SECURITY] Path traversal is not allowed. ');
                    }

                    if(unsafeNomalizedPath.length==0){
                        unsafeNomalizedPath = "."
                    }else if(unsafeNomalizedPath[0]!=_path_.sep){
                        unsafeNomalizedPath = _path_.sep+unsafeNomalizedPath;
                    }

                    target = unsafeNomalizedPath;

                }else{
                    target = ".";//_path_.sep;//SCOPE.getBasePath();
                }

                const files:IDbIndex = proj.dataAnalyzer.getIndex('PKG');

                files.map( (vOffset:number, vFile:ModelFile)=>{
                    // Logger.info(vFile.getRelativePath()+" =?= "+target+" > "+vFile.hasRelDir(target));
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

