import {ValidationRule} from "../../Validator.js";
import {Cookie, CookieOptions} from "./Cookie.js";


/**
 * Represent a cookie
 *
 * @class
 */
export class CookieHeader {

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
    static serialize(pName:string, pValue:string, pOptions:CookieOptions = {}):string {
        const encodeFn = pOptions.encode || encodeURIComponent;

        if (typeof encodeFn !== 'function') {
            throw new TypeError('option encode is invalid');
        }

        if (!Cookie.VALIDATE.fieldContent.test(pName)) {
            throw new TypeError('argument name is invalid');
        }

        const value = encodeFn(pValue);

        if (!Cookie.VALIDATE.fieldContent.test(value)) {
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