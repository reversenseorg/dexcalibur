import {IBridge} from "./Bridge";

export enum PrivilegedExecutionType {
    BINARY='b',
    COMMAND='c',
    WRAPPER_MODE='w',
    INTENT='i'
}


export class PrivilegedExecutionPhase {

    name:string;
    type:PrivilegedExecutionType = PrivilegedExecutionType.BINARY;

    bridgeCmd = '';
    devBin = '';
    devBinArgs:string[] = [];
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


    setBridgeCommand( pCommand:string):void {
        this.bridgeCmd = pCommand;
    }

    setBinary( pBinary:string, pArgs:string[] = []):void {
        this.devBin = pBinary;
        this.devBinArgs = pArgs;
    }

    addBinaryArg( pArg:string):void {
        this.devBinArgs.push( pArg);
    }

    isCommand():boolean {
        return (this.type===PrivilegedExecutionType.COMMAND);
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

    execNonCommand( pBridge:IBridge):void {
        switch (this.type){
            case PrivilegedExecutionType.BINARY:
                pBridge.shellWithEHsync( `${this.devBin} ${this.devBinArgs.join(' ')}`);
                break;
            case PrivilegedExecutionType.WRAPPER_MODE:
                pBridge.execBridgeCommand(this.bridgeCmd);
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
        return o;
    }
}

export interface PrivilegedExecutionStrategyMap {
    [name:string] :PrivilegedExecutionStrategy
}

export class PrivilegedExecutionStrategy {

    name:string;
    bridge:IBridge;
    phases:PrivilegedExecutionPhase[] = [];

    constructor(pConfig:any) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

    setBridge(pBridge:IBridge):void {
        this.bridge = pBridge;
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
        for(let i=0; i<this.phases.length; i++){
            // replace isPriv by isFinal
            if(!this.phases[i].isPrivileged()){
                this.phases[i].execNonCommand(pBridge);
            }else{
                pph.push(this.phases[i]);
            }
        }

        /*
        pph.map( (pPhase:PrivilegedExecutionPhase) => {
            pPhase.run(pBridge);
        });*/

        return pph.pop().wrapCommandString(pCommand);
    }

    prepareArray( pCommand:string[], pBridge:IBridge = null  ):string[] {
        const bridge = pBridge===null ? this.bridge : pBridge;
        const pph:PrivilegedExecutionPhase[] = [];
        for(let i=0; i<this.phases.length; i++){
            // replace isPriv by isFinal
            if(!this.phases[i].isPrivileged()){
                this.phases[i].execNonCommand(pBridge);
            }else{
                pph.push(this.phases[i]);
            }
        }

        /*
        pph.map( (pPhase:PrivilegedExecutionPhase) => {
            pPhase.run(pBridge);
        });*/

        return pph.pop().wrapCommandArr(pCommand);
    }

    toJsonObject():any{
        let o:any  = {};
        o.name = this.name;
        o.phases = [];
        for(let i=0; i<this.phases.length; i++){
            o.phases[i] = this.phases[i].toJsonObject();
        }
        return o;
    }
}