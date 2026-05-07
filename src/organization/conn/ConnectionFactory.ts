import {Connection, ConnectionProtocol, ProtocolMapping} from "./Connection.js";
import {map} from "rxjs";
import {HttpConnection} from "./HttpConnection.js";
import {HttpBasicConnection} from "./HttpBasicConnection.js";
import {HttpBearerConnection} from "./HttpBearerConnection.js";
import {GooglePlaystoreConnection} from "./GooglePlaystoreConnection.js";
import {ConnectionProtocolException} from "./error/ConnectionProtocolException.js";


export class ConnectionFactory {


    static getExtraMappingsFor(pProtocol:ConnectionProtocol):ProtocolMapping {

        let mapping:ProtocolMapping = {
            secrets: [],
            fields: []
        };

        if(!Connection.VALIDATE.type.test(pProtocol)){
            throw ConnectionProtocolException.PROTOCOL_NOT_SUPPORTED(pProtocol);
        }

        switch (pProtocol){
            case ConnectionProtocol.HTTP:
                mapping = HttpConnection.MAPPING;
                break;
            case ConnectionProtocol.HTTP_BASIC:
                mapping = HttpBasicConnection.MAPPING;
                break;
            case ConnectionProtocol.HTTP_REALM:
                mapping = HttpBearerConnection.MAPPING;
                break;
            case ConnectionProtocol.PLAYSTORE:
                mapping = GooglePlaystoreConnection.MAPPING;
                break;
            case ConnectionProtocol.CLAUDE:
            case ConnectionProtocol.OPENAI:
            case ConnectionProtocol.AWS:
            case ConnectionProtocol.GCP:
                mapping = GooglePlaystoreConnection.MAPPING;
                break;
        }

        return mapping;
    }
}