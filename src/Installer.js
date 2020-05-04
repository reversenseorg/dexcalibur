'use strict';

const _readline_    = require('readline');
const _path_        = require('path');
const _fs_          = require('fs');
const _stream_      = require('stream');
const _got_         = require("got");

const _https_       = require('https');

const {URL}         = require("url");
const {promisify}   = require('util');

//const _pipeline_ = promisify(_stream_.pipeline);


const StatusMessage = require('./StatusMessage');
const Configuration = require('./Configuration');
const Workspace = require('./Workspace');
const DxcWorkspace = require('./DexcaliburWorkspace');

const Logger        = require('./Logger')();


const GET_VERSION = {
    javaVersion: "java --version",
    fridaVersion: "frida --version",
    nodeVersion: "node --version"
};




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
      

        this.wsReady = false;

        this.status = null;

        this.taskList = [];
        this.aborted = false;
    }

    

    /**
     * To download remote file
     * 
     * @param {URL} pRemoteURL Remote URL
     */
    static download(pRemoteURL, pLocalPath, pOptions, pCallbacks){


        _stream_.pipeline(
            _got_.stream(pRemoteURL, pOptions),
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
    addTask(pName, pRemoteURL, pLocalPath, pCallbacks, pOptions = {}){
        this.taskList.push({
            name: pName,
            url: pRemoteURL,
            target: pLocalPath,
            callbacks: pCallbacks,
            system: pOptions.system != null ? pOptions.system : null,
            options: pOptions
        });
    }

    addSimpleTask(pName, pCallbacks, pOptions={}){
        this.taskList.push({
            name: pName,
            url: null,
            callbacks: pCallbacks,
            system: pOptions.system != null ? pOptions.system : null,
            options: pOptions
        });
    }

    runTask( pTaskOffset, pStep){
        let self = this;
        let task = this.taskList[pTaskOffset];

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
            this.status = new StatusMessage( this.progress, `Running : ${task.name}  ...`);
            task.callbacks.onSuccess(this);

            self.nextTask( pTaskOffset+1, pStep);
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



