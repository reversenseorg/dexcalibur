import DexcaliburEngine from "../../DexcaliburEngine.js";


import * as Got from "got";
import {EmailSenderException} from "./error/EmailSenderException.js";

import * as Log from '../../Logger.js';
import {Email} from "./Email.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
const got = Got.default;

/**
 *
 */
export class EmailSender {

    ready = false;

    domainID = "2d118760-c9f5-4b04-9905-db8f47b8c46d";
    projectID = "2d118760-c9f5-4b04-9905-db8f47b8c46d";

    region = "fr-par";

    apiKey:string;

    constructor(pEngine:DexcaliburEngine) {
        try{
            // rename secret 'emailer.api-key'
            if(process.env.DXC_EMAIL_APIKEY!=null){
                this.apiKey = process.env.DXC_EMAIL_APIKEY;
            }else{
                this.apiKey = pEngine.getSecretManager().readRawSecret('SCW5QQAPBNJDG3B4K6KY').toString();
            }
            this.apiKey = this.apiKey.replaceAll(/[\n\r]/g,'').trim();
            this.ready = true;
        }catch(e){
            if(e.code!=null && e.code==EmailSenderException.MISSING_API_KEY().getCode()){
                // log
            }
        }

    }

    createBody(pToMail:string, pSubject:string, pRawText:string, pHtml:string):any {
        return {
            "from": {
                "name": "Reversense Support",
                "email": "no-reply@reversense.net"
            },
            "to": [
                {
                    "email":pToMail
                }
            ],
            "subject": pSubject,
            "project_id": "2d118760-c9f5-4b04-9905-db8f47b8c46d",
            "text": pRawText,
            "html": pHtml,
            "attachments": [],
            "additional_headers": [
                {
                    "key": "Reply-To",
                    "value": "support@reversense.net"
                }
            ]
        };
    }

    async sendMail( pAddress:string, pSubject:string, pRawBody:string, pBody:string):Promise<boolean> {

        let data:any;
        try{
            const opts = {
                method: 'POST',
                headers: {
                    'X-Auth-Token':this.apiKey
                },
                json: this.createBody(pAddress,pSubject,pRawBody,pBody)
            };

            Logger.debugRAW(opts);
            data = await got(`https://api.scaleway.com/transactional-email/v1alpha1/regions/${this.region}/emails`, opts as any);
            Logger.debugRAW(data);

        }catch (e){
            Logger.error(e.stack);
            throw EmailSenderException.SENDING_FAILURE(pAddress,pSubject);
        }

        return false;
    }

    async sendPreparedMail( pAddress:string,pEmail:Email):Promise<boolean> {

        let data:any;
        try{
            const opts = {
                method: 'POST',
                headers: {
                    'X-Auth-Token':this.apiKey
                },
                json: this.createBody(pAddress,pEmail.getSubject(),pEmail.getRawText(),pEmail.getHTML())
            };

            Logger.debugRAW(opts);
            data = await got(`https://api.scaleway.com/transactional-email/v1alpha1/regions/${this.region}/emails`, opts as any);
            Logger.debugRAW(data);

        }catch (e){
            Logger.error(e.stack);
            throw EmailSenderException.SENDING_FAILURE(pAddress,pEmail.getSubject());
        }

        return false;
    }
}