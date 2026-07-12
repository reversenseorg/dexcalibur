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

import {IBridge} from "./Bridge.js";
import Utils from "./Utils.js";
import {CoreDebug} from "./core/CoreDebug.js";

export enum PrivilegedExecutionType {
    BINARY='b',
    COMMAND='c',
    WRAPPER_MODE='w',
    INTENT='i',
    HOST_COMMAND='h',
    BRIDGE_COMMAND="bc"
}

/**
 *
 */
export class PrivilegedExecutionPhase {

    name:string;
    type:PrivilegedExecutionType = PrivilegedExecutionType.BINARY;

    bridgeCmd = '';
    devBin = '';
    devBinArgs:string[] = [];
    /**
     * Host-side binary to execute
     * @field
     */
    hostBin = '';
    /**
     * Arguments for host-side binary
     * @field
     */
    hostBinArgs:string[] = [];

    final:boolean;

    constructor(pConfig:any) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }


    isFinal():boolean {
        return this.final;
    }

    isHostSide():boolean {
        return (this.type===PrivilegedExecutionType.HOST_COMMAND);
    }

    setBridgeCommand( pCommand:string):void {
        this.bridgeCmd = pCommand;
    }

    setBinary( pBinary:string, pArgs:string[] = []):void {
        this.devBin = pBinary;
        this.devBinArgs = pArgs;
    }

    setHostBinary( pBinary:string, pArgs:string[] = []):void {
        this.hostBin = pBinary;
        this.hostBinArgs = pArgs;
    }


    addBinaryArg( pArg:string):void {
        this.devBinArgs.push( pArg);
    }

    isCommand():boolean {
        return (this.type===PrivilegedExecutionType.COMMAND || this.type===PrivilegedExecutionType.HOST_COMMAND);
    }

    /**
     * To wrap the specified command to execute with privileges inside
     * a more complete command from the phase
     *
     * This method supports the token `@@__COMMAND__@@`
     *
     *
     * @param {string} pCommand Optional. Default value is an empty string.
     * @return {string} Prepared command to execute in order to perform a privileged action
     * @method
     */
    wrapCommandString( pCommand = ""):string {
        let base = `${this.bridgeCmd} ${this.devBin} ${this.devBinArgs.join(' ')}`;
        if(base.indexOf("@@__COMMAND__@@")>-1){
            base = base.replaceAll("@@__COMMAND__@@", pCommand);
        }else{
            base  += " "+pCommand;
        }
        return base;
    }

    /**
     * To wrap the specified command to execute with privileges inside
     * a more complete command from the phase redacted as an array of params
     *
     * @param {string[]} pCommand Optional. Default value is an empty string.
     * @return {string[]} Prepared command to execute in order to perform a privileged action
     * @method
     */
    wrapCommandArr( pCommandParts:string[] = []):string[] {
        let cmd:string[]=[];

        if(this.bridgeCmd!=null && this.bridgeCmd!='')
            cmd.push(this.bridgeCmd);
        if(this.devBin!=null && this.devBin!='')
            cmd.push(this.devBin);
        if(this.devBinArgs!=null && this.devBinArgs.length>0)
            cmd = cmd.concat(this.devBinArgs);

        return cmd.concat(pCommandParts);
    }

    /**
     *
     * @param pBridge
     */
    execNonCommand( pBridge:IBridge):void {
        switch (this.type){
            case PrivilegedExecutionType.BINARY:
                pBridge.shellWithEHsync( `${this.devBin} ${this.devBinArgs.join(' ')}`);
                break;

            case PrivilegedExecutionType.WRAPPER_MODE:
                // this mode is not supported when the phase is not a final phase
                break;
            case PrivilegedExecutionType.HOST_COMMAND:
                Utils.execSync( `${this.hostBin} ${this.hostBinArgs.join(' ')}`);
                break;
            case PrivilegedExecutionType.BRIDGE_COMMAND:
                pBridge.execBridgeCommand(
                    this.bridgeCmd,
                    (this.devBin!=null)? this.devBin : "",
                    (this.devBinArgs!=null)? this.devBinArgs : [],
                );
                break;
        }
    }

    toJsonObject():any{
        let o:any  = {};
        o.name = this.name;
        o.type = this.type;
        o.bridgeCmd = this.bridgeCmd;
        o.devBin = this.devBin;
        o.devBinArgs = this.devBinArgs;
        o.final = this.final;
        CoreDebug.checkJsonSerialize(o, "PrivilegedExecutionPhase");
        return o;
    }
}


export enum StrategyTrigger {
    CMD_EXEC = 'cmd_exec',
    DEV_BOOT = 'dev_boot',
    DEV_LIST = 'dev_list',
    PROJ_START = 'proj_start'
}


export interface PrivilegedExecutionStrategyOpts {
    name?:string;
    description?:string;
    bridge?:IBridge;
    phases?:PrivilegedExecutionPhase[];
    _trigger?:StrategyTrigger;
}


/**
 * Represent a named set of command/action to perform to be able to execute
 * command with root privilege on the target device
 *
 * @class
 */
export class PrivilegedExecutionStrategy {

    /**
     * Set name
     * @type {string}
     * @field
     */
    name:string;

