import GenericTrustProfile from "../../device/profile/GenericTrustProfile.js";
import Certificate, {CertificateFormat} from "../../formats/common/Certificate.js";
import {NosyProfile} from "../../device/profile/NosyProfile.js";
import {DeviceProfilingOptions, IBridge} from "../../Bridge.js";
import * as _path_ from "path";
import UT from "../../Utils.js";
import CertificateHelper from "../../formats/helpers/CertificateHelper.js";
import * as Log from "../../Logger.js";
import {IProfile} from "../../device/profile/IProfile.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 *
 * @class
 * @author Georges-B MICHEL
 */
export class AndroidTrustProfile extends GenericTrustProfile implements NosyProfile
{
    uid = "Android_AC";

    requireRoot = true;

    nosy = true;

    is(pData:any){
        const patterns = [
            new RegExp('^cacerts-'),
        ];

        for(let i=0; i<patterns.length; i++){
            if(patterns[i].test(pData)){
                return true;
            }
        }

        return false;
    }

    async scanCACerts(pRemoteFolder:string, pTmpName:string, pBridge:IBridge, pOptions:DeviceProfilingOptions):Promise<Certificate[]> {

        const cas:Certificate[] = [];

        try{
            const cacert = _path_.join(pOptions.localTmp,pTmpName);

            await pBridge.privilegedShell(" cp -r "+pRemoteFolder+" "+pOptions.remoteTmp+"/"+pTmpName);
            await pBridge.privilegedShell(" chmod 777 "+pOptions.remoteTmp+"/"+pTmpName)
            pBridge.pull(pOptions.remoteTmp+"/"+pTmpName,cacert);

            UT.forEachFileOf(cacert, (vCertPath)=>{
                let cert:Certificate;
                try{
                    // open as der
                    cert = CertificateHelper.parseX509(vCertPath, CertificateFormat.DER, pRemoteFolder+'/'+_path_.basename(vCertPath));
                    Logger.info("[ANDROID][TRUST] DER "+pTmpName+" : "+JSON.stringify(cert.toJsonObject()));
                    cas.push(cert);
                }catch(e){
                    // open as PEM
                    try{
                        cert = CertificateHelper.parseX509(vCertPath, CertificateFormat.PEM, pRemoteFolder+'/'+_path_.basename(vCertPath));
                        Logger.info("[ANDROID][TRUST] PEM "+pTmpName+" : "+JSON.stringify(cert.toJsonObject()));
                        cas.push(cert);
                    }catch(e){

                        Logger.error("[ANDROID][TRUST] Certificate  "+pTmpName+" cannot be parsed : ");
                        Logger.error(e.stack);
                    }

                }

                //Logger.info("XXXX cacerts-added +1 : "+JSON.stringify(cas[cas.length-1].toJsonObject()));
            },true);

            //pOptions.profile.addProperty(pTmpName, cas, false);
        }catch(err){
            Logger.info(err.message);
            Logger.info(err.stack);
        }

        return cas;
    }

    /**
     *
     * @param pDevice
     * @method
     * @async
     * @since 1.1.0
     */
    async performProfiling(pBridge:IBridge, pOptions:DeviceProfilingOptions):Promise<IProfile> {

        let success:any;
        let certs:Certificate[];
        try{
            //if(this.systemCAs.length==0){
                this.systemCAs = await this.scanCACerts("/system/etc/security/cacerts", 'cacerts', pBridge, pOptions);
                //await this.scanCACerts(true, "/system/etc/security/cacerts_google", 'cacerts_google', pBridge, pOptions);
                //await this.scanCACerts(true, "/system/etc/security/cacerts_wfa", 'cacerts_wfa', pBridge, pOptions);
            //}


            this.customCAs = await this.scanCACerts("/data/misc/user/0/cacerts-added", 'cacerts-added', pBridge, pOptions);


            success = this;
        }catch(err){
            Logger.info(err.message);
            Logger.info(err.stack);
            success = null;
        }

        return success;
    }

    /**
     *
     * @param {*} pName
     * @param {*} pValue
     */
    setProperty( pName:string, pValue:any){
        /*switch(pName){
            case 'cacerts-added':
                this.customCAs = pValue;
                break;
            case 'cacerts':
                this.systemCAs = pValue;
                break;
            default:
                this.prop[pName] = pValue;
                break;
        }*/
    }

    /**
     * To get custom AC certificate from the device
     *
     * @return {Certificate[]}
     * @method
     * @since 1.1.0
     */
    getCustomCAs():Certificate[] {
        return this.customCAs; //this.prop['cacerts-added'];
    }

    /**
     * To get custom AC certificate from the device
     *
     * @return {Certificate[]}
     * @method
     * @since 1.1.0
     */
    getSystemCAs():Certificate[] {
        return this.systemCAs; //this.prop['cacerts-added'];
    }


    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):AndroidTrustProfile{
        const o:AndroidTrustProfile = new AndroidTrustProfile();
        for(const i in pJson){
            switch (i) {
                case 'customCAs':
                    o.customCAs = [];
                    pJson.customCAs.map( x => {
                        o.customCAs.push( Certificate.fromJsonObject(x) )
                    });
                    break;
                case 'systemCAs':
                    o.systemCAs = [];
                    pJson.systemCAs.map( x => {
                        o.systemCAs.push( Certificate.fromJsonObject(x) )
                    });
                    break;
                default:
                    o[i] = pJson[i];
                    break;
            }
        }
        return o;
    }

}