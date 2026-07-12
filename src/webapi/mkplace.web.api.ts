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
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import * as Log from "../Logger.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import {Product} from "../credit/Product.js";
import {ReversenseProduct} from "../billing/ReversenseProduct.js";
import {BusinessPlanType} from "../billing/BusinessPlan.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const MARKETPLACE_WEB_API: DelegateWebApi = new DelegateWebApi("MKP");


MARKETPLACE_WEB_API.addAsyncAuthenticatedRoute(
    '/product/:pid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC

                $.sendSuccess(res, (await $.context.mkpManager.getProduct(req.params.pid))?.toJsonObject());
            }catch(err){

                $.sendErrorAfterException(
                    res, MARKETPLACE_WEB_API.name,
                    "Cannot list available products in Marketplace ",
                    err,{cause:err.message});
            }
        }
    },{
        readProject: false,
        mcp: {
            [HTTP_VERB.GET]: {
                name: 'mkplace-get-product',
                    uri: '/product/{productUUID}',
                    summary: `To get information about a product from the Reversense marketplace using the specified "productUUID".`,
                    parameters: [{
                        name: 'productUUID',
                        required: true,
                        description: ReversenseProduct.TYPE.getPrimaryKey()._dscr,
                        schema: ReversenseProduct.TYPE.getPrimaryKey().toJSONSchemaPart()
                    }],
                    responses: [{
                        description: "The project object after execution.",
                        schema: ReversenseProduct.TYPE.toJSONSchemaPart()
                    }]
            }
        }
    }
);

MARKETPLACE_WEB_API.addAsyncAuthenticatedRoute(
    '/list/:oid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                $.sendSuccess(res, $.context.mkpManager.listLocallyAvailableProducts());
            }catch(err){

                $.sendErrorAfterException(
                    res, MARKETPLACE_WEB_API.name,
                    "Cannot list available products in Marketplace ",
                    err,{cause:err.message});
            }
        }
    },{
        readProject: false,
        mcp: {
            [HTTP_VERB.GET]: {
                name: 'mkplace-list-products',
                uri: '/product/{organizationUUID}',
                summary: `To list available products by organization.`,
                parameters: [{
                    name: 'organizationUUID',
                    required: true,
                    description: OrganizationUnit.TYPE.getPrimaryKey()._dscr,
                    schema: OrganizationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: "List of Reversense products available in the Marketplace for the specifid organization.",
                    schema: ReversenseProduct.TYPE.toJSONSchemaPart(true)
                }]
            }
        }
    }
);


MARKETPLACE_WEB_API.addAsyncAuthenticatedRoute(
    '/owned/:oid',
    {
        'get': async (pReq:DelegateRequest, pRes:DelegateResponse) =>{
            const $: WebServer = pReq.dxc.$;

            try{
                // ========== LOGIC
                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.params.oid
                );

                $.sendSuccess(pRes, $.context.mkpManager.listProductsOwnedBy(org)); // org.getBusinessPlan().wallet)

            }catch(err){

                $.sendErrorAfterException(
                    pRes, MARKETPLACE_WEB_API.name,
                    "Cannot list available products in Marketplace ",
                    err,{cause:err.message});
            }
        }
    },{
        readProject: false,
        mcp: {
            [HTTP_VERB.GET]: {
                name: 'mkplace-owned-products',
                uri: '/owned/{organizationUUID}',
                summary: `To list products owned by organization.`,
                parameters: [{
                    name: 'organizationUUID',
                    required: true,
                    description: OrganizationUnit.TYPE.getPrimaryKey()._dscr,
                    schema: OrganizationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: "List of Reversense products owned by the specified organization.",
                    schema: ReversenseProduct.TYPE.toJSONSchemaPart(true)
                }]
            }
        }
    }
);



MARKETPLACE_WEB_API.addAsyncAuthenticatedRoute(
    '/buy',
    {
        'post': async (pReq:DelegateRequest, pRes:DelegateResponse) =>{
            const $: WebServer = pReq.dxc.$;

            try{
                // ========== LOGIC

                // target org
                const org = await $.context.getOrgManager().getOrganization(
                    (pReq as any).user,
                    pReq.body.oid
                );

                $.sendSuccess(pRes, (await $.context.mkpManager.buyProduct(pReq.user, org, pReq.body.pid, pReq.body.plan, pReq.body.qtity)) );
            }catch(err){
                $.sendErrorAfterException(
                    pRes, MARKETPLACE_WEB_API.name,
                    "Cannot buy the product in Marketplace ",
                    err,{cause:err.message});
            }
        }
    },{
        readProject: false,
        mcp: {
            [HTTP_VERB.POST]: {
                name: 'mkplace-buy',
                uri: '/buy',
                summary: `To buy the product specified in **pid** using ReversenseProduct **code**, with the **plan** and the fixed quntity in **qtity**.`,
                parameters: [{
                    name: 'oid',
                    required: true,
                    description: OrganizationUnit.TYPE.getPrimaryKey()._dscr,
                    schema: OrganizationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'pid',
                    required: true,
                    description: ReversenseProduct.TYPE.getPrimaryKey()._dscr,
                    schema: ReversenseProduct.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'plan',
                    required: true,
                    description: "Plan to use for the purchase. It can be one of the following values : 'sub' for 'annual subscription with unlimited scan', 'scan' for one shot scan.",
                    schema: {
                        type: "string",
                        enum: Object.values(BusinessPlanType)
                    }
                },{
                    name: 'qtity',
                    required: true,
                    description: "Quantity of the product to buy.",
                    schema: { type:"number", minimum:1, maximum:1000 }
                }],
                responses: [{
                    description: "TRUE if the product successfully purchased, FALSE otherwise.",
                    schema: { type: "boolean" }
                }]
            }
        }
    }
);
