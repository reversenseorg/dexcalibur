/**
 * Security Zone helps to prevent sensitive data to be leak
 * to web client or into log files by serialize functions
 */
export enum SecurityZone {
    PUBLIC= 'pub',
    PRIVATE='priv',
    LOG='log'
}