
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
