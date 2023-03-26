/**
 * A simple structure to store DBMS connections strings
 */
export interface DbmsConnSettings {
    dbms:string;
    uri:string;
    port: number;
    user:string;
    pwd:string;
}