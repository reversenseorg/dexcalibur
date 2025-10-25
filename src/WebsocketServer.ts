import {server as WebSocketServer} from 'websocket';
import DexcaliburEngine from "./DexcaliburEngine.js";
import * as http from "http";
import * as https from "https";
import * as Log from "./Logger.js";
import {User} from "./User.js";
import {Workflow} from "./Workflow.js";
import {Settings} from "./Settings.js";
import {UserSession} from "./user/session/UserSession.js";
import {UserService} from "./user/UserService.js";
import DexcaliburProject from "./DexcaliburProject.js";
import AccessControl from "./user/acl/AccessControl.js";
import {AccessZone} from "./user/acl/Zones.js";
import {DexcaliburEngineMode} from "./DexcaliburEngineMode.js";
import {HookManager} from "./hook/HookManager.js";
import {EngineNodeUUID, NodePurpose, WebSocketClient} from "./core/EngineNode.js";
import {UserAccountUUID} from "./user/UserAccount.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";
import {DexcaliburProjectException} from "./errors/DexcaliburProjectException.js";
import * as console from "node:console";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export interface SocketSession {
    created: number;
    user?:any;
    socket: any;
}

/**
 * This class creates a websocket server and it dispatches requests
 *
 * @class
 * @since 1.0.0
 * @author Georges-Bastien MICHEL
 */
export class WebsocketServer
{
    /**
     *
     * @private
     */
    private _wsclients:Record<EngineNodeUUID, WebSocketClient> = {};

    private _usrSockets:Record<UserAccountUUID, Record<string, SocketSession>> = {};

    /**
     * Dexcalibur engine instance (context)
     *
     * @type {DexcaliburEngine}
     * @field
     * @since 1.0.0
     */
    engine: DexcaliburEngine = null;

    /**
     * WS server port number
     *
     * @type {number}
     * @field
     * @since 1.0.0
     */
    port:number = null;

    /**
     * Websocket server instance
     *
     * @type {WebSocketServer}
     * @field
     * @since 1.0.0
     */
    wsServer:WebSocketServer = null;

    /**
     * HTTP server instance
     *
     * @type {http.Server|https.Server}
     * @field
     * @since 1.0.0
     */
    httpServer:http.Server|https.Server = null;

    /**
     * @deprecated
     */
    user: User = new User({});


    /**
     * To create an uninitialized websocket server instance
     *
     * @param {DexcaliburEngine} pEngine Instance of dexcalibur engine
     * @constructor
     * @since 1.0.0
     */
    constructor( pEngine: DexcaliburEngine) {
        this.engine = pEngine;
    }

    /**
     * To check if the origin is allowed and to adapt CORS headers
     *
     * @param {string} origin HTTP Header 'Origin'
     * @return {boolean} TRUE if the origin is allowed, else false.
     * @since 1.0.0
     */
    static originIsAllowed(origin:string):boolean {
        return true;
    }

    /**
     *
     * @param pUUID
     * @param pToken
     */
    isTokenValid(pUUID:string, pToken:string):boolean {
        return (this._usrSockets[pUUID]!=null) && (this._usrSockets[pUUID][pToken]!=null)
            && (((new Date()).getTime() - this._usrSockets[pUUID][pToken].created) < 48*3600*1000);
    }


    async restoreSession():Promise<void> {
        const sess = await this.engine.getUserService().restoreSocketSessions();
        // todo
    }

    /**
     * To initialize web socket server.
     *
     * It is the main entry point for requests before dispatching.
     *
     * @method
     * @since v1.0.0
     */
    init( pConfig:Settings.WebServerSettings):void{

        const self = this;

        // Create WS server instance if needed
        if(this.httpServer == null){
            this.httpServer =  http.createServer((req, res) => {
                res.end();
            });

            this.wsServer = new WebSocketServer({
                httpServer: this.httpServer,
                maxReceivedFrameSize: 64 * 1024,
                maxReceivedMessageSize: 1024 * 1024,
                fragmentationThreshold: 16 * 1024,
                ignoreXForwardedFor: true,
                autoAcceptConnections: false
            })
        }

        // set port number with data from global settings
        this.port = pConfig.getWsPort();

        this.wsServer.on('close', function(webSocketConnection:any, closeReason:any, description:string) {

            Logger.error("[WebSocketServer] Connection closed : ",webSocketConnection, closeReason, description);
        });

        this.wsServer.on('request', function(request:any) {

            try{
                if (!WebsocketServer.originIsAllowed(request.origin)) {
                    // Make sure we only accept requests from an allowed origin
                    request.reject();
                    Logger.info((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
                    return;
                }

                // term
                let conn:any = request.accept('term-protocol', request.origin);

                Logger.info((new Date()) + ' Connection accepted for terminal');

                conn.on('message', function(message:any) :void{

                    const usrSvc:UserService = self.engine.getUserService();

                    // do authentication / retrieve user session

                    let user:User = self.user;

                    try{

                        // process command for the user
                        if (message.type === 'utf8') {
                            let unsafeJSON = JSON.parse(message.utf8Data);

                            if(self.engine.getEngineMode()!==DexcaliburEngineMode.SLAVE){
                                // check token
                                if(!self.isTokenValid(unsafeJSON.user,unsafeJSON.token)){
                                    // reject
                                    conn.sendUTF(JSON.stringify({action:'_ping', data:{ success: false, msg:'rejected' }}));
                                    return;
                                }


                                const socksess = self._usrSockets[unsafeJSON.user][unsafeJSON.token];
                                if(socksess.socket==null){
                                    socksess.socket = conn;
                                }

                            }



                            // do authent / retieve user session
                            let sess:UserSession = null;
                            if(unsafeJSON[usrSvc.getQueryParam()]!=null){
                                Logger.info("[SESSION] Opening session from websocket msg : ...");
                                sess= usrSvc.openSession(
                                    unsafeJSON[usrSvc.getQueryParam()]
                                );
                                Logger.info("[SESSION] Opening session from websocket msg : Done");
                            }


                            if(self.engine.getEngineMode()==DexcaliburEngineMode.SLAVE){
                                console.log(unsafeJSON,sess);
                            }

                            // retrieve target project
                            let prj:DexcaliburProject = null;
                            if(unsafeJSON._puid != null && sess != null){
                                //if(self.context.)
                                prj = sess.getActiveProjectByUID(self.engine, unsafeJSON._puid);
                            }


                            if(unsafeJSON['svc']!==undefined){


                                switch(unsafeJSON.svc){
                                    case 'stat':

                                        Logger.info('Received Message: ' + message.utf8Data);
                                        if(unsafeJSON.hasOwnProperty('data')) {
                                            switch (unsafeJSON.data.op) {
                                                case 'project':

                                                    if (unsafeJSON.data.hasOwnProperty('opts')) {
                                                        const wf= self.engine.getWorkflow(unsafeJSON.data.opts);
                                                        // TODO : bind user to localsessid to avoid security issue
/*

                                                        AccessControl.check(
                                                            AccessZone.PROJECT,
                                                            AccessControl.access.PROJ_OPEN_OWN,
                                                            prj,
                                                            sess.getUserAccount()
                                                        );*/

                                                        if(wf!=null){
                                                            AccessControl.check(
                                                                AccessZone.GENERIC,
                                                                AccessControl.access.GLOB_SHOW_ALL_WORKFLOWS,
                                                                wf,
                                                                sess.getUserAccount()
                                                            );

                                                            wf.sendStatus(user, conn, { localid: unsafeJSON.data.localid });
                                                        }else{
                                                            // start later
                                                            self.engine.onNewWorkflow(unsafeJSON.data.opts, ((pWorkflow:Workflow)=>{
                                                                console.log("WF : ON NEW WORKFLOW > ",unsafeJSON.data.opts)
                                                                pWorkflow.declareOwner(sess.getUserAccount(), conn, { localid: unsafeJSON.data.localid });
                                                            }));
                                                        }
                                                    }
                                                    break;
                                            }
                                        }
                                        break;
                                    case 'xterm':
                                        // TODO : check user permissions
                                        Logger.info('Received Message: ' + message.utf8Data);
                                        self.engine.getTerminalServer().processCommand(user, conn, message.utf8Data);
                                        break;
                                    case '_ping':
                                        // TODO : check user permissions
                                        conn.sendUTF(JSON.stringify({action:'_ping', data:{ success: true, msg:'pong' }}));
                                        break;
                                    case 'hookm':
                                        // TODO : check user permissions
                                        Logger.info('Received Message: ' + message.utf8Data);

                                        if(self.engine.getEngineMode()==DexcaliburEngineMode.MASTER){
                                            // TODO : retrieve node by its uuid
                                            // target project is not local
                                            // search node and forward websocket
                                            try{
                                                self.engine.getNodeManager().getReadySlave(
                                                    unsafeJSON['prj'],
                                                    NodePurpose.REVIEW
                                                ).then((vNode)=>{

                                                    Logger.info(`[Ready Slave] [WebsocketServer] [project=${unsafeJSON['prj']}] [org=null] [purpose=${NodePurpose.REVIEW}]  : ${vNode!=null? vNode.getUID() : 'KO'}`);
                                                    if(vNode!=null){
                                                        const nodeUID = vNode.getUID();
                                                        try{
                                                            if(self._wsclients[nodeUID]==null){
                                                                self._wsclients[nodeUID] = vNode.createWebsocketClient();
                                                                self._wsclients[nodeUID].setNodeUid(nodeUID);
                                                                self._wsclients[nodeUID].getWsOutput().subscribe((vMsg:any)=>{

                                                                    // INSECURE ZONE :
                                                                    // Ensure the reponse is forwarded to the right issuer
                                                                    const sss = self.getSocketOf(unsafeJSON.user, unsafeJSON.token);

                                                                    console.log(vMsg,sss.socket);
                                                                    if(sss.socket!=null){
                                                                        sss.socket.sendUTF(vMsg);
                                                                    }
                                                                })
                                                                self._wsclients[nodeUID].connectWS('term-protocol');
                                                                //this.getSocket(conn)
                                                                self._wsclients[nodeUID].sendMsg(message.utf8Data);
                                                            }else{
                                                                //this.getSocket(conn)
                                                                self._wsclients[nodeUID].sendMsg(message.utf8Data);
                                                            }
                                                        }catch(e2){
                                                            console.log("E2",e2);
                                                        }

                                                    }
                                                });
                                            }catch(eee){
                                                console.log("EEE",eee);
                                            }

                                        }else{


                                            if(!ValidationRule.uuid().test(unsafeJSON['prj'])){
                                                throw DexcaliburProjectException.INVALID_UUID_FMT(unsafeJSON['prj'])
                                            }

                                            const p = self.engine.getProject(unsafeJSON['prj']);
                                            Logger.info(`HOOK > ProcessCommand > project [uid=${p.getUID()}][mode=${self.engine.engine_type} `);

                                            if(p!=null) {
                                                (p.hook as HookManager).processCommand(user, conn, message.utf8Data);
                                            }
                                        }


                                        break;
                                }
                            }else{
                                Logger.info('Received Invalid message: ' + message.utf8Data);
                            }
                        }
                        else if (message.type === 'binary') {
                            Logger.info('Received Binary Message of ' + message.binaryData.length + ' bytes');
                            self.engine.getTerminalServer().processData(user, conn, message.binaryData);
                        }
                    }catch (err1){

                        Logger.error('[WEBSOCKET] Cmd: "project", Error : '+err1.message);
                    }


                });

                //function(reasonCode, description)
                conn.on('close', function() {

                    // do authentication (TODO)
                    let user:User = self.user;

                    Logger.info((new Date()) + ' Peer ' + conn.remoteAddress + ' disconnected.');
                    self.engine.getTerminalServer().close(user, conn);
                });

            }catch(err){
                Logger.error("[WebSocketServer] An error happened : ",err);
            }
        });
    }

    /**
     * To specify the port number to use
     *
     * TODO : should not be modifed after start, or change should restart the websocket server
     *
     * @param pNumber
     */
    setPort(pNumber:number):void {
        this.port = pNumber;
    }

    /**
     * To retrieve the port number used by the websocket server
     *
     * It is the real final port. If the websocket server didn't start, the port may be wrong.
     *
     * @since 1.8.10
     */
    getPort():number {
        return this.port;
    }

    /**
     * To start the web socket server.
     * By default the port number, is the port number of dexcalibur server + 1
     *
     * @return {number} Port number
     * @method
     * @since 1.0.0
     */
    start() :number {

        if(this.port==null){
            this.port = this.engine.getSettings().getWebserverSettings().getWsPort();
        }

        const wwwPort = this.port;


        if(this.httpServer != null){
            this.httpServer.listen(wwwPort, function () {
                Logger.success('Web socket server started on : ' + wwwPort);
            });
        }else{
            Logger.error('Web socket server cannot start on : ' + wwwPort);
        }

        return wwwPort;
    }

    getSocketOf(pUUID:UserAccountUUID, pTok:string):any {
        const s = this._usrSockets[pUUID];
        if(s==null) return null;
        return s[pTok];
    }

    addSession(pUUID:UserAccountUUID,pTok:string): void {
        if(this._usrSockets[pUUID] == null){
            this._usrSockets[pUUID] = {};
        }

        this._usrSockets[pUUID][pTok] = {
            created: (new Date()).getTime(),
            user: pUUID,
            socket: null
        };
    }
}