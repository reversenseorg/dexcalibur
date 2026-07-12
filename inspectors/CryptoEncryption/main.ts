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

import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelStringValue from "../../src/ModelStringValue.js";
import ModelDataBlock from "../../src/ModelDataBlock.js";

var PATTERNS = [
    "AES",
    "DES",
    "DESede",
    "HmacSHA1",
    "HmacSHA224",
    "HmacSHA256",
    "HmacSHA384",
    "HmacSHA512",
    "PBEwithHmacSHA1",
    "PBEwithHmacSHA1AndAES_128",
    "PBEwithHmacSHA1AndAES_256",
    "PBEwithHmacSHA224AndAES_128",
    "PBEwithHmacSHA224AndAES_256",
    "PBEwithHmacSHA256AndAES_128",
    "PBEwithHmacSHA256AndAES_256",
    "PBEwithHmacSHA384AndAES_128",
    "PBEwithHmacSHA384AndAES_256",
    "PBEwithHmacSHA512AndAES_128",
    "PBEwithHmacSHA512AndAES_256",
    "PBEwithMD5AND128BITAES-CBC-OPENSSL",
    "PBEwithMD5AND192BITAES-CBC-OPENSSL",
    "PBEwithMD5AND256BITAES-CBC-OPENSSL",
    "PBEwithMD5ANDDES",
    "PBEwithMD5ANDRC2",
    "PBEwithSHA1ANDDES",
    "PBEwithSHA1ANDRC2",
    "PBEwithSHA256AND128BITAES-CBC-BC",
    "PBEwithSHA256AND192BITAES-CBC-BC",
    "PBEwithSHA256AND256BITAES-CBC-BC",
    "PBEwithSHAAND128BITAES-CBC-BC",
    "PBEwithSHAAND128BITRC2-CBC",
    "PBEwithSHAAND128BITRC4",
    "PBEwithSHAAND192BITAES-CBC-BC",
    "PBEwithSHAAND2-KEYTRIPLEDES-CBC",
    "PBEwithSHAAND256BITAES-CBC-BC",
    "PBEwithSHAAND3-KEYTRIPLEDES-CBC",
    "PBEwithSHAAND40BITRC2-CBC",
    "PBEwithSHAAND40BITRC4",
    "PBEwithSHAANDTWOFISH-CBC",
    "PBKDF2WithHmacSHA1",
    "PBKDF2withHmacSHA1And8BIT",
    "PBKDF2withHmacSHA224",
    "PBKDF2withHmacSHA256",
    "PBKDF2withHmacSHA384",
    "PBKDF2withHmacSHA512",
]


// ===== INIT =====

var CryptoEncryption:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    tags: [
        {
            name: "crypto.encryption.factory",
            _tagsOptions: [
                { name:"secret_key_alg", label:"Tagged value is an algorithm commonly used to generate secret key" },
                { name:"read_key", label:"Tagged function call a method that read a key" }
            ]
        },
        {
            name: "crypto.encryption.type",
            _tagsOptions: [
                { name:"aes", label:"Tagged value are involved into AES encryption" }
            ]
        }
    ],

    hookSet: {
        id: "CryptoEncryption",
        name: "Cryptography : Encryption",
        description: "Tag function and data related to data encryption and key management",
        strategies:[]
    },

    eventListenerSources: {
        "model.string.new": {
            lang: "js",
            source: `
            // PBKDF2WithHmacSHA1
            var patterns = [${PATTERNS.map(x => '"'+x+'"').concat(',')}];
            if(patterns.indexOf(pEvent.data.value)>-1){
                var tag = pEvent.getContext().getTagManager().getTag("crypto.encryption.factory.secret_key_alg"); 
                if(tag!==null){
                    pEvent.data.addTag(tag);
                }
            }
            `
        },
        "dxc.fullscan.post_deploy": {
            lang: "js",
            source: ` 
                var pCtx = pEvent.getContext();
                var calls = pCtx.find.call("calleed.name:/^getKeySpec$/");
                var tag = pCtx.getTagManager().getTag("crypto.encryption.factory.read_key"); 
                
                if(calls==null || tag===null) return;
                
                calls.list().map(x => {
                    x.caller.addTag(tag);
                });
            `
        }
    }
});

export default  CryptoEncryption;