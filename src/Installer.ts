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

'use strict';

import * as _readline_ from 'readline';
import * as _fs_       from 'fs';
import * as _stream_   from 'stream';
import * as _ps_   from 'child_process';

import * as Got from "got";
const got = Got.default;

import * as _https_    from 'https';

import {URL} from "url";
import * as Log from './Logger.js';
import {promisify} from 'util';
import DexcaliburEngine from "./DexcaliburEngine.js";
import StatusMessage from "./StatusMessage.js";

//const _pipeline_ = promisify(_stream_.pipeline);



const GET_VERSION = {
    javaVersion: "java --version",
    fridaVersion: "frida --version",
    nodeVersion: "node --version"
};




/**
 * This class is the install helper
 */
export default class Installer
{
    consoleIO:_readline_.Interface = null;
    context:DexcaliburEngine = null;
    os = null;
    wsReady:boolean = false;
    status:StatusMessage = null;
    taskList:any = [];
    aborted:boolean = false;

    constructor( pContext:DexcaliburEngine=null){
        this.consoleIO = _readline_.createInterface({
            input: process.stdin,
            output: process.stdout
        });    
        
        this.context = pContext;
    }

    

    /**
     * To download remote file
     * 
     * @param {URL} pRemoteURL Remote URL
     */
    static download(pRemoteURL:string, pLocalPath:string, pOptions:any, pCallbacks:any){

        _stream_.pipeline(
            got.stream(pRemoteURL, pOptions),
            _fs_.createWriteStream(pLocalPath, {
                flags: 'w+',
                mode: 0o777,
                encoding: 'binary' // binary
            }),
            (err)=>{
                if(pCallbacks.onSuccess != null)
                        pCallbacks.onSuccess(err);
            }
        );
    }

    static verifyWorkspacePath( pPath:string){
        if( _fs_.existsSync(pPath) == true)
            return null;
        else
            return "Folder not found.";
    }

    /**
     * 
     * Callbacks :
     *  - onSuccess
     *  - onError
     *  - onPreDownload
     *  - onPostDownload
     *  - onDownloadingError
     * 
     * 
     * @param {*} pName 
     * @param {*} pRemoteURL 
     * @param {*} pLocalPath 
     * @param {*} pCallbacks 
     * @param {*} pOS 
     */
    addTask(pName:string, pRemoteURL:string, pLocalPath:string, pCallbacks:any, pOptions:any = {}){
        this.taskList.push({
            name: pName,
            url: pRemoteURL,
            target: pLocalPath,
            callbacks: pCallbacks,
            system: pOptions.system != null ? pOptions.system : null,
            options: pOptions
        });
    }

    addSimpleTask(pName:string, pCallbacks:any, pOptions:any={}){
        this.taskList.push({
            name: pName,
            url: null,
            callbacks: pCallbacks,
            system: pOptions.system != null ? pOptions.system : null,
            options: pOptions
        });
    }

    runTask( pTaskOffset:number, pStep:number){
        let self:Installer = this;
        let task:any = this.taskList[pTaskOffset];

        // download
        if(task.url !== null){
            this.status = new StatusMessage( this.status.progress, `Downloading ${task.name} from ${task.url} ...`);
            Installer.download( task.url, task.target, task.options, {
                onSuccess: function(vData){
                    self.status.progress += pStep;
                    if(task.callbacks.onPostDownload != null)
                        task.callbacks.onPostDownload(task, pStep, vData)

                    self.nextTask( pTaskOffset+1, pStep);
                },
                onError: function(vErr){
                    self.aborted = true;
                    if(task.callbacks.onDownloadingError !== null)
                        task.callbacks.onDownloadingError(task, pStep, vErr)
                }
            });
        }else{
            self.status.progress += pStep;         
            this.status = new StatusMessage( this.status.progress, `Running : ${task.name}  ...`);
            task.callbacks.onSuccess(this);

            self.nextTask( pTaskOffset+1, pStep);
        }

        // after downlaod

    }

    nextTask( pTaskOffset:number, pStep:number){
        if(this.aborted == false){
            if(this.taskList[pTaskOffset] !== undefined)
                this.runTask( pTaskOffset, pStep);
            else{
                this.status = StatusMessage.newSuccess(`Success.`);
            }
        }else{
            this.status = StatusMessage.newError( `An error occured. Stopped :( `);
        }
    }

    run():boolean{
        let step:number = 10; //Math.round(100/(this.taskList.length*2));

        this.status = new StatusMessage( 10, `Starting ...`);
        this.runTask( 0, step);

        return true;
    }

    resetStatus():void{
        this.status = null;
    }

    getStatus():StatusMessage{
        return this.status;
    }

    updateStatus(pProgress:number, pMessage:string):StatusMessage{
        return this.status.update(pProgress, pMessage);
    }

    checkFridaVersion():boolean{
        let v:string = _ps_.execSync('frida --version').toString();
        if(/[0-9]{1,2}(\.[0-9a-f]+)/.test(v)){
            return true;
        }else{
            return false;
        }
    }
}



