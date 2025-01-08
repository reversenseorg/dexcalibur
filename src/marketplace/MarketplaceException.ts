
import {Resource} from "../common/Resource.js";
import {MonitoredError} from "@dexcalibur/dexcalibur-orm";
import {ErrorCode} from "../errors/MonitoredError.js";


const BASE_ERR = ErrorCode.MARKETPLACE;

export class MarketplaceException extends MonitoredError {

    static RESOURCE_WRITE_FAILURE = (pRes:Resource)=>{
        return new MarketplaceException(`Resource [uid=${pRes.getPath()}] cannot be wrote`,BASE_ERR + 1) };

    static RESOURCE_INTEGRITY_FAILURE = (pRes:Resource)=>{
        return new MarketplaceException(`Integrity check of resource [uid=${pRes.getPath()}] failed`,BASE_ERR + 2) };

    static PRODUCT_NOT_FOUND = (pProductUID:string)=>{
        return new MarketplaceException(`Product not found [uid=${pProductUID}]`,BASE_ERR + 3) };

    static ACTION_NOT_SUPPORTED = (pCommand:string,pAction:string)=>{
        return new MarketplaceException(`Action not supported [cmd=${pCommand}][action=${pAction}]`,BASE_ERR + 4) };

    static PRODUCT_UPDATE_FAILED = (pProductUID:string)=>{
        return new MarketplaceException(`Product cannot be updated [uid=${pProductUID}]`,BASE_ERR + 5) };

    static PRODUCT_DELETE_FAILED = (pProductUID:string)=>{
        return new MarketplaceException(`Product cannot be deleted [uid=${pProductUID}]`,BASE_ERR + 6) };

    static RELEASE_UPDATE_FAILED = (pProductUID:string, pRel:string)=>{
        return new MarketplaceException(`Release cannot be added [product=${pProductUID}][release=${pRel}]`,BASE_ERR + 7) };

    static RELEASE_DELETE_FAILED = (pProductUID:string, pRel:string)=>{
        return new MarketplaceException(`Release cannot be deleted [product=${pProductUID}][release=${pRel}]`,BASE_ERR + 8) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('MARKETPLACE', pMsg, pCode, pExtra);
    }
}