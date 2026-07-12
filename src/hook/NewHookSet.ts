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

import DexcaliburProject from "../DexcaliburProject.js";
import HookPrologue from "../HookPrologue.js";
import HookStrategy from "./HookStrategy.js";
import Hook from "../Hook.js";


export default class NewHookSet {



    id:string = null;
    name:string = null;
    description:string = null;
    prologue:HookPrologue = null;
    strategies:HookStrategy[] = [];
    hooks:Hook[] = [];
    share:any = null;

    private ctx:DexcaliburProject = null;
    private enable:boolean = false;
    private prolog:any = null;
    private requires:string[] = [];
    private color:any = null;


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

    injectContext(context:DexcaliburProject):NewHookSet{
        this.ctx = context;

        // forward to the prologue
        if(this.prolog!=null)
            this.prolog.context = this.ctx;

        // register the hookset to the HookManager
        // this.ctx.hook.addHookSet(this);

        return this;
    }
}