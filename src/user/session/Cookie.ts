import {ValidationRule} from "@dexcalibur/dexcalibur-orm";
import {SessionException} from "./SessionException.js";
import {RuntimeSecurityException} from "../../errors/RuntimeSecurityException.js";
import {CryptoUtils} from "../../CryptoUtils.js";
import {CycloneDX} from "../../bom/CycloneDX.js";
import HashAlg = CycloneDX.HashAlg;
import {Nullable} from "@dexcalibur/dxc-core-api";



export interface CookieOptions {
    originalMaxAge?: number,
    maxAge?: number,
    expires?:  Date,
    secure?: boolean|"auto",
    httpOnly?: boolean
    domain?: string,
    path?: string,
    sameSite?: SameSite,
    encode?: (vStr:string)=>string,
    decode?: (vStr:string)=>string
}

export enum SameSite {
    STRICT="strict",
    LAX="lax",
    NONE="none"
}

/**
 * Represent a cookie
 *
 * @class
 */
export class Cookie {

    static VALIDATE = {
        /*
         * RegExp to match field-content in RFC 7230 sec 3.2
         *
         * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
         * field-vchar   = VCHAR / obs-text
         * obs-text      = %x80-FF
         */
        fieldContent: ValidationRule.newRegexpAssert(/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/),
    }
    /**
     * Path of validity
     */
    path = '/';

    /**
     * httpOnly flag
     * @type {boolean}
     * @field
     */
    httpOnly = true;

    /**
     * Max age
     */
    originalMaxAge: number = 0;

    /**
     * Secure flag (send only over HTTPS)
     * @field
     */
    secure:boolean|"auto" = false;

    /**
     * Domain or subdomains of the cookie
     * @field
     */
    domain = "";

    /**
     * Only for request initiate from same site
     *
     * @field
     */
    sameSite:SameSite = SameSite.STRICT;

    private _expires:Date;



    constructor(pOptions:CookieOptions) {
        if(pOptions.expires) this._expires = pOptions.expires;
        if(pOptions.secure) this.secure = pOptions.secure;
        if(pOptions.httpOnly) this.httpOnly = pOptions.httpOnly;
        if(pOptions.domain) this.domain = pOptions.domain;
        if(pOptions.path) this.path = pOptions.path;
        if(pOptions.sameSite) this.sameSite = pOptions.sameSite;
        if(pOptions.maxAge) this.maxAge = pOptions.maxAge;
        if(pOptions.originalMaxAge) this.originalMaxAge = pOptions.originalMaxAge;
    }


    /**
     * To sign the value of a cookie with specified secret
     *
     * @param {string} pValue
     * @param {string} pSecret
     */
    static sign(pValue:string, pSecret:string):string{
        if(!Cookie.VALIDATE.fieldContent.test(pValue)){
            throw SessionException.INVALID_COOKIE_VALUE_FMT(pValue);
        }
        if(!ValidationRule.utf8String().test(pSecret)){
            throw RuntimeSecurityException.COOKIE_SIGN_FAILURE();
        }

        return pValue + '.' + CryptoUtils.hmac_sha256(pValue, pSecret, 'base64', true)
                                .replace(/\=+$/, '');
    }

    /**
     * To unsign (verify value signature) the value of a cookie with specified secret
     *
     *
     *
     * @param {string} pValue
     * @param {string} pSecret
     */
    static unsign(pValue:string, pSecret:string):Nullable<string> {

        if(!Cookie.VALIDATE.fieldContent.test(pValue)){
            throw SessionException.INVALID_COOKIE_VALUE_FMT(pValue);
        }
        if(!ValidationRule.utf8String().test(pSecret)){
            throw RuntimeSecurityException.COOKIE_UNSIGN_FAILURE();
        }

        const offset = pValue.lastIndexOf('.');
        const mac = Cookie.sign(pValue.slice(0, offset), pSecret);

        if(CryptoUtils.stringEqual(pValue,mac,"sha256")){
            return pValue.slice(0, offset);
        }else{
            // throw RuntimeSecurityException.COOKIE_UNSIGN_FAILURE();
            return null;
        }
    }

    set expires(pDate:Date) {
        this._expires = pDate;
        this.originalMaxAge = this.maxAge;
    }

    /**
     * Get expires `date`.
     *
     * @return {Date}
     * @api public
     */
    get expires():Date {
        return this._expires;
    }

    /**
     * Set expires via max-age in `ms`.
     *
     * @param {Number} ms
     * @api public
     */

    set maxAge(pMS:number|Date) {
        if (pMS && typeof pMS !== 'number' && !(pMS instanceof Date)) {
            throw new TypeError('maxAge must be a number or Date')
        }

        if (pMS instanceof Date) {
            throw new Error('maxAge as Date; pass number of milliseconds instead')
        }

        this.expires = (typeof pMS === 'number')? new Date(Date.now() + pMS): pMS;
    }

