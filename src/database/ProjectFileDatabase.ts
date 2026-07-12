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

import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";

import ModelFile from "../ModelFile.js";
import DataScope from "../DataScope.js";
import {MerlinSearchRequest} from "../search/MerlinSearchRequest.js";
import {ProjectDatabase} from "./ProjectDatabase.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * Represent the server DB where project data are stored or cloned
 *
 * @class
 */
export class ProjectFileDatabase  {

    private _pdb:ProjectDatabase;
    private _prj:DexcaliburProject;

    constructor(pPrj:DexcaliburProject, pDb:ProjectDatabase) {
        this._pdb = pDb;
        this._prj = pPrj;
    }


    /**
     * To create a baseline search request for search in file db
     *
     * @param {DataScope} pScope File scope
     * @returns {MerlinSearchRequest} request
     * @method
     */
    createRequestByScope(pScope:DataScope):MerlinSearchRequest {
        return MerlinSearchRequest.fromCondition(
            this._prj.merlin,
            ModelFile.TYPE,
            `scope:${pScope.getUID()}`,{
                not:false
            }
        )
    }

    /**
     * To search
     * @param pScope
     * @param pFilter
     */
    async searchFiles(pScope:DataScope, pFilter:any):Promise<ModelFile[]> {
        const coll = this._pdb.getCollectionOf(ModelFile.TYPE.getType());

        return await  this._pdb.search({
            scope: pScope,

        },ModelFile.TYPE.getType())
    }

    /**
     * To search
     * @param pScope
     * @param pFilter
     */
    async searchFilesByName(pScope:DataScope, pPattern:string|RegExp):Promise<ModelFile[]> {

        let request:MerlinSearchRequest =  this.createRequestByScope(pScope);
        if(typeof pPattern==='string'){
            request = request.search("name:"+pPattern)
        }else if(pPattern instanceof RegExp){
            request = request.search(`name:/${pPattern.source}/`,{ not:false, regexp: true })
        }else{
            throw new Error("ProjectFileDatabase : Filter type not supported ")
        }

        return (await request.executePDB(this._prj)).getData();
    }

    /**
     * To search
     * @param pScope
     * @param pFilter
     */
    async searchFilesByPath(pScope:DataScope, pPattern:string|RegExp):Promise<ModelFile[]> {

        let request:MerlinSearchRequest =  this.createRequestByScope(pScope);
        if(typeof pPattern==='string'){
            request = request.search("_r:"+pPattern)
        }else if(pPattern instanceof RegExp){
            request = request.search(`_r:/${pPattern.source}/`,{ not:false, regexp: true })
        }else{
            throw new Error("ProjectFileDatabase : Filter type not supported ")
        }

        return (await request.executePDB(this._prj)).getData();
    }

    /**
     * To search
     * @param pScope
     * @param pFilter
     */
    async searchSharedObjects(pScope:DataScope):Promise<ModelFile[]> {

        let request:MerlinSearchRequest =  this.createRequestByScope(pScope)
                            .search(`_r:/\.so$/`,{ not:false, regexp: true })

        return (await request.executePDB(this._prj)).getData();
    }

    /**
     * To search
     * @param pScope
     * @param pFilter
     */
    async searchExecutables(pScope:DataScope):Promise<ModelFile[]> {

        /*let request:MerlinSearchRequest =  this.createRequestByScope(pScope)
            .filter(`type:/^(ELF|Mach-O|PE)$/`,{ not:false, regexp: true })

        return (await request.executePDB(this._prj)).getData();*/

        return await this._pdb.getCollectionOf(ModelFile.TYPE.getType()).search({
            filter:{
                scope: pScope.getInternalName(),
                type: {
                    $regex: "^(ELF|Mach-O|PE)$"
                }
            }
        },{raw:true});
    }
}