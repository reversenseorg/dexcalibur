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

import HookPrologue from "../HookPrologue.js";
import DexcaliburProject from "../DexcaliburProject.js";
import * as Log from '../Logger.js';
import HookStrategy from "../hook/HookStrategy.js";
import {AbstractHook} from "../hook/AbstractHook.js";
import {NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType}
from "@dexcalibur/dxc-core-api";;

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * @class
 */
export default class HookGroup
{
    static TYPE:NodeType = new NodeType( "hook_group", NodeInternalType.HOOK_GROUP, []);

    __:NodeInternalType = NodeInternalType.HOOK_GROUP;

    id:string = null;
    name:string = null;
    description:string = null;

    prologue:HookPrologue = null;



    /**
     * Flag. Builtin hookgroup are defined by inspectors.
     *
     * @type {boolean}
     * @field
     * @since 1.0.0
     */

    tags:any = {
        builtin: false
    };

    hooks:AbstractHook[] = [];

    context:DexcaliburProject = null;
    enable:boolean = false;
    requires:string[] = [];
    color:any = null;
    share:any = null;

    strats:HookStrategy[] = [];

    /**
     * Group of hook
     *
     * @param {*} config
     */
    constructor(pConfig:any=null){

        // this.requiresNode = [];
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    isEnable():boolean{
        return this.enable;
    }

    getID():string{
        return this.id;
    }

    injectContext(context:DexcaliburProject):HookGroup{
        this.context = context;

        // forward to the prologue
        if(this.prologue!=null)
            this.prologue.context = this.context;

        // register the hookset to the HookManager
        //this.context.hook.registerHookSet(this);

        return this;
    }

    addPrologue(code:string):HookGroup{
        //this.prologue = code;
        this.prologue = new HookPrologue({
            parentID: this.id,
            script: code
        });

        return this;
    }

    require(module:string){
        this.requires.push(module);
    }
    /*
    requireNodeModule(module){
        this.requiresNode.push(module);
    }*/
    /**
     * Create a object shared with others hook callback
     * @param {Object} config Shared object config
     */
    addHookShare(config:any):HookGroup{
        this.share = config;
        return this;
    }


    /**
     * Get the shared object from this hookset
     * @returns {Object} Shared object
     * @function
     */
    getHookShare():any{
        return this.share;
    }

}