    /**
     * Get expires max-age in `ms`.
     *
     * @return {Number}
     * @api public
     */

    get maxAge():number {
        return (this.expires instanceof Date)
            ? this.expires.valueOf() - Date.now()
            : this.expires;
    }

    /**
     * Return cookie data object.
     *
     * @return {Object}
     * @api private
     */

    get data():CookieOptions {
        return {
            originalMaxAge: this.originalMaxAge
            , expires: this._expires
            , secure: this.secure
            , httpOnly: this.httpOnly
            , domain: this.domain
            , path: this.path
            , sameSite: this.sameSite
        }
    }

    /**
     * Return a serialized cookie string.
     *
     * @return {String}
     * @api public
     */

    serialize(pName:string,pVal:any){
        return Cookie._serialize(pName, pVal, this.data);
    }

    /**
     * Return JSON representation of this cookie.
     *
     * @return {Object}
     * @api private
     */

    toJSON():CookieOptions {
        return this.data;
    }


    /**
     * Parse a cookie header.
     *
     * Parse the given cookie header string into an object
     * The object has the various cookies as keys(names) => values
     *
     * @param {string} pSerializedCookie
     * @param {CookieOptions} [pOptions]
     * @return {Record<string,string>}
     * @static
     * @public
     */
     static parse(pSerializedCookie:string, pOptions:CookieOptions = {}):Record<string,string> {
        if (typeof pSerializedCookie !== 'string') {
            throw new TypeError('argument str must be a string');
        }

        const data = {}

        const pairs = pSerializedCookie.split(/; */);
        const decodeFn = pOptions.decode || decodeURIComponent;
        let pair:string, eq_idx:number, key:string, val:string;

        for (let i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            eq_idx = pair.indexOf('=');

            // skip things that don't look like key=value
            if (eq_idx < 0) {
                continue;
            }

            key = pair.slice(0, eq_idx).trim()
            val = pair.slice(++eq_idx, pair.length).trim();

            // quoted values
            if ('"' == val[0]) {
                val = val.slice(1, -1);
            }

            // only assign once
            if (undefined == data[key]) {
                try {
                    data[key] = decodeFn(val);
                } catch (e) {
                    data[key] = val;
                }
            }
        }

        return data;
    }

    /**
     * Serialize data into a cookie header.
     *
     * Serialize the a name value pair into a cookie string suitable for
     * http headers. An optional options object specified cookie parameters.
     *
     * serialize('foo', 'bar', { httpOnly: true })
     *   => "foo=bar; httpOnly"
     *
     * @param {string} name
     * @param {string} val
     * @param {object} [options]
     * @return {string}
     * @public
     */
    static _serialize(pName:string, pValue:string, pOptions:CookieOptions = {}):string {
        const encodeFn = pOptions.encode || encodeURIComponent;

        if (typeof encodeFn !== 'function') {
            throw new TypeError('option encode is invalid');
        }

        if (!Cookie.VALIDATE.fieldContent.test(pName)) {
            throw new TypeError('argument name is invalid');
        }

        const value = encodeFn(pValue);

        if (Cookie.VALIDATE.fieldContent.test(value)) {
            throw new TypeError('argument val is invalid');
        }

        let str = pName + '=' + value;

        if (null != pOptions.maxAge) {
            const maxAge = pOptions.maxAge - 0;

            if (isNaN(maxAge) || !isFinite(maxAge)) {
                throw new TypeError('option maxAge is invalid')
            }

            str += '; Max-Age=' + Math.floor(maxAge);
        }

        if (pOptions.domain) {
            if (!Cookie.VALIDATE.fieldContent.test(pOptions.domain)) {
                throw new TypeError('option domain is invalid');
            }

            str += '; Domain=' + pOptions.domain;
        }

        if (pOptions.path) {
            if (!Cookie.VALIDATE.fieldContent.test(pOptions.path)) {
                throw new TypeError('option path is invalid');
            }

            str += '; Path=' + pOptions.path;
        }

        if (pOptions.expires) {
            if (typeof pOptions.expires.toUTCString !== 'function') {
                throw new TypeError('option expires is invalid');
            }

            str += '; Expires=' + pOptions.expires.toUTCString();
        }

        if (pOptions.httpOnly) {
            str += '; HttpOnly';
        }

        if (pOptions.secure) {
            str += '; Secure';
        }

        if (pOptions.sameSite) {
            const sameSite = (typeof pOptions.sameSite === 'string')
                ? pOptions.sameSite.toLowerCase() : pOptions.sameSite;

            switch (sameSite) {
                /*case true:
                    str += '; SameSite=Strict';
                    break;*/
                case 'lax':
                    str += '; SameSite=Lax';
                    break;
                case 'strict':
                    str += '; SameSite=Strict';
                    break;
                case 'none':
                    str += '; SameSite=None';
                    break;
                default:
                    throw new TypeError('option sameSite is invalid');
            }
        }

        return str;
    }
}