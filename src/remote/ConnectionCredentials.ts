import Util from "../Utils";
import {AuthType} from "../user/auth/AuthTypes";


export class ConnectionCredentials {
     type:AuthType = AuthType.PASSWORD;
     username:string;
     cred:any;
     mask_A:string;
     mask_B:string;

     constructor() {
         this.mask_A = Util.randString(16, Util.ALPHANUM);
         this.mask_B = Util.randString(16, Util.ALPHANUM);
     }

    static _mask( pVal:string, pMask:string) :string {
         let o:string = "";
         for(let i=0; i<pVal.length; i++){
             o += pVal.charCodeAt(i) ^ pMask.charCodeAt(i%16);
         }
         return o;
     }

    setType(pType:AuthType):void {
         this.type = pType;
    }

    setCredential(pCred:string):ConnectionCredentials {
        this.mask_B = Util.randString(16, Util.ALPHANUM);
        this.cred = "";
        for(let i=0; i<pCred.length; i++){
            this.cred += pCred.charCodeAt(i) ^ this.mask_B.charCodeAt(i%16);
        }
        return this;
    }

    setUsername(pName:string):ConnectionCredentials {
        this.mask_A = Util.randString(16, Util.ALPHANUM);
        this.username = "";
        for(let i=0; i<pName.length; i++){
            this.username += pName.charCodeAt(i) ^ this.mask_A.charCodeAt(i%16);
        }
        return this;
    }
}