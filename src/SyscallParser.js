const fs = require("fs");
const CLASS = require("./CoreClass.js");
const UT = require("./utils.js");

const syscall_raw = fs.readFileSync("./builtinref/syscall.js","utf8");

var sysc = syscall_raw.split("\n"); 
var syscall_list = [];

const RX_SYSCALL = new RegExp("([^\\s]+)\\s+([^\\s\\(]+)\\s*\\(([^)]*)\\)\\s+(.*)");
const RX_PARAM = new RegExp("([^\\s]+)\\s+([^\\s\\(]+)\\s*\\(([^)]*)\\)\\s+(.*)");

let match = null, fn = null, offset=-1, tpl="";

console.log(sysc);

for(let i=0; i<sysc.length ; i++){
    if(["#","*","/"].indexOf(sysc[i][0])>-1 || sysc[i].length==0) continue;

    match = RX_SYSCALL.exec(sysc[i]);

    tpl = `
    new CLASS.Syscall({
        sys_name: "@@_sysname_@@",        
        func_name: "@@_funcname_@@",
        ret: "@@_ret_@@",
        args: [@@_args_@@],
        sysnum: [@@_sysnum_@@]
    })
    `;
    
    if(match == null) console.log(sysc[i]);

    fn = new CLASS.Syscall();

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
    tpl = tpl.replace("@@_args_@@", match[3].split(",").map(x=>'"'+UT.trim(x)+'"').join(','));

    // num
    tpl = tpl.replace("@@_sysnum_@@", match[4]);
    
    syscall_list.push(tpl);
}

var starter = `
const CLASS = require('./CoreClass.js');

const SYSCALLS = [
`;

for(let i=0;  i<syscall_list.length ; i++){
    starter+= syscall_list[i]+`,
    `;   
}
starter = starter.substr(0,starter.length-1);
starter += `
];

module.exports = SYSCALLS;
`

fs.writeFileSync("./Syscalls.js",starter);

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

