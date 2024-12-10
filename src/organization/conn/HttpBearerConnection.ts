import { ConnectionOptions, ProtocolMapping} from "./Connection.js";
import {HttpConnection} from "./HttpConnection.js";


export class HttpBearerConnection extends HttpConnection {

    static MAPPING:ProtocolMapping = {
      secrets: [
          { name:"bearer_token", secret:null }
      ],
      fields: [
          { name:"url", field:"" },
          { name:"method", field:"" }
      ]
    };

    constructor(pOptions:ConnectionOptions) {
        super(pOptions);
    }
}