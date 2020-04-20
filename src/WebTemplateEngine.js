const _fs_ = require('fs');
const _path_ = require('path');

// Replace 'pattern' by 'replace" in 'source' buffer and 
// return the new buffer
function BufferReplace(source, pattern, replace) {
    let bo = Buffer.alloc(source.length + replace.length - pattern.length);
    let off = source.indexOf(pattern);

    source.copy(bo, 0, 0, off);

    let rep = Buffer.from(replace, 'binary');
    rep.copy(bo, off, 0, replace.length);

    source.copy(bo, off + replace.length, off + pattern.length, source.length);

    return bo;
}

/**
 * Minimalistic template engine replace token by file content
 * (as old Apache module SSI)
 * 
 * @class
 */
class WebTemplateEngine {

    constructor( pProject) {
        this.project = pProject;
        this.tokenRE = new RegExp("<!--##\\s*(.+)\\s+##-->");
        this.tokens = {};
        this.root = _path_.join( __dirname, "webserver", "public");
    }

    
    /**
     * To replace token by the corresponding file content  before
     * to send the HTTP response to the client.
     * 
     * Token should take the form <!--## file/path/to/tpl.html ##-->
     * 
     * @param {*} data 
     */
    process(data) {
        let m = null, tpl = null, match = false;
        do {
            m = this.tokenRE.exec(data);
            //console.log(m);

            if (m == null || m.length < 2) {
                break;
            }
            tpl = _fs_.readFileSync(_path_.join(this.root, m[1]), 'binary');
            // console.log(this.root+m[1],tpl);

            // data = data.replace(m[0], fs.readFileSync(this.root+m[1]));
            data = BufferReplace(data, m[0], tpl);
            match = true;
        } while (this.tokenRE.test(data));

        if (match)
            return data.toString('utf8');//('ascii'); 
        else
            return data;
    }
}

module.exports = WebTemplateEngine;