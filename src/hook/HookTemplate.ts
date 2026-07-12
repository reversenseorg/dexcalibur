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

import HookStrategy from "./HookStrategy.js";


export default class HookTemplate {

    private _strategy: HookStrategy = null;

    private _tpl: string = null;

    private _cache: string = null;

    private _weight:number = -1;

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


    setStrategy(pStrategy:HookStrategy):void {
        this._strategy = pStrategy;
    }

    getStrategy():HookStrategy {
        return this._strategy;
    }

    setCodeTemplate(pTpl:string):void {
        this._tpl = pTpl;
    }

    getCodeTemplate():string {
        return this._tpl;
    }

    /**
     *
     * @param pContext
     */
    generateCode( pContext:any ):string {
        let c = this._tpl;
        for(let i in pContext){
            while(c.indexOf(i)>-1){
                c = c.replaceAll(i, pContext[i]);
            }
        }
        this._cache = c;
        return this._cache;
    }
}