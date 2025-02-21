
export enum TokenPurpose {
    NONE='none',
    ACCOUNT_VERIFY='accver'
}
export interface Token<T> {
    token: string,
    purpose: TokenPurpose,
    ttl: number,
    date: number,
    extra: T
}
export interface TokenOptions<T> {
    token: string,
    purpose: TokenPurpose,
    ttl: number,
    extra?: T
}