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
