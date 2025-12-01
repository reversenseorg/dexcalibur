
export interface MagicSignature {
    offset:number,
    magic:string,
    next?:MagicSignature[]
}