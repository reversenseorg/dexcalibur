import {Subject} from "rxjs";
import {Nullable} from "./core/IStringIndex.js";
import * as _ws_ from "websocket";
import {EngineNodeUUID, WebSocketClient} from "./core/EngineNode.js";
import * as Log from "./Logger.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 *
 * @class
 * @since 1.8.1
 */
export class WebsocketClient {

    private _node:Nullable<EngineNodeUUID> = null;

    private _port:number = -1;

    private _secure:any = {};

    private _hostname:string;

    private _ws:Nullable<any> = null;

    private _wsReady = false;

    private _wsConn:any = null;

    private _wsClosed = false;

    private _wsResponse$:Subject<any>;

    private _wsRequest$:Subject<any>;

    private _protocol:string = "";

    constructor(pHost: string, pPort: number, pSecure:any = null) {
        this._port = pPort;
        this._hostname = pHost;
        this._secure = pSecure;
    }

    setNodeUid(pUID:EngineNodeUUID):void {
        this._node = pUID;
    }

    /**
     *
     */
    init(pProtocol:string):Nullable<WebSocketClient>{

        this._wsResponse$ = new Subject();
        this._wsRequest$ = new Subject();

        Logger.info("Create ws client for ws://"+this._hostname+':'+this._port+'/');
        this._ws = new (_ws_.default.client)();

        this._ws.on('connectFailed', (err)=>{
            Logger.error(`[node=${this._node}][WEBSOCKET] ConnectError : ${err.toString()}`);
        });

        this._ws.on('connect', (vConnection)=>{

            this._wsConn = vConnection;

            vConnection.on('error', (e)=> {
                console.log(e);
                Logger.error(`[node=${this._node}][WEBSOCKET] Connection Error`);
                this._wsReady = false;
            });
            vConnection.on('close', ()=> {
                Logger.error(`[node=${this._node}][WEBSOCKET] Connection closed`);
                this._wsReady = false;
                this._wsClosed = true;
            });
            vConnection.on('message', (vMsg)=> {
                Logger.info(`[node=${this._node}][WEBSOCKET] Message received`);
                this._wsResponse$.next(vMsg);
            });


            this._wsRequest$.subscribe((vMsg)=>{
                if(this._wsReady && this._wsConn!=null){
                    this._wsConn.sendUTF(vMsg);
                }else if(this._wsClosed == true){
                    Logger.info(`[node=${this._node}][WEBSOCKET] Connection is close. Re-open ... ${this._protocol}`);
                    this.connectWS(this._protocol);
                }
            });
        });
    }



    connectWS(pProtocol:string){
        if(this._ws!=null && this._wsReady==false){
            this._protocol = pProtocol;
            this._ws.connect("ws://"+this._hostname+':'+this._port+'/',pProtocol);
            this._wsReady = true;
        }

        return this._wsConn;
    }

    getWsInput():Subject<any> {
        return this._wsRequest$;
    }

    getWsOutput():Subject<any> {
        return this._wsResponse$;
    }

    isWsReady():boolean {
        return this._wsReady;
    }
}