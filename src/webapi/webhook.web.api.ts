/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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
