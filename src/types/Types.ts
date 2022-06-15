
export enum L {
    PATH,
    SIZE,
    FD, // File Descriptor
    DFD, // Directory File Descriptor
    FLAG,
    ATTRMODE,
    O_FLAGS,
    VADDR,
    MPROT,
    OUTPUT_BUFFER,
    PID,
    ERR,
    SIG,
    XATTR_LIST,
    F_,
    MFD, // Mapped FD
    UID,
    GID,
    UTSNAME,
    FCNTL_ARGS, // fnctl() args
    FCNTL_RET, // fnctl() ret
    TIME, // Timestamp
    INODE, // Inode
    DEV, // Device
    DSTRUCT,
    EPFD, // EPoll File Descriptor
    WD,// Watch Descriptor,
    PIPEFD, // fd[2] read FD, write FD
    SOCKFD,
    BUFFER,
    PKEY,
    IDSTRUCT,
    FUTEX,
    TIMER,
    MQDES// struct always parsed,
}

export enum T {
    INT32,
    UINT32,
    LONG,
    ULONG,
    SHORT,
    USHORT,
    FLOAT,
    DOUBLE,
    CHAR,
    STRING,
    CHAR_BUFFER,
    POINTER32,
    POINTER64,
    STRUCT
}
