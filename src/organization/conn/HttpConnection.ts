import {Connection, ConnectionOptions, ProtocolMapping} from "./Connection.js";


export class HttpConnection extends Connection {

    static MAPPING:ProtocolMapping = {
      secrets: [],
      fields: [
          { name:"url", field:"" },
          { name:"method", field:"" },
      ]
    };

    constructor(pOptions:ConnectionOptions) {
        super(pOptions);
    }
}