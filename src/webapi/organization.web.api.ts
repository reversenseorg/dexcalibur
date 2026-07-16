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

import {DelegateRequest, DelegateResponse, DelegateWebApi, HTTP_VERB} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {ValidationRule} from "@reversense/dexcalibur-orm";
import {UserGroup} from "../user/acl/common/UserGroup.js";
import {ApplicationUnit, ApplicationUnitUUID} from "../organization/ApplicationUnit.js";
import {UserAccount} from "../user/UserAccount.js";
import {Connection, ConnectionProtocol} from "../organization/conn/Connection.js";
import {Secret} from "../core/secrets/Secret.js";
import {ConnectionFactory} from "../organization/conn/ConnectionFactory.js";
import {ProjectState} from "../ProjectState.js";
import {UserServiceException} from "../errors/UserServiceException.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import AccessControl from "../user/acl/AccessControl.js";
import {NodeInternalType, Nullable, OperatingSystem} from "@reversense/dxc-core-api";
import AssuranceReport, {AssuranceReportUUID} from "../audit/common/AssuranceReport.js";
import {DataSegment} from "../audit/common/Indicator.js";
import {UploadedResource, UploadedResourceUUID} from "../common/UploadedResource.js";
import {ProjectInput} from "../analyzer/ProjectInput.js";
import {Buffer} from "buffer";
import {ProjectOrder} from "../project/ProjectOrder.js";
import DexcaliburProject from "../DexcaliburProject.js";

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
    },{
        mcp: {
            [HTTP_VERB.POST]: {
                name:'organization-create',
                uri: '/ou/create',
                summary: `To create a new organization unit. 
                
                An organization unit own everything related to a company, apps or teams excepted user accounts.
                Prior to analyze an application, create a project or connections, you must have a valid organization unit.
    
                Each organization has one or more authentication modules, policies, sales plan, and more.
                `,
                parameters: [{
                    name: 'name',
                    required: true,
                    description: OrganizationUnit.TYPE.getProperty("name")._dscr,
                    schema: OrganizationUnit.TYPE.getProperty("name").toJSONSchemaPart()
                },{
                    name: 'companyName',
                    required: true,
                    description: OrganizationUnit.TYPE.getProperty("companyName")._dscr,
                    schema: OrganizationUnit.TYPE.getProperty("companyName").toJSONSchemaPart()
                },{
                    name: 'description',
                    required: true,
                    description: OrganizationUnit.TYPE.getProperty("description")._dscr,
                    schema: OrganizationUnit.TYPE.getProperty("description").toJSONSchemaPart()
                }],
                responses: [{
                    description: "Return the newly created organization unit." ,
                    schema: OrganizationUnit.TYPE.toJSONSchemaPart()
                }]
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
    },{
        mcp: {
            [HTTP_VERB.GET]: {
                name:'organization-list-applications',
                uri: '/ou/org/{organizationUUID}/au/list',
                summary: `To list all application units owned by the organization specified by UUID **organizationUUID**.`,
                parameters: [{
                    name: 'organizationUUID',
                    required: true,
                    description: OrganizationUnit.TYPE.getPrimaryKey()._dscr,
                    schema: OrganizationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: "Return the list of application units available." ,
                    schema: ApplicationUnit.TYPE.toJSONSchemaPart(true)
                }]
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
    '/ou/org/:oid/settings',
    {
        'post':  async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{

            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                $.sendSuccess( pRes, await $.context.getOrgManager().updateOrgSettings(
                    pReq.user,
                    org,
                    pReq.body.settings
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
    '/ou/org/:oid/runners',
    {
        'get':  async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{

            const $:WebServer = pReq.dxc.$;

            try{

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                const runners = await $.context.getOrgManager().getRunners(pReq.user,org);

                $.sendSuccess( pRes, runners.map(x => x.toJsonObject(null, SecurityZone.PUBLIC)));

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
    '/ou/org/:oid/runner/:nid/stop',
    {
        'post':  async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{

            const $:WebServer = pReq.dxc.$;

            try{
                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                $.sendSuccess( pRes, { done: await $.context.getOrgManager().stopRunner(pReq.user, org, pReq.params.nid) });
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
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Application unit cannot be created. ",err, { cause:err.message });
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
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Application unit cannot be modified.",err, { cause:err.message });
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
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Application unit cannot be deleted.",err, { cause:err.message });
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
    },{
        mcp: {
            [HTTP_VERB.GET]: {
                name:'organization-list-connections',
                uri: '/ou/org/{organizationUUID}/conn/list',
                summary: `To list all connections specified by its UUID **connectionUUID**.`,
                parameters: [{
                    name: 'organizationUUID',
                    required: true,
                    description: OrganizationUnit.TYPE.getPrimaryKey()._dscr,
                    schema: OrganizationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: "Return the list of connections available." ,
                    schema:  Connection.TYPE.toJSONSchemaPart(true)
                }]
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
                        if(Connection.VALIDATE.uuid.test(pReq.body.secrets[n])){
                            conn.mapSecret(n, pReq.body.secrets[n]);
                        }else{
                            throw new Error("SecretUUID is invalid.")
                        }
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
    '/ou/org/:oid/conn/cid/:cid',
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



ORG_WEB_API.addAsyncPublicRoute(
    '/ou/org/:oid/conn/protos',
    {
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void>=>{
            const $:WebServer = pReq.dxc.$;
            try{
                $.sendSuccess( pRes,Connection.SUPPORTED);
            }catch(err){
                $.sendErrorAfterException( pRes, ORG_WEB_API.name,"Secret cannot be removed from organization.",
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
    '/ou/org/:oid/conn/cid/:cid',
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
                await $.context.getOrgManager().removeConnectionFromOrg(
                    pReq.user, org, pReq.params.cid
                );

                $.sendSuccess(
                    pRes,
                    await $.context.getOrgManager().removeConnectionFromOrg(
                        pReq.user, org, pReq.params.cid
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
                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Organization Identity provider unreachable.",
                    err,{cause:err.message});
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
                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Organization Identity provider unreachable.",
                    err,{cause:err.message});
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
                        authorizedCIDR: pReq.body.module.authorizedCIDR,


                        ttl: pReq.body.module.ttl,
                        keysize: pReq.body.module.keysize


                    });

                $.sendSuccess( pRes, { created: result });

            }catch(err){
                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Organization AuthModule cannot be modified",
                    err,{cause:err.message});
            }
        },
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<any>=>{
            const $:WebServer = pReq.dxc.$;

            try{
                if(typeof pReq.query.org  != 'string'){
                    throw OrganizationManagerException.UNKNOWN_ORG(null);
                }

                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.query.org as string);
                const result = await $.context.getOrgManager().getAuthModules(pReq.user, org);
                $.sendSuccess( pRes, result.map(x => x.toJsonObject(SecurityZone.PUBLIC)));

            }catch(err){
                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Organization AuthModule cannot be listed",
                    err,{cause:err.message});
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
                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Organization AuthModule cannot be modified",
                    err,{cause:err.message});
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/members/create',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);
                const user = await $.context.getOrgManager().createUser(pReq.user, org, pReq.body);

                $.sendSuccess( pRes, { uuid: user });
            } catch (err) {
                if(err.code===UserServiceException.ERR.USERNAME_NOT_AVAILABLE){
                    $.sendErrorAfterException(pRes, ORG_WEB_API.name,  "This username is not available.", err);
                }else{
                    $.sendErrorAfterException(pRes, ORG_WEB_API.name,  "Cannot create a new user into this organization", err);
                }

            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/member/:uid',
    {
        'put': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);

                $.sendSuccess( pRes, {
                    updated: await $.context.getOrgManager().updateUser(pReq.user, org, pReq.params.uid, pReq.body.user)
                });
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot create a new user into this organization", err);
            }
        },
        'delete': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);

                $.sendSuccess( pRes, {
                    updated: await $.context.getOrgManager().dropMember(pReq.user, org, pReq.params.uid, false)
                });
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot create a new user into this organization", err);
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/member/:uid/send_unlock',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);

                $.sendSuccess( pRes, {
                    sent: await $.context.getOrgManager().sendUnlockMail(pReq.user, org, pReq.params.uid)
                });
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot sent unlock mail", err);
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/member/:uid/lock',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);

                $.sendSuccess( pRes, {
                    sent: await $.context.getOrgManager().lockMember(pReq.user, org, pReq.params.uid)
                });
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot lock user account", err);
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/member/:uid/unlock',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);

                $.sendSuccess( pRes, {
                    sent: await $.context.getOrgManager().unlockMember(pReq.user, org, pReq.params.uid)
                });
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot unlock unlock user account", err);
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/member/:uid/activate',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);

                $.sendSuccess( pRes, {
                    sent: await $.context.getOrgManager().activateMember(pReq.user, org, pReq.params.uid)
                });
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot sent unlock mail", err);
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/member/:uid/roles',
    {
        'put': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);

                if(pReq.body.global===true){
                    $.sendSuccess( pRes, {
                        sent: await $.context.getUserService().updateGlobalRoles(pReq.user, org.getUID(), pReq.params.uid, pReq.body.roles)
                    });
                }else{
                    $.sendSuccess( pRes, {
                        sent: await $.context.getOrgManager().updateMemberRoles(pReq.user, org, pReq.params.uid, pReq.body.roles)
                    });
                }

            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot changed roles of this user", err);
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/member/:uid/pwd',
    {
        'put': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);
                let success = false;

                if(!UserAccount.VALIDATE._uid.test(pReq.params.uid)){
                    throw UserServiceException.INVALID_USER_UUID_FMT(pReq.params.uid);
                }

                if(pReq.user.getUID()===pReq.params.uid){
                    success = await $.context.getUserService().changeOwnPwd(
                        pReq.user,
                        pReq.body.current,
                        pReq.body.newpwd,
                        pReq.body.csrf
                    );
                }else{
                    success = await $.context.getUserService().changeUserPwd(
                        pReq.user,
                        pReq.params.uid,
                        pReq.body.current,
                        pReq.body.newpwd,
                        org,
                        pReq.body.csrf
                    );
                }

                $.sendSuccess( pRes, success);
            } catch (err) {


                $.sendErrorAfterException(
                    pRes,
                    ORG_WEB_API.name,
                    (err.message!=null ? err.message : "Cannot change password of the user account."),
                    err);
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
                $.sendErrorAfterException(
                    pRes, ORG_WEB_API.name,
                    "Cannot retrieve the list of roles supported by organization", err);
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
    '/ou/org/:oid/upload/:uid/preview',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);
                const res = await $.context.getWebserver().uploader.getResource(pReq.params.uid);

                if(res==null){
                    throw new Error("Uploaded resoruce not found");
                }

                let os = res.getExtra('os');
                if(os==null){
                    os  = pReq.body.os;
                }

                // gather extra data from store

                $.sendSuccess(
                    pRes, { info: await $.context.getOrgManager().extractInfo(res, os) }
                );
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot attach the device to the organization.", err);
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/upload/:uid/preview/icon',
    {
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);
                const res = await $.context.getWebserver().uploader.getResource(pReq.params.uid, pReq.user);

                if(res==null){
                    throw new Error("Uploaded resource not found");
                }

                let os = res.getExtra('os');
                if(os==null){
                    os  = pReq.body.os;
                }

                // gather extra data from store

                let icons = res.getExtra('icons');

                if(icons.icon!=null){

                    const img = Buffer.from( icons.icon.data+"",'base64');
                    pRes.setHeader('Content-Type', 'image/png;');
                    pRes.setHeader('Content-Length', img.length);
                    pRes.status(200);

                    console.log(img.toString('hex'));
                    pRes.write( img, ()=>{
                        pRes.send();
                        return;
                    });
                }else{
                    throw new Error("Icon not found.");
                }
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot attach the device to the organization.", err);
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:uid/store/:cid/dl',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);

                // download from store and upload to DB
                const upl = await $.context.getOrgManager().download(
                    pReq.user, org, pReq.body.pkg, pReq.body.cid
                );

                // gather extra data from store
                $.sendSuccess(
                    pRes, upl.map(x => { return {
                        uid:x.getUID(),
                        purpose:x.getExtra("purpose")
                    }})
                );

            } catch (err) {
                $.sendErrorAfterException(pRes,
                    ORG_WEB_API.name,
                    "Cannot download application from store. Please verify the package ID or contact the support.",
                    err);
            }
        }
    },{
        mcp: {
            [HTTP_VERB.POST]: {
                name:'organization-store-download-app',
                uri: '/ou/org/{organizationUUID}/store/{connectionUUID}/dl',
                summary: `To download an application identified by its **package identifier** from a remote store using the connection specified by its UUID **connectionUUID**. `,
                parameters: [{
                    name: 'organizationUUID',
                    required: true,
                    description: OrganizationUnit.TYPE.getPrimaryKey()._dscr,
                    schema: OrganizationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'connectionUUID',
                    required: true,
                    description: Connection.TYPE.getPrimaryKey()._dscr,
                    schema: Connection.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'pkg',
                    required: true,
                    description: "The package identifier of the application to download in the store",
                    schema: { type: 'string' }
                },{
                    name: 'cid',
                    required: true,
                    description: Connection.TYPE.getPrimaryKey()._dscr,
                    schema: Connection.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: "Download the application from the store using the specified connection." ,
                    schema: { type: 'array', items: { uid: { type: 'string' },  purpose: { type: 'string' } }}
                }]
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/wizard/appcheck',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.oid);
                const __io_check__ = ValidationRule.structure({
                    os: ValidationRule.os(),
                    inputs: ValidationRule.asArrayOf([
                        ValidationRule.structure({
                            uid: UploadedResource.VALIDATE.uuid,
                            purpose: ProjectInput.VALIDATE.purpose
                        })
                    ])
                });

                let options:any = {};

                if(__io_check__.test(pReq.body)){
                    options ={
                        os: pReq.body.os,
                        inputs: pReq.body.inputs,
                    };
                }



                $.sendSuccess(
                    pRes, await $.context.getOrgManager().wizardAppCheck(
                        pReq.user, org, options
                    )
                );

            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot attach the device to the organization.", err);
            }
        }
    }, {
        mcp: {
            [HTTP_VERB.POST]: {
                name: 'organization-application-wizard-appcheck',
                uri: '/ou/org/{organizationUUID}/wizard/appcheck',
                summary: `To verify if a package identified by its **package identifier** can be attached 
                to an existing application unit in the organization, or if a new application unit must be created.
                If a new application unit must be created, a new license or subscription will be created 
                else the license is verified.
                `,
                parameters: [{
                    name: 'organizationUUID',
                    required: true,
                    description: OrganizationUnit.TYPE.getPrimaryKey()._dscr,
                    schema: OrganizationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'os',
                    required: true,
                    description: "Target operating system",
                    schema: ApplicationUnit.TYPE.getProperty("os").toJSONSchemaPart()
                },{
                    name: 'inputs',
                    required: true,
                    description: "The list of uploaded files to use as inputs for the project.",
                    schema: {
                        type:"array",
                        items: { type:"object", properties: {
                            uid: { type:"string" },
                            purpose: { type:"string" }
                        }}}
                }],
                responses: [{
                    description: "The project object after execution.",
                    schema: {
                        type:"object",
                        properties: {
                            "new": { type:"boolean" },
                            lic: { type:"object" },
                            aid: ApplicationUnit.TYPE.getPrimaryKey().toJSONSchemaPart(),
                        }
                    }
                }]
            }
        }
    }
);

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:uid/usergroup/:grp/',
    {
        'delete': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);

                $.sendSuccess(
                    pRes,
                    await $.context.getOrgManager().dropUserGroup(pReq.user, org, pReq.params.grp)
                );
            } catch (err) {
                Logger.error(err.stack);
                console.log(err);
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot delete the user group from organization", err);
            }
        },
        'put': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);

                $.sendSuccess(
                    pRes,
                    await $.context.getOrgManager().updateUserGroup(pReq.user, org, pReq.params.grp, pReq.body.data)
                );
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
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot retrieve the list of members from the user group", err);
            }
        },
        'put': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const org = await $.context.getOrgManager().getOrganization(pReq.user, pReq.params.uid);

                $.sendSuccess( pRes, await $.context.getOrgManager().updateOrgGrpMembers(
                    pReq.user,
                    org,
                    org.getUserGroup(pReq.params.grp),
                    pReq.body.users));
            } catch (err) {
                $.sendErrorAfterException(pRes, ORG_WEB_API.name, "Cannot update the list of members of user group", err);
            }
        }
    },{

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
    '/ou/app/:aid/report/:mid/:kid',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse):Promise<void> => {

            const $: WebServer = pReq.dxc.$;

            try {
                const app = await $.context.getOrgManager()
                    .getDirectApplication(pReq.user, pReq.params.aid);

                let options:any = {
                    limit: 1,
                    offset: -1,
                    sort: ['created_asc'],
                    terminated: true
                };

                if(pReq.body.filter!=null){
                    if(pReq.body.filter.limit)
                        options.limit = pReq.body.filter.limit;
                    if(pReq.body.filter.offset)
                        options.offset = pReq.body.filter.offset;
                    if(pReq.body.filter.sort)
                        options.sort = pReq.body.filter.sort;
                    if(pReq.body.filter.terminated)
                        options.terminated = pReq.body.filter.terminated;
                }

                // search report by Model UID and filters
                const reports = await $.context.getAuditManager()
                    .searchReports(
                        pReq.user,
                        app,
                        pReq.params.mid, options);

                if(reports.length==0){
                    $.sendSuccess( pRes, {});
                    return;
                }

                let result:Record<AssuranceReportUUID, DataSegment[]> = {};
                reports.map( (r:AssuranceReport) => {
                    if(r.hasIndicator(pReq.params.kid)){
                        result[r.getUID()] = r.getIndicator(pReq.params.kid).data;
                    }
                })

                $.sendSuccess( pRes, result);
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



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/app/:aid/project/orders',
    {
        'get': async function (pReq:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = pReq.dxc.$;

            try{

                // target app
                const app = await $.context.getOrgManager().getDirectApplication(
                    (pReq as any).user,
                    pReq.params.aid
                );

                const pos = await $.context.getProjectManager().listProjectOrders(
                    (pReq as any).user,
                    app,
                    (pReq.query.state!=null ? pReq.query.state : ProjectState.NONE) as ProjectState
                );

                $.sendSuccess(res,pos.map(x=> x.toJsonObject(null,SecurityZone.PUBLIC)));
            }catch(err){
                $.sendErrorAfterException(res,
                    ORG_WEB_API.name,
                    "App unit : project orders be listed.",
                    err);
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/app/:aid/license/activated',
    {
        'get': async function (pReq:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = pReq.dxc.$;

            try{

                // target app
                const app = await $.context.getOrgManager().getDirectApplication(
                    (pReq as any).user,
                    pReq.params.aid
                );

                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    app.getParentOrganization()
                );

                $.sendSuccess(res,(await $.context.getOrgManager().listActivatedProductFor(org,app.getUID( ))));
            }catch(err){
                $.sendErrorAfterException(res,
                    ORG_WEB_API.name,
                    "Cannot check if the application unit has activated license.",
                    err);
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/app/:aid/license/activate',
    {
        'post': async function (pReq:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = pReq.dxc.$;

            try{

                // target app
                const app = await $.context.getOrgManager().getDirectApplication(
                    pReq.user,
                    pReq.body.aid
                );

                const org = await $.context.getOrgManager().getOrganization(
                    pReq.user,
                    app.getParentOrganization()
                );


                $.sendSuccess(res,await $.context.getOrgManager().activateLicense(
                    pReq.user,
                    org,
                    pReq.body.plan,
                    {
                        __: NodeInternalType.APP_UNIT,
                        _uid: app.getUID()
                    },
                    pReq.body.pid
                ));
            }catch(err){
                $.sendErrorAfterException(res,
                    ORG_WEB_API.name,
                    "Cannot check if the application unit has activated license.",
                    err);
            }
        }
    }
);



ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/app/:aid/scan/orders',
    {
        'get': async function (pReq:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = pReq.dxc.$;

            try{

                // target app
                const app = await $.context.getOrgManager().getDirectApplication(
                    (pReq as any).user,
                    pReq.params.aid
                );

                const scheduler = $.context.getScanScheduler();
                const data:any[] = [];

                (await scheduler.listOrdersByApp(
                    pReq.user, app
                )).map( x => {
                    data.push(x.toJsonObject());
                })

                $.sendSuccess(res,data);
            }catch(err){
                $.sendErrorAfterException(res, ORG_WEB_API.name, "Scans orders cannot be listed.",err, { cause:err.message });
            }
        }
    }
);

// /ou/app/:aid/info

ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/app/:aid/info',
    {
        'get': async function (pReq:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = pReq.dxc.$;

            try{
                // target app
                const app = await $.context.getOrgManager().getDirectApplication(
                    (pReq as any).user,
                    pReq.params.aid
                );

                $.sendSuccess(res,app.toJsonObject());
            }catch(err){
                $.sendErrorAfterException(res, ORG_WEB_API.name, "Application unit information cannot be retrieved.",err, { cause:err.message });
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/app/:aid/attr/:attr',
    {
        'get': async function (pReq:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = pReq.dxc.$;

            try{
                // target app
                const app = await $.context.getOrgManager().getDirectApplication(
                    (pReq as any).user,
                    pReq.params.aid
                );

                const attr = OrganizationAccessControl.getAttr(pReq.params.attr);

                AccessControl.isAuthorized(
                    AccessControl.access.ORG_ACL_MGT,
                    pReq.user,
                    await $.context.getOrgManager().getOrganization(
                        (pReq as any).user,
                        app.orgUnit
                    ),
                    [
                        OrganizationAccessControl.attr.OWNER,
                        OrganizationAccessControl.attr.MEMBER_GRP,
                    ]
                );

                $.sendSuccess(res, app.getAccessAttribute(attr));
            }catch(err){
                $.sendErrorAfterException(
                    res, ORG_WEB_API.name,
                    "Cannot modify attributes of this object.",
                    err,{cause:err.message});
            }
        },
        'put': async function (pReq:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = pReq.dxc.$;

            try{
                // target app
                const app = await $.context.getOrgManager().getDirectApplication(
                    (pReq as any).user,
                    pReq.params.aid
                );

                $.sendSuccess(res, await $.context.getOrgManager().updateAttr(
                    pReq.user,
                    ApplicationUnit.TYPE.getType(),
                    app,
                    OrganizationAccessControl.getAttr(pReq.params.attr),
                    pReq.body.values
                ));
            }catch(err){
                $.sendErrorAfterException(
                    res, ORG_WEB_API.name,
                    "Cannot modify attributes of this object.",
                    err,{cause:err.message});
            }
        }
    }
);


ORG_WEB_API.addAsyncAuthenticatedRoute(
    '/ou/org/:oid/licenses',
    {
        'get': async function (pReq:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = pReq.dxc.$;

            try{
                // target app
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                $.sendSuccess(res,await $.context.getOrgManager().listActivatedModels(
                    (pReq as any).user, org
                ));
            }catch(err){
                $.sendErrorAfterException(
                    res, ORG_WEB_API.name,
                    "Activated assurance models cannot be retrieved.",err,
                    { cause:err.message });
            }
        }
    });