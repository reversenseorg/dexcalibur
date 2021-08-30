import {IDexcaliburEngine} from "../IDexcaliburEngine";
import {DexcaliburConnectionParams} from "./DexcaliburConnectionParams";
import {ConnectionCredentials} from "./ConnectionCredentials";
import {ConnectionHandler} from "./ConnectionHandler";
import {AuthType} from "../user/auth/AuthTypes";
import {ConnectionManagerException} from "../errors/ConnectionManagerException";


export class ConnectionManager {

    ctx:IDexcaliburEngine;

    constructor(pInstance:IDexcaliburEngine) {
        this.ctx = pInstance;
    }

    async open( pParam:DexcaliburConnectionParams, pCred:ConnectionCredentials):Promise<ConnectionHandler> {
        if(pParam==null) throw ConnectionManagerException.EMPTY_CONN_PARAMS();
        if(pCred==null) throw ConnectionManagerException.EMPTY_CREDS();
        if(pCred.type !== pParam.authType) throw ConnectionManagerException.AUTH_TYPE_UNSUPPORTED();

        let handler;
        try{
            handler = new ConnectionHandler(pParam);
            handler.doAuthentication(pCred);
        }catch(err){

        }

        return handler;

    }
}