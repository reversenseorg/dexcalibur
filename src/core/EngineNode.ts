import got from "got";
import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import {Nullable} from "./IStringIndex.js";
import {Subject} from "rxjs";
import * as Process from "child_process";
import DexcaliburWorkspace from "../DexcaliburWorkspace.js";
import UT from "../Utils.js";
import * as _path_ from "path";
import * as _fs_ from "fs";
import {EngineNodeException} from "../errors/EngineNodeException.js";
import {NodeState} from "./EngineNodeManager.js";

const GOT = got.default;


export interface EngineNodeEvent {

}

export enum ScanState {
    RUNNING="running",
    TERMINATED="terminated",
    ABORTED="aborted",
    CRASHED="crashed"
}

export interface ScanSession {
    modelUID:string;
    scanReport: any;
    state: ScanState
}
/**
 * Represent a running node
 *
 * @class
 */
export class EngineNode {

    readonly UUID:string;
    private _engine:Nullable<IDexcaliburEngine> = null;

    private _projectUID:string;

    event$:Subject<any> = new Subject<any>();

    state:NodeState = NodeState.UNKNOW;
    
    httpPort:number = -1;
    httpsPort:number = -1;
    running:boolean = false;

    errPipe:Nullable<string>;
    outPipe:Nullable<string>;

    activeScanSession:Nullable<ScanSession> = null;

    history:ScanSession[] = [];

    constructor(pUUID:string, pProjectUID:string) {
        this.UUID = pUUID;
        this._projectUID = pProjectUID;
    }

    start():void {
        //this.event$.next({ })


    }

    async isBusy():Promise<boolean> {
        return false;
    }

    async startScan(pModelUID:string):Promise<any> {

        if(this.isReady()){
            if(this.activeScanSession !=null){
                this.activeScanSession.state = ScanState.TERMINATED;
                this.history.push(this.activeScanSession);
            }
        }else{
            throw EngineNodeException.BUSY_NODE(this.UUID,"startScan");
        }

        this.activeScanSession = {
            modelUID: pModelUID,
            state: ScanState.RUNNING,
            scanReport: null
        };

        //GOT()

    }


    /**
     *
     * @param pState
     */
    setState(pState:NodeState):void {
        this.state = pState;
    }

    setHttpPort(pPort:number):void {
        if(this.running){
            throw EngineNodeException.NODE_ALREADY_RUNNING("http port");
        }

        this.httpPort = pPort;
    }
    setHttpsPort(pPort:number):void {
        if(this.running){
            throw EngineNodeException.NODE_ALREADY_RUNNING("https port");
        }

        this.httpsPort = pPort;
    }

    isStarted():boolean {
        return (this.state==NodeState.IDDLE||this.state==NodeState.BUSY);
    }

    /**
     * Node is ready to receive command
     *
     */
    isReady():boolean {
        return (this.state===NodeState.IDDLE);
    }

    async spawn():Promise<any>{


        let child:Process.ChildProcess=null;
        let opts:any = {};

        try{
            let args:string[] = [];
            const ws:DexcaliburWorkspace =  DexcaliburWorkspace.getInstance();
            const time = UT.time();

            this.errPipe = _path_.join( ws.getTempFolderLocation(), (time+'_err.log'));
            this.outPipe = _path_.join( ws.getTempFolderLocation(), (time+'_out.log'));

            const out:number = _fs_.openSync( this.errPipe, 'w+', 0o666);
            const err:number = _fs_.openSync( this.outPipe, 'w+', 0o666);


            args.push('./dist/dexcalibur.js');
            args.push('--headless');
            args.push('--slave-node');
            args.push('--node-uid='+this.UUID);
            args.push('--port='+this.httpPort);


            child = Process.spawn('node', args, { detached: true, stdio: [ 'ignore', out, err ] });
            child.unref();

            console.log( `[ENGINE NODE] node spawned:   ${args}  (opts)`);

        }catch(err){
            console.error('[ENGINE NODE] Detached node error :'+err.message);
        }

        return true;
    }
}