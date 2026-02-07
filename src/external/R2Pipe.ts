
import * as _fs_ from "fs";
import * as _os_ from "os";
import * as _proc_ from "child_process";

import {ChildProcess} from "child_process";

import {Nullable} from "@dexcalibur/dxc-core-api";
import {R2Exception} from "./errors/R2Exception.js";
import {Subject, Subscription} from "rxjs";
import * as Log from "../Logger.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export interface R2RawCmdResult {
    cmd: string,
    data: Buffer
}


export interface R2CmdResult {
    cmd: string,
    success:boolean,
    data: any,
    json: boolean,
    message?:string
}

export interface R2CmdListener {
    cmd?: string,
    onerr: any,
    onres: any
}


export interface R2CmdOpts {
    json: boolean,
    ignoreErr: boolean
}

let instanceCtr:number = 0;
let instancePorts:number[] = [];


export interface R2Cmd {
    cmd: string,
    time: number,
    duration: number,
    results?: any,
    opts: R2CmdOptions,
    listeners?: R2CmdListener,
    id:number,
    err?:string[],
    infos?:string[]
}

export interface R2Options {
    keepResults?: boolean;
    history?: boolean;
    remote?: { uri?:string, port?:number }
}

export interface R2CmdOptions {
    json:boolean;
    ignoreErr:boolean;
    [opt:string]:any;
}


/**
 * Represent the connection to an instance of radare2
 *
 * @class
 */
export class R2Pipe {

    static NAME = "radare2";
    static R2PIPE_PATH:string;

    static PORT_BASE = 4000;
    static PORT_MAX = 4300;

    private _ctr = 0;

    in:number = -1;
    out:number = -1;

    _onResults:((res:R2RawCmdResult)=>void) = ()=>{};
    _onError:((err:any)=>void) = ()=>{};

    file:Nullable<string> = null;

    pipeQueue:any[] = [];
    path:string;

    err:string[] = [];
    stopped = true;

    history:R2Cmd[] = [];
    waiting:R2Cmd[] = [];
    current:Nullable<R2Cmd> = null;
    cmd$:Subject<R2Cmd> = new Subject<R2Cmd>();
    cmd$subs:Nullable<Subscription> = null;

    /**
     * @deprecated
     */
    cmd?:string = undefined;

    /**
     * @deprecated
     */
    cmdList: R2CmdListener[] = [];

    cmdErr:string[] = [];


    out_buff:Nullable<Buffer> = null;

    time:number = -1;
    results:any = null;

    opts:R2Options = {
        history: true,
        keepResults: false
    }

    private _name:string = "";
    private _ps?:ChildProcess = undefined;
    private _waiting: boolean = false;

    i:number = -1;

    constructor(pFile:string) {
        this.file = pFile;
    }

    /**
     * To set the default path to radare2 bin
     *
     * @param {string} pR2BinPath
     */
    static setPath(pR2BinPath):void {
        R2Pipe.R2PIPE_PATH = pR2BinPath;
    }


    static randomPort():number {
        let port:number;
        do{
            port= Math.round((R2Pipe.PORT_MAX-R2Pipe.PORT_BASE)*Math.random())+R2Pipe.PORT_BASE;
        }while(instancePorts.indexOf(port)>-1);
        instancePorts.push(port);
        return port;
    }

    /**
     * To set Radare2 start options specific to the instance/target file
     *
     * @param {any} pOpts Options
     */
    setOptions(pOpts:R2Options):void {
        this.opts = pOpts;
    }

    /**
     * To open a file in Radare2 and create a R2Pipe instance to interact
     * with it
     *
     * @param {string} pFilePath
     */
    static open(pFilePath:string, pOptions?:R2Options):R2Pipe {

        const r2instance = new R2Pipe(pFilePath);

        if(pOptions!=null){
            r2instance.setOptions(pOptions);
        }

        r2instance.start();
        r2instance._name = "radare2-"+(++instanceCtr);

        return r2instance;
    }


    getPort():number{
        if(this.opts.remote==null){
            throw R2Exception.REMOTE_OPTS_NOT_CONFIGURED(this._name);
        }

        if(this.opts.remote.port!=null){
            return this.opts.remote.port;
        }else{
            return R2Pipe.randomPort();
        }
    }

