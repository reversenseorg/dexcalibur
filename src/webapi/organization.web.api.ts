import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {AuthModule} from "../user/auth/AuthModule.js";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {ValidationRule} from "../Validator.js";
import {UserGroup} from "../user/acl/common/UserGroup.js";
import Role from "../user/acl/common/Role.js";

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
                Logger.error("[API][ORG] List of organizations cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "List of organizations cannot be retrieved.", {cause:err.message});
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
                Logger.error("[API][ORG] Organization unit cannot be created : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, "Organization unit cannot be created. ", {cause:err.message });
            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:uid',
    {
        'put': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $:WebServer = pReq.dxc.$;

            try{
                $.sendSuccess(
                    pRes,
                    await $.context.getOrgManager().updateOrganization(
                        (pReq as any).user,
                        new OrganizationUnit({
                            name: pReq.body.name,
                            description: pReq.body.description,
                            companyName: pReq.body.companyName,
                        })
                    )
                );
            }catch(err){
                Logger.error("[API][PROJECT] Specified project cannot be set as default project. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(pRes, "Specified project cannot be set as default project. Cause : "+err.message);
            }
        },
        'delete':  (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{
                const data:any[] = [];
                const proj = $.context.getActiveProjects(req.dxc.sess.getUserAccount());

                for(const i in proj) data.push( proj[i].toJsonObject());
                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][PROJECT] List of actives projects cannot be retrieved. Cause : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "List of actives projects cannot be retrieved. Cause : "+err.message);
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