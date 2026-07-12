/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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