    /**
     * Description of the strategy
     *
     * @type {string}
     * @field
     */
    description:string = "";

    /**
     * The bridge to use
     * @type {IBridge}
     * @field
     */
    bridge:IBridge;

    /**
     * A list of steps to execute prior to be able run a command as root
     * @type {PrivilegedExecutionPhase[]}
     * @field
     */
    phases:PrivilegedExecutionPhase[] = [];

    /**
     * @type {StrategyTrigger} Default value is `StrategyTrigger.CMD_EXEC`
     * @field
     * @private
     */
    _trigger:StrategyTrigger = StrategyTrigger.CMD_EXEC;

    private _executed:boolean = false;

    constructor(pConfig:PrivilegedExecutionStrategyOpts) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

    /**
     * To set when the EoP must be executed
     * @param {StrategyTrigger} pTrigger
     */
    setTrigger(pTrigger:StrategyTrigger):void {
        this._trigger = pTrigger;
    }

    setBridge(pBridge:IBridge):void {
        this.bridge = pBridge;
    }


    /**
     * To check if the strategy has been already executed
     */
    hasRun():boolean {
        return this._executed;
    }

    /**
     * To check if the currrent strategy must be executed for
     * specified event
     *
     * @param {StrategyTrigger} pEvent
     * @method
     */
    mustRun(pEvent:StrategyTrigger):boolean {
        return (this._trigger===pEvent);
    }

    addPhase( pPhase:PrivilegedExecutionPhase):void {
        this.phases.push(pPhase);
    }

    /**
     * To run a strategy independent of command that require EoP
     * @method
     */
    run(){
        for(let i=0; i<this.phases.length; i++){
            // replace isPriv by isFinal
            this.phases[i].execNonCommand(this.bridge);
        }

        this._executed = true;
    }

    /**
     * To check if the command must be prepared
     */
    requirePrepare(){
        if(this._trigger==StrategyTrigger.CMD_EXEC){
            return true
        }else if(!this.hasRun() &&
            ((this._trigger==StrategyTrigger.DEV_BOOT)
                ||(this._trigger==StrategyTrigger.DEV_LIST)
                ||(this._trigger==StrategyTrigger.PROJ_START))){

            this.run();
            return false;
        }

        return false;
    }
    /**
     * To execute all phases required to exec a privileged command
     *
     * @param pBridge
     */
    prepareString( pCommand:string, pBridge:IBridge = null ):string {
        const bridge = pBridge===null ? this.bridge : pBridge;
        const pph:PrivilegedExecutionPhase[] = [];

        // execute only if the strategy must be executed prior to each command
        // of if the strategy has been never executed
        if(this._trigger==StrategyTrigger.CMD_EXEC){
            for(let i=0; i<this.phases.length; i++){
                // replace isPriv by isFinal
                if(!this.phases[i].isFinal()){
                    this.phases[i].execNonCommand(bridge);
                }

                if(i==(this.phases.length-1)){
                    pph.push(this.phases[i]);
                }

            }
        }else if(!this.hasRun() &&
            ((this._trigger==StrategyTrigger.DEV_BOOT)
                ||(this._trigger==StrategyTrigger.DEV_LIST)
                ||(this._trigger==StrategyTrigger.PROJ_START))){

            this.run();
        }

        if(pph.length>0){
            return pph.pop().wrapCommandString(pCommand);
        }else{
            return pCommand;
        }


    }

    /**
     * To execute (if needed) some step prior to execute the command
     *
     * @param pCommand
     * @param pBridge
     */
    prepareArray( pCommand:string[], pBridge:IBridge = null  ):string[] {
        const bridge = pBridge===null ? this.bridge : pBridge;
        const pph:PrivilegedExecutionPhase[] = [];


        // execute only if the strategy must be executed prior to each command
        // or if the strategy has been never executed
        if(this._trigger==StrategyTrigger.CMD_EXEC){
            for(let i=0; i<this.phases.length; i++){
                // replace isPriv by isFinal
                if(!this.phases[i].isFinal()){
                    this.phases[i].execNonCommand(bridge);
                }

                if(i==(this.phases.length-1)){
                    pph.push(this.phases[i]);
                }
            }
        }

        if(pph.length>0){
            return pph.pop().wrapCommandArr(pCommand);
        }else{
            return pCommand;
        }
    }

    toJsonObject():any{
        let o:any  = {};
        o.name = this.name;
        o.phases = [];
        o.description = this.description;
        o._trigger = this._trigger;
        // skip _executed =>  it must not be saved
        for(let i=0; i<this.phases.length; i++){
            o.phases[i] = this.phases[i].toJsonObject();
        }

        CoreDebug.checkJsonSerialize(o, "PrivilegedExecutionStrategy");
        return o;
    }

    static fromJsonObject(pStrategy: any):PrivilegedExecutionStrategy {
        const o = new PrivilegedExecutionStrategy(pStrategy);

        if(o.phases.length>0){
            o.phases.map((vPhase:PrivilegedExecutionPhase, vIndex:number)=>{
                o.phases[vIndex] = new PrivilegedExecutionPhase(vPhase);
            })
        }
        return o;
    }
}