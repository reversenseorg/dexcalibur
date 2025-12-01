import { ConnectionOptions, ProtocolMapping} from "./Connection.js";
import {HttpConnection} from "./HttpConnection.js";


export class GooglePlaystoreConnection extends HttpConnection {

    static MAPPING:ProtocolMapping = {
      secrets: [
          { name:"aas_token", secret:null }
      ],
      fields: [
          { name:"account_username", field:"" },
          { name:"device", field:null, descr:"Device Code name : px_9=Pixel 9, ..." },
          { name:"split_apk", field:null, descr:"Download split APKs", values:[true,false] }
      ]
    };

    constructor(pOptions:ConnectionOptions) {
        super(pOptions);
    }
}