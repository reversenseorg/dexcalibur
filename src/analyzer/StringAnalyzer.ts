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

import DexcaliburProject from "../DexcaliburProject.js";
import ModelStringValue from "../ModelStringValue.js";
import {Tag} from "@reversense/dexcalibur-orm";
import * as console from "node:console";


const SQL_KEYWORDS = [
    "SELECT", "INSERT", "UPDATE", "DELETE", "REPLACE",
    "CREATE", "DROP", "ALTER",
    "WHERE", "JOIN", "HAVING", "GROUP", "ORDER", "LIMIT",
    "BEGIN", "COMMIT", "ROLLBACK",
    "INTO", "FROM", "TABLE", "VALUES",
];

export class StringAnalyzer {

    static FORMATS:any = [

        [/^0x[0-9a-fA-F]{16}$/, "encoded.hex64", "64-bits"],
        [/^0x[0-9a-fA-F]{8}$/, "encoded.hex32", "32-bits"],
        [/^0x[0-9a-fA-F]+$/, "encoded.hex", "Hex"],
        [/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})+$/, "encoded.hcolor", "Hex Color"],
        //[/^0o?[0-7]+$/, "encoded.oct", "Octal"],
        //[/^[01]+$/, "encoded.bin", "Binary"],
        //[/^[0-9]+$/, "encoded.dec", "Dec"],
        [/^\d+\.\d+\.\s+$/, "encoded.semver", "Semver"],
        //[/^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/, "encoded.ipv4", "IPv4"],
        [/^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$/, "encoded.ipv4", "IPv4"],
        [/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)$/, "encoded.base64", "Base64"],
        [/^([A-Za-z0-9_-]{4})*([A-Za-z0-9_-]{2}==|[A-Za-z0-9_-]{3}=)$/, "encoded.base64url", "Base64url"],
        // Too much permissive, conflict with URI :
        // [/^\s*(---\s*)?([^\n:#]+:\s*.*|\-\s+.+).*(\n|$)$/m,"encoded.yaml","YAML"],
        [/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/, "encoded.uuid", "UUID"],
        // MAC (avec : ou -)
        [/^(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/, "encoded.mac", "MAC address"],
        // Email
        [/^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,63}$/, "encoded.email", "Email"],
        // Windows path (très courant dans binaires)
        [/^([A-Za-z]:\\|\\\\)[^<>:"|?*\r\n]{4,240}$/, "encoded.path_win", "Windows path"],
        // Unix path
        [/^\/([^\/\x00\r\n]+\/)*[^\/\x00\r\n]{1,255}$/, "encoded.path_unix", "Unix path"],

        // Glob / wildcard path (config)
        // [/^(\/|\.\/|[A-Za-z]:\\).*[?*[\]{}].*$/, "encoded.path_glob", "Glob path"],

        // PEM (cert / key) - header seul (évite parse complet)
        [/^-----BEGIN (?:CERTIFICATE|PUBLIC KEY|PRIVATE KEY|RSA PRIVATE KEY|EC PRIVATE KEY)-----$/, "encoded.pem_header", "PEM header"],
        // JWT (3 segments base64url, heuristique)
        [/^ey[A-Za-z0-9_-]{10,}\.ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/, "encoded.jwt", "JWT"],
        // API key “generic” (heuristique, réduit FP via longueur + classes)
        // [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9_\-]{20,80}$/, "encoded.apikey_generic", "Generic API key"],
        // AWS Access Key ID (AKIA/ASIA…)
        // [/^(?:AKIA|ASIA|AIDA|AGPA|AROA|ANPA|ANVA)[A-Z0-9]{16}$/,"encoded.aws_access_key_id"],
        // AWS Secret Access Key (base64-ish 40)
        // [/^[A-Za-z0-9\/+=]{40}$/,"encoded.aws.secret_access_key"],
        // Git commit SHA1 (40 hex) – si vous ne voulez pas dépendre de vos 400 hashes
        //[/^[0-9a-fA-F]{40}$/,"encoded.git.sha1"],
        // Docker image digest sha256:<64hex>
        //[/^sha256:[0-9a-fA-F]{64}$/,"encoded.docker_digest"],
        // SPDX license id (heuristique)
        //[/^[A-Za-z0-9.+-]{2,40}$/,"encoded.license.spdx_soft"],
        // MIME type
        [/^(application|audio|font|image|message|model|multipart|text|video)\/[A-Za-z0-9!#$&^_.+-]{1,127}$/, "encoded.mime", "MIME"],
        // Date ISO 8601 (date seule)
        [/^\d{4}-\d{2}-\d{2}$/, "encoded.date_iso", "ISO date"],
        // DateTime ISO 8601 (heuristique, avec Z/offset)
        [/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/, "encoded.datetime_iso", "ISO Datetime"],
        // [/^v?\d+(\.\d+){1,3}?$/, "encoded.float", "Float number"],
        // INI / .properties “key=value” (1 ligne)
        [/^[A-Za-z0-9_.-]{1,64}(=[^=\n]|:[^:\n])[^/]{1,2}.+$/, "encoded.key_pair", "Key Pair"],
        // URL-encoded (présence de %xx répétée)
        [/^.*\/.*(%[0-9A-Fa-f]{2})+.*\/.*$/, "encoded.urlencoded_soft", "URL-encoded"],
        [/^&([a-zA-Z0-9_%]+(\[[a-zA-Z0-9_%]*\])?)=.*$/, "encoded.uri_param", "URI Param"],
        [/(\(\?\:?)?.*(\[[a-aA-Z0-9]+\]|a-F|A-F|a-z|A-Z|[01]-9|\\[SDBWsdbwtmrfTNRF]|\([^)]+:\\.*\)|\\u[0-9]{4}).*/, "encoded.regexp", "Regexp"]
    ];

    static sqlPatterns: [RegExp, string, string][] = [

        // ─── DDL ──────────────────────────────────────────────────────────────────

        [/\bCREATE\s+(?:TEMP(?:ORARY)?\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[\w"`\[\]]+/i, "sql.ddl.create_table", "CREATE TABLE"],
        [/\bDROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?[\w"`\[\]]+/i, "sql.ddl.drop_table", "DROP TABLE"],
        [/\bALTER\s+TABLE\s+[\w"`\[\]]+/i, "sql.ddl.alter_table", "ALTER TABLE"],

        // ─── DML ──────────────────────────────────────────────────────────────────

        [/\bSELECT\s+(?:DISTINCT\s+)?(?:\*|[\w"`\[\],\s]+)\s+FROM\s+[\w"`\[\]]+/i, "sql.dml.select", "SELECT"],
        [/\bINSERT\s+(?:OR\s+\w+\s+)?INTO\s+[\w"`\[\]]+\s*(?:\([^)]*\))?\s*VALUES\s*\(/i, "sql.dml.insert", "INSERT"],
        [/\bUPDATE\s+[\w"`\[\]]+\s+SET\s+[\w"`\[\]]+\s*=/i, "sql.dml.update", "UPDATE"],
        [/\bDELETE\s+FROM\s+[\w"`\[\]]+/i, "sql.dml.delete", "DELETE"],
        [/\bREPLACE\s+INTO\s+[\w"`\[\]]+/i, "sql.dml.replace", "REPLACE"],
        [/\bINSERT\s+.*\bON\s+CONFLICT\b|\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/i, "sql.dml.upsert", "UPSERT"],

        // ─── CLAUSES ──────────────────────────────────────────────────────────────

        [/\bWHERE\s+[\w"`\[\]]+\s*(?:=|!=|<>|LIKE|IN|IS|BETWEEN|>|<)/i, "sql.clause.where", "WHERE"],
        [/\b(?:INNER|LEFT|RIGHT|FULL|CROSS)?\s*(?:OUTER\s+)?JOIN\s+[\w"`\[\]]+\s+ON\b/i, "sql.clause.join", "JOIN"],
        [/\bORDER\s+BY\s+[\w"`\[\],\s]+(?:ASC|DESC)?/i, "sql.clause.order_by", "ORDER BY"],
        [/\bGROUP\s+BY\s+[\w"`\[\],\s]+/i, "sql.clause.group_by", "GROUP BY"],
        [/\bHAVING\s+[\w"`\[\]]+\s*(?:=|>|<|!=|<>)/i, "sql.clause.having", "HAVING"],
        [/\bLIMIT\s+\d+(?:\s*,\s*\d+|\s+OFFSET\s+\d+)?/i, "sql.clause.limit", "LIMIT"],

        // ─── TRANSACTIONS ─────────────────────────────────────────────────────────

        [/\bBEGIN\s+(?:DEFERRED|IMMEDIATE|EXCLUSIVE\s+)?TRANSACTION\b|\bBEGIN\b/i, "sql.tx.begin", "BEGIN"],
        [/\bCOMMIT(?:\s+TRANSACTION)?\b/i, "sql.tx.commit", "COMMIT"],
        [/\bROLLBACK(?:\s+TRANSACTION)?\b/i, "sql.tx.rollback", "ROLLBACK"],

        // ─── INJECTION ────────────────────────────────────────────────────────────

        [/(?:["'`]\s*\+\s*\w+|\w+\s*\+\s*["'`])\s*(?:WHERE|FROM|INTO|VALUES)/i, "sql.injection.string_concat", "String concat"],
        [/(?:sprintf|snprintf|printf|format|String\.format|%s|%d)\s*.*(?:SELECT|INSERT|UPDATE|DELETE|WHERE)/i, "sql.injection.format_string", "Format string"],
        [/(?:rawQuery|execSQL|execute|query)\s*\(\s*["'`][^"'`]*(?:SELECT|INSERT|UPDATE|DELETE)/i, "sql.injection.raw_query", "Raw query"],

    ];


    static extractTags():Tag[]{
        const o="encoded.".length;
        return StringAnalyzer.FORMATS.map(f=> {
            return new Tag({
                name: f[1].substr(o),
                label: f[2],
                descr: f[3]
            });
        });
    }

    static detectJson(pStr:string):boolean{

        const b = pStr[0];
        const e = pStr[pStr.length-1];
        if(b!=="{" && b!=="[" || e!=="}" && e!=="]") return false;

        try{
            JSON.parse(pStr);
            return true;
        }catch(e){
            return false;
        }
    }

    static detectSQL(pStr:string):string[]{
        const up = pStr.toUpperCase();
        if(!SQL_KEYWORDS.some((v:string)=> up.includes(v))) return [];

        return StringAnalyzer.sqlPatterns.filter((vPattern:any) => {
            return vPattern[0].test(pStr);
        }).map((v:any) => {
            return v[1];
        });
    }

    static detectToken(pStr:string):string[]{

        if(pStr.length!=1)  return [];

        const t:string[] = [];
        switch (pStr[0]) {
            case "<":
                t.push("lex.lt");
            case "{":
                t.push("lex.begin");
                break;
            case ">":
                t.push("lex.gt");
            case "}":
                t.push("lex.end");
                break;
            case "=":
                t.push("lex.eq");
                break;
            case ":":
                t.push("lex.assign");
                break;
            case "|":
                t.push("lex.sep");
                break;
            case ";":
                t.push("lex.sem");
                break;
        }

        return t;
    }


    /**
     * To detect formats and tag specifgied string
     * @param pContext
     * @param pStr
     */
    static detectFormat(pContext:DexcaliburProject, pStr:ModelStringValue):string[]{

        const val = pStr.getValue();
        if(val==null || val.length==0) return [];

        let res:string[] = StringAnalyzer.extractFormat(val);

        res = res.filter((vTagName:string)=>{
            try{
                if(["encoded.email","network.protocol.https"].indexOf(vTagName)>-1){
                    console.log(val,vTagName,res);
                }
                const t = pContext.getTagManager().getTag(vTagName);
                if(t!=null){
                    pStr.addTag(t);
                    return true
                }else{
                    return false;
                }
            }catch(e){
                console.error(e,vTagName);
                return false;
            }
        });

        return res;
    }

    /**
     *
     * @param pStr
     */
    static extractFormat(pStr:string):string[]{

        if(pStr==null) return [];

        let t:string[] = [];
        const trim = pStr.trim();

        if(URL.canParse(pStr) && pStr.indexOf("://")>-1){
            const u = new URL(pStr);
            if(u.port.length>0){
                t.push("network.uri.port")
            }
            if(u.hash.length>0){
                t.push("network.uri.hash")
            }
            if(u.search.length>0){
                t.push("network.uri.query")
            }
            if(u.hostname.length>0){
                t.push("network.uri.host")
            }
            if(u.protocol.length>0){
                if(['http:','https:','ftp:','ssh:'].indexOf(u.protocol)>-1){
                    t.push(`network.protocol.${u.protocol.substring(0,u.protocol.length-1).toLowerCase()}`);
                }else{
                    t.push("network.uri.custom_schema");
                }
                console.log(pStr,u.protocol,u);
            }

            if(t.length>0){
                t.push("network.uri.any");
            }
        }

        if(StringAnalyzer.detectJson(trim)){
            t.push("encoded.json");
        }

        t = t.concat(StringAnalyzer.detectToken(trim));
        t = t.concat(StringAnalyzer.detectSQL(trim));


        StringAnalyzer.FORMATS.map((v:any) => {
            if(v[0].test(pStr)){
                console.log("MATCH",v[1],pStr);
                t.push(v[1]);
            }
        });

        return t;
    }
}