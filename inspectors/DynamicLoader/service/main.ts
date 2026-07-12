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

import InspectorFrontController, {IFC_TYPE} from "../../../src/InspectorFrontController.js";
import DexcaliburProject from "../../../src/DexcaliburProject.js";
import * as _fs_ from 'fs';
import {IDbIndex} from "../../../src/persist/orm/DbAbstraction.js";
import {FinderResult} from "../../../src/search/FinderResult.js";
import BusEvent from "../../../src/BusEvent.js";

var Controller:InspectorFrontController =  new InspectorFrontController();



/*

*/
function getInvokedMethod(context:DexcaliburProject):any{
    let meth:FinderResult = context.find.method("@code.call.dynamic");
    return meth.toJsonObject({});
}

function getExternalDex(context:DexcaliburProject):any{
    let files:IDbIndex = context.getInspector("DynamicLoader").getDB().getIndex("dex",null);

    return files.toJsonObject();
}

function getElementsDiscovered(context:DexcaliburProject):any{
    let cls:FinderResult = context.find.class("@code.call.dynamic");
    return cls.toJsonObject({});
}

function cleanupSavedDex(context:DexcaliburProject):any{
    let files:IDbIndex = context.getInspector("DynamicLoader").getDB().getIndex("dex",null);

    files.map(function(k,v){
        try{
            _fs_.unlinkSync(v.getPath());
            context.trigger({
                type: "file.del",
                data: v.getUID()
            });
            v = null;
        }catch(err){}
    });

    context.getInspector("DynamicLoader").getDB().newIndex("dex",null);


    return true;
}

/**
 * Delegate front controller
 */
Controller.registerHandler(IFC_TYPE.GET, function(ctx:DexcaliburProject,req:any,res:any):any{

    let action:string = req.query.action;
    let act:any ={
        status: 404,
        data: { error: "Action not found. "}
    };

    switch(action){
        case 'refresh_reflect':
            act.status = 200;
            act.data.error = null;
            act.data.data = getInvokedMethod(ctx);
            break;
        case 'refresh_dex':
            act.status = 200;
            act.data.error = null;
            act.data.data = getExternalDex(ctx);
            break;
        case 'refresh_discover':
            act.status = 200;
            act.data.error = null;
            act.data.data = getElementsDiscovered(ctx);
            break;
        case 'cleanup':
            act.status = 200;
            act.data.error = null;
            act.data.data = cleanupSavedDex(ctx);
            break;
    }

    res.status(act.status).send(act.data);
});

export default Controller;