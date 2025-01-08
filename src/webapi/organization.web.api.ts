import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {ValidationRule} from "../Validator.js";
import {UserGroup} from "../user/acl/common/UserGroup.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import {UserAccount} from "../user/UserAccount.js";
import {Connection, ConnectionProtocol} from "../organization/conn/Connection.js";
import {Secret} from "../core/secrets/Secret.js";
import {ConnectionFactory} from "../organization/conn/ConnectionFactory.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const ORG_WEB_API: DelegateWebApi = new DelegateWebApi("ORG");



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/list',
    {
        'get':  async (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{
                const data:any[] = [];

                const orgs = await $.context.getOrgManager().listOrganizations(
                    (req as any).user
                );

                orgs.map( o => data.push( o.toJsonObject()));
                $.sendSuccess( res, data);

            }catch(err){
                $.sendErrorAfterException(
                    res, ORG_WEB_API.name,
                    "List of organizations cannot be retrieved.",
                    err,{cause:err.message});
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/create',
    {
        'post':  async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{

            const $:WebServer = pReq.dxc.$;

            try{
                const org = await $.context.getOrgManager().createOrganizations(
                    (pReq as any).user,
                    new OrganizationUnit({
                        name: pReq.body.name,
                        description: pReq.body.description,
                        companyName: pReq.body.companyName
                    }));

                $.sendSuccess( pRes, org.toJsonObject());

            }catch(err){

                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Organization unit cannot be created.",
                    err,{cause:err.message});
            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:uid',
    {
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.uid
                );

                // update
                $.sendSuccess(
                    pRes,
                    org.toJsonObject({},SecurityZone.PUBLIC)
                );
            }catch(err){


                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Organization details cannot be retrieved.",
                    err,{cause:err.message});

            }
        },
        'put': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.uid
                );

                // update
                $.sendSuccess(
                    pRes,
                    await $.context.getOrgManager().updateOrganization(
                        (pReq as any).user,
                        org,
                        {
                            name: pReq.body.name,
                            description: pReq.body.description,
                            companyName: pReq.body.companyName,
                        }
                    )
                );
            }catch(err){


                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Organization cannot be modified.",
                    err,{cause:err.message});

            }
        },
        'delete': async (pReq:DelegateRequest, res:DelegateResponse):Promise<void>=>{

            const $:WebServer = pReq.dxc.$;

            try{
                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.uid
                );

                // drop
                $.sendSuccess( res, { deleted: await  $.context.getOrgManager().dropOrganization(
                        (pReq as any).user,
                        org
                    )});

            }catch(err){

                $.sendErrorAfterException(
                    res, ORG_WEB_API.name,
                    "Orgnization cannot be deleted.",
                    err,{cause:err.message});

            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/au/list',
    {
        'get':  async (pReq:DelegateRequest, pRes:DelegateResponse)=>{

            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );


                const apps = await $.context.getOrgManager().listApplications(
                    (pReq as any).user,
                    org
                );

                const data:any[] = [];
                apps.map( o => data.push( o.toJsonObject()));

                $.sendSuccess( pRes, data);

            }catch(err){

                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "List of application units cannot be retrieved.",
                    err,{cause:err.message});

            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/okc/reroll',
    {
        'post':  async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{

            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                $.sendSuccess( pRes, await $.context.getOrgManager().rerollOrganizationKeyChain(
                    (pReq as any).user,
                    org
                ));

            }catch(err){

                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Organization keychain cannot be reroll.",
                    err,{cause:err.message});
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/au/create',
    {
        'post':  async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{

            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                // create app unit
                const app = await $.context.getOrgManager().createApplication(
                    (pReq as any).user,
                    org,
                    (new ApplicationUnit({
                        name: pReq.body.name,
                        description: pReq.body.description,
                        packageID: pReq.body.packageID,
                        os: pReq.body.os,
                        orgUnit: org.getUID()
                    })).addMembers([
                        ((pReq as any).user as UserAccount).getUID()
                    ])
                );

                // attach member to app
                if(pReq.body.members.length>0){
                    await $.context.getOrgManager().addMembersToAU(
                        (pReq as any).user,
                        org,
                        app,
                        pReq.body.members
                    );
                }

                $.sendSuccess( pRes, app.toJsonObject());

            }catch(err){
                Logger.error("[API][ORG] Organization unit cannot be created : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, "Organization unit cannot be created. ", {cause:err.message });
            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/au/app/:aid',
    {
        'put': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );


                // target app
                const app = await $.context.getOrgManager().getApplication(
                    (pReq as any).user,
                    org,
                    pReq.params.aid
                );

                $.sendSuccess(
                    pRes,
                    await $.context.getOrgManager().updateApplication(
                        (pReq as any).user,
                        org,
                        app,
                        (pReq.body)
                    )
                );
            }catch(err){
                Logger.error("[API][PROJECT] Specified project cannot be set as default project. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, "Specified project cannot be set as default project. Cause : "+err.message);
            }
        },
        'delete': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void>=>{

            const $:WebServer = pReq.dxc.$;

            try{


                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                // target app
                const app = await $.context.getOrgManager().getApplication(
                    (pReq as any).user,
                    org,
                    pReq.params.aid
                );

                $.sendSuccess(
                    pRes,
                    await $.context.getOrgManager().dropApplication(
                        (pReq as any).user,
                        org,
                        app
                    )
                );

            }catch(err){
                Logger.error("[API][PROJECT] List of actives projects cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, "List of actives projects cannot be retrieved. Cause : "+err.message);
            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/conn/list',
    {
        'get':  async (pReq:DelegateRequest, pRes:DelegateResponse)=>{

            const $:WebServer = pReq.dxc.$;

            try{
                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                const list = await $.context.getOrgManager().listConnections(
                    (pReq as any).user,
                    org
                );

                const data:any[] = [];
                list.map( o => data.push( o.toJsonObject()));

                $.sendSuccess( pRes, data);

            }catch(err){

                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "List of connections settings cannot be retrieved.",
                    err,{cause:err.message});

            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/conn/create',
    {
        'post':  async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{

            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                // create conn
                const conn = (new Connection({
                    name: pReq.body.name,
                    type: pReq.body.type,
                    description: pReq.body.description,
                    address: pReq.body.address,
                }));

                if(pReq.body.fields!=null){
                    for(let n in pReq.body.fields){
                        conn.mapField(n,pReq.body.fields[n]);
                    }
                }

                if(pReq.body.secrets!=null){
                    for(let n in pReq.body.secrets){
                        conn.mapSecret(n,pReq.body.secrets[n]);
                    }
                }


                // create app unit
                const success = await $.context.getOrgManager().addConnectionToOrg(
                    (pReq as any).user,
                    org,
                    conn
                );

                $.sendSuccess( pRes, success);

            }catch(err){

                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Connection has not been created and attached to organization .",
                    err,{cause:err.message});
            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/conn/uid/:cid',
    {
        'put': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );


                const conn = org.getConnection(pReq.params.cid);

                if(pReq.body.name!=null) conn.setName(pReq.body.name);
                if(pReq.body.type!=null) conn.setType(pReq.body.type);
                if(pReq.body.description!=null) conn.setDescription(pReq.body.description);
                if(pReq.body.address!=null) conn.setAddress(pReq.body.address);

                if(pReq.body.fields!=null){
                    for(let n in pReq.body.fields){
                        conn.mapField(n,pReq.body.fields[n]);
                    }
                }

                if(pReq.body.secrets!=null){
                    for(let n in pReq.body.secrets){
                        conn.mapSecret(n,pReq.body.secrets[n]);
                    }
                }

                $.sendSuccess(
                    pRes,
                    await $.context.getOrgManager().updateConnections(
                        (pReq as any).user,
                        org, conn
                    )
                );
            }catch(err){

                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Connection cannot be updated.",
                    err,{cause:err.message});
            }
        },
        'delete': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void>=>{
            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                const conn = org.getConnection(pReq.params.cid);

                $.sendSuccess(
                    pRes,
                    await org.removeConnection(conn.getUID())
                );
            }catch(err){

                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Connection cannot be updated.",
                    err,{cause:err.message});
            }
        }
    }
);





ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/secrets/list',
    {
        'get':  async (pReq:DelegateRequest, pRes:DelegateResponse)=>{

            const $:WebServer = pReq.dxc.$;

            try{
                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                const list = await $.context.getOrgManager().listOrgSecrets(
                    (pReq as any).user,
                    org
                );

                const data:any[] = [];
                list.map( o => data.push( o.toJsonObject(SecurityZone.PUBLIC)));

                $.sendSuccess( pRes, data);

            }catch(err){

                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "List of organization secrets cannot be retrieved.",
                    err,{cause:err.message});

            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/secrets/create',
    {
        'post':  async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{

            const $:WebServer = pReq.dxc.$;

            try{
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                const secret = (new Secret({
                    name: pReq.body.name,
                    description: pReq.body.description
                }));

                secret.writeSecretString(pReq.body.data, pReq.body.data.length);

                // create app unit
                const success = await $.context.getOrgManager().addSecretToOrg(
                    (pReq as any).user,
                    org,
                    secret
                );

                $.sendSuccess( pRes, success);

            }catch(err){

                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Secret cannot be created and attached to organization .",
                    err,{cause:err.message});
            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/secret/:sid',
    {
        'delete': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void>=>{
            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                const sec = org.getSecret(pReq.params.sid);

                $.sendSuccess(
                    pRes,
                    await $.context.getOrgManager().removeSecretFromOrg(
                        (pReq as any).user,
                        org,
                        sec.getUID()
                    )
                );
            }catch(err){

                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Secret cannot be removed from organization.",
                    err,{cause:err.message});
            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/conn/proto/:proto',
    {
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void>=>{
            const $:WebServer = pReq.dxc.$;

            try{
                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                $.sendSuccess(
                    pRes,
                    ConnectionFactory.getExtraMappingsFor( pReq.params.proto as ConnectionProtocol)
                );
            }catch(err){

                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Secret cannot be removed from organization.",
                    err,{cause:err.message});
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/sso/conf/test',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{
            const $:WebServer = pReq.dxc.$;

            try{
                const result = await $.context.getOrgManager().testSsoConnection(
                    (pReq as any).user,
                    {
                       clientId: pReq.body.clientId,
                        clientSecret: pReq.body.clientSecret,
                        discoverUri: pReq.body.discoverUri,
                    });

                $.sendSuccess( pRes, { conn: result });

            }catch(err){
                Logger.error("[API][ORG] Organization Identity provider unreachable : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, "Organization Identity provider unreachable. ", {cause:err.message });
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/sso/conf/update',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{
            const $:WebServer = pReq.dxc.$;

            try{
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.body.org);

                const result = await $.context.getOrgManager().saveSsoConnection(
                    (pReq as any).user,
                    org,
                    {
                        uid: pReq.body.uid,
                        type: pReq.body.type,
                        name: pReq.body.name,
                        active: pReq.body.active,
                        btnImg: pReq.body.btnImg,
                        selfReg: pReq.body.selfReg,

                        clientId: pReq.body.clientId,
                        clientSecret: pReq.body.clientSecret,
                        discoverUri: pReq.body.discoverUri,

                        authorizedIPs: pReq.body.authorizedIPs,
                        authorizedCIDR: pReq.body.authorizedCIDR
                    });

                $.sendSuccess( pRes, { conn: result });

            }catch(err){
                Logger.error("[API][ORG] Organization Identity provider unreachable : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, "Organization Identity provider unreachable. ", {cause:err.message });
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/auth/module',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{
            const $:WebServer = pReq.dxc.$;

            try{
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.body.orgUnit);
                const result = await $.context.getOrgManager().editAuthModule(
                    (pReq as any).user,
                    org,
                    {
                        type: pReq.body.module.type,
                        name: pReq.body.module.name,
                        active: pReq.body.module.active,
                        btnImg: pReq.body.module.btnImg,
                        selfReg: pReq.body.module.selfReg,

                        clientId: pReq.body.module.clientId,
                        clientSecret: pReq.body.module.clientSecret,
                        discoverUri: pReq.body.module.discoverUri,

                        authorizedIPs: pReq.body.module.authorizedIPs,
                        authorizedCIDR: pReq.body.module.authorizedCIDR
                    });

                $.sendSuccess( pRes, { created: result });

            }catch(err){
                Logger.error("[API][ORG] Organization AuthModule cannot be modified : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, " Organization AuthModule cannot be modified; ", {cause:err.message });
            }
        },
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{
            const $:WebServer = pReq.dxc.$;

            try{
                if(typeof pReq.query.org  != 'string'){
                    throw OrganizationManagerException.UNKNOWN_ORG(null);
                }

                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.query.org as string);
                console.log(org);
                const result = await $.context.getOrgManager().getAuthModules(pReq.user, org);
                $.sendSuccess( pRes, result.map(x => x.toJsonObject(SecurityZone.PUBLIC)));

            }catch(err){
                Logger.error("[API][ORG] Organization AuthModule cannot be listed : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, " Organization AuthModule cannot be listed. ", {cause:err.message });
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/auth/test/conn',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{
            const $:WebServer = pReq.dxc.$;

            try{
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.body.orgUnit);
                const success = await $.context.getOrgManager().testAuthModuleConnection(pReq.user, org, pReq.body.module);

                $.sendSuccess( pRes, { connected: success });

            }catch(err){
                Logger.error("[API][ORG] Organization AuthModule cannot be modified : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, " Organization AuthModule cannot be modified; ", {cause:err.message });
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:uid/members/list',
    {
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                // replace by a "Window" object which enforce offset and size verifying with limit and more
                const offset = (pReq.body.offset!=null)? parseInt(pReq.body.offset,10):0;
                const size = (pReq.body.size!=null)? parseInt(pReq.body.size,10):100;

                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);
                const acc = await $.context.getOrgManager().listMembers(pReq.user, org, offset, size);
                const data:any[] = [];

                acc.map(vAcc => data.push(vAcc.toJsonObject({}, SecurityZone.PUBLIC)));

                $.sendSuccess( pRes, data);
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot retrieve the list of organization members", err);
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:uid/members/invite',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);

                if(!ValidationRule.emailList().test(pReq.body.emails)){
                    throw new Error("Emails format is invalid")
                }

                if(pReq.body.grp!=null && !UserGroup.VALIDATE.uuid.test(pReq.body.grp)){
                    throw new Error("UserGroupUUID format is invalid")
                }

                $.sendSuccess( pRes, {
                    sent: await $.context.getOrgManager().inviteUsers(pReq.user, org, pReq.body.emails, pReq.body.grp)
                });
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot retrieve the list of organization members", err);
            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:uid/roles',
    {
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);
                const acc = await $.context.getOrgManager().listRoles(pReq.user, org);
                const data:any[] = [];

                acc.map(vAcc => data.push(vAcc.toJsonObject({}, SecurityZone.PUBLIC)));

                $.sendSuccess( pRes, data);
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot retrieve the list of roles supported by organization", err);
            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:uid/usergroups',
    {
        'get':async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);

                $.sendSuccess( pRes, org.groups.map(g => g.toJsonObject({}, SecurityZone.PUBLIC)));
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot retrieve the list of user group supported by organization", err);
            }
        },
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);
                const grp = await $.context.getOrgManager().createUserGroup(pReq.user, org, new UserGroup({
                    name: pReq.body.name,
                    description: pReq.body.description
                }));

                if(pReq.body.roles!=null
                    && Array.isArray(pReq.body.roles)
                    && pReq.body.roles.length>0){

                    await $.context.getOrgManager().addRolesToGroup(pReq.user, org, grp.getUID(), pReq.body.roles);
                }

                if(pReq.body.members!=null
                    && Array.isArray(pReq.body.members)
                    && pReq.body.members.length>0){

                    await $.context.getOrgManager().addMembersToGroup(pReq.user, org, grp.getUID(), pReq.body.members);
                }


                $.sendSuccess( pRes, { created: true });
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot retrieve the list of roles supported by organization", err);
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:uid/dev/:mode',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);

                switch (pReq.params.mode){
                    case 'attach':
                        $.sendSuccess(
                            pRes,
                            await $.context.getOrgManager().attachDevice(pReq.user, org, pReq.body.dev)
                        );
                        break;
                    case 'detach':
                        $.sendSuccess(
                            pRes,
                            await $.context.getOrgManager().detachDevice(pReq.user, org, pReq.body.dev)
                        );
                        break;
                    default:
                        throw new Error("Action not supported");
                }
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot attach the device to the organization.", err);
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:uid/usergroup/:grp/members',
    {
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);
                const result = await $.context.getOrgManager().listGroupMembers(pReq.user, org, pReq.params.grp);
                const data:any[] = [];

                result.map(vAcc => data.push(vAcc.toJsonObject({}, SecurityZone.PUBLIC)));

                $.sendSuccess( pRes, data);
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot retrieve the list of roles supported by organization", err);
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:uid/usergroup/:grp/roles',
    {
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);
                const acc = await $.context.getOrgManager().listGroupRoles(pReq.user, org, pReq.params.grp);
                const data:any[] = [];

                acc.map(vAcc => data.push(vAcc.toJsonObject({}, SecurityZone.PUBLIC)));

                $.sendSuccess( pRes, data);
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot retrieve the list of roles supported by organization", err);


            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/app/:aid/dev/:action',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const app = await $.context.getOrgManager()
                    .getDirectApplication(pReq.user, pReq.params.aid);

                let detachDev = false;
                switch (pReq.params.action){
                    case 'detach':
                        detachDev = true;
                    case 'attach':
                        //  validate 'pReq.body.dev' is an array of UUID
                        if(ApplicationUnit.VALIDATE.devices.test(pReq.body.dev)){
                            for(let i=0; i<pReq.body.dev.length; i++){
                                await $.context.getOrgManager().assignDevice(
                                    pReq.user as UserAccount,
                                    app,
                                    pReq.body.dev[i],
                                    detachDev
                                );
                            }
                        }else{
                            throw new Error("Some device UUIDs have invalid format");
                        }
                        break;
                    default:
                        Logger.error("Operation not supported");
                        break
                }

                $.sendSuccess( pRes, true);
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot retrieve the list of roles supported by organization", err);
            }
        }
    }
);