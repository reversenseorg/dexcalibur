/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import * as VM from "vm";
import DexcaliburEngine from "./DexcaliburEngine.js";
import {PATCHES} from "./internals/patches.js";
import {DXC_LIFECYCLE_EVENT} from "./CoreConst.js";
import DexcaliburProject from "./DexcaliburProject.js";
import {OrganizationUnit} from "./organization/OrganizationUnit.js";
import {BusinessPlan} from "./billing/BusinessPlan.js";


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
  _code:any;

  version:string;
  time:string;
  descr:string;
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
  async execute( pEngine:DexcaliburEngine, pExtra:any = null):Promise<void>{
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
      await this._code.call( null, vmContext);
    }


    return ;
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

  patches:DexcaliburPatch[] = [new DexcaliburPatch({
    ev: DXC_LIFECYCLE_EVENT.ENG_AFTER_BOOT,
    time: "22/07/2025",
    version: "1.0.0",
    descr: "Patch organization unit created by engine < X to set new BusinessPlan",
    _code:  async (pCtx:{ENGINE:DexcaliburEngine,PROJECT?:DexcaliburProject}):Promise<void>=>{

      const orgs = await pCtx.ENGINE.getOrgManager().listOrganizations(
          pCtx.ENGINE.getInternalAcc()
      );

      for(let i=0; i<orgs.length; i++){
        let bp:BusinessPlan;
        try{
          bp = orgs[i].getBusinessPlan();
          if(bp.isDeprecated()){
            orgs[i].createBusinessPlan({ thresholds: { concurrentNodes: 3 }});
            await pCtx.ENGINE.getOrgManager().updateOrganization(
                pCtx.ENGINE.getInternalAcc(),
                orgs[i],
                {
                  businessPlan: orgs[i].getBusinessPlan()
                }
            );
            console.log(`Business plan of ${orgs[i].getUID()} organization have been updated`);
          }else{
            console.log(`Business plan of ${orgs[i].getUID()} organization is up-to-date`);
          }
        }catch (e){
          if(bp==null){
            bp = new BusinessPlan({
              org: orgs[i].getUID()
            })
          }
        }

      }
    }
  })];


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
  async run( pEvent:DXC_LIFECYCLE_EVENT, pExtra:any = null):Promise<void>{
    for(let i=0; i<this.patches.length; i++){
      if(this.patches[i].ev === pEvent){
        await this.patches[i].execute( this.engine, pExtra);
      }
    }
  }
}
