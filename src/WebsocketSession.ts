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

import {User} from "./User.js";
import Util from "./Utils.js";
import {RuntimeEvent} from "./hook/RuntimeEvent.js";


// list of HookSession UIDs
const gUIDs = [];

interface LocalSession {
    user: User;
    lid: string;
    socket: any;
}


export abstract class WebsocketSession {

    protected _socket:any = null;

    protected _sessid:string = null;

    protected _owners: User[] = [];

    protected _clients:LocalSession[] = [];


    /**
     * To generate a valid unique session id
     *
     * TODO : use UUID instead of randString()
     *
     * @
     * @since 1.0.0
     */
    static generateSessID():string{
        let uuid:string = null;
        do{
            uuid = Util.randString( 16, Util.ALPHANUM);
        }while(gUIDs.indexOf(uuid)>-1);
        return uuid;
    }


    constructor() {
        this._sessid = WebsocketSession.generateSessID();
    }

    /**
     * To check if authentication is required
     *
     * @return {boolean}
     * @method
     * @since 1.0.0
     */
    isRequireAuthentication():boolean{
        return (this._owners.length > 0);
    }

    /**
     * To check if the given user is an owner or not
     *
     * @param {User} pUser The user to verify
     * @return {boolean}
     * @method
     * @since 1.0.0
     */
    isOwner(pUser:User):boolean{
        let f:boolean = false;

        this._clients.map( (vOwner:LocalSession)=>{
            if(vOwner.user.is(pUser)) f=true;
        });
        return f;
    }

    /**
     * To check if the instance has one or less owner
     *
     * @return {boolean} TRUE if the session has one or less owner. Else FALSE
     * @method
     * @since 1.0.0
     */
    hasSingleOwner():boolean {
        return (this._owners.length <= 1);
    }

    /**
     * To bind this session to the given user
     * Once a session has one or more owner, authentication is required.
     * TODO : add permissions
     *
     * @param {User} pUser Owner of the session
     * @method
     * @since 1.0.0
     */
    addOwner(pUser:User, pLocalId:string, pSocket:any=null):void {
        this._clients.push({
            user: pUser,
            lid: pLocalId,
            socket: pSocket
        });
        //this._owners.push(pUser);
        //pUser.addHookSession(this, pLocalId);
    }

    getOwners():User[] {
        let usr:User[] = [];
        this._clients.map( vSess => usr.push(vSess.user));
        return usr;
    }

    getSocket():any {
        return this._socket;
    }

    getSessionID():string {
        return this._sessid;
    }

    send(pData:any):void {
        this._clients.map( vClients => {
            //Logger.raw("Send websocket message to : "+vClients.lid+", "+this._sessid)
            vClients.socket.sendUTF(JSON.stringify({action:'msg', svc:"hookm", data:{
                success: true,
                msg: pData,
                localid: vClients.lid,
                sessid: this._sessid
            }}));
        })
    }

    sendRuntimeEvent(pEvent:RuntimeEvent<any>):void {
        this._clients.map( vClients => {
            //Logger.raw("Send websocket message to : "+vClients.lid+", "+this._sessid)
            vClients.socket.sendUTF(JSON.stringify({action:'msg', svc:"hookm", data:{
                    success: true,
                    msg: pEvent.toJsonObject(),
                    localid: vClients.lid,
                    sessid: this._sessid
                }}));
        })
    }


    /**
     *
     * @param pSocket
     */
    exit(pSocket:any):void {

        this._socket = pSocket;

        this.onExit();

    }


    abstract onExit():void ;
}