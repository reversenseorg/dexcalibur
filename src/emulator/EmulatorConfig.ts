import {Nullable} from "@dexcalibur/dxc-core-api";
import {MemoryBlock} from "../memory/MemoryBlock.js";
import {ModelRegister} from "../elixir/ModelRegister.js";
import {MemoryAddress} from "../memory/MemoryAddress.js";

export interface EmulatorInput {
    uid:string;
    offset:number;
    size:number;
    data:any;
}

export interface EmulatorSession {
    start:MemoryAddress;
    ends:MemoryAddress[];
    ctx?:ModelRegister[];
}

export class EmulatorConfig {

    private _ctr = 0;

    baseAddress:MemoryAddress = new MemoryAddress(BigInt(0));
    size:Nullable<number> = null;

    memRegions:MemoryBlock[] = [];
    inputs:EmulatorInput[] = [];
    cpuContext:ModelRegister[] = [];
    sessions:EmulatorSession[] = [];

    constructor(pConfig:any=null){
        if (pConfig!=null) for(let i in pConfig) this[i] = pConfig[i];
    }

    addMemory( pBlock:MemoryBlock, pOpts:any):void {
        pBlock.align = pOpts.align;

        if(pBlock.align>0){
            const al = BigInt(pBlock.align).valueOf()
            const growingDown = (pBlock.end.address<pBlock.start.address);
            const sz:bigint = growingDown ? pBlock.start.address-pBlock.end.address : pBlock.end.address-pBlock.start.address;
            if( sz % al !=0n){
                if(growingDown)
                    pBlock.end = pBlock.start.add(BigInt(Number( sz / al )+1) * al);
                else
                    pBlock.end = pBlock.start.sub(BigInt(Number( sz / al )+1) * al);
            }
        }
        this.memRegions.push(pBlock);
    }

    addInput( pData:any, pOffset:number, pSize:number, pName:Nullable<string> = null):void {
        this.inputs.push({
            uid: (pName!=null ? pName : this._generateInputUID()),
            offset: pOffset,
            size: pSize,
            data: pData
        });
    }

    addSession( pStart:MemoryAddress, pEnds:MemoryAddress[] = [], pCtx:ModelRegister[] = []):void {
        this.sessions.push({
            start: pStart,
            ends: pEnds
        });
    }

    addRelativeSession( pStart:number, pEnds:number[] = [], pCtx:ModelRegister[] = []):void {
        this.sessions.push({
            start: this.baseAddress.add(pStart),
            ends: pEnds.map( (x:number)=> this.baseAddress.add(x))
        });
    }

    setBaseAddress( pAddr:MemoryAddress):void {
        this.baseAddress = pAddr;
    }

    private _generateInputUID():string {
        return "inp-"+(this._ctr++);
    }

    toConfigOptions():any {
        return {
            baseAddress: this.baseAddress.toHex(-1),
            size: this.size,
            extra: {
                extensions: ["vfp","simd"]
            },
            memRegions: this.memRegions.map(mm => mm.toJsonObject()),
            inputs: this.inputs.map(mm => {
                return {
                    uid: mm.uid,
                    offset: mm.offset,
                    size: mm.size
                }
            }),
            sessions: this.sessions.map(s => {
                return {
                    start: s.start.toHex(-1),
                    ends: s.ends.map(x=>x.toHex(-1)),
                    ctx: (s.ctx!=null ? s.ctx : null)
                };
            }),
            cpuContext: this.cpuContext,
        };
    }
}
