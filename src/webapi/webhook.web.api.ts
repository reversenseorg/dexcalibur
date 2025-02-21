import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const WEBHOOK_WEB_API: DelegateWebApi = new DelegateWebApi("WEBHOOK");


WEBHOOK_WEB_API.addAsyncPublicRoute(
    '/account',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.query.token!=null){
                    res.location(await $.context.getUserService().activateAccount(req.query.token as string))
                        .status(302)
                        .send();
                    return;
                }else{
                    res.location("https://www.reversense.com").status(302).send();
                }
            }catch(err){
                Logger.error(err.stack);
                res.location("https://www.reversense.com").status(302).send();
            }
        }
    },{
        lazyProject: true
    }
);
