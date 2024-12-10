import { ConnectionOptions, ProtocolMapping} from "./Connection.js";
import {HttpConnection} from "./HttpConnection.js";


export class HttpBasicConnection extends HttpConnection {

    static MAPPING:ProtocolMapping = {
      secrets: [
          { name:"password", secret:null }
      ],
      fields: [
          { name:"url", field:"" },
          { name:"method", field:"" },
          { name:"username", field:"" },
      ]
    };

    constructor(pOptions:ConnectionOptions) {
        super(pOptions);
    }
}