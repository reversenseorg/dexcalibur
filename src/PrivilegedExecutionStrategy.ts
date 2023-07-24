import {IBridge} from "./Bridge.js";
import Utils from "./Utils.js";
import {CoreDebug} from "./core/CoreDebug.js";

export enum PrivilegedExecutionType {
    BINARY='b',
    COMMAND='c',
    WRAPPER_MODE='w',
    INTENT='i',
    HOST_COMMAND='h'
}


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

    priv:boolean;

    constructor(pConfig:any) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

    setPrivileged(pBool:boolean):void {
        this.priv =  pBool;
    }

    isPrivileged():boolean {
        return this.priv;
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

    wrapCommandString( pCommand = ""):string {
        return `${this.bridgeCmd} ${this.devBin} ${this.devBinArgs.join(' ')} ${pCommand}`;
    }

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
                pBridge.execBridgeCommand(this.bridgeCmd);
                break;
            case PrivilegedExecutionType.HOST_COMMAND:
                Utils.execSync( `${this.hostBin} ${this.hostBinArgs.join(' ')}`);
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
        o.priv = this.priv;
        CoreDebug.checkJsonSerialize(o, "PrivilegedExecutionPhase");
        return o;
    }
}

export interface PrivilegedExecutionStrategyMap {
    [name:string] :PrivilegedExecutionStrategy
}


export enum StrategyTrigger {
    CMD_EXEC,
    DEV_LIST
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
    private _trigger:StrategyTrigger = StrategyTrigger.CMD_EXEC;

    private _executed:boolean = false;

    constructor(pConfig:any) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
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
     * To execute all phases required to exec a privileged command
     *
     * @param pBridge
     */
    prepareString( pCommand:string, pBridge:IBridge = null ):string {
        const bridge = pBridge===null ? this.bridge : pBridge;
        const pph:PrivilegedExecutionPhase[] = [];

        // execute only if the strategy must be executed prior to each command
        // of if the strategy has been never executed
        if(this._trigger==StrategyTrigger.CMD_EXEC || !this.hasRun()){
            for(let i=0; i<this.phases.length; i++){
                // replace isPriv by isFinal
                if(!this.phases[i].isPrivileged()){
                    this.phases[i].execNonCommand(bridge);
                }

                if(i==(this.phases.length-1)){
                    pph.push(this.phases[i]);
                }

            }
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
        // of if the strategy has been never executed
        if(this._trigger==StrategyTrigger.CMD_EXEC || !this.hasRun()){
            for(let i=0; i<this.phases.length; i++){
                // replace isPriv by isFinal
                if(!this.phases[i].isPrivileged()){
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
        for(let i=0; i<this.phases.length; i++){
            o.phases[i] = this.phases[i].toJsonObject();
        }
        CoreDebug.checkJsonSerialize(o, "PrivilegedExecutionStrategy");
        return o;
    }
}