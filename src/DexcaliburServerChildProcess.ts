import DexcaliburEngine from "./DexcaliburEngine";
import * as assert from "assert";
import * as _fs_ from "fs";
import * as _os_ from "os";
import {Settings} from "./Settings";


// TODO : remove before prod
//const LOG_ENABLED = true;

const LOG_FILE = (process.env.DXC_LOG_PATH ? process.env.DXC_LOG_PATH : null);
function __log( pMessage:string):void{
  if(LOG_FILE!=null)
    _fs_.appendFileSync(LOG_FILE, pMessage+_os_.EOL);
}

export enum IpcMode {
  API = 'API',
  WAIT = 'WAIT'
}

export interface IpcMessage {
  cmd: string;
  data: any;
}




/**
 * Represents the Dexcalibur Engine
 * when dexcalibur is spawned from another process
 *
 * To offers IPC API
 *
 * @class
 * @export
 * @since 1.0.0
 */
export class DexcaliburServerChildProcess {

  /**
   * TRUE if the server is active, else FALSE
   * @type {boolean}
   * @field
   */
  active:boolean = true;

  /**
   * @type {DexcaliburEngine}
   * @field
   */
  engine:DexcaliburEngine = null;

  /**
   * Dexcalibur server main process
   * @type {NodeJS.Process}
   * @field
   */
  process:any = null;

  /**
   *
   * Send back an 'initialized' message over IPC
   *
   * @param {NodeJS.Process} pProcess Process reference
   * @constructor
   */
  constructor( pProcess:any) {

    let self:DexcaliburServerChildProcess = this;
    this.process = pProcess;

    __log('[DXC-SRV][PROCESS] init ...');
    this.process.on('message', (pMsg)=>{

      const msg = JSON.parse(pMsg);
      __log('[DXC-SRV][IPC-HANDLER] Received : '+msg.cmd);
      self.dispatch(msg);
    });

    this.send( { cmd:'initialized', data:{ msg: 'New dxc-server instance OK' }});
  }

  /*
  ----------------- IPC HANDLER --------------------
   */

  /**
   * All commands below are supported:
   *
   * - `start` : Get, or create a new, DexcaliburEngine instance, see start() for more options
   * - `install` : REMOVED
   * - `reinstall` : REMOVED
   * - `project-ready` :
   *
   *
   * @param {any}
   * @method
   * @since 1.0.0
   */
  dispatch( pMessage:IpcMessage):void {

    __log('[DXC-SRV][DISPATCH-IPC] Active : '+(this.active?'true':'false'));
    __log('[DXC-SRV][DISPATCH-IPC] Caught message : '+pMessage.cmd);
    if(this.active === false) return;

    try{
      switch(pMessage.cmd){
        case 'start':
          this.engine = DexcaliburEngine.getInstance();
          this.start(pMessage.data);
          break;
        case 'project-ready':
          this.isProjectReady(pMessage.data);
          break;
        default:
          __log('[DXC-SRV][DISPATCH-IPC] Invalid IPC command : '+pMessage.cmd);
          break;
      }
    }catch(err){
      __log(`[DXC-SRV][DISPATCH-IPC] Exception caught : 
        ${err.message}
      `);
    }

  }

  /**
   *
   * @param pMessage
   */
  send( pMessage:any):void {

    __log('[DXC-SRV][PROCESS] PID : '+this.process.pid );
    __log('[DXC-SRV][SEND-IPC] Send message : '+pMessage.cmd);
    this.process.send( pMessage);
  }

  /*
  ---------------- DXC BOOTLOADER -------------
   */

  /**
   * To start Dexcalibur server through IPC
   *
   * If no options are passed, Dexcalibur read configuration file at default location
   * (<APP>/dxc.config.json).
   *
   * If no options are passed AND Dexcalibur requires install, then a warning message
   * is sent back over IPC
   *
   * Options supported :
   * - `cfg` [String] Path of configuration file
   *
   * @param {any} pOptions Optional. A set of options for "start"
   * @method
   * @since 1.0.0
   */
  start(pOptions:any = {}):void {

    let ready:boolean=false;
    let cfg:Settings.GlobalSettings;


    __log('[DXC-SRV][IPC] settings receipt : '+JSON.stringify(pOptions));

    if(pOptions.hasOwnProperty('cfg') && _fs_.existsSync(pOptions.cfg)){
        //this.engine.setConfigurationPath(pOptions.cfg);
        cfg = Settings.GlobalSettings.load(pOptions.cfg);
    }else if(DexcaliburEngine.requireInstall()){
       // not implemented
        this.send({ cmd:'started', data: { success:false, msg:'Dexcalibur is not installed'}});
        return;
    }


    if(cfg === undefined){
      cfg = Settings.GlobalSettings.load();
    }


    __log('[DXC-SRV][IPC] Global settings loaded : '+cfg.toJson()); //JSON.stringify(cfg.toObject()));

    let dxcWebRoot:string = null;

    this.engine.loadConfiguration(cfg);

    ready = this.engine.boot(
      pOptions.restore===true? true : false,
      dxcWebRoot
    );


    if(ready){
      this.engine.start(pOptions.port);
      __log('[DXC-SRV][IPC] Dexcalibur engine has started.');
      this.send( {cmd:'started', data: {success:true }});
      return ;
    }else{
      __log('[DXC-SRV][IPC] Dexcalibur engine is not ready.');
      this.send( {cmd:'started', data: {success:false, msg:'Dexcalibur engine is not ready.' }});
      return ;
    }
  }


  isProjectReady(pOptions:any):void {
    if(!pOptions.hasOwnProperty('uid')){
      __log('[DXC-SRV][IPC] isProjectReady : Invalid project UID');
      this.send( {cmd:'project-ready', data: { ready:false, error:true, msg:'Invalid project UID' }});
      return ;
    }

    this.send( {cmd:'project-ready', data: {
      ready: (this.engine.getProject(pOptions.uid)!==null)
    }});
  }

  /**
   * To disable IPC
   *
   * @method
   * @since 1.0.0
   */
  disable():void{
    this.active = false;
  }

  /**
   * To get process ref
   *
   *
   */
  getProcess():any {
    return this.process;
  }
}
