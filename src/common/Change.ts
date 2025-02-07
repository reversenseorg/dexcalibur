import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";


export interface IChange {
    version:string,
    date:number,
    description?:string,
    author?:UserAccountUUID,
}