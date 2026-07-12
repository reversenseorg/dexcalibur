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

import {TermsOfUse} from "./TermsOfUse.js";


export interface TermsManagerOptions {

    /**
     * Available languages.
     * For each a folder must exist inside `LicenseConfiguration.folder`
     *
     * @type {string[]}
     */
    lang: string[],

    /**
     * Default licence lang
     * @type {string}
     */
    defaultLang?: string,

    /**
     * Path of the folder containing licence files
     * @type {string}
     */
    folder?: string
}


/**
 *
 */
export class TermsManager {

    config:TermsManagerOptions;

    translations: Record<string, TermsOfUse> = {};

    constructor( pConfig:TermsManagerOptions) {
        this.config = pConfig;
        this.config.lang.map( x => {
            this.translations[x] = new TermsOfUse(this.config.folder, x);
        });
    }


    getTerms(pLang:string):TermsOfUse {
        if(this.translations.hasOwnProperty(pLang)){
            return this.translations[pLang];
        }else if( this.config.defaultLang != null){
            return this.translations[this.config.defaultLang];
        }else{
            return Object.values(this.translations)[0];
        }
    }
}