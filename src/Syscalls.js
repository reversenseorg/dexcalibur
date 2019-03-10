const CLASS = require('./CoreClass.js');

const SYSCALLS = [

    new CLASS.Syscall({
        sys_name: "exit",        
        func_name: "_exit_thread",
        ret: "void",
        args: ["int"],
        sysnum: [1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fork",        
        func_name: "__fork",
        ret: "pid_t",
        args: ["void"],
        sysnum: [2]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "waitpid",        
        func_name: "_waitpid",
        ret: "pid_t",
        args: ["pid_t","int*","int","struct rusage*"],
        sysnum: [-1,7,7]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "waitid",        
        func_name: "__waitid",
        ret: "int",
        args: ["int","pid_t","struct siginfo_t*","int","void*"],
        sysnum: [280,284,278]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "clone",        
        func_name: "__sys_clone",
        ret: "pid_t",
        args: ["int","void*","int*","void*","int*"],
        sysnum: [120]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "execve",        
        func_name: "execve",
        ret: "int",
        args: ["const char*","char* const*","char* const*"],
        sysnum: [11]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setuid32",        
        func_name: "__setuid",
        ret: "int",
        args: ["uid_t"],
        sysnum: [213,213,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setuid",        
        func_name: "__setuid",
        ret: "int",
        args: ["uid_t"],
        sysnum: [-1,-1,23]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getuid32",        
        func_name: "getuid",
        ret: "uid_t",
        args: [""],
        sysnum: [199,199,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getuid",        
        func_name: "getuid",
        ret: "uid_t",
        args: [""],
        sysnum: [-1,-1,24]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getgid32",        
        func_name: "getgid",
        ret: "gid_t",
        args: [""],
        sysnum: [200,200,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getgid",        
        func_name: "getgid",
        ret: "gid_t",
        args: [""],
        sysnum: [-1,-1,47]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "geteuid32",        
        func_name: "geteuid",
        ret: "uid_t",
        args: [""],
        sysnum: [201,201,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "geteuid",        
        func_name: "geteuid",
        ret: "uid_t",
        args: [""],
        sysnum: [-1,-1,49]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getegid32",        
        func_name: "getegid",
        ret: "gid_t",
        args: [""],
        sysnum: [202,202,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getegid",        
        func_name: "getegid",
        ret: "gid_t",
        args: [""],
        sysnum: [-1,-1,50]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getresuid32",        
        func_name: "getresuid",
        ret: "uid_t",
        args: ["uid_t *ruid","uid_t *euid","uid_t *suid"],
        sysnum: [209,209,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getresuid",        
        func_name: "getresuid",
        ret: "uid_t",
        args: ["uid_t *ruid","uid_t *euid","uid_t *suid"],
        sysnum: [-1,-1,186]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getresgid32",        
        func_name: "getresgid",
        ret: "gid_t",
        args: ["gid_t *rgid","gid_t *egid","gid_t *sgid"],
        sysnum: [211,211,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getresgid",        
        func_name: "getresgid",
        ret: "gid_t",
        args: ["gid_t *rgid","gid_t *egid","gid_t *sgid"],
        sysnum: [-1,-1,191]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "gettid",        
        func_name: "gettid",
        ret: "pid_t",
        args: [""],
        sysnum: [224,224,222]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "readahead",        
        func_name: "readahead",
        ret: "ssize_t",
        args: ["int","off64_t","size_t"],
        sysnum: [225,225,223]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getgroups32",        
        func_name: "getgroups",
        ret: "int",
        args: ["int","gid_t *"],
        sysnum: [205,205,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getgroups",        
        func_name: "getgroups",
        ret: "int",
        args: ["int","gid_t *"],
        sysnum: [-1,-1,80]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getpgid",        
        func_name: "getpgid",
        ret: "pid_t",
        args: ["pid_t"],
        sysnum: [132]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getppid",        
        func_name: "getppid",
        ret: "pid_t",
        args: [""],
        sysnum: [64]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getsid",        
        func_name: "getsid",
        ret: "pid_t",
        args: ["pid_t"],
        sysnum: [147]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setsid",        
        func_name: "setsid",
        ret: "pid_t",
        args: [""],
        sysnum: [66]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setgid32",        
        func_name: "setgid",
        ret: "int",
        args: ["gid_t"],
        sysnum: [214,214,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setgid",        
        func_name: "setgid",
        ret: "int",
        args: ["gid_t"],
        sysnum: [-1,-1,46]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "seteuid32",        
        func_name: "seteuid",
        ret: "int",
        args: ["uid_t"],
        sysnum: [] // TODO
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setreuid32",        
        func_name: "__setreuid",
        ret: "int",
        args: ["uid_t","uid_t"],
        sysnum: [203,203,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setreuid",        
        func_name: "__setreuid",
        ret: "int",
        args: ["uid_t","uid_t"],
        sysnum: [-1,-1,70]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setresuid32",        
        func_name: "__setresuid",
        ret: "int",
        args: ["uid_t","uid_t","uid_t"],
        sysnum: [208,208,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setresuid",        
        func_name: "__setresuid",
        ret: "int",
        args: ["uid_t","uid_t","uid_t"],
        sysnum: [-1,-1,185]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setresgid32",        
        func_name: "setresgid",
        ret: "int",
        args: ["gid_t","gid_t","gid_t"],
        sysnum: [210,210,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setresgid",        
        func_name: "setresgid",
        ret: "int",
        args: ["gid_t","gid_t","gid_t"],
        sysnum: [-1,-1,190]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "brk",        
        func_name: "__brk",
        ret: "void*",
        args: ["void*"],
        sysnum: [45]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "kill",        
        func_name: "kill",
        ret: "int",
        args: ["pid_t","int"],
        sysnum: [-1,37,37]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "tkill",        
        func_name: "tkill",
        ret: "int",
        args: ["pid_t tid","int sig"],
        sysnum: [-1,238,236]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "tgkill",        
        func_name: "tgkill",
        ret: "int",
        args: ["pid_t tgid","pid_t tid","int sig"],
        sysnum: [-1,270,266]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "ptrace",        
        func_name: "__ptrace",
        ret: "int",
        args: ["int request","int pid","void* addr","void* data"],
        sysnum: [26]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "set_thread_area",        
        func_name: "__set_thread_area",
        ret: "int",
        args: ["void*  user_desc"],
        sysnum: [-1,243,283]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getpriority",        
        func_name: "__getpriority",
        ret: "int",
        args: ["int","int"],
        sysnum: [96]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setpriority",        
        func_name: "setpriority",
        ret: "int",
        args: ["int","int","int"],
        sysnum: [97]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setrlimit",        
        func_name: "setrlimit",
        ret: "int",
        args: ["int resource","const struct rlimit *rlp"],
        sysnum: [75]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "ugetrlimit",        
        func_name: "getrlimit",
        ret: "int",
        args: ["int resource","struct rlimit *rlp"],
        sysnum: [191,191,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getrlimit",        
        func_name: "getrlimit",
        ret: "int",
        args: ["int resource","struct rlimit *rlp"],
        sysnum: [-1,-1,76]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getrusage",        
        func_name: "getrusage",
        ret: "int",
        args: ["int who","struct rusage*  r_usage"],
        sysnum: [77]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setgroups32",        
        func_name: "setgroups",
        ret: "int",
        args: ["int","const gid_t *"],
        sysnum: [206,206,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setgroups",        
        func_name: "setgroups",
        ret: "int",
        args: ["int","const gid_t *"],
        sysnum: [-1,-1,81]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getpgrp",        
        func_name: "getpgrp",
        ret: "pid_t",
        args: ["void"],
        sysnum: [] // TODO
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setpgid",        
        func_name: "setpgid",
        ret: "int",
        args: ["pid_t","pid_t"],
        sysnum: [57]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "vfork",        
        func_name: "vfork",
        ret: "pid_t",
        args: ["void"],
        sysnum: [190,-1,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setregid32",        
        func_name: "setregid",
        ret: "int",
        args: ["gid_t","gid_t"],
        sysnum: [204,204,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setregid",        
        func_name: "setregid",
        ret: "int",
        args: ["gid_t","gid_t"],
        sysnum: [-1,-1,71]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "chroot",        
        func_name: "chroot",
        ret: "int",
        args: ["const char *"],
        sysnum: [61]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "prctl",        
        func_name: "prctl",
        ret: "int",
        args: ["int option","unsigned int arg2","unsigned int arg3","unsigned int arg4","unsigned int arg5"],
        sysnum: [172,172,192]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "capget",        
        func_name: "capget",
        ret: "int",
        args: ["cap_user_header_t header","cap_user_data_t data"],
        sysnum: [184,184,204]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "capset",        
        func_name: "capset",
        ret: "int",
        args: ["cap_user_header_t header","const cap_user_data_t data"],
        sysnum: [185,185,205]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sigaltstack",        
        func_name: "sigaltstack",
        ret: "int",
        args: ["const stack_t*","stack_t*"],
        sysnum: [186,186,206]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "acct",        
        func_name: "acct",
        ret: "int",
        args: ["const char*  filepath"],
        sysnum: [51]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "read",        
        func_name: "read",
        ret: "ssize_t",
        args: ["int","void*","size_t"],
        sysnum: [3]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "write",        
        func_name: "write",
        ret: "ssize_t",
        args: ["int","const void*","size_t"],
        sysnum: [4]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "pread64",        
        func_name: "pread64",
        ret: "ssize_t",
        args: ["int","void *","size_t","off64_t"],
        sysnum: [180,180,200]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "pwrite64",        
        func_name: "pwrite64",
        ret: "ssize_t",
        args: ["int","void *","size_t","off64_t"],
        sysnum: [181,181,201]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "open",        
        func_name: "__open",
        ret: "int",
        args: ["const char*","int","mode_t"],
        sysnum: [5]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "openat",        
        func_name: "__openat",
        ret: "int",
        args: ["int","const char*","int","mode_t"],
        sysnum: [322,295,288]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "close",        
        func_name: "close",
        ret: "int",
        args: ["int"],
        sysnum: [6]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "creat",        
        func_name: "creat",
        ret: "int",
        args: ["const char*","mode_t"],
        sysnum: [] //TODO
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "lseek",        
        func_name: "lseek",
        ret: "off_t",
        args: ["int","off_t","int"],
        sysnum: [19]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "_llseek",        
        func_name: "__llseek",
        ret: "int",
        args: ["int","unsigned long","unsigned long","loff_t*","int"],
        sysnum: [140]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getpid",        
        func_name: "getpid",
        ret: "pid_t",
        args: [""],
        sysnum: [20]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "mmap",        
        func_name: "mmap",
        ret: "*",
        args: ["void *","size_t","int","int","int","long"],
        sysnum: [] // TODO
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "mmap2",        
        func_name: "__mmap2",
        ret: "*",
        args: ["void*","size_t","int","int","int","long"],
        sysnum: [192,192,210]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "munmap",        
        func_name: "munmap",
        ret: "int",
        args: ["void *","size_t"],
        sysnum: [91]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "mremap",        
        func_name: "mremap",
        ret: "*",
        args: ["void *","size_t","size_t","unsigned long"],
        sysnum: [163,163,167]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "msync",        
        func_name: "msync",
        ret: "int",
        args: ["const void *","size_t","int"],
        sysnum: [144]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "mprotect",        
        func_name: "mprotect",
        ret: "int",
        args: ["const void *","size_t","int"],
        sysnum: [125]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "madvise",        
        func_name: "madvise",
        ret: "int",
        args: ["const void *","size_t","int"],
        sysnum: [220,219,218]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "mlock",        
        func_name: "mlock",
        ret: "int",
        args: ["const void *addr","size_t len"],
        sysnum: [150,150,154]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "munlock",        
        func_name: "munlock",
        ret: "int",
        args: ["const void *addr","size_t len"],
        sysnum: [151,151,155]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "mlockall",        
        func_name: "mlockall",
        ret: "int",
        args: ["int flags"],
        sysnum: [152,152,156]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "munlockall",        
        func_name: "munlockall",
        ret: "int",
        args: [""],
        sysnum: [153,153,157]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "mincore",        
        func_name: "mincore",
        ret: "int",
        args: ["void*  start","size_t  length","unsigned char*  vec"],
        sysnum: [219,218,217]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "ioctl",        
        func_name: "__ioctl",
        ret: "int",
        args: ["int","int","void *"],
        sysnum: [54]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "readv",        
        func_name: "readv",
        ret: "int",
        args: ["int","const struct iovec *","int"],
        sysnum: [145]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "writev",        
        func_name: "writev",
        ret: "int",
        args: ["int","const struct iovec *","int"],
        sysnum: [146]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fcntl",        
        func_name: "__fcntl",
        ret: "int",
        args: ["int","int","void*"],
        sysnum: [55]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "flock",        
        func_name: "flock",
        ret: "int",
        args: ["int","int"],
        sysnum: [143]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fchmod",        
        func_name: "fchmod",
        ret: "int",
        args: ["int","mode_t"],
        sysnum: [94]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "dup",        
        func_name: "dup",
        ret: "int",
        args: ["int"],
        sysnum: [41]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "pipe",        
        func_name: "pipe",
        ret: "int",
        args: ["int *"],
        sysnum: [42,42,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "pipe2",        
        func_name: "pipe2",
        ret: "int",
        args: ["int *","int"],
        sysnum: [359,331,328]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "dup2",        
        func_name: "dup2",
        ret: "int",
        args: ["int","int"],
        sysnum: [63]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "_newselect",        
        func_name: "select",
        ret: "int",
        args: ["int","struct fd_set *","struct fd_set *","struct fd_set *","struct timeval *"],
        sysnum: [142]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "ftruncate",        
        func_name: "ftruncate",
        ret: "int",
        args: ["int","off_t"],
        sysnum: [93]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "ftruncate64",        
        func_name: "ftruncate64",
        ret: "int",
        args: ["int","off64_t"],
        sysnum: [194,194,212]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getdents64",        
        func_name: "getdents",
        ret: "int",
        args: ["unsigned int","struct dirent *","unsigned int"],
        sysnum: [217,220,219]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fsync",        
        func_name: "fsync",
        ret: "int",
        args: ["int"],
        sysnum: [118]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fdatasync",        
        func_name: "fdatasync",
        ret: "int",
        args: ["int"],
        sysnum: [148,148,152]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fchown32",        
        func_name: "fchown",
        ret: "int",
        args: ["int","uid_t","gid_t"],
        sysnum: [207,207,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fchown",        
        func_name: "fchown",
        ret: "int",
        args: ["int","uid_t","gid_t"],
        sysnum: [-1,-1,95]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sync",        
        func_name: "sync",
        ret: "void",
        args: ["void"],
        sysnum: [36]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fcntl64",        
        func_name: "__fcntl64",
        ret: "int",
        args: ["int","int","void *"],
        sysnum: [221,221,220]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fstatfs64",        
        func_name: "__fstatfs64",
        ret: "int",
        args: ["int","size_t","struct statfs *"],
        sysnum: [267,269,256]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sendfile",        
        func_name: "sendfile",
        ret: "ssize_t",
        args: ["int out_fd","int in_fd","off_t *offset","size_t count"],
        sysnum: [187,187,207]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fstatat64",        
        func_name: "fstatat",
        ret: "int",
        args: ["int dirfd","const char *path","struct stat *buf","int flags"],
        sysnum: [327,300,293]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "mkdirat",        
        func_name: "mkdirat",
        ret: "int",
        args: ["int dirfd","const char *pathname","mode_t mode"],
        sysnum: [323,296,289]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fchownat",        
        func_name: "fchownat",
        ret: "int",
        args: ["int dirfd","const char *path","uid_t owner","gid_t group","int flags"],
        sysnum: [325,298,291]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fchmodat",        
        func_name: "fchmodat",
        ret: "int",
        args: ["int dirfd","const char *path","mode_t mode","int flags"],
        sysnum: [333,306,299]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "renameat",        
        func_name: "renameat",
        ret: "int",
        args: ["int olddirfd","const char *oldpath","int newdirfd","const char *newpath"],
        sysnum: [329,302,295]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fsetxattr",        
        func_name: "fsetxattr",
        ret: "int",
        args: ["int","const char *","const void *","size_t","int"],
        sysnum: [228,228,226]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fgetxattr",        
        func_name: "fgetxattr",
        ret: "ssize_t",
        args: ["int","const char *","void *","size_t"],
        sysnum: [231,231,229]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "flistxattr",        
        func_name: "flistxattr",
        ret: "ssize_t",
        args: ["int","char *","size_t"],
        sysnum: [234,234,232]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fremovexattr",        
        func_name: "fremovexattr",
        ret: "int",
        args: ["int","const char *"],
        sysnum: [237,237,235]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "link",        
        func_name: "link",
        ret: "int",
        args: ["const char*","const char*"],
        sysnum: [9]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "unlink",        
        func_name: "unlink",
        ret: "int",
        args: ["const char*"],
        sysnum: [10]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "unlinkat",        
        func_name: "unlinkat",
        ret: "int",
        args: ["int","const char *","int"],
        sysnum: [328,301,294]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "chdir",        
        func_name: "chdir",
        ret: "int",
        args: ["const char*"],
        sysnum: [12]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "mknod",        
        func_name: "mknod",
        ret: "int",
        args: ["const char*","mode_t","dev_t"],
        sysnum: [14]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "chmod",        
        func_name: "chmod",
        ret: "int",
        args: ["const char*","mode_t"],
        sysnum: [15]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "chown32",        
        func_name: "chown",
        ret: "int",
        args: ["const char *","uid_t","gid_t"],
        sysnum: [212,212,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "chown",        
        func_name: "chown",
        ret: "int",
        args: ["const char *","uid_t","gid_t"],
        sysnum: [-1,-1,202]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "lchown32",        
        func_name: "lchown",
        ret: "int",
        args: ["const char*","uid_t","gid_t"],
        sysnum: [198,198,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "lchown",        
        func_name: "lchown",
        ret: "int",
        args: ["const char*","uid_t","gid_t"],
        sysnum: [-1,-1,16]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "mount",        
        func_name: "mount",
        ret: "int",
        args: ["const char*","const char*","const char*","unsigned long","const void*"],
        sysnum: [21]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "umount",        
        func_name: "umount",
        ret: "int",
        args: ["const char*"],
        sysnum: [] // TODO
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "umount2",        
        func_name: "umount2",
        ret: "int",
        args: ["const char*","int"],
        sysnum: [52]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fstat64",        
        func_name: "fstat",
        ret: "int",
        args: ["int","struct stat*"],
        sysnum: [197,197,215]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "stat64",        
        func_name: "stat",
        ret: "int",
        args: ["const char *","struct stat *"],
        sysnum: [195,195,213]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "lstat64",        
        func_name: "lstat",
        ret: "int",
        args: ["const char *","struct stat *"],
        sysnum: [196,196,214]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "mkdir",        
        func_name: "mkdir",
        ret: "int",
        args: ["const char *","mode_t"],
        sysnum: [39]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "readlink",        
        func_name: "readlink",
        ret: "int",
        args: ["const char *","char *","size_t"],
        sysnum: [85]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "rmdir",        
        func_name: "rmdir",
        ret: "int",
        args: ["const char *"],
        sysnum: [40]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "rename",        
        func_name: "rename",
        ret: "int",
        args: ["const char *","const char *"],
        sysnum: [38]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getcwd",        
        func_name: "__getcwd",
        ret: "int",
        args: ["char * buf","size_t size"],
        sysnum: [183,183,203]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "access",        
        func_name: "access",
        ret: "int",
        args: ["const char *","int"],
        sysnum: [33]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "faccessat",        
        func_name: "faccessat",
        ret: "int",
        args: ["int","const char *","int","int"],
        sysnum: [334,307,300]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "symlink",        
        func_name: "symlink",
        ret: "int",
        args: ["const char *","const char *"],
        sysnum: [83]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "fchdir",        
        func_name: "fchdir",
        ret: "int",
        args: ["int"],
        sysnum: [133]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "truncate",        
        func_name: "truncate",
        ret: "int",
        args: ["const char*","off_t"],
        sysnum: [92]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setxattr",        
        func_name: "setxattr",
        ret: "int",
        args: ["const char *","const char *","const void *","size_t","int"],
        sysnum: [226,226,224]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "lsetxattr",        
        func_name: "lsetxattr",
        ret: "int",
        args: ["const char *","const char *","const void *","size_t","int"],
        sysnum: [227,227,225]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getxattr",        
        func_name: "getxattr",
        ret: "ssize_t",
        args: ["const char *","const char *","void *","size_t"],
        sysnum: [229,229,227]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "lgetxattr",        
        func_name: "lgetxattr",
        ret: "ssize_t",
        args: ["const char *","const char *","void *","size_t"],
        sysnum: [230,230,228]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "listxattr",        
        func_name: "listxattr",
        ret: "ssize_t",
        args: ["const char *","char *","size_t"],
        sysnum: [232,232,230]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "llistxattr",        
        func_name: "llistxattr",
        ret: "ssize_t",
        args: ["const char *","char *","size_t"],
        sysnum: [233,233,231]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "removexattr",        
        func_name: "removexattr",
        ret: "int",
        args: ["const char *","const char *"],
        sysnum: [235,235,233]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "lremovexattr",        
        func_name: "lremovexattr",
        ret: "int",
        args: ["const char *","const char *"],
        sysnum: [236,236,234]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "statfs64",        
        func_name: "__statfs64",
        ret: "int",
        args: ["const char *","size_t","struct statfs *"],
        sysnum: [266,268,255]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "unshare",        
        func_name: "unshare",
        ret: "long",
        args: ["unsigned long"],
        sysnum: [337,310,303]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "pause",        
        func_name: "pause",
        ret: "int",
        args: [""],
        sysnum: [29]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "gettimeofday",        
        func_name: "gettimeofday",
        ret: "int",
        args: ["struct timeval*","struct timezone*"],
        sysnum: [78]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "settimeofday",        
        func_name: "settimeofday",
        ret: "int",
        args: ["const struct timeval*","const struct timezone*"],
        sysnum: [79]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "times",        
        func_name: "times",
        ret: "clock_t",
        args: ["struct tms *"],
        sysnum: [43]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "nanosleep",        
        func_name: "nanosleep",
        ret: "int",
        args: ["const struct timespec *","struct timespec *"],
        sysnum: [162,162,166]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "clock_gettime",        
        func_name: "clock_gettime",
        ret: "int",
        args: ["clockid_t clk_id","struct timespec *tp"],
        sysnum: [263,265,263]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "clock_settime",        
        func_name: "clock_settime",
        ret: "int",
        args: ["clockid_t clk_id","const struct timespec *tp"],
        sysnum: [262,264,262]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "clock_getres",        
        func_name: "clock_getres",
        ret: "int",
        args: ["clockid_t clk_id","struct timespec *res"],
        sysnum: [264,266,264]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "clock_nanosleep",        
        func_name: "clock_nanosleep",
        ret: "int",
        args: ["clockid_t clock_id","int flags","const struct timespec *req","struct timespec *rem"],
        sysnum: [265,267,265]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getitimer",        
        func_name: "getitimer",
        ret: "int",
        args: ["int","const struct itimerval *"],
        sysnum: [105]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setitimer",        
        func_name: "setitimer",
        ret: "int",
        args: ["int","const struct itimerval *","struct itimerval *"],
        sysnum: [104]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "timer_create",        
        func_name: "__timer_create",
        ret: "int",
        args: ["clockid_t clockid","struct sigevent *evp","timer_t *timerid"],
        sysnum: [257,259,257]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "timer_settime",        
        func_name: "__timer_settime",
        ret: "int",
        args: ["timer_t","int","const struct itimerspec*","struct itimerspec*"],
        sysnum: [258,260,258]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "timer_gettime",        
        func_name: "__timer_gettime",
        ret: "int",
        args: ["timer_t","struct itimerspec*"],
        sysnum: [259,261,259]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "timer_getoverrun",        
        func_name: "__timer_getoverrun",
        ret: "int",
        args: ["timer_t"],
        sysnum: [260,262,260]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "timer_delete",        
        func_name: "__timer_delete",
        ret: "int",
        args: ["timer_t"],
        sysnum: [261,263,261]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "utimes",        
        func_name: "utimes",
        ret: "int",
        args: ["const char*","const struct timeval tvp[2]"],
        sysnum: [269,271,267]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "utimensat",        
        func_name: "utimensat",
        ret: "int",
        args: ["int","const char *","const struct timespec times[2]","int"],
        sysnum: [348,320,316]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sigaction",        
        func_name: "sigaction",
        ret: "int",
        args: ["int","const struct sigaction *","struct sigaction *"],
        sysnum: [67]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sigprocmask",        
        func_name: "sigprocmask",
        ret: "int",
        args: ["int","const sigset_t *","sigset_t *"],
        sysnum: [126]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sigsuspend",        
        func_name: "__sigsuspend",
        ret: "int",
        args: ["int unused1","int unused2","unsigned mask"],
        sysnum: [72,72,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sigsuspend",        
        func_name: "__sigsuspend",
        ret: "int",
        args: ["const sigset_t *mask"],
        sysnum: [-1,-1,72]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "rt_sigaction",        
        func_name: "__rt_sigaction",
        ret: "int",
        args: ["int sig","const struct sigaction *act","struct sigaction *oact","size_t sigsetsize"],
        sysnum: [174,174,194]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "rt_sigprocmask",        
        func_name: "__rt_sigprocmask",
        ret: "int",
        args: ["int  how","const sigset_t *set","sigset_t *oset","size_t sigsetsize"],
        sysnum: [175,175,195]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "rt_sigtimedwait",        
        func_name: "__rt_sigtimedwait",
        ret: "int",
        args: ["const sigset_t *set","struct siginfo_t  *info","struct timespec_t  *timeout","size_t  sigset_size"],
        sysnum: [177,177,197]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sigpending",        
        func_name: "sigpending",
        ret: "int",
        args: ["sigset_t *"],
        sysnum: [73]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socket",        
        func_name: "socket",
        ret: "int",
        args: ["int","int","int"],
        sysnum: [281,-1,183]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketpair",        
        func_name: "socketpair",
        ret: "int",
        args: ["int","int","int","int*"],
        sysnum: [288,-1,184]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "bind",        
        func_name: "bind",
        ret: "int",
        args: ["int","struct sockaddr *","int"],
        sysnum: [282,-1,169]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "connect",        
        func_name: "connect",
        ret: "int",
        args: ["int","struct sockaddr *","socklen_t"],
        sysnum: [283,-1,170]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "listen",        
        func_name: "listen",
        ret: "int",
        args: ["int","int"],
        sysnum: [284,-1,174]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "accept",        
        func_name: "accept",
        ret: "int",
        args: ["int","struct sockaddr *","socklen_t *"],
        sysnum: [285,-1,168]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getsockname",        
        func_name: "getsockname",
        ret: "int",
        args: ["int","struct sockaddr *","socklen_t *"],
        sysnum: [286,-1,172]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getpeername",        
        func_name: "getpeername",
        ret: "int",
        args: ["int","struct sockaddr *","socklen_t *"],
        sysnum: [287,-1,171]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sendto",        
        func_name: "sendto",
        ret: "int",
        args: ["int","const void *","size_t","int","const struct sockaddr *","socklen_t"],
        sysnum: [290,-1,180]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "recvfrom",        
        func_name: "recvfrom",
        ret: "int",
        args: ["int","void *","size_t","unsigned int","struct sockaddr *","socklen_t *"],
        sysnum: [292,-1,176]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "shutdown",        
        func_name: "shutdown",
        ret: "int",
        args: ["int","int"],
        sysnum: [293,-1,182]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "setsockopt",        
        func_name: "setsockopt",
        ret: "int",
        args: ["int","int","int","const void *","socklen_t"],
        sysnum: [294,-1,181]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getsockopt",        
        func_name: "getsockopt",
        ret: "int",
        args: ["int","int","int","void *","socklen_t *"],
        sysnum: [295,-1,173]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sendmsg",        
        func_name: "sendmsg",
        ret: "int",
        args: ["int","const struct msghdr *","unsigned int"],
        sysnum: [296,-1,179]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "recvmsg",        
        func_name: "recvmsg",
        ret: "int",
        args: ["int","struct msghdr *","unsigned int"],
        sysnum: [297,-1,177]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:1",        
        func_name: "socket",
        ret: "int",
        args: ["int","int","int"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:2",        
        func_name: "bind",
        ret: "int",
        args: ["int","struct sockaddr *","int"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:3",        
        func_name: "connect",
        ret: "int",
        args: ["int","struct sockaddr *","socklen_t"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:4",        
        func_name: "listen",
        ret: "int",
        args: ["int","int"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:5",        
        func_name: "accept",
        ret: "int",
        args: ["int","struct sockaddr *","socklen_t *"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:6",        
        func_name: "getsockname",
        ret: "int",
        args: ["int","struct sockaddr *","socklen_t *"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:7",        
        func_name: "getpeername",
        ret: "int",
        args: ["int","struct sockaddr *","socklen_t *"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:8",        
        func_name: "socketpair",
        ret: "int",
        args: ["int","int","int","int*"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:11",        
        func_name: "sendto",
        ret: "int",
        args: ["int","const void *","size_t","int","const struct sockaddr *","socklen_t"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:12",        
        func_name: "recvfrom",
        ret: "int",
        args: ["int","void *","size_t","unsigned int","struct sockaddr *","socklen_t *"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:13",        
        func_name: "shutdown",
        ret: "int",
        args: ["int","int"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:14",        
        func_name: "setsockopt",
        ret: "int",
        args: ["int","int","int","const void *","socklen_t"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:15",        
        func_name: "getsockopt",
        ret: "int",
        args: ["int","int","int","void *","socklen_t *"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:16",        
        func_name: "sendmsg",
        ret: "int",
        args: ["int","const struct msghdr *","unsigned int"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "socketcall:17",        
        func_name: "recvmsg",
        ret: "int",
        args: ["int","struct msghdr *","unsigned int"],
        sysnum: [-1,102,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sched_setscheduler",        
        func_name: "sched_setscheduler",
        ret: "int",
        args: ["pid_t pid","int policy","const struct sched_param *param"],
        sysnum: [156,156,160]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sched_getscheduler",        
        func_name: "sched_getscheduler",
        ret: "int",
        args: ["pid_t pid"],
        sysnum: [157,157,161]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sched_yield",        
        func_name: "sched_yield",
        ret: "int",
        args: ["void"],
        sysnum: [158,158,162]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sched_setparam",        
        func_name: "sched_setparam",
        ret: "int",
        args: ["pid_t pid","const struct sched_param *param"],
        sysnum: [154,154,158]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sched_getparam",        
        func_name: "sched_getparam",
        ret: "int",
        args: ["pid_t pid","struct sched_param *param"],
        sysnum: [155,155,159]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sched_get_priority_max",        
        func_name: "sched_get_priority_max",
        ret: "int",
        args: ["int policy"],
        sysnum: [159,159,163]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sched_get_priority_min",        
        func_name: "sched_get_priority_min",
        ret: "int",
        args: ["int policy"],
        sysnum: [160,160,164]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sched_rr_get_interval",        
        func_name: "sched_rr_get_interval",
        ret: "int",
        args: ["pid_t pid","struct timespec *interval"],
        sysnum: [161,161,165]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sched_setaffinity",        
        func_name: "sched_setaffinity",
        ret: "int",
        args: ["pid_t pid","size_t setsize","const cpu_set_t* set"],
        sysnum: [241,241,239]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sched_getaffinity",        
        func_name: "__sched_getaffinity",
        ret: "int",
        args: ["pid_t pid","size_t setsize","cpu_set_t* set"],
        sysnum: [242,242,240]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "getcpu",        
        func_name: "__getcpu",
        ret: "int",
        args: ["unsigned *cpu","unsigned *node","void *unused"],
        sysnum: [345,318,312]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "ioprio_set",        
        func_name: "ioprio_set",
        ret: "int",
        args: ["int which","int who","int ioprio"],
        sysnum: [314,289,314]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "ioprio_get",        
        func_name: "ioprio_get",
        ret: "int",
        args: ["int which","int who"],
        sysnum: [315,290,315]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "uname",        
        func_name: "uname",
        ret: "int",
        args: ["struct utsname *"],
        sysnum: [122]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "wait4",        
        func_name: "__wait4",
        ret: "pid_t",
        args: ["pid_t pid","int *status","int options","struct rusage *rusage"],
        sysnum: [114]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "umask",        
        func_name: "umask",
        ret: "mode_t",
        args: ["mode_t"],
        sysnum: [60]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "reboot",        
        func_name: "__reboot",
        ret: "int",
        args: ["int","int","int","void *"],
        sysnum: [88]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "syslog",        
        func_name: "__syslog",
        ret: "int",
        args: ["int","char *","int"],
        sysnum: [103]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "init_module",        
        func_name: "init_module",
        ret: "int",
        args: ["void *","unsigned long","const char *"],
        sysnum: [128]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "delete_module",        
        func_name: "delete_module",
        ret: "int",
        args: ["const char*","unsigned int"],
        sysnum: [129]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "syslog",        
        func_name: "klogctl",
        ret: "int",
        args: ["int","char *","int"],
        sysnum: [103]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "sysinfo",        
        func_name: "sysinfo",
        ret: "int",
        args: ["struct sysinfo *"],
        sysnum: [116]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "personality",        
        func_name: "personality",
        ret: "int",
        args: ["unsigned long"],
        sysnum: [136]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "perf_event_open",        
        func_name: "perf_event_open",
        ret: "long",
        args: ["struct perf_event_attr *attr_uptr","pid_t pid","int cpu","int group_fd","unsigned long flags"],
        sysnum: [364]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "futex",        
        func_name: "futex",
        ret: "int",
        args: ["void *","int","int","void *","void *","int"],
        sysnum: [240,240,238]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "epoll_create",        
        func_name: "epoll_create",
        ret: "int",
        args: ["int size"],
        sysnum: [250,254,248]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "epoll_ctl",        
        func_name: "epoll_ctl",
        ret: "int",
        args: ["int epfd","int op","int fd","struct epoll_event *event"],
        sysnum: [251,255,249]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "epoll_wait",        
        func_name: "epoll_wait",
        ret: "int",
        args: ["int epfd","struct epoll_event *events","int max","int timeout"],
        sysnum: [252,256,250]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "inotify_init",        
        func_name: "inotify_init",
        ret: "int",
        args: ["void"],
        sysnum: [316,291,284]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "inotify_add_watch",        
        func_name: "inotify_add_watch",
        ret: "int",
        args: ["int","const char *","unsigned int"],
        sysnum: [317,292,285]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "inotify_rm_watch",        
        func_name: "inotify_rm_watch",
        ret: "int",
        args: ["int","unsigned int"],
        sysnum: [318,293,286]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "poll",        
        func_name: "poll",
        ret: "int",
        args: ["struct pollfd *","unsigned int","long"],
        sysnum: [168,168,188]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "eventfd2",        
        func_name: "eventfd",
        ret: "int",
        args: ["unsigned int","int"],
        sysnum: [356,328,325]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "ARM_set_tls",        
        func_name: "__set_tls",
        ret: "int",
        args: ["void*"],
        sysnum: [983045,-1,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "ARM_cacheflush",        
        func_name: "cacheflush",
        ret: "int",
        args: ["long start","long end","long flags"],
        sysnum: [983042,-1,-1]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "cacheflush",        
        func_name: "_flush_cache",
        ret: "int",
        args: ["char *addr","const int nbytes","const int op"],
        sysnum: [-1,-1,147]
    })
    ,
    
    new CLASS.Syscall({
        sys_name: "syscall",        
        func_name: "syscall",
        ret: "int",
        args: ["int number","..."],
        sysnum: [-1,-1,0]
    })
    ,
   
];

module.exports = SYSCALLS;
