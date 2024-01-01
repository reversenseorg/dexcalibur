import * as VM from "vm";
import DexcaliburEngine from "./DexcaliburEngine.js";
import {PATCHES} from "./internals/patches.js";
import {DXC_LIFECYCLE_EVENT} from "./CoreConst.js";


/**
 * A DexcaliburPatch is a way to patch project instance or other at
 * runtime without restarting server
 *
 * @class
 */
export class DexcaliburPatch {

  /**
   * A function or a piece of JS code to evaluate in context
   * @type
   * @private
   */
  private _code:any;

  version:string;
  time:string;
  desr:string;
  ev:DXC_LIFECYCLE_EVENT;

  constructor(pConfig:any) {
    for(const i in pConfig){
      this[i] = pConfig[i];
    }
  }

  static fromJsonObject( pConfig:any):DexcaliburPatch {
    return new DexcaliburPatch(pConfig);
  }

  /**
   * Execute the patch for the specified engine instance and project
   *
   * @param pEngine
   * @param pProject
   */
  execute( pEngine:DexcaliburEngine, pExtra:any = null){
    // TODO: verify code signature
    const vmContext:any = { ENGINE:pEngine };

    switch(this.ev) {
      case DXC_LIFECYCLE_EVENT.NEW_PROJECT:
      case DXC_LIFECYCLE_EVENT.OPEN_PROJECT:
      case DXC_LIFECYCLE_EVENT.CLOSE_PROJECT:
        vmContext.PROJECT = pExtra;
        break;
    }

    if(typeof this._code === "string"){
      VM.runInContext( this._code, vmContext);
    }else{
      this._code.call( null, vmContext);
    }


    return true;
  }
}

interface DexcaliburUpdaterMap {
  [engineUID:string] :DexcaliburUpdater
}

const gUpdaters:DexcaliburUpdaterMap = {};

/**
 * An updater is unique per Dexcalibur engine
 *
 * It provides some hooks inside DexcaliburEngine lifecycle
 * to dynamically modify behavior.
 *
 * TODO : replace by Event streams
 * Oriented-Aspect Programming
 *
 * @class
 */
export class DexcaliburUpdater {


  engine:DexcaliburEngine = null;

  patches:DexcaliburPatch[] = [];


  constructor(pEngine:DexcaliburEngine) {
    this.engine =   pEngine;
    PATCHES.map( vConfig => {
      this.patches.push( DexcaliburPatch.fromJsonObject(vConfig));
    });
  }

  static getInstance(pEngine:DexcaliburEngine):DexcaliburUpdater{
    if(gUpdaters[pEngine.UID]==null){
      gUpdaters[pEngine.UID] = new DexcaliburUpdater(pEngine);
    }

    return gUpdaters[pEngine.UID];
  }


  /**
   * To execute every patches registered for this event
   *
   * @param {DXC_LIFECYCLE_EVENT} pEvent
   * @param {*} pExtra
   * @method
   */
  run( pEvent:DXC_LIFECYCLE_EVENT, pExtra:any = null):void{
    this.patches.map( (vPath:DexcaliburPatch)=>{
      if(vPath.ev === pEvent){
        vPath.execute( this.engine, pExtra);
      }
    });
  }
}
