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
import {GlobalAccessControl} from "./user/acl/rbac/GlobalAccessContol.js";
import {ProjectAccessControl} from "./user/acl/rbac/ProjectAccessContol.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

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

    // TODO
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

                            // do authent / retieve user session
                            let sess:UserSession = null;
                            if(unsafeJSON[usrSvc.getQueryParam()]!=null){
                                Logger.info("[SESSION] Opening session from websocket msg : ...");
                                sess= usrSvc.openSession(
                                    unsafeJSON[usrSvc.getQueryParam()]
                                );
                                Logger.info("[SESSION] Opening session from websocket msg : Done");
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


                                                        AccessControl.check(
                                                            AccessZone.PROJECT,
                                                            ProjectAccessControl.access.PROJ_OPEN_OWN,
                                                            prj,
                                                            sess.getUserAccount()
                                                        );

                                                        if(wf!=null){
                                                            AccessControl.check(
                                                                AccessZone.GENERIC,
                                                                GlobalAccessControl.access.GLOB_SHOW_ALL_WORKFLOWS,
                                                                wf,
                                                                sess.getUserAccount()
                                                            );

                                                            wf.sendStatus(user, conn, { localid: unsafeJSON.data.localid });
                                                        }else{
                                                            // start later
                                                            self.engine.onNewWorkflow(unsafeJSON.data.opts, ((pWorkflow:Workflow)=>{
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
                                        const p = self.engine.getProject(unsafeJSON['prj']);

                                        if(p!=null) {
                                            Logger.info('Retrieving hook Message from project ' + p.uid);
                                            p.hook.processCommand(user, conn, message.utf8Data);
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
     * To start the web socket server.
     * By default the port number, is the port number of dexcalibur server + 1
     *
     * @param pPort {number} Port number
     * @method
     * @since 1.0.0
     */
    start( pPort:number) :void {

        if (pPort == null) {
            this.port = this.engine.getSettings().getWebserverSettings().getWsPort();
        } else {
            this.port = pPort;
        }

        const wwwPort = this.port;

        if(this.httpServer != null){
            this.httpServer.listen(wwwPort, function () {
                Logger.success('Web socket server started on : ' + wwwPort);
            });
        }else{
            Logger.error('Web socket server cannot start on : ' + wwwPort);
        }
    }
}