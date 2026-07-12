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

import {SemverException} from "./SemverException.js";

export interface SemVerData {
    major:number;
    minor:number;
    patch:number;
    prerelease?:string;
    meta?:string;
    raw?:string;
}

export interface SemVerComparison {
    newest:SemVerData;
    oldest:SemVerData;
}

export class SemVerHelper {

    static RE = /^(?<major>[0-9]+)(?<minor>\.[0-9]+)(?<patch>\.[0-9]+)(?<rel>-[a-zA-Z0-9-_.]+)?(?<meta>\+[a-zA-Z0-9-_.]+)?$/i;
    static RE_FLEX = /^(?<major>[0-9]+)(?<minor>\.[0-9]+)?(?<patch>\.[0-9]+)?(?<rel>-[a-zA-Z0-9-_.]+)?(?<meta>\+[a-zA-Z0-9-_.]+)?$/i;

    static stringify(pSemVer:SemVerData):string {
        return `${pSemVer.major}.${pSemVer.minor==null?'0':pSemVer.minor}.${pSemVer.patch==null?'0':pSemVer.patch}${pSemVer.prerelease!=null?'-'+pSemVer.prerelease:''}${pSemVer.meta!=null?'+'+pSemVer.meta:''}`;
    }

    /**
     * To normalize an incomplete version :
     *
     * `1.2` will become `1.2.0`
     * `1.2-alpha`will become `1.2.0-alpha`
     *
     * @param pVersion
     */
    static normalize(pVersion:string):string {
        const matches = SemVerHelper.RE_FLEX.exec(pVersion);
        let ver:SemVerData;

        if(matches==null){
            throw SemverException.INVALID_FORMAT(pVersion);
        }

        try{
            ver = {
                major: parseInt(matches.groups.major,10),
                minor: (matches.groups.minor!=null ? parseInt(matches.groups.minor.substring(1),10):0),
                patch: (matches.groups.patch!=null ? parseInt(matches.groups.patch.substring(1),10):0),
                prerelease: (matches.groups.rel!=null? matches.groups.rel.substring(1) : null),
                meta: (matches.groups.meta!=null? matches.groups.meta.substring(1) : null),
                raw: pVersion
            };
        }catch(err){}

        return SemVerHelper.stringify(ver);
    }

    /**
     * To parse a semantic version from string and return a structured object
     *
     * @param {string} pVersion
     * @return {SemVerData} Parsed data
     * @method
     * @static
     */
    static parse( pVersion:string):SemVerData {
        const matches = SemVerHelper.RE.exec(pVersion);
        let ver:SemVerData;

        if(matches==null){
            throw SemverException.INVALID_FORMAT(pVersion);
        }

        try{
            ver = {
                major: parseInt(matches.groups.major,10),
                minor: parseInt(matches.groups.minor.substring(1),10),
                patch: parseInt(matches.groups.patch.substring(1),10),
                prerelease: (matches.groups.rel!=null? matches.groups.rel.substring(1) : null),
                meta: (matches.groups.meta!=null? matches.groups.meta.substring(1) : null),
                raw: pVersion
            };
        }catch(err){
            throw SemverException.INVALID_FORMAT(pVersion);
        }

        return ver;
    }


    /**
     *
     * @param {string} pVersionA
     * @param {string} pVersionB
     * @return {SemVerComparison} Comparison result
     */
    static compare( pVersionA:string, pVersionB:string):SemVerComparison {
        const verA = SemVerHelper.parse(pVersionA);
        const verB = SemVerHelper.parse(pVersionB);
        const res:any = {}

        if(verA.major==verB.major){
            if(verA.minor==verB.minor){
                if(verA.patch==verB.patch){
                    res.newest = verA;
                    res.oldest = verB;
                }else{
                    if(verA.patch>verB.patch){
                        res.newest = verA;
                        res.oldest = verB;
                    }else{
                        res.newest = verB;
                        res.oldest = verA;
                    }
                }
            }else{
                if(verA.minor>verB.minor){
                    res.newest = verA;
                    res.oldest = verB;
                }else{
                    res.newest = verB;
                    res.oldest = verA;
                }
            }
        }else{
            if(verA.major>verB.major){
                res.newest = verA;
                res.oldest = verB;
            }else{
                res.newest = verB;
                res.oldest = verA;
            }

        }

        return res;
    }
}