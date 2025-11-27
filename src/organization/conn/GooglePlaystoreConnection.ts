import { ConnectionOptions, ProtocolMapping} from "./Connection.js";
import {HttpConnection} from "./HttpConnection.js";


export class GooglePlaystoreConnection extends HttpConnection {

    static MAPPING:ProtocolMapping = {
      secrets: [
          { name:"aas_token", secret:null }
      ],
      fields: [
          { name:"account_username", field:"" },
          { name:"device", field:null }
      ]
    };

    constructor(pOptions:ConnectionOptions) {
        super(pOptions);
    }
}