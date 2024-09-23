import {RegisterSpace} from "../core/RegisterSpace.js";
import {MemoryBlock} from "../../memory/MemoryBlock.js";
import {Endianness} from "../../core/Endianness.js";

export class DalvikProcessor {

    endianness = Endianness.LITTLE_ENDIAN;

    regs:Record<string, RegisterSpace> = {};
    spaces:Record<string, MemoryBlock> = {};

    constructor() {
        // create ref / constant pool
        // create memory space

        // create register spaces
        this.regs["ret"] = RegisterSpace.fromSpec("p", 1, 0x0, 4);
        this.regs["ret_wide"] = RegisterSpace.fromSpec("p", 1, 0x8, 8);
        this.regs["param"] = RegisterSpace.fromSpec("p", 16, 0x100, 4);
        this.regs["param_wide_odd"] = RegisterSpace.fromSpec("p", 16, 0x104, 8, 1);
        this.regs["param_wide_even"] = RegisterSpace.fromSpec("p", 16, 0x100, 8);
        this.regs["local"] = RegisterSpace.fromSpec("v", 255, 0x1000, 4);
        this.regs["local_wide_odd"] = RegisterSpace.fromSpec("v", 255, 0x1004, 4, 1);
        this.regs["local_wide_even"] = RegisterSpace.fromSpec("v", 255, 0x1000, 4);
    }
}