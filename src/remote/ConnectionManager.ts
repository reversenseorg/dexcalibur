import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import {DexcaliburConnectionParams} from "./DexcaliburConnectionParams.js";
import {ConnectionCredentials} from "./ConnectionCredentials.js";
import {ConnectionHandler} from "./ConnectionHandler.js";
import {AuthType} from "../user/auth/AuthTypes.js";
import {ConnectionManagerException} from "../errors/ConnectionManagerException.js";


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