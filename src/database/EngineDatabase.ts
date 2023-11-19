import DexcaliburEngine from "../DexcaliburEngine.js";
import {Settings} from "../Settings.js";
import DatabaseSettings = Settings.DatabaseSettings;
import {MongodbAdapter, MongodbDb} from "@dexcalibur/dexcalibur-orm-mongodb";
import {Nullable} from "../core/IStringIndex.js";
import {MongoCredentialsOptions, AuthMechanism} from "mongodb";
import * as Log from "../Logger.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface EngineDatabaseOptions {
    conn?:string;
    host:string;
    port:string;
}

export interface EngineDatabaseCredential {
    username: string;
    password: string;
    source: string;
    mechanism: string;
    mechanismProperties: any;
}

/**
 * Represent the serevr DB where project data are stored or cloned
 *
 * @class
 */
export class EngineDatabase {

    private _ctx:DexcaliburEngine;
    private _opts:DatabaseSettings;
    private _connector: MongodbAdapter;
    private _ready = false;
    private _db:Nullable<MongodbDb> = null;

    constructor(pContext:DexcaliburEngine, pOptions:DatabaseSettings) {
        this._ctx = pContext;
        this._opts = pOptions;

        if(pOptions!=null){
            this._init(pOptions);
        }
    }

    private _init(pOptions:DatabaseSettings):void {
        let creds:Nullable<MongoCredentialsOptions> = null;

        if(pOptions.hasConnectionString()!=null){
            creds = this.parseCredentialString(pOptions.getConnectionString());
        }

        this._connector = new MongodbAdapter(this._ctx, {
            clusterUrl: this._opts.getHost(),
            port:  this._opts.getPort(),
            credentials: creds
        });
    }

    /**
     * Format
     *
     * URI(user):URI(pwd):URI(source):mechanism
     *
     * @param pStr
     */
    parseCredentialString(pStr:string): MongoCredentialsOptions {
        const parts = pStr.split(':');

        return {
            username: decodeURIComponent(parts[0]),
            password: decodeURIComponent(parts[1]),
            source: decodeURIComponent(parts[2]),
            mechanism: parts[3] as AuthMechanism,
            mechanismProperties: {}
        };
    }


    async connect():Promise<void> {
        this._db = await this._connector.asyncConnect(null,"dxcserver");

        Logger.debug("Connection successful");
    }
}