    static trim(pData:Buffer):Buffer {
        let data = pData;
        // remove trailing null bytes

        let i=0;
        while((data[i]==0x00 || data[i]==0x0a) && i<data.length) i++;
        if(i>0 && i<data.length) data = data.slice(i);

        i = data.length-1;
        while((data[i]==0x00 || data[i]==0x0a) && i>=0) i--;
        if(i>0) data = data.slice(0,i+1);

        return data;
    }

    /**
     *
     * @private
     */
    private _resetQueue(){

        // reset waiting list
        this.waiting = [];
        this.current = null;

        if(this.cmd$subs!=null){
            this.cmd$subs.unsubscribe();
        }

        this.cmd$subs = this.cmd$.subscribe((vCmd:R2Cmd)=>{
            if(vCmd!=null){
                this.current = vCmd;
                this._execCmd(this.current);
            }
        });
    }

    static CTR=0;

    /**
     * To spawn a new instance
     *
     *
     */
    start():void {

        let args:string[] = [];

        if(this.opts.remote!=null){
            args.push(`-qc.:${this.getPort()}`)
        }else{
            args.push("-q0")
        }

        args.push(this.file);

        // reset cmd queue
        this._resetQueue();

        // start process
        this._ps = _proc_.spawn(R2Pipe.R2PIPE_PATH, args);

        this._ps.stdout.on('data', (data) => {

            this.stopped = false;

            if(this.current==null){
                //Logger.info("RADARE2 stdout NO WAITING COMMAND: ",data.toString('hex'));
                this.out_buff = null; //(this.out_buff==null? data : Buffer.concat([this.out_buff,data]))
                return;
            }

            if(data.length>=2 && data[0]==0x00 && data[1]==0x00){
                data = data.slice(2);
                //Logger.info("OPERATION "+this.current.cmd.substring(0,this.current.cmd.length-1)+" STARTED ",data.toString('hex'));
                this.out_buff = null;
                this.current.listeners.onres({ cmd:this.current.cmd, data:Buffer.from([]) });
                return;
            }

            if(data.length==1 && data[0]==0x00){
                if(this.out_buff!=null && this.out_buff.length==2 && this.out_buff[0]==0x00 && this.out_buff[1]==0x00){
                    //Logger.info("OPERATION "+this.current.cmd.substring(0,this.current.cmd.length-1)+" STARTED (2)",data.toString('hex'));
                    this.out_buff = null;
                    this.current.listeners.onres({ cmd:this.current.cmd, data:Buffer.from([]) });
                    return;
                }else{
                    //Logger.info("OPERATION "+this.current.cmd.substring(0,this.current.cmd.length-1)+" DONE WITHOUT RESULT",data.toString('hex'));
                    this.out_buff = (this.out_buff==null? data : Buffer.concat([this.out_buff,data]))
                }
                return;
            }

            this.out_buff = (this.out_buff==null? data : Buffer.concat([this.out_buff,data]))

            if(this.out_buff.length==1 && this.out_buff[0]==0x00){
                // continue
               return;
            }

            if(this.out_buff.length==1){
                return;
            }

            // end of result block => result is full
            let eoc = -1, cmd:R2Cmd;
            _fs_.writeFileSync(process.env.HOME+'/r2test/'+this.current.id+'.r2.out', this.current.cmd+`---len:${data.length}---
`+data+`
---hex---
`+data.toString('hex')+"\n\n", { flag: 'a' });

            eoc = this.out_buff.indexOf("\x00",1);

            if(eoc==-1 && this.out_buff.length>2){
                eoc = this.out_buff.indexOf("\x0a");
                if (eoc == -1) {
                    // current command is not complete
                    Logger.debug(`wait ... RESULT NOT TERMINATED BY CRLF NOR NULL BYTE (blk=${data.length}, total=${this.out_buff.length})`);//,this.out_buff.toString('hex'));
                    return;
                }
            }

            if(this.out_buff[eoc-1]!=0x0a || (this.out_buff[eoc+1]!=undefined && this.out_buff[eoc+1]!=0x00)){
                Logger.debug(`wait ... RESULT NOT TERMINATED BY NULL (blk=${data.length}, eoc=${eoc}, total=${this.out_buff.length})`);//,this.out_buff.toString('hex'));
                return;
            }

            cmd = this.current; //this.cmdList.shift();

            if(cmd==null || cmd.listeners==null || cmd.cmd==null){
                Logger.debug("wait ... CMD undefined or inconsistent");
                return;
            }

//            if(this.out_buff.slice(eoc-1,eoc+2).toString('hex')=='0a0000'){
            if(this.out_buff.slice(eoc-1,eoc+1).toString('hex')=='0a00'){
                // update buffer
                const d =this.out_buff.slice( (this.out_buff[0]==0?1:0) ,eoc-1);
                this.out_buff = this.out_buff.slice(eoc+2);
                Logger.debug("R2Pipe RESPONSE COMPLETE : ",d.toString('ascii'));
                cmd.listeners.onres({ cmd:cmd.cmd, data:d });
            }else{
                //Logger.info("CONTINUE TO BUFFERIZE : "+this.current.cmd);
            }


            return;
        });

        // for each chunk of results
        this._ps.stderr.on('data', (data) => {

            if(this.current==null){
                this.err.push(data);
                //Logger.info("RADARE2 stderr (cmd-3) NO WAITING COMMAND: ",data.toString());
                return;
            }

            if(this.current.err==null) this.current.err = [];
            if(this.current.infos==null) this.current.infos = [];

            let eol = data.indexOf(_os_.EOL);

            if(eol>-1){

                R2Pipe.trim(data).toString().split(_os_.EOL).map((line:string) => {
                    if(line.startsWith("ERROR:")){
                        this.current.err.push(line.substring(6));
                    }else{
                        this.current.infos.push(line);
                    }
                });


                Logger.info(`RADARE2 stderr (${this.current.id} cmd:${this.current.cmd.substring(0,this.current.cmd.length-1)})
\tINFO: `+this.current.infos+`\n\tERROR: `+this.current.err);


                if(this.current.err.length>0){
                    this.cmdErr = this.cmdErr.concat(this.current.err);
                    this.cmdErr.push(data.toString());
                    this.err.push(data);

                    Logger.info(`RADARE2 stderr before onerr call (${this.current.id}): `); //,data.toString());

                    //this.current.listeners.onerr({ err:this.current.err, info:this.current.infos, data:data });
                    return;
                }else{
                    this.cmdErr = [];
                }

            }else{
                this.cmdErr.push(data.toString());
                this.err.push(data);
            }

            /*
            if(info.length>0){
                this.current.listeners.onres({ info:info, data:data });
            }*/
        });

        this._ps.on('close', (code) => {
            Logger.info(`RADARE2 child process exited with code ${code}`);
            this.stopped = true;
        });

        this.stopped = false;
    }


    private _execCmd(pCommand:R2Cmd):any{

        Logger.info(`Execute R2Cmd [${this.file}][${pCommand.id}] : ${pCommand.cmd}`);
        this._ps.stdin.write( pCommand.cmd + '\n');
    }

    /**
     * Frontend
     * To run a r2 command
     * @param pCommand
     */
    async runCmd(pCommand:string, pOpts:R2CmdOptions = { json:true, ignoreErr:false } ):Promise<R2CmdResult>{

        if(!this.isRunning()){
            throw R2Exception.CMD_STOPPED(this._name, pCommand);
        }

        let listeners:R2CmdListener = {
            onres: null,
            onerr: null
        };

        //this.cmd = pCommand;
        //this.cmd = pCommand;
        this.cmdList.push(listeners);
        this.cmdErr = [];

        if(pOpts.json && pCommand.indexOf('j')==-1) this.cmd = this.cmd+'j';

        this.time = (new Date()).getTime();
        this.results = [];
        this._waiting = true;
        this.i = this.history.length;

        Logger.info("Send cmd : ",pCommand);

        const self = this;
        return new Promise((vResolve, vReject)=>{

            listeners.onres = (vData:R2RawCmdResult)=>{


                let nextCmd:Nullable<R2Cmd>;
                const vResult = R2Pipe.trim(vData.data).toString();
                let res:any = null;

                nextCmd = this.waiting.pop();

                try{
                    if(nextCmd ==null){
                        this.current.results = this.results;
                        this.current.duration = (new Date()).getTime()-this.current.time;
                        this.history.push(this.current);
                        this.current = null;
                    }

                    res = (pOpts.json && vResult.length>0)? JSON.parse(vResult) : vResult;
                    vResolve( { cmd:pCommand, success:true, data: res, json:pOpts.json, message:null });
                    if(nextCmd !=null)
                        this.cmd$.next(nextCmd);
                }catch (e){
                    Logger.error(e.stack);

                    if(vResult.indexOf(_os_.EOL)>-1){
                        let errors:string[] = [];
                        let info:string[] = [];

                        vResult.split(_os_.EOL).map((line:string) => {
                            if(line.startsWith("ERROR:")){
                                errors.push(line.substring(6));
                            }else{
                                info.push(line);
                            }
                        });


                        if(errors.length>0){
                            vReject( { cmd:pCommand, success:false, message:this.cmdErr, data: info });
                        }else{
                            vResolve( { cmd:pCommand, success:true, message:info.join(','), data: vResult, json:false });
                        }
                        if(nextCmd !=null)
                            this.cmd$.next(nextCmd);
                    }else{
                        vReject( { cmd:pCommand, success:false, message:this.cmdErr, data: vResult });
                        if(nextCmd !=null)
                            this.cmd$.next(nextCmd);
                    }
                }
            };

            listeners.onerr = (vErr)=>{
                if(pOpts.ignoreErr){
                    vResolve( { cmd:pCommand, success:true, message:this.cmdErr.join(','), data: null, json:false });
                }else{
                    vReject( { cmd:pCommand, success:false, message:this.cmdErr, data: vErr });
                }
                let nextCmd:Nullable<R2Cmd> = this.waiting.pop();
                if(nextCmd !=null) this.cmd$.next(nextCmd);
            }


            let cmd:R2Cmd = {
                cmd: pCommand+"\n",
                id: (this._ctr++),
                listeners: listeners,
                opts: pOpts,
                time: (new Date()).getTime(),
                duration: -1, // not started
                results: (this.opts.keepResults ? this.results : null)
            };

            // first call
            if(this.current!=null){
                // push to waiting to avoid race condition
                this.waiting.push(cmd);
            }else{
                this.cmd$.next(cmd)
            }
        });
    }


    /**
     * To check if the process is running
     *
     *
     */
    isRunning():boolean {
        return (this.stopped===false);
    }


    startRemotely():any {
        /*
         launch(pFile:string[], opts, cb):void {
            if (typeof opts === 'function') {
                cb = opts;
                opts = this.options;
            }
            const port = (4000 + (Math.random() * 4000)) | 0;
            const ls = _proc_.spawn(this.r2bin, ['-qc.:' + port].concat(...opts).concat(pFile));
            ls.cmdparm = port;
            r2bind(ls, cb, R2Pipe.remoteCmd);
        }
         */
    }

    kill(pSignal = 9):void {
        if(this._ps!=null){
            this._ps.kill(pSignal);
        }
    }

    /*
    static remoteCmd (pPort:number, pCommand:string|string[], pCallback:Nullable<(vMsg:string)=>void>=null) {
        try {
            let msg = '';
            const client = new _net_.Socket();
            client.connect(pPort, 'localhost', function () {});
            client.write(pCommand + '\n');
            client.on('data', function (data) {
                msg += data;
            });
            // Add a 'close' event handler for the client socket
            client.on('close', function () {
                if (typeof pCallback === 'function') {
                    pCallback(msg);
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    static httpCmd(uri, cmd, cb):void {
        let text = '';
        const req = http.get(uri + cmd, function (res) {
            res.on('data', function (res) {
                text += res;
            });
        }).on('error', function (err) {
            cb(err);
        });
        req.on('close', function (e) {
            cb(null, text);
        });
    }
*/

    // --------------------

    private static isEntireBlock(pData: Buffer) {
        return (pData[0]==0x00 && (pData[pData.length-1]==0x00 || pData[pData.length-1]==0x0a));
    }

    private static isResultComplete(pData: Buffer) {
        return (pData[pData.length-3]==0x0a && pData[pData.length-2]==0x0a);
    }

    private static isValidJson(r2CmdListener: R2CmdListener, data: any) {
        if(r2CmdListener.cmd.indexOf('j')==-1) return false;

        let json:any;
        try{
            json = JSON.parse(R2Pipe.trim(data).toString());
            return true;
        }catch (e){
            return false;
        }
    }

    private static isEmpty(data: Buffer) {
        let i =0;
        while(i<data.length && (data[i]==0x00||data[i]==0x0a)) i++;

        return (i==(data.length-1));
    }
}

