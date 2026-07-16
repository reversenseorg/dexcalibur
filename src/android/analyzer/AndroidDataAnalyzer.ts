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

import DataScope from "../../DataScope.js";
import {from, mergeMap, Observable, ReplaySubject, Subject} from "rxjs";
import ModelFile from "../../ModelFile.js";
import * as _fs_ from "fs";
import * as _path_ from "path";
import {DataAnalyzer} from "../../DataAnalyzer.js";
import {IDbCollection} from "@reversense/dexcalibur-orm";
import DexcaliburProject from "../../DexcaliburProject.js";
import {IDelegatedDataAnalyzer} from "../../analyzer/IDelegatedDataAnalyzer.js";
import * as Log from "../../Logger.js";
import {OperatingSystem} from "@reversense/dxc-core-api";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface FileInfo {
    path: string,
    rpath:string
}

export class AndroidDataAnalyzer implements IDelegatedDataAnalyzer {

    ctx:DexcaliburProject;

    constructor(pProject:DexcaliburProject) {
        this.ctx = pProject;
    }

    /**
     * To scan the 'path' as APK content
     *
     * @param path
     * @param pType
     */
    async scan(path:string, pScope:DataScope, pRelPath:string = null):Promise<Observable<ModelFile[]>>{

        let db:IDbCollection = this.ctx.getProjectDB().getCollectionOf(ModelFile.TYPE.getType());

        if(path[path.length-1]=='/')
            path = path.substr(0,path.length-1);


        // upsert
        let f = new ModelFile({
            name: _path_.basename(path),
            path: path,
            scope: pScope,
            _r: pRelPath==null ? '/' : pRelPath,
            _d: 'd'
        });

        try{
            // _uid:f.getUID(),
            let file = await db.asyncUpdateEntry(f,{replace:true, upsert:true, filter:{ _r:f._r, __i:pScope.__i  }});
        }catch(err){
            Logger.error(err.message,err.stack);
            console.log(f);
        }


        if(_fs_.readdirSync(path).length==0){
            return from([]);
        }

        // scan file formats
        return this.ctx.getDataAnalyzer()._detectFileFormatFolder(path, "**/*.smali")
            .pipe(
                mergeMap( async(vFiles:ModelFile[])=>{

                    // consolidate and save files
                    for(let i=0;i<vFiles.length; i++){
                        vFiles[i].setScope(pScope);
                        vFiles[i] = await db.asyncAddEntry({
                            _r:vFiles[i].getRelativePath(),
                            scope:vFiles[i].getScope().getUID()
                        }, vFiles[i]);
                    }

                    // complete Binwalk results with folders
                    let folders:ModelFile[] = [];
                    this.ctx.getDataAnalyzer()._indexFolders(path, folders);

                    for(let i=0;i<folders.length; i++){
                        folders[i].setScope(pScope);
                        folders[i] = await db.asyncAddEntry({
                            _r:folders[i].getRelativePath(),
                            scope:folders[i].getScope().getUID()
                        }, folders[i]);
                    }


                    // files.length
                    Logger.info("[*] "+vFiles.length+" files analyzed");

                    return vFiles;
                })
            );
    }




    /**
     * To scan the 'path' as APK content
     *
     * @param path
     * @param pType
     */
    async detectFmtFiles(pFiles:ModelFile[], pScope:DataScope):Promise<Observable<ModelFile[]>>{

        let db:IDbCollection = this.ctx.getProjectDB().getCollectionOf(ModelFile.TYPE.getType());


        let  files:Record<string,ModelFile>={};
        for(let i=0; i<pFiles.length; i++){
            files[pFiles[i].getRealPath()] = pFiles[i] as ModelFile;
        }

        // scan file formats
        return this.ctx.getDataAnalyzer()._detectFileFormatFrom(Object.keys(files))
            .pipe(
                mergeMap( async(vFiles:ModelFile[])=>{

                    // consolidate and save files
                    for(let i=0;i<vFiles.length; i++){
                        files[vFiles[i].getRealPath()].__t = vFiles[i].__t;
                        files[vFiles[i].getRealPath()].__p = vFiles[i].__p;
                        files[vFiles[i].getRealPath()].type = vFiles[i].type;
                        await this.ctx.getProjectDB().save(vFiles[i], null, ['__p','__t','type']);
                    }

                    // files.length
                    Logger.info("[*] "+vFiles.length+" files analyzed");

                    return vFiles;
                })
            );
    }
}