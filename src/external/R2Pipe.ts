
import * as http from "http";
import * as _os_ from "os";
import * as _proc_ from "child_process";

import {ChildProcess} from "child_process";

import {Nullable} from "@dexcalibur/dxc-core-api";
import {R2Exception} from "./errors/R2Exception.js";

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
    cmd: string,
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
    results?: any
}

export interface R2Options {
    keepResults?: boolean;
    history?: boolean;
    remote?: { uri?:string, port?:number }
}

export interface R2CmdOptions {
    json:boolean;
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


    cmd?:string = undefined;
    cmdList: R2CmdListener[] = [];
    cmdErr:string[] = [];
    cmdOpts:R2CmdOptions = {
        json: true
    };
    rawdata:Nullable<Buffer[]> = null;

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

        //console.log("AFTER R2 TRIM : ",data.toString());
        return data;
    }

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

        this._ps = _proc_.spawn(R2Pipe.R2PIPE_PATH, args);

        this._ps.stdout.on('data', (data) => {

            this.stopped = false;

            if(this.out_buff==null){
                this.out_buff = data;
            }else{
                this.out_buff = Buffer.concat([this.out_buff,data]);
            }

            if(this.out_buff.length==1){
                console.log("OUTPUT BUFF IS TOO SHORT ",this.out_buff.toString('hex'));
                return;
            }
            if(this.cmdList.length==0){
                // continue to buffer
                console.log("CMD LIST IS EMPTY ",this.out_buff.toString());
                return;
            }



            // end of result block => result is full

            let eoc = -1, cmd:R2CmdListener;
            do {
                eoc = this.out_buff.indexOf("\n");

                if(eoc==-1 && this.out_buff.length>2){
                    // current command is not complete
                    // console.log(`wait ... RESULT NOT TERMINATED BY CRLF (blk=${data.length}, total=${this.out_buff.length})`);//,this.out_buff.toString('hex'));
                    return;
                }

                if(this.out_buff[eoc+1]!=0x0a || this.out_buff[eoc+1]!=0x00){

                    if(this.out_buff.length>eoc+2){
                        if(this.out_buff[eoc+2]!=0x00){
                            // command ended but result is incomplete (not null terminated)
                            if(data.length<8192){
                                console.log(this.out_buff.slice(eoc,eoc+4).toString('hex'));
                            }
                            // console.log(`wait ... RESULT NOT TERMINATED BY NULL (blk=${data.length}, eoc=${eoc}, total=${this.out_buff.length})`);//,this.out_buff.toString('hex'));
                            return;
                        }
                    }

                }

                cmd = this.cmdList.shift();

                if(cmd==null){
                    // console.error("wait ... CMD is null in r2 stdout");
                    return;
                }

                console.log("RESOLVED CMD ",cmd.cmd);

                cmd.onres({ cmd:cmd.cmd, data:this.out_buff.slice(0,eoc+3) });
                // update buffer
                this.out_buff = this.out_buff.slice(eoc+3);

            }while(this.cmdList.length>0);


            return;
        });

        this._ps.stderr.on('data', (data) => {


            if(this._waiting && this.cmd!=null){

                if(data.indexOf(_os_.EOL)>-1){
                    let errors:string[] = [];
                    let info:string[] = [];

                    R2Pipe.trim(data).toString().split(_os_.EOL).map((line:string) => {
                        if(line.startsWith("ERROR:")){
                            errors.push(line.substring(6));
                        }else{
                            info.push(line);
                        }
                    });


                    if(errors.length>0){
                        this.cmdErr = this.cmdErr.concat(errors);
                        this.cmdErr.push(data.toString());
                        this.err.push(data);
                        //self._onError(this.cmdErr);
                    }else{
                        this.cmdErr = [];

                        console.log(`RADARE2 stderr => stdout (_onResults : ${data}`);
                        //self._onResults( { cmd:this.cmdList.shift(), data: Buffer.from([]) });

                    }
                }else{
                    console.log(`RADARE2 stderr (cmd): ${data}`);
                    this.cmdErr.push(data.toString());
                    this.err.push(data);
                    //self._onError(data);
                }
            }else{
                console.log(`RADARE2 stderr: ${data}`);
                this.err.push(data);
                //self._onError(data);
            }


        });

        this._ps.on('close', (code) => {
            console.log(`RADARE2 child process exited with code ${code}`);
            this.stopped = true;
        });

        this.stopped = false;
    }



    /**
     * To run a r2 command
     * @param pCommand
     */
    async runCmd(pCommand:string, pOpts:R2CmdOpts = { json:true, ignoreErr:false } ):Promise<R2CmdResult>{

        if(!this.isRunning()){
            throw R2Exception.CMD_STOPPED(this._name, pCommand);
        }

        if(this.cmd!=undefined /*&& this.opts.history*/){
            this.history.push({
                cmd: this.cmd,
                time: this.time,
                duration: (new Date()).getTime()-this.time,
                results: (this.opts.keepResults ? this.results : null)
            });
        }

        let listeners:R2CmdListener = {
            cmd: pCommand,
            onres: null,
            onerr: null
        };

        this.cmd = pCommand;
        this.cmdList.push(listeners);
        this.cmdErr = [];

        if(pOpts.json && pCommand.indexOf('j')==-1) this.cmd = this.cmd+'j';

        this.time = (new Date()).getTime();
        this.results = [];
        this._waiting = true;
        this.i = this.history.length;

        console.log("Send cmd : ",pCommand);

        const self = this;
        return new Promise((vResolve, vReject)=>{

            listeners.onres = (vData:R2RawCmdResult)=>{


                const vResult = R2Pipe.trim(vData.data).toString();


                //console.log(`_onResult (cmd=${pCommand}, len =${vResult.length}) `);

                // vReject(vErr);
                try{
                    vResolve( { cmd:pCommand, success:true, data: (pOpts.json && vResult.length>0)? JSON.parse(vResult) : vResult, json:pOpts.json, message:null });
                    return;
                }catch (e){
                    console.error(e);

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
                    }else{
                        vReject( { cmd:pCommand, success:false, message:this.cmdErr, data: vResult });
                    }
                }
            };

            listeners.onerr = (vErr)=>{
                if(pOpts.ignoreErr){
                    vResolve( { cmd:pCommand, success:true, message:this.cmdErr.join(','), data: null, json:false });
                }else{
                    vReject( { cmd:pCommand, success:false, message:this.cmdErr, data: vErr });
                }
            }

            self._ps.stdin.write( pCommand + '\n');
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

