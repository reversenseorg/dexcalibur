

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

import * as _path_ from "path";
import * as _fs_ from 'fs';
import Util from "./Utils.js";

const RX_SYSCALL = new RegExp("([^\\s]+)\\s+([^\\s\\(]+)\\s*\\(([^)]*)\\)\\s+(.*)");
const RX_PARAM = new RegExp("([^\\s]+)\\s+([^\\s\\(]+)\\s*\\(([^)]*)\\)\\s+(.*)");



export default class SyscallBuilder
{
    static from(pSourceFile:string, pDestinationFile:string, pEncoding:any='utf8'){


        let match:RegExpExecArray = null, fn:any = null, offset:number=-1, tpl:string="";
        let syscall_list:any = [];
        let syscall_raw:string = _fs_.readFileSync(pSourceFile, pEncoding).toString();
        let sysc:string[] = syscall_raw.split("\n");

        for(let i:number=0; i<sysc.length ; i++){
            if(["#","*","/"].indexOf(sysc[i][0])>-1 || sysc[i].length==0) continue;

            match = RX_SYSCALL.exec(sysc[i]);

            tpl = `
    new ModelSyscall({
        sys_name: "@@_sysname_@@",        
        func_name: "@@_funcname_@@",
        ret: "@@_ret_@@",
        args: [@@_args_@@],
        sysnum: [@@_sysnum_@@]
    })
    `;

            //if(match == null) Logger.error(sysc[i]);

            // return type
            tpl = tpl.replace("@@_ret_@@",match[1]);

            // names
            if(match[2] != null && (offset = match[2].indexOf(":"))>-1){
                tpl = tpl.replace("@@_sysname_@@", match[2].substr(offset+1));
                tpl = tpl.replace("@@_funcname_@@", match[2].substr(0,offset));
            }else{
                tpl = tpl.replace("@@_sysname_@@", match[2]);
                tpl = tpl.replace("@@_funcname_@@", match[2]);
            }

            // args
            tpl = tpl.replace("@@_args_@@", match[3].split(",").map(x=>'"'+Util.trim(x)+'"').join(','));

            // num
            tpl = tpl.replace("@@_sysnum_@@", match[4]);

            syscall_list.push(tpl);
        }

        var starter = `
import ModelSyscall from './ModelSyscall';

export const SYSCALLS = [
`;

        for(let i:number=0;  i<syscall_list.length ; i++){
            starter+= syscall_list[i]+`,
    `;
        }
        starter = starter.substr(0,starter.length-1);
        starter += `
];

`

        _fs_.writeFileSync(pDestinationFile,starter);
    }
}

// https://android.googlesource.com/platform/bionic/+/cd58770/libc/SYSCALLS.TXT
/*

# this file is used to list all the syscalls that will be supported by
# the Bionic C library. It is used to automatically generate the syscall
# stubs, the list of syscall constants (__NR_xxxx) and the content of <linux/_unistd.h>
#
# each non comment line has the following format:
#
# return_type    func_name[:syscall_name[:call_id]]([parameter_list])  (syscall_number|"stub")
#
# note that:
#      - syscall_name correspond to the name of the syscall, which may differ from
#        the exported function name (example: the exit syscall is implemented by the _exit()
#        function, which is not the same as the standard C exit() function which calls it)
#        The call_id parameter, given that func_name and syscall_name have
#        been provided, allows the user to specify dispatch style syscalls.
#        For example, socket() syscall on i386 actually becomes:
#          socketcall(__NR_socket, 1, *(rest of args on stack)).
#
#      - each parameter type is assumed to be stored on 32 bits, there is no plan to support
#        64-bit architectures at the moment
#
#      - it there is "stub" instead of a syscall number, the tool will not generate any
#        assembler template for the syscall; it's up to the bionic implementation to provide
#        a relevant C stub
#
#      - additionally, if the syscall number is different amoung ARM, and x86, MIPS use:
#        return_type funcname[:syscall_name](parameters) arm_number,x86_number,mips_number
#
# the file is processed by a python script named gensyscalls.py
#
*/
//# process management

