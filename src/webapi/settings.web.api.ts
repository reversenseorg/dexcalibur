import {DelegateWebApi} from "./DelegateWebApi";
import WebServer from "../WebServer";
import {Router, Request, Response} from "express";
import * as Log from "../Logger";
import {GlobalSettingsException} from "../errors/GlobalSettingsException";
import {SecurityZone} from "../security/SecurityZone";
import {Settings} from "../Settings";
import ExternalSettings = Settings.ExternalSettings;

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const SETTINGS_WEB_API: DelegateWebApi = new DelegateWebApi();

SETTINGS_WEB_API.addPublicRoute(
    '/global',
    {
        'get': (req:Request, res:Response)=>{

            const $:WebServer = req.dxc.$;
            let data:any;

            try{
                switch (req.query['type']){
                    case 'ext':
                        data = $.context.getSettings().getExternalSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'srv':
                        data = $.context.getSettings().getServerSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'web':
                        data = $.context.getSettings().getWebserverSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'conn':
                        data = $.context.getSettings().getConnectionSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    default:
                        throw GlobalSettingsException.CATEGORY_UNKNOW();
                }


                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][SETTINGS] Category cannot be retrieved : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        },
        'post': (req:Request, res:Response)=>{

            const $:WebServer = req.dxc.$;
            let settings:any;


            try{

                if(req.body['name'] == null){
                    throw GlobalSettingsException.SETTING_UNKNOW();
                }

                switch (req.query['type']){
                    case 'ext':
                        settings = $.context.getSettings().getExternalSettings();
                        break;
                    case 'srv':
                        settings = $.context.getSettings().getServerSettings();
                        break;
                    case 'web':
                        settings = $.context.getSettings().getWebserverSettings();
                        break;
                    case 'conn':
                        settings = $.context.getSettings().getConnectionSettings();
                        break;
                    default:
                        throw GlobalSettingsException.CATEGORY_UNKNOW();
                }


                $.sendSuccess(res, settings.add(
                    req.body['name'],
                    req.body['value']
                ));
            }catch(err){
                Logger.error("[API][SETTINGS] Category cannot be retrieved : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        },
        'put': (req:Request, res:Response)=>{

            const $:WebServer = req.dxc.$;
            let data:any, settings:any;

            try{
                if(req.body['name'] == null){
                    throw GlobalSettingsException.SETTING_UNKNOW();
                }

                switch (req.body['type']){
                    case 'ext':
                        settings = $.context.getSettings().getExternalSettings();
                        break;
                    case 'srv':
                        settings = $.context.getSettings().getServerSettings();
                        break;
                    case 'web':
                        settings = $.context.getSettings().getWebserverSettings();
                        break;
                    case 'conn':
                        settings = $.context.getSettings().getConnectionSettings();
                        break;
                    default:
                        throw GlobalSettingsException.CATEGORY_UNKNOW();
                }


                settings.update(
                    settings.sanitize( req.body['name'], req.body['value'])
                );
                settings.save();

                $.sendSuccess(res, settings.save());
            }catch(err){
                Logger.error("[API][SETTINGS] Category cannot be retrieved : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    }
)

SETTINGS_WEB_API.addPublicRoute(
    '/import',
    {
        'post': (req:Request, res:Response)=>{

            const $:WebServer = req.dxc.$;
            let data:any;

            try{
                switch (req.query['type']){
                    case 'ext':
                        data = $.context.getSettings().getExternalSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'srv':
                        data = $.context.getSettings().getServerSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'web':
                        data = $.context.getSettings().getWebserverSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'conn':
                        data = $.context.getSettings().getConnectionSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    default:
                        throw GlobalSettingsException.CATEGORY_UNKNOW();
                }



                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][SETTINGS] Category cannot be retrieved : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    }
)
