import Util from "../Utils";
import {ConnectionTokenException} from "../errors/ConnectionTokenException";

export class ConnectionToken {

    val:string;
    expire:number;

    constructor(pToken:string, pExpire:number) {
        this.val = pToken;
        this.expire = pExpire;
    }

    getToken():string{
       if(Util.time()>this.expire){
           throw ConnectionTokenException.EXPIRED_TOKEN();
       }

       if(this.val == null){
           throw ConnectionTokenException.EMPTY_TOKEN();
       }

       return this.val;
    }
}