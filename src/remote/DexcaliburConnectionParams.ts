import {DexcaliburConnectionException} from "../errors/DexcaliburConnectionException";
import {AuthType} from "../user/auth/AuthTypes";

export enum DexcaliburConnectionType {
    LOCAL="local",
    REMOTE="remote"
}

export interface DexcaliburConnectionParamsList {
    [name:string] :DexcaliburConnectionParams
}

/**
 * Represents connection parameters required to establish
 * a connection with a remote Dexcalibur server
 *
 * @class
 * @author Georges-Bastien Michel <georges@reversense.com>
 * @since 1.0.0
 */
export class DexcaliburConnectionParams {

    type:DexcaliburConnectionType = DexcaliburConnectionType.REMOTE;
    /**
     *
     */
    ipv4:string = null;
    ipv6:string = null;
    port:number = null;
    hostname:string = null;

    /**
     * Name for this configuration
     *
     * @field
     * @type string
     */
    name:string = null;

    /**
     * UID
     *
     * @field
     * @type string
     */
    uid:string = null;

    /**
     * Preferred authentication type
     *
     * @field
     * @type AuthType
     */
    authType:AuthType = AuthType.PASSWORD;


    /**
     *
     * @param pUID
     * @param pName
     * @param pIP
     * @param pPort
     * @constructor
     */
    constructor( pUID:string, pName:string, pIP:string, pPort:number) {
        this.uid = pUID;
        this.name = pName;


        if(pIP != null) {
            if (pIP.indexOf('.') > -1 && pIP.indexOf(':') == -1)
                this.ipv4 = pIP;
            else if (pIP.indexOf(':') == -1)
                this.ipv6 = pIP;
            else
                this.hostname = pIP;
        }

        this.port = pPort;
    }

    /**
     * To get configuration name
     */
    getName():string {
        return  this.name;
    }

    getUID():string {
        return this.uid;
    }


    getIpAddress():string{
        if(this.ipv4 != null){
            return this.ipv4
        }
        else if(this.ipv6 != null){
            return this.ipv6
        }
        else{
            throw DexcaliburConnectionException.IP_NOT_DEFINED();
        }
    }

    getHostname():string {
        if(this.hostname != null){
            return this.hostname;
        }
        else{
            throw DexcaliburConnectionException.HOSTNAME_NOT_DEFINED();
        }
    }


    getPort():number{
        if(this.port != null){
            return this.port;
        }
        else{
            throw DexcaliburConnectionException.PORT_NOT_DEFINED();
        }
    }

    static fromPoorObject(pObj:any):DexcaliburConnectionParams {
        let o:DexcaliburConnectionParams = new DexcaliburConnectionParams(
            pObj.hasOwnProperty('uid')? pObj.uid : null,
            pObj.hasOwnProperty('name')? pObj.name : null,
            pObj.hasOwnProperty('ip')? pObj.ip : null,
            pObj.hasOwnProperty('port')? pObj.port : null,
        );

        o.hostname = pObj.hasOwnProperty('hostname')? pObj.url : null;
        o.authType = pObj.hasOwnProperty('authType')? pObj.authType : null;

        return o;
    }

    toString():string {
        let s:string = "";
        s += 'uid?'+this.uid+'?';
        s += 'name?'+this.name+'?';
        if(this.hostname!=null){
            s += 'host?'+this.hostname+'?';
        }else if(this.ipv4){
            s += 'ipv4?'+this.ipv4+'?';
        }else if(this.ipv4){
            s += 'ipv6?'+this.ipv6+'?';
        }
        s += 'port?'+(this.port!=null ? this.port : '-1');
        s += 'auth?'+this.authType+'?';
        s += 't?'+this.type+'?';

        return s;
    }

    fromString( pConnStr:string ):DexcaliburConnectionParams {
        let o:DexcaliburConnectionParams;

        const tokens:string[] = pConnStr.split('?');

        o = new DexcaliburConnectionParams(
            (tokens[0]=='uid' ? tokens[1] : null),
            (tokens[2]=='name' ? tokens[3] : null),
            (tokens[4]!=null ? tokens[5] : null),
            (tokens[7]!='-1' ? parseInt(tokens[7],10) : null)
        );

        if(tokens[8]!=null && tokens[8]=="auth")
            o.authType = AuthType[tokens[9]];

        if(tokens[10]!=null && tokens[10]=="t")
            o.type = DexcaliburConnectionType[tokens[11]];
        
        return o;
    }
}