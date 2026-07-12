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

import * as _url_ from 'url';

var parse = _url_.parse


export class UrlParser {


    /** Parse the `req` url with memoization.
    *
    * @param {ServerRequest} req
    * @return {Object}
    * @public
    */

    static parseurl(pRequest:any) {
        if (pRequest.url === undefined) {
            // URL is undefined
            return undefined
        }

        let parsed = pRequest._parsedUrl;

        if (UrlParser.fresh(pRequest.url, parsed)) {
            // Return cached URL parse
            return parsed;
        }

        // Parse the URL
        parsed = UrlParser.fastparse(pRequest.url);
        parsed._raw = pRequest.url;

        return (pRequest._parsedUrl = parsed);
    };

    /**
     * Parse the `req` original url with fallback and memoization.
     *
     * @param {ServerRequest} req
     * @return {Object}
     * @public
     */

    static originalurl(pRequest:any):any {
        var url = pRequest.originalUrl

        if (typeof url !== 'string') {
            // Fallback
            return UrlParser.parseurl(pRequest)
        }

        var parsed = pRequest._parsedOriginalUrl

        if (UrlParser.fresh(url, parsed)) {
            // Return cached URL parse
            return parsed
        }

        // Parse the URL
        parsed = UrlParser.fastparse(url)
        parsed._raw = url

        return (pRequest._parsedOriginalUrl = parsed)
    };

    /**
     * Parse the `str` url with fast-path short-cut.
     *
     * @param {string} str
     * @return {Object}
     * @private
     */

    static fastparse (str) {
        if (typeof str !== 'string' || str.charCodeAt(0) !== 0x2f /* / */) {
            return url.parse(str)
        }

        var pathname = str
        var query = null
        var search = null

        // This takes the regexp from https://github.com/joyent/node/pull/7878
        // Which is /^(\/[^?#\s]*)(\?[^#\s]*)?$/
        // And unrolls it into a for loop
        for (var i = 1; i < str.length; i++) {
            switch (str.charCodeAt(i)) {
                case 0x3f: /* ?  */
                    if (search === null) {
                        pathname = str.substring(0, i)
                        query = str.substring(i + 1)
                        search = str.substring(i)
                    }
                    break
                case 0x09: /* \t */
                case 0x0a: /* \n */
                case 0x0c: /* \f */
                case 0x0d: /* \r */
                case 0x20: /*    */
                case 0x23: /* #  */
                case 0xa0:
                case 0xfeff:
                    return url.parse(str)
            }
        }

        var url = url.Url !== undefined
            ? new url.Url()
            : {}

        url.path = str
        url.href = str
        url.pathname = pathname

        if (search !== null) {
            url.query = query
            url.search = search
        }

        return url
    }

    /**
     * Determine if parsed is still fresh for url.
     *
     * @param {string} url
     * @param {object} parsedUrl
     * @return {boolean}
     * @private
     */

    static fresh (url, parsedUrl) {
        return typeof parsedUrl === 'object' &&
            parsedUrl !== null /*&&
            (Url === undefined || parsedUrl instanceof Url) */&&
            parsedUrl._raw === url
    }

}