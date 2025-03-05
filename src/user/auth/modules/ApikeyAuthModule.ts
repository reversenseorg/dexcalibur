import * as _net_ from "net";
import {AuthModule, AuthModuleOptions, AuthModuleType} from "../AuthModule.js";
import {SecurityZone} from "../../../security/SecurityZone.js";
import {AuthenticationSettings} from "../AuthenticationSettings.js";
import {OrganizationManagerException} from "../../../errors/OrganizationManagerException.js";

export interface ApikeyAuthModuleOptions extends AuthModuleOptions {
    authorizedIPs?:string[];
    authorizedCIDR?:string[];
    ttl?:number;
    keysize?:number;
}

/**
 *
 * @class
 */
export class ApikeyAuthModule extends AuthModule {

    static DEFAULT_KEY_LEN = 256;
    static DEFAULT_KEY_TTL = 24*60;

    private _block:_net_.BlockList = new _net_.BlockList();

    authorizedIPs:string[] = [];

    authorizedCIDR:string[] = [];

    /**
     * Time To Live (in hours)
     */
    ttl: number = ApikeyAuthModule.DEFAULT_KEY_TTL; // 60d : avg 2 months

    keysize: number = ApikeyAuthModule.DEFAULT_KEY_LEN;

    constructor(pOptions: ApikeyAuthModuleOptions) {
        super({
            ...pOptions,
            type: AuthModuleType.APIKEY
        });

        this.update(pOptions);
    }

    update(pOptions: ApikeyAuthModuleOptions | ApikeyAuthModule) {
        super.update(pOptions);

        this.authorizedIPs = (pOptions.authorizedIPs!=null ? pOptions.authorizedIPs : []);
        this.authorizedCIDR = (pOptions.authorizedCIDR!=null ? pOptions.authorizedCIDR : []);
        this.keysize = (pOptions.keysize!=null ? pOptions.keysize : ApikeyAuthModule.DEFAULT_KEY_LEN);
        this.ttl = (pOptions.ttl!=null ? pOptions.ttl : ApikeyAuthModule.DEFAULT_KEY_TTL);

        this.updateBlock();
    }

    updateBlock() {
        const newBlock = new _net_.BlockList();
        this.authorizedIPs.map(x => {
            try{
                newBlock.addAddress(x.trim(), (x.indexOf(':')>-1?"ipv6":"ipv4"));
            }catch (err){
                throw OrganizationManagerException.INVALID_IP_ADDRESS(x);
            }
        });
        this.authorizedCIDR.map(x => {
            try{
                const o = x.trim().split('/');
                newBlock.addSubnet(o[0],parseInt(o[1],10));
            }catch (err){
                throw OrganizationManagerException.INVALID_CIDR_ADDRESS(x);
            }

        });
        this._block = newBlock;
    }

    getAuthorizedIps():string[]{
        return this.authorizedIPs;
    }

    getAuthorizedCIDR():string[]{
        return this.authorizedCIDR;
    }

    /**
     * To get TTL in seconds
     *
     * @returns {number} api key ttl
     * @method
     */
    geTTL():number{
        return this.ttl*60*60;
    }

    getKeySize():number {
        return this.keysize;
    }

    isIpAuthorized(pIncomingIP:string):boolean{
        return this._block.check(pIncomingIP);
    }

    addAuthorizedIP( pIpAddress:string ):void {
        this.authorizedIPs.push(pIpAddress);
    }

    addAuthorizedCIDR( pCIDR:string ):void {
        this.authorizedCIDR.push(pCIDR);
    }


    async testConnection(pAuthSettings:AuthenticationSettings):Promise<boolean> {
        return true;
    }

    toJsonObject(pZone: SecurityZone = SecurityZone.PUBLIC): any {
        let o = super.toJsonObject(pZone);
        o.authorizedCIDR = this.authorizedCIDR;
        o.authorizedIPs = this.authorizedIPs;
        o.keysize = this.keysize;
        o.ttl = this.ttl;
        return o;
    }
}