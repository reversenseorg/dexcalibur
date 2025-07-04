'use strict';

const util = require('./util');
const fs = require('fs');
const proc = require('child_process');

const BUFLEN = 1024;

function runCmdSync (ls, cmd) {
    let result = '';
    let buf = new Buffer(BUFLEN);
    let bread = 0;
    /*
      if (typeof ls.syncStdin !== 'number' || isNaN(ls.syncStdin)) {
        throw new Error('This must run from inside radare2.');
      }
    */
    fs.writeSync(ls.syncStdin, cmd + '\n');
    while ((bread = fs.readSync(ls.syncStdout, buf, 0, BUFLEN, null)) > 0) {
        /* check for cmd end */
        if (buf[bread - 1] !== 0x00) {
            result += buf.slice(0, bread).toString();
        } else {
            result += buf.slice(0, bread - 1).toString();
            break;
        }
    }

    return result;
}

function parseJSON (func, cmd) {
    const res = func(cmd);
    if (res === null) {
        return res;
    }
    try {
        return JSON.parse(res);
    } catch (e) {
        return null;
    }
}

function r2bind (pProcessInfo, r2cmd) {
    const buf = new Buffer(1024);

    /* Wait for radare2 to start */
    if (r2cmd === 'pipe') {
        fs.readSync(pProcessInfo.syncStdout, buf, 0, 1024, null);
    }

    const r2 = {
        /* Run R2 cmd */
        cmd: function (cmd) {
            return runCmdSync(pProcessInfo, util.cleanCmd(cmd));
        },

        /* Run cmd and return JSON output */
        cmdj: function (cmd) {
            return parseJSON(r2.cmd, util.cleanCmd(cmd));
        },

        /* Quit CMD */
        quit: function () {
            if (pProcessInfo.stdin && pProcessInfo.stdin.end) {
                pProcessInfo.stdin.end();
            }
            pProcessInfo.kill('SIGINT');
        }
    };

    return r2;
}

module.exports.r2bind = r2bind;
