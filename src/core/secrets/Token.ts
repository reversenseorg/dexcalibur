
export enum TokenPurpose {
    NONE='none',
    ACCOUNT_VERIFY='accver'
}
export interface Token {
    token: string,
    purpose: TokenPurpose,
    ttl: number,
    date: number
}
export interface TokenOptions {
    token: string,
    purpose: TokenPurpose,
    ttl: number
}