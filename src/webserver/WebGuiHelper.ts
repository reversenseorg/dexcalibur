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

import {WebGuiConfiguration} from "./WebGuiConfiguration.js";

/**
 * The aim of this helper is to parse GUI configuration strings and prepare web server configuration object
 *
 * @class
 */
export class WebGuiHelper {

    constructor() {

    }


    /**
     * To parse serialized configuration of exposed GUI and return an array of
     * WebGuiConfiguration objects. Each object contain configuration of one GUI
     *
     * Input string has following format :
     *
     * <GUI_NAME>[ : <PPT_NAME>[ = <PPT_VAL>] ]* [ , <GUI_NAME>[ : <PPT_NAME>[ = <PPT_VAL>] ] ]
     *
     * @param {string} pStrCfg Serialized config to parse
     * @return {WebGuiConfiguration[]} A list of configuration object
     * @method
     * @static
     */
    static parse( pStrCfg:string):WebGuiConfiguration[] {
        const configs:WebGuiConfiguration[] = [];

        if(pStrCfg==null) return [];

        const guis = pStrCfg.split(",");
        guis.map(x => {
            const params = x.split(':');
            const cfg = new WebGuiConfiguration(x);
            cfg.name = params.shift();
            if(params.length>0){
                params.map( p => {
                    const v = p.split('=');
                    cfg.addProperty(v[0], v[1]!=null ? v[1] : null);
                })
            }
            configs.push(cfg);
        })

        return configs;
    }
}