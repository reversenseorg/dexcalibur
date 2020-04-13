'use strict';

const _readline_    = require('readline');
const _path_        = require('path');
const _fs_          = require('fs');
const _https_ = require('https');


const Configuration = require('./Configuration');
const Workspace = require('./Workspace');
const DxcWorkspace = require('./DexcaliburWorkspace');

const Logger        = require('./Logger')();


const GET_VERSION = {
    javaVersion: "java --version",
    fridaVersion: "frida --version",
    nodeVersion: "node --version"
};


class StatusMessage
{
    constructor( pProgress, pMessage=""){
        this.progress = pProgress;
        this.msg = pMessage;
        this.extra = null;
    }

    static newError( pProgress, pMessage){
        let m  = new StatusMessage(pProgress, pMessage);
        m.extra = "error";
        return m;
    }

    static newSuccess( pMessage){
        let m  = new StatusMessage(100, pMessage);
        m.extra = "success";
        return m;
    }

    getProgress(){
        return this.progress;
    }

    getMessage(){
        return this.msg;
    }

    getExtra(){
        return this.extra;
    }

    toJsonObject(){
        let o = new Object();
        o.progress = this.progress;
        o.msg = this.msg;
        o.extra = this.extra;
        return o;
    }
}

/**
 * This class is the install helper
 */
class Installer
{
    constructor( pContext=null){
        this.consoleIO = _readline_.createInterface({
            input: process.stdin,
            output: process.stdout
        });    
        
        this.context = pContext;

        this.os = null;
        
        this.ws = null;
        this.wsPath = null;

        this.adb = null;
        this.frida = null;
        this.apktool = null;

        this.wsReady = false;

        this.status = null;

        this.taskList = [];
        this.aborted = false;
    }

    

    /**
     * To download remote file
     */
    static download(pRemoteURL, pLocalPath, pCallbacks){
        
        _https_.get( pRemoteURL, (res) => {
            // console.log('statusCode:', res.statusCode);
            // console.log('headers:', res.headers);

            let ws = null;

            res.on('data', (d) => {
                //this.config.apktPath
                if(ws == null){
                    ws = _fs_.createWriteStream(pLocalPath, {
                        flags: 'w+',
                        mode: 0o777,
                        encoding: 'binary'
                    });
                }
                
                ws.write(d);
            });
            res.on('end', (e) => {
                if (!res.complete){
                    Logger.error('The connection was terminated while the file was still being downloaded');
                    if(pCallbacks.onError != null)
                        pCallbacks.onError(e);
                }
                else{
                    ws.close();
                    if(pCallbacks.onSuccess != null)
                        pCallbacks.onSuccess(e);
                }
            });

        }).on('error', (e) => {
            Logger.error(e);
        });

    }

    static verifyWorkspacePath( pPath){
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
    addTask(pName, pRemoteURL, pLocalPath, pCallbacks, pOS=null){
        this.taskList.push({
            name: pName,
            url: pRemoteURL,
            target: pLocalPath,
            callbacks: pCallbacks,
            system: pOS
        });
    }

    runTask( pTaskOffset, pStep){
        let self = this;
        let task = this.taskList[pTaskOffset];


        // download
        if(task.url !== null){
            this.status = new StatusMessage( this.progress, `Downloading ${task.name} from ${task.url} ...`);
            Installer.download( task.url, task.target, {
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
        }

        // after downlaod

    }

    nextTask( pTaskOffset, pStep){
        if(this.aborted == false){
            if(this.taskList[pTaskOffset] !== undefined)
                this.runTask( pTaskOffset, pStep);
            else{
                this.status = StatusMessage.newSuccess(`Success.`);
            }
        }else{
            this.status = StatusMessage.newError( this.status.progress, `An error occured. Stopped :( `);
        }
    }

    run(){
        let step = 10; //Math.round(100/(this.taskList.length*2));

        this.status = new StatusMessage( 10, `Starting ...`);
        this.runTask( 0, step);

        return true;
    }

    resetStatus(){
        this.status = null;
    }

    getStatus(){
        return this.status;
    }

    /*
    initStatus(){
        this.status = {
            msg: null,
            progress: 0
        };
    }


    getStatusProgress(){
        return this.status.progress;
    }

    getStatusMessage(){
        return this.status.msg;
    }
    */

    checkFridaVersion(){
        let v = process.execSync('frida --version');
        if(/[0-9]{1,2}(\.[0-9a-f]+)/.test(v)){
            return true;
        }else{
            return false;
        }
    }
}

module.exports = {
    Installer: Installer,
    StatusMessage: StatusMessage
}



