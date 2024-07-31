import {MemoryAddress} from "./MemoryAddress.js";
import {Nullable} from "../core/IStringIndex.js";
import {TagUUID} from "@dexcalibur/dexcalibur-orm";


export enum MemoryBlockPermission {
 READ=0b1,
 WRITE=0b10,
 EXECUTE=0b100
}

export type MemoryBlockRef = string;

export class MemoryBlock {

    name:Nullable<string> = null;
    description: string = "";
    perm:number;
    start:MemoryAddress;
    end:MemoryAddress;

    children:MemoryBlock[] = [];

    tags:TagUUID[]

    constructor() {
    }

    static fromAddressRange( pStart:MemoryAddress, pEnd:MemoryAddress):MemoryBlock{
        const b = new MemoryBlock();
        b.setEnd(pEnd);
        b.setStart(pStart);
        return b;
    }

    getRef(pAddressSize:number = 8):MemoryBlockRef {
        return `${this.start.toHex(pAddressSize)}-${this.end.toHex(pAddressSize)}`;
    }

    setStart(pAddress:MemoryAddress):void {
        this.start = pAddress;
    }

    setEnd(pAddress:MemoryAddress):void {
        this.end = pAddress;
    }

    changeReadable(pState:boolean){
        this.changePerm(pState, MemoryBlockPermission.READ);
    }

    changeExecutable(pState:boolean){
        this.changePerm(pState, MemoryBlockPermission.EXECUTE);
    }

    changeWritable(pState:boolean){
        this.changePerm(pState, MemoryBlockPermission.WRITE);
    }

    changePerm(pState:boolean, pMask:MemoryBlockPermission){
        if(pState){
            if((this.perm & pMask)==0){
                this.perm = this.perm | pMask;
            }
        }else{
            if((this.perm & pMask)==0){
                this.perm = this.perm ^ pMask;
            }
        }

    }


    toJsonObject():any {
        let o:any = {
            name: this.name,
            description: this.description,
            perm: this.perm,
            tags: this.tags,
            children: [],
            start: null,
            end: null
        };

        if(this.start!=null){
            o.start = this.start.toHex(8);
        }

        if(this.end!=null){
            o.end = this.end.toHex(8);
        }



        if(this.children!=null){
            this.children.map(x => {
                if(x!=null)  o.children.push(x.toJsonObject());
            })
        }

        return o;
    }

    static fromJsonObject(pObject:any):MemoryBlock {
        const o = new MemoryBlock();
        o.name = pObject.name;
        o.description = pObject.description;
        o.perm = pObject.perm;
        o.start = (pObject.start!=null ? new MemoryAddress(pObject.start) : null);
        o.end = (pObject.end!=null ? new MemoryAddress(pObject.end) : null);
        o.children = [];
        pObject.children.map(x => {
            o.children.push(MemoryBlock.fromJsonObject(x));
        })
        o.tags = pObject.tags;

        return o;
    }
}