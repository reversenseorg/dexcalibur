import {IFileAnalyzer} from "../../analyzer/IFileAnalyzer.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import ModelFile, {ModelFileOptions} from "../../ModelFile.js";
import Util from "../../Utils.js";
import ShellHelper from "../../ShellHelper.js";
import * as _path_ from "path";
import * as _glob_ from "glob";

import {getEnvironmentData, isMainThread, setEnvironmentData, Worker} from "node:worker_threads";

import BusEvent from "../../BusEvent.js";
import {FileScanResult} from "../../DataAnalyzer.js";

import * as Log from '../../Logger.js';
import {Observable, Subject} from "rxjs";

import {FileFormatDetectorWorker} from "./FileFormatDetectorWorker.js";
import {JobWorkerMessage} from "./Job.js";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface FileFmtSession {
    path:string,
    files:ModelFile[]
}

export class FileFormatDetector {

    private _poolSize:number;

    private _workerFactory:any;

    private _backend:IFileAnalyzer;

    private _queue:Subject<string> = new Subject<string>();

    finish$:Subject<FileFmtSession> = new Subject<FileFmtSession>();


    constructor(pPoolSize = 10) {
        this._poolSize = pPoolSize;
    }


    /**
     * Back to use with workers
     *
     * @param pBackend
     */
    setBackend( pBackend:IFileAnalyzer){
        this._backend = pBackend;
    }


    /**
     * To scan a folder content with binwalk
     *
     * @param {string} pPath Folder to scan
     * @param {DexcaliburProject} pContext Active project
     * @param {Function} pSkipIf Glob pattern to skip
     * @return {ModelFile[]} An array of ModelFile
     */
    async analyzeFolder(pPath:string, pContext:DexcaliburProject, pSkipIf:any, pDelay = 600):Promise<Subject<ModelFile[]>> {

        const b = Util.time();
        let observable:Subject<ModelFile[]> = new Subject<ModelFile[]>();
        let files:ModelFile[] = [];
        let scheduler:Worker;

        let vFiles:any[];

        try{
            vFiles = _glob_.default.sync(pPath+"/**/*", {
                dot:true,
                nodir: true,
                ignore: pSkipIf,
                absolute: true
            });

            let counter:number = 0;
            const m = '/'+vFiles.length+' Files analyzed by data carving';

            scheduler = await FileFormatDetectorWorker.queueScheduler(10, vFiles, (jMsg:JobWorkerMessage)=>{


                if(jMsg.cmd=="log"){
                    if(!jMsg.success || jMsg.err!=null ){
                        Logger.error("[FileFormatDetectorWorker][queueScheduler]["+jMsg.threadID+" ] : "+(jMsg.err!=null? jMsg.err : jMsg.data));
                    }else{
                        Logger.info("[FileFormatDetectorWorker][queueScheduler]["+jMsg.threadID+" ] : "+jMsg.data);
                    }
                    return;
                }

                if(jMsg.cmd=="exec"){

                    if(!jMsg.success){
                        Logger.error("[FileFormatDetectorWorker][queueScheduler]["+jMsg.threadID+"] Error : "+jMsg.err);
                        return;
                    }

                    const f:ModelFile = new ModelFile({
                        type: jMsg.data.fmt!=null ? jMsg.data.fmt.type : null,
                        __p: jMsg.data.fmt!=null ? jMsg.data.fmt.__p : null,
                        name: _path_.basename(jMsg.data.file),
                        path: jMsg.data.file,
                    });

                    // append to the list
                    files.push(f);

                    if(pContext!=null){
                        pContext.bus.send(new BusEvent<FileScanResult>({
                            type: "data.file.new.knownFmt",
                            data: {
                                src: jMsg.data.backend,
                                file: f
                            }
                        }))
                    }
                    return;
                }

            },pDelay);


            scheduler.on("exit", (exitCode)=>{

                if(exitCode==0){
                    Logger.success("[FileFormatDetectorWorker][queueScheduler][file="+files.length+"][duration="+(Util.time()-b)+"] Completed ");
                    observable.next(files);
                }else{
                    Logger.error("[FileFormatDetectorWorker][queueScheduler][file="+files.length+"][duration="+(Util.time()-b)+"] Exited on code : "+exitCode);
                }

            });

        }catch(err){
            Logger.error("[FileFmtFetector][BINWALK HELPER] Binwalk failed to scan path (1) : "+pPath+"\n"+err.message+"\n"+err.stack);
        }

        return observable;
    }


    /**
     * To scan a list of file path with binwalk or equivalent
     *
     * @param {string[]} pPath The list of path to scan
     * @param {DexcaliburProject} pContext Active project
     * @return {Promise<Subject<ModelFile[]>>} An array of ModelFile
     * @method
     * @async
     */
    async analyzeFiles(pFiles:string[], pContext:DexcaliburProject, pDelay = 600):Promise<Subject<ModelFile[]>> {

        const b = Util.time();
        let observable:Subject<ModelFile[]> = new Subject<ModelFile[]>();
        let files:ModelFile[] = [];
        let scheduler:Worker;


        try{

            let counter:number = 0;
            const m = '/'+pFiles.length+' Files analyzed by data carving';

            scheduler = await FileFormatDetectorWorker.queueScheduler(10, pFiles, (jMsg:JobWorkerMessage)=>{


                if(jMsg.cmd=="log"){
                    if(!jMsg.success || jMsg.err!=null ){
                        Logger.error("[FileFormatDetectorWorker][queueScheduler]["+jMsg.threadID+" ] : "+(jMsg.err!=null? jMsg.err : jMsg.data));
                    }else{
                        Logger.info("[FileFormatDetectorWorker][queueScheduler]["+jMsg.threadID+" ] : "+jMsg.data);
                    }
                    return;
                }

                if(jMsg.cmd=="exec"){

                    if(!jMsg.success){
                        Logger.error("[FileFormatDetectorWorker][queueScheduler]["+jMsg.threadID+"] Error : "+jMsg.err);
                        return;
                    }

                    const f:ModelFile = new ModelFile({
                        type: jMsg.data.fmt!=null ? jMsg.data.fmt.type : null,
                        __p: jMsg.data.fmt!=null ? jMsg.data.fmt.__p : null,
                        name: _path_.basename(jMsg.data.file),
                        path: jMsg.data.file,
                    });

                    // append to the list
                    files.push(f);

                    if(pContext!=null){
                        pContext.bus.send(new BusEvent<FileScanResult>({
                            type: "data.file.new.knownFmt",
                            data: {
                                src: jMsg.data.backend,
                                file: f
                            }
                        }))
                    }
                    return;
                }

            },pDelay);


            scheduler.on("exit", (exitCode)=>{

                if(exitCode==0){
                    Logger.success("[FileFormatDetectorWorker][queueScheduler][file="+files.length+"][duration="+(Util.time()-b)+"] Completed ");
                    observable.next(files);
                }else{
                    Logger.error("[FileFormatDetectorWorker][queueScheduler][file="+files.length+"][duration="+(Util.time()-b)+"] Exited on code : "+exitCode);
                }

            });

        }catch(err){
            Logger.error("[FileFmtFetector][BINWALK HELPER] Binwalk failed to scan the list of path: \n"+err.message+"\n"+err.stack);
        }

        return observable;
    }

}