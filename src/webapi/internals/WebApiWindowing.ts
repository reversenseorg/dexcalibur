

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

export class WebApiWindowing {

    static defaultStart = 0;
    static defaultLength = 100;

    start:number = WebApiWindowing.defaultStart;
    length:number = WebApiWindowing.defaultLength;

    constructor(pStart = 0,pSize = 100) {
        this.start = pStart;
        this.length = pSize;
    }

    static parse( pConfig:any):WebApiWindowing {
        const cfg = new WebApiWindowing();
        if(pConfig.start!=null) cfg.start = pConfig.start;
        if(pConfig.length!=null) cfg.length = pConfig.length;
        return cfg;
    }

    getLength():number{
        return this.length
    }

    getStartOffset():number {
        return this.start;
    }

    and( pOptions):WebApiWindowing {
        return new WebApiWindowing(
            (pOptions.start ? this.start+pOptions.start : this.start),
            (pOptions.length ? this.length+pOptions.length : this.length)
        )
    }

    toJsonObject() {
        return {
            start:this.start,
            length:this.length};
    }
}