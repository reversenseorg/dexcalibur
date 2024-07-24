/**
 * Represent a memory address
 */
export class MemoryAddress {

    address:bigint = BigInt(-1);

    constructor(pAddress?:bigint) {
        if(pAddress!=null){
            this.address = pAddress;
        }
    }

    add(pNumber:number|bigint):MemoryAddress{
        return new MemoryAddress(this.address + BigInt(pNumber));
    }


    sub(pNumber:number|bigint):MemoryAddress{
        return new MemoryAddress(this.address - BigInt(pNumber));
    }


    /**
     * Export to hexadecimal representation with padding
     * @param {number} pAddressSize Number of byte in the representation
     * @return {string}
     * @method
     */
    toHex(pAddressSize:number):string {
        const hex = this.address.toString(16);
        if(pAddressSize<0 || (hex.length/2>=pAddressSize)){
            return "0x"+hex;
        }else{
            return "0x"
                +(hex.length%2>0?'0':'')
                +('00'.repeat(pAddressSize-Math.round(hex.length/2)))
                +hex;
        }

    }
}