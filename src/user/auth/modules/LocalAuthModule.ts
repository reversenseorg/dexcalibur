import * as _net_ from "net";
import {AuthModule, AuthModuleOptions, AuthModuleType} from "../AuthModule.js";
import {SecurityZone} from "../../../security/SecurityZone.js";
import {AuthenticationSettings} from "../AuthenticationSettings.js";
import {OrganizationManagerException} from "../../../errors/OrganizationManagerException.js";

export interface LocalAuthModuleOptions extends AuthModuleOptions {
    authorizedIPs?:string[];
    authorizedCIDR?:string[];
    banned?: string[];
}

export class LocalAuthModule extends AuthModule {

    private _block:_net_.BlockList = new _net_.BlockList();

    authorizedIPs:string[] = [];

    authorizedCIDR:string[] = [];

    banned: string[] = [];

    constructor(pOptions: LocalAuthModuleOptions) {
        super({
            ...pOptions,
            type: AuthModuleType.LOCAL_PASSWD
        });

        this.authorizedIPs = pOptions.authorizedIPs!;
        this.authorizedCIDR = pOptions.authorizedCIDR!;
        this.banned = pOptions.banned!;

        this.updateBlock()
    }

    update(pOptions: LocalAuthModuleOptions | LocalAuthModule) {
        super.update(pOptions);

        this.authorizedIPs = pOptions.authorizedIPs!;
        this.authorizedCIDR = pOptions.authorizedCIDR!;
        this.banned = pOptions.banned!;

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

    getBannedIPs():string[]{
        return this.banned;
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
        o.banned = this.banned;
        return o;
    }
}