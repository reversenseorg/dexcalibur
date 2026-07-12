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