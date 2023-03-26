import {AbiException} from "../errors/AbiException.js";

export enum AddressSize {
    BITS_128=128,   // floating register
    BITS_64=64,
    BITS_32=32,
    BITS_16=16,
    BITS_8=8
}

export enum AbiType {
    arm_v5='armv5',
    armeabi='armeabi-v7a',
    armeabi_v7a='armeabi-v7a',
    arm64_v8a='arm64-v8a',
    x86='x86',
    x86_64='x86_64',
    mips='mips',
    mips64='mips64',
}

export enum InstructionSet {
    ARMEABI='armeabi',
    THUMB2='Thumb-2',
    VFPV3='VFPv3-D16',
    AARCH64='AArch64',
    AARCH32='AArch32',
    x86='x86',
    x86_64='x86_64',
    MIPS='mips',
    MIPS_64='mips64',
}


export class ABI {
    name:string ;

    altNames:string[];
    /**
     * Max address size supported
     */
    asize: AddressSize;
    instrSet:InstructionSet[] = [];
    weight = 0;

    constructor( pConfig:any) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }


}


/**
 * A class to explore ABIs from the knowledge DB
 *
 * @class
 */
export class AbiManager {

    // TODO add armeabi
    static ABI:any = {
        [AbiType.arm_v5]: new ABI({
            name:AbiType.arm_v5,
            asize: AddressSize.BITS_32,
            instrSet:[
                InstructionSet.ARMEABI] }),
        [AbiType.arm64_v8a]: new ABI({
            name:AbiType.arm64_v8a,
            asize: AddressSize.BITS_64,
            instrSet:[
                InstructionSet.AARCH64] }),
        [AbiType.armeabi_v7a]: new ABI({
            name:AbiType.armeabi_v7a,
            asize: AddressSize.BITS_32,
            weight:1,
            instrSet:[
                InstructionSet.ARMEABI,
                InstructionSet.THUMB2,
                InstructionSet.VFPV3]  }),
        [AbiType.armeabi]: new ABI({
            name:AbiType.armeabi,
            asize: AddressSize.BITS_32,
            weight:0 }),
        [AbiType.x86_64]: new ABI({
            name:AbiType.x86_64,
            asize: AddressSize.BITS_64,
            instrSet:[
                InstructionSet.x86_64] }),
        [AbiType.x86]: new ABI({
            name:AbiType.x86,
            asize: AddressSize.BITS_32,
            instrSet:[
                InstructionSet.x86] }),
        [AbiType.mips]: new ABI({
            name:AbiType.mips,
            asize: AddressSize.BITS_32,
            instrSet:[
                InstructionSet.MIPS] }),
        [AbiType.mips64]: new ABI({
            name:AbiType.mips64,
            asize: AddressSize.BITS_64,
            instrSet:[
                InstructionSet.MIPS_64] })
    }

    /**
     * To get all ISA supported by an ABI
     *
     * @param {AbiType} pAbi
     * @return {InstructionSet[]} A list of ISA
     * @method
     * @since 1.1.0
     */
    static getISAsFromABI( pAbi:AbiType):InstructionSet[]{
        if(AbiManager.ABI[pAbi] != null){
            return (AbiManager.ABI[pAbi] as ABI).instrSet;
        }else {
            throw AbiException.UNKNOW_ABI(pAbi);
        }
    }


    /**
     * To get a list of ABI instance from a single ABI name or a list of ABI name
     *
     * @param {AbiType | AbiType[]} pAbi One or several ABI name
     * @return { ABI[] } A list of ABI instances
     * @method
     * @since 1.0.0
     */
    static from( pAbi:string | string[]): ABI[] {
        const abis = (!Array.isArray(pAbi)? [pAbi] : pAbi);
        const out:ABI[] = [];
        abis.map( (pAbiName:string)=>{
            if(AbiManager.ABI[pAbiName] != null){
                out.push( AbiManager.ABI[pAbiName] );
            }/*else {
                throw AbiException.UNKNOW_ABI(pAbiName);
            }*/
        });
        return out;
    }
}