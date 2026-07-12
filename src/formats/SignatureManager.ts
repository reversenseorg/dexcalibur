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

import {FormatSignature} from "./FormatSignature.js";
import {DataFormatManager} from "./DataFormatManager.js";
import {IMagicParser, IParser, IParserFeature} from "../parser/IParser.js";


export interface SignatureDef {
    name:string;
}

export class SignatureManager {

    static sigs:Record<string, any> = {};

    constructor() {
    }

    static addSignatures(pSignatures:any[]):void {
        pSignatures.map(x =>{
            this.sigs[x.name] = x;
        })
    }

    static getMagicOf(pFormat: string) {
        const p = DataFormatManager.getInstance().getMagicByFormat(pFormat);
        return (p.length>0? p[0] : null);
    }

    static getParserOf(pFormat: string) {
        const p = DataFormatManager.getInstance().getParserByFormat(pFormat);
        return (p.length>0? (p[0] as IMagicParser<any>).hasSignature : null);
    }

    static getDescription(pFormat: string, pCat:string = null):string {

        const p = DataFormatManager.getInstance().getParserByFormat(pFormat);
        return (p.length>0? p[0].description : null);
    }

    static getExtractor(pFormat: string):any {
        return null;
    }
}

SignatureManager.addSignatures([
    // gzip
    new FormatSignature({
        name: "gzip",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("gzip"),
        parser: SignatureManager.getParserOf("gzip"),
        description: SignatureManager.getDescription("gzip"),
        extractor: SignatureManager.getExtractor("gzip"),
    }),
    // .deb
    new FormatSignature({
        name: "deb",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("deb"),
        parser: SignatureManager.getParserOf("deb"),
        description: SignatureManager.getDescription("deb"),
        extractor: null,
    }),
    // 7-zip
    new FormatSignature({
        name: "7zip",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("sevenzip"),
        parser: SignatureManager.getParserOf("sevenzip"),
        description: SignatureManager.getDescription("sevenzip"),
        extractor: SignatureManager.getExtractor("sevenzip"),
    }),
    // xz
    new FormatSignature({
        name: "xz",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("xz"),
        parser: SignatureManager.getParserOf("xz"),
        description: SignatureManager.getDescription("xz"),
        extractor: SignatureManager.getExtractor("lzma"),
    }),
    // tarball
    new FormatSignature({
        name: "tarball",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("tarball"),
        parser: SignatureManager.getParserOf("tarball"),
        description: SignatureManager.getDescription("tarball"),
        extractor: SignatureManager.getExtractor("tarball"),
    }),
    // squashfs
    new FormatSignature({
        name: "squashfs",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("squashfs"),
        parser: SignatureManager.getParserOf("squashfs"),
        description: SignatureManager.getDescription("squashfs"),
        extractor: SignatureManager.getExtractor("squashfs"),
    }),
    // dlob
    new FormatSignature({
        name: "dlob",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("dlob"),
        parser: SignatureManager.getParserOf("dlob"),
        description: SignatureManager.getDescription("dlob"),
        extractor: null,
    }),
    // lzma
    new FormatSignature({
        name: "lzma",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("lzma"),
        parser: SignatureManager.getParserOf("lzma"),
        description: SignatureManager.getDescription("lzma"),
        //extractor: SignatureManager.getExtractor("sevenzip"),
        extractor: SignatureManager.getExtractor("lzma"),
    }),
    // bmp
    new FormatSignature({
        name: "bmp",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("bmp"),
        parser: SignatureManager.getParserOf("bmp"),
        description: SignatureManager.getDescription("bmp"),
        extractor: SignatureManager.getExtractor("bmp"),
    }),
    // bzip2
    new FormatSignature({
        name: "bzip2",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("bzip2"),
        parser: SignatureManager.getParserOf("bzip2"),
        description: SignatureManager.getDescription("bzip2"),
        extractor: SignatureManager.getExtractor("bzip2"),
    }),
    // uimage
    new FormatSignature({
        name: "uimage",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("uimage"),
        parser: SignatureManager.getParserOf("uimage"),
        description: SignatureManager.getDescription("uimage"),
        extractor: SignatureManager.getExtractor("uimage"),
    }),
    // packimg header
    new FormatSignature({
        name: "packimg",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("packimg"),
        parser: SignatureManager.getParserOf("packimg"),
        description: SignatureManager.getDescription("packimg"),
        extractor: null,
    }),
    // crc32 constants
    new FormatSignature({
        name: "crc32",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("hashes"),
        parser: SignatureManager.getParserOf("hashes"),
        description: SignatureManager.getDescription("CRC32"),
        extractor: null,
    }),
    // sha256 constants
    new FormatSignature({
        name: "sha256",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("hashes"),
        parser: SignatureManager.getParserOf("hashes"),
        description: SignatureManager.getDescription("SHA256"),
        extractor: null,
    }),
    // cpio
    new FormatSignature({
        name: "cpio",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("cpio"),
        parser: SignatureManager.getParserOf("cpio"),
        description: SignatureManager.getDescription("cpio"),
        extractor: SignatureManager.getExtractor("sevenzip"),
    }),
    // iso9660 primary volume
    new FormatSignature({
        name: "iso9660",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("iso9660"),
        parser: SignatureManager.getParserOf("iso9660"),
        description: SignatureManager.getDescription("iso9660"),
        extractor: SignatureManager.getExtractor("iso9660"),
    }),
    // linux kernel
    new FormatSignature({
        name: "linux_kernel",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("linux"),
        parser: SignatureManager.getParserOf("linux"),
        description: SignatureManager.getDescription("LINUX_KERNEL_VERSION","linux"),
        extractor: SignatureManager.getExtractor("linux"),
    }),
    // linux boot image
    new FormatSignature({
        name: "linux_boot_image",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("linux"),
        parser: SignatureManager.getParserOf("linux"),
        description: SignatureManager.getDescription("LINUX_BOOT_IMAGE","linux"),
        extractor: null,
    }),
    // linux arm zimage
    new FormatSignature({
        name: "linux_arm_zimage",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("linux"),
        parser: SignatureManager.getParserOf("linux"),
        description: SignatureManager.getDescription("LINUX_ARM_ZIMAGE","linux"),
        extractor: null,
    }),
    // zstd
    new FormatSignature({
        name: "zstd",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("zstd"),
        parser: SignatureManager.getParserOf("zstd"),
        description: SignatureManager.getDescription("zstd"),
        extractor: SignatureManager.getExtractor("zstd"),
    }),
    // zip
    new FormatSignature({
        name: "zip",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("zip"),
        parser: SignatureManager.getParserOf("zip"),
        description: SignatureManager.getDescription("zip"),
        extractor: SignatureManager.getExtractor("sevenzip"),
    }),
    // Intel PCH ROM
    new FormatSignature({
        name: "pchrom",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("pchrom"),
        parser: SignatureManager.getParserOf("pchrom"),
        description: SignatureManager.getDescription("pchrom"),
        extractor: SignatureManager.getExtractor("uefi"),
    }),
    // UEFI PI volume
    new FormatSignature({
        name: "uefi_pi_volume",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("uefi"),
        parser: SignatureManager.getParserOf("uefi"),
        description: SignatureManager.getDescription("VOLUME","uefi"),
        extractor: SignatureManager.getExtractor("uefi"),
    }),
    // UEFI capsule image
    new FormatSignature({
        name: "uefi_capsule",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("uefi"),
        parser: SignatureManager.getParserOf("uefi"),
        description: SignatureManager.getDescription("CAPSULE","uefi"),
        extractor: SignatureManager.getExtractor("uefi"),
    }),
    // PDF document
    new FormatSignature({
        name: "pdf",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("pdf"),
        parser: SignatureManager.getParserOf("pdf"),
        description: SignatureManager.getDescription("pdf"),
        extractor: null,
    }),
    // ELF
    new FormatSignature({
        name: "elf",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("elf"),
        parser: SignatureManager.getParserOf("elf"),
        description: SignatureManager.getDescription("elf"),
        extractor: null,
    }),
    // CramFS
    new FormatSignature({
        name: "cramfs",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("cramfs"),
        parser: SignatureManager.getParserOf("cramfs"),
        description: SignatureManager.getDescription("cramfs"),
        extractor: SignatureManager.getExtractor("sevenzip"),
    }),
    // QNX IFS
    // TODO: The signature and extractor are untested. Need a sample IFS image.
    new FormatSignature({
        name: "qnx_ifs",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("qnx"),
        parser: SignatureManager.getParserOf("qnx"),
        description: SignatureManager.getDescription("IFS","qnx"),
        extractor: SignatureManager.getExtractor("dumpifs"),
    }),
    // RomFS
    new FormatSignature({
        name: "romfs",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("romfs"),
        parser: SignatureManager.getParserOf("romfs"),
        description: SignatureManager.getDescription("romfs"),
        extractor: SignatureManager.getExtractor("romfs"),
    }),
    // EXT
    new FormatSignature({
        name: "ext",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("ext"),
        parser: SignatureManager.getParserOf("ext"),
        description: SignatureManager.getDescription("ext"),
        extractor: SignatureManager.getExtractor("tsk"),
    }),
    // CAB archive
    new FormatSignature({
        name: "cab",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("cab"),
        parser: SignatureManager.getParserOf("cab"),
        description: SignatureManager.getDescription("cab"),
        extractor: SignatureManager.getExtractor("cab"),
    }),
    // JFFS2
    new FormatSignature({
        name: "jffs2",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("jffs2"),
        parser: SignatureManager.getParserOf("jffs2"),
        description: SignatureManager.getDescription("jffs2"),
        extractor: SignatureManager.getExtractor("jffs2"),
    }),
    // YAFFS
    new FormatSignature({
        name: "yaffs",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("yaffs"),
        parser: SignatureManager.getParserOf("yaffs"),
        description: SignatureManager.getDescription("yaffs"),
        extractor: SignatureManager.getExtractor("yaffs2"),
    }),
    // lz4
    new FormatSignature({
        name: "lz4",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("lz4"),
        parser: SignatureManager.getParserOf("lz4"),
        description: SignatureManager.getDescription("lz4"),
        extractor: SignatureManager.getExtractor("lz4"),
    }),
    // lzop
    new FormatSignature({
        name: "lzop",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("lzop"),
        parser: SignatureManager.getParserOf("lzop"),
        description: SignatureManager.getDescription("lzop"),
        extractor: SignatureManager.getExtractor("lzop"),
    }),
    // lzop
    new FormatSignature({
        name: "pe",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("pe"),
        parser: SignatureManager.getParserOf("pe"),
        description: SignatureManager.getDescription("pe"),
        extractor: null,
    }),
    // zlib
    new FormatSignature({
        name: "zlib",
        // The magic bytes for this signature are only 2 bytes, only match on the beginning of a file
        short: true,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("zlib"),
        parser: SignatureManager.getParserOf("zlib"),
        description: SignatureManager.getDescription("zlib"),
        extractor: SignatureManager.getExtractor("zlib"),
    }),
    // gpg signed data
    new FormatSignature({
        name: "gpg_signed",
        // The magic bytes for this signature are only 2 bytes, only match on the beginning of a file
        short: true,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("gpg"),
        parser: SignatureManager.getParserOf("gpg"),
        description: SignatureManager.getDescription("GPG_SIGNED","gpg"),
        extractor: SignatureManager.getExtractor("gpg"),
    }),
    // pem certificates
    new FormatSignature({
        name: "pem_certificate",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("pem"),
        parser: SignatureManager.getParserOf("pem"),
        description: SignatureManager.getDescription("PEM_CERTIFICATE","pem"),
        extractor: SignatureManager.getExtractor("pem"),
    }),
    // pem public keys
    new FormatSignature({
        name: "pem_public_key",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("pem"),
        parser: SignatureManager.getParserOf("pem"),
        description: SignatureManager.getDescription("PEM_PUBLIC_KEY","pem"),
        extractor: SignatureManager.getExtractor("pem"),
    }),
    // pem private keys
    new FormatSignature({
        name: "pem_private_key",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("pem"),
        parser: SignatureManager.getParserOf("pem"),
        description: SignatureManager.getDescription("PEM_PRIVATE_KEY","pem"),
        extractor: SignatureManager.getExtractor("pem"),
    }),
    // netgear chk
    new FormatSignature({
        name: "chk",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("chk"),
        parser: SignatureManager.getParserOf("chk"),
        description: SignatureManager.getDescription("chk"),
        extractor: null,
    }),
    // trx
    new FormatSignature({
        name: "trx",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("trx"),
        parser: SignatureManager.getParserOf("trx"),
        description: SignatureManager.getDescription("trx"),
        extractor: SignatureManager.getExtractor("trx"),
    }),
    // Motorola S-record
    new FormatSignature({
        name: "srecord",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("srec"),
        parser: SignatureManager.getParserOf("srec"),
        description: SignatureManager.getDescription("SREC","srec"),
        extractor: SignatureManager.getExtractor("srec"),
    }),
    // Motorola S-record (generic)
    new FormatSignature({
        name: "srecord_generic",
        short: true,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("srec"),
        parser: SignatureManager.getParserOf("srec"),
        description: SignatureManager.getDescription("SREC_SHORT","srec"),
        extractor: SignatureManager.getExtractor("srec"),
    }),
    // Android sparse
    new FormatSignature({
        name: "android_sparse",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("androidsparse"),
        parser: SignatureManager.getParserOf("androidsparse"),
        description: SignatureManager.getDescription("androidsparse"),
        extractor: SignatureManager.getExtractor("androidsparse"),
    }),
    // device tree blob
    new FormatSignature({
        name: "dtb",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("dtb"),
        parser: SignatureManager.getParserOf("dtb"),
        description: SignatureManager.getDescription("dtb"),
        extractor: SignatureManager.getExtractor("dtb"),
    }),
    // ubi
    new FormatSignature({
        name: "ubi",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("ubi"),
        parser: SignatureManager.getParserOf("ubi"),
        description: SignatureManager.getDescription("UBI_IMAGE","ubi"),
        extractor: SignatureManager.getExtractor("ubi"),
    }),
    // ubifs
    new FormatSignature({
        name: "ubifs",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("ubi"),
        parser: SignatureManager.getParserOf("ubi"),
        description: SignatureManager.getDescription("UBI_FS","ubi"),
        extractor: SignatureManager.getExtractor("ubi"),
    }),
    // cfe bootloader
    new FormatSignature({
        name: "cfe",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("cfe"),
        parser: SignatureManager.getParserOf("cfe"),
        description: SignatureManager.getDescription("cfe"),
        extractor: null,
    }),
    // SEAMA firmware header
    new FormatSignature({
        name: "seama",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("seama"),
        parser: SignatureManager.getParserOf("seama"),
        description: SignatureManager.getDescription("seama"),
        extractor: null,
    }),
    // compress'd
    new FormatSignature({
        name: "compressd",
        short: true,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("compressd"),
        parser: SignatureManager.getParserOf("compressd"),
        description: SignatureManager.getDescription("compressd"),
        extractor: SignatureManager.getExtractor("sevenzip"),
    }),
    // rar archive
    new FormatSignature({
        name: "rar",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("rar"),
        parser: SignatureManager.getParserOf("rar"),
        description: SignatureManager.getDescription("rar"),
        extractor: SignatureManager.getExtractor("rar"),
    }),
    // PNG image
    new FormatSignature({
        name: "png",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("png"),
        parser: SignatureManager.getParserOf("png"),
        description: SignatureManager.getDescription("png"),
        extractor: SignatureManager.getExtractor("png"),
    }),
    // JPEG image
    new FormatSignature({
        name: "jpeg",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("jpeg"),
        parser: SignatureManager.getParserOf("jpeg"),
        description: SignatureManager.getDescription("jpeg"),
        extractor: SignatureManager.getExtractor("jpeg"),
    }),
    // arcadyan obfuscated lzma
    new FormatSignature({
        name: "arcadyan",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("arcadyan"),
        parser: SignatureManager.getParserOf("arcadyan"),
        description: SignatureManager.getDescription("arcadyan"),
        extractor: SignatureManager.getExtractor("arcadyan"),
    }),
    // copyright text
    new FormatSignature({
        name: "copyright",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("copyright"),
        parser: SignatureManager.getParserOf("copyright"),
        description: SignatureManager.getDescription("copyright"),
        extractor: null,
    }),
    // WIND kernel version
    new FormatSignature({
        name: "wind_kernel",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("vxworks"),
        parser: SignatureManager.getParserOf("vxworks"),
        description: SignatureManager.getDescription("WIND_KERNEL","vxworks"),
        extractor: null,
    }),
    // vxworks symbol table
    new FormatSignature({
        name: "vxworks_symtab",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("vxworks"),
        parser: SignatureManager.getParserOf("vxworks"),
        description: SignatureManager.getDescription("SYMTAB","vxworks"),
        extractor: SignatureManager.getExtractor("vxworks"),
    }),
    // ecos mips exception handler
    new FormatSignature({
        name: "ecos",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("ecos"),
        parser: SignatureManager.getParserOf("ecos"),
        description: SignatureManager.getDescription("EXCEPTION_HANDLER","ecos"),
        extractor: null,
    }),
    // dmg
    new FormatSignature({
        name: "dmg",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("dmg"),
        parser: SignatureManager.getParserOf("dmg"),
        description: SignatureManager.getDescription("dmg"),
        extractor: SignatureManager.getExtractor("dmg"),
    }),
    // riff
    new FormatSignature({
        name: "riff",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("riff"),
        parser: SignatureManager.getParserOf("riff"),
        description: SignatureManager.getDescription("riff"),
        extractor: SignatureManager.getExtractor("riff"),
    }),
    // openssl
    new FormatSignature({
        name: "openssl",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("openssl"),
        parser: SignatureManager.getParserOf("openssl"),
        description: SignatureManager.getDescription("openssl"),
        extractor: SignatureManager.getExtractor("encfw"),
    }),
    // lzfse
    new FormatSignature({
        name: "lzfse",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("lzfse"),
        parser: SignatureManager.getParserOf("lzfse"),
        description: SignatureManager.getDescription("lzfse"),
        extractor: SignatureManager.getExtractor("lzfse"),
    }),
    // MBR
    new FormatSignature({
        name: "mbr",
        short: true,
        offset: 0x01FE,
        always_display: true,
        magic: SignatureManager.getMagicOf("mbr"),
        parser: SignatureManager.getParserOf("mbr"),
        description: SignatureManager.getDescription("mbr"),
        extractor: SignatureManager.getExtractor("mbr"),
    }),
    // tp-link
    new FormatSignature({
        name: "tplink",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("tplink"),
        parser: SignatureManager.getParserOf("tplink"),
        description: SignatureManager.getDescription("tplink"),
        extractor: null,
    }),
    // HP PJL
    new FormatSignature({
        name: "pjl",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("pjl"),
        parser: SignatureManager.getParserOf("pjl"),
        description: SignatureManager.getDescription("pjl"),
        extractor: null,
    }),
    // JBOOT ARM firmware image
    new FormatSignature({
        name: "jboot_arm",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("jboot"),
        parser: SignatureManager.getParserOf("jboot"),
        description: SignatureManager.getDescription("JBOOT_ARM","jboot"),
        extractor: null,
    }),
    // JBOOT STAG header
    new FormatSignature({
        name: "jboot_stag",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("jboot"),
        parser: SignatureManager.getParserOf("jboot"),
        description: SignatureManager.getDescription("JBOOT_STAG","jboot"),
        extractor: null,
    }),
    // JBOOT SCH2 header
    new FormatSignature({
        name: "jboot_sch2",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("jboot"),
        parser: SignatureManager.getParserOf("jboot"),
        description: SignatureManager.getDescription("JBOOT_SCH2","jboot"),
        extractor: SignatureManager.getExtractor("jboot"),
    }),
    // pcap-ng
    new FormatSignature({
        name: "pcapng",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("pcap"),
        parser: SignatureManager.getParserOf("pcap"),
        description: SignatureManager.getDescription("PCAPNG","pcap"),
        extractor: SignatureManager.getExtractor("pcap"),
    }),
    // RSA encrypted data
    new FormatSignature({
        name: "rsa",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("rsa"),
        parser: SignatureManager.getParserOf("rsa"),
        description: SignatureManager.getDescription("rsa"),
        extractor: null,
    }),
    // GIF image
    new FormatSignature({
        name: "gif",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("gif"),
        parser: SignatureManager.getParserOf("gif"),
        description: SignatureManager.getDescription("gif"),
        extractor: SignatureManager.getExtractor("gif"),
    }),
    // SVG image
    new FormatSignature({
        name: "svg",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("svg"),
        parser: SignatureManager.getParserOf("svg"),
        description: SignatureManager.getDescription("svg"),
        extractor: SignatureManager.getExtractor("svg"),
    }),
    // Linux ARM64 boot image
    new FormatSignature({
        name: "linux_arm64_boot_image",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("linux"),
        parser: SignatureManager.getParserOf("linux"),
        description: SignatureManager.getDescription("LINUX_ARM64_BOOT_IMAGE","linux"),
        extractor: null,
    }),
    // FAT
    new FormatSignature({
        name: "fat",
        short: true,
        offset: 0x01FE,
        always_display: false,
        magic: SignatureManager.getMagicOf("fat"),
        parser: SignatureManager.getParserOf("fat"),
        description: SignatureManager.getDescription("fat"),
        extractor: SignatureManager.getExtractor("tsk"),
    }),
    // EFI GPT
    new FormatSignature({
        name: "efigpt",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("efigpt"),
        parser: SignatureManager.getParserOf("efigpt"),
        description: SignatureManager.getDescription("efigpt"),
        extractor: SignatureManager.getExtractor("sevenzip"),
    }),
    // RTK firmware header
    new FormatSignature({
        name: "rtk",
        short: true,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("rtk"),
        parser: SignatureManager.getParserOf("rtk"),
        description: SignatureManager.getDescription("rtk"),
        extractor: null,
    }),
    // AES S-Box
    new FormatSignature({
        name: "aes_sbox",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("aes"),
        parser: SignatureManager.getParserOf("aes"),
        description: SignatureManager.getDescription("AES_SBOX","aes"),
        extractor: null,
    }),
    // AES Forward table
    new FormatSignature({
        name: "aes_forward_table",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("aes"),
        parser: SignatureManager.getParserOf("aes"),
        description: SignatureManager.getDescription("AES_FT","aes"),
        extractor: null,
    }),
    // AES Reverse table
    new FormatSignature({
        name: "aes_reverse_table",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("aes"),
        parser: SignatureManager.getParserOf("aes"),
        description: SignatureManager.getDescription("AES_RT","aes"),
        extractor: null,
    }),
    // AES RCON
    new FormatSignature({
        name: "aes_rcon",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("aes"),
        parser: SignatureManager.getParserOf("aes"),
        description: SignatureManager.getDescription("AES_RCON","aes"),
        extractor: null,
    }),
    // Accelerated AES
    new FormatSignature({
        name: "aes_acceleration_table",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("aes"),
        parser: SignatureManager.getParserOf("aes"),
        description: SignatureManager.getDescription("AES_ACC","aes"),
        extractor: null,
    }),
    // LUKS
    new FormatSignature({
        name: "luks",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("luks"),
        parser: SignatureManager.getParserOf("luks"),
        description: SignatureManager.getDescription("luks"),
        extractor: null,
    }),
    // TP-Link RTOS
    new FormatSignature({
        name: "tplink_rtos",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("tplink"),
        parser: SignatureManager.getParserOf("tplink"),
        description: SignatureManager.getDescription("RTOS","tplink"),
        extractor: null,
    }),
    // BIN firmware header
    new FormatSignature({
        name: "binhdr",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("binhdr"),
        parser: SignatureManager.getParserOf("binhdr"),
        description: SignatureManager.getDescription("binhdr"),
        extractor: null,
    }),
    // Autel obfuscated firmware
    new FormatSignature({
        name: "autel",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("autel"),
        parser: SignatureManager.getParserOf("autel"),
        description: SignatureManager.getDescription("autel"),
        extractor: SignatureManager.getExtractor("autel"),
    }),
    // NTFS
    new FormatSignature({
        name: "ntfs",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("ntfs"),
        parser: SignatureManager.getParserOf("ntfs"),
        description: SignatureManager.getDescription("ntfs"),
        extractor: SignatureManager.getExtractor("tsk"),
    }),
    // APFS
    new FormatSignature({
        name: "apfs",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("apfs"),
        parser: SignatureManager.getParserOf("apfs"),
        description: SignatureManager.getDescription("apfs"),
        extractor: SignatureManager.getExtractor("sevenzip"),
    }),
    // BTRFS
    new FormatSignature({
        name: "btrfs",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("btrfs"),
        parser: SignatureManager.getParserOf("btrfs"),
        description: SignatureManager.getDescription("btrfs"),
        extractor: null,
    }),
    // WinCE
    new FormatSignature({
        name: "wince",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("wince"),
        parser: SignatureManager.getParserOf("wince"),
        description: SignatureManager.getDescription("wince"),
        extractor: SignatureManager.getExtractor("wince"),
    }),
    // Dahua ZIP
    new FormatSignature({
        name: "dahua_zip",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("dahua_zip"),
        parser: SignatureManager.getParserOf("dahua_zip"),
        description: SignatureManager.getDescription("dahua_zip"),
        extractor: SignatureManager.getExtractor("dahua_zip"),
    }),
    // DLink MH01
    new FormatSignature({
        name: "mh01",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("mh01"),
        parser: SignatureManager.getParserOf("mh01"),
        description: SignatureManager.getDescription("mh01"),
        extractor: SignatureManager.getExtractor("mh01"),
    }),
    // CSman DAT
    new FormatSignature({
        name: "csman",
        short: true,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("csman"),
        parser: SignatureManager.getParserOf("csman"),
        description: SignatureManager.getDescription("csman"),
        extractor: SignatureManager.getExtractor("csman"),
    }),
    // DirectX ByteCode
    new FormatSignature({
        name: "dxbc",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("dxbc"),
        parser: SignatureManager.getParserOf("dxbc"),
        description: SignatureManager.getDescription("dxbc"),
        extractor: SignatureManager.getExtractor("dxbc"),
    }),
    // D-Link TLV firmware
    new FormatSignature({
        name: "dlink_tlv",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("dlink_tlv"),
        parser: SignatureManager.getParserOf("dlink_tlv"),
        description: SignatureManager.getDescription("dlink_tlv"),
        extractor: SignatureManager.getExtractor("encfw"),
    }),
    // DLKE encrypted firmware
    new FormatSignature({
        name: "dlke",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("dlke"),
        parser: SignatureManager.getParserOf("dlke"),
        description: SignatureManager.getDescription("dlke"),
        extractor: SignatureManager.getExtractor("encfw"),
    }),
    // SHRS encrypted firmware
    new FormatSignature({
        name: "shrs",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("shrs"),
        parser: SignatureManager.getParserOf("shrs"),
        description: SignatureManager.getDescription("shrs"),
        extractor: SignatureManager.getExtractor("encfw"),
    }),
    // PKCS DER hashes
    new FormatSignature({
        name: "pkcs_der_hash",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("pkcs_der"),
        parser: SignatureManager.getParserOf("pkcs_der"),
        description: SignatureManager.getDescription("pkcs_der"),
        extractor: null,
    }),
    // LogFS
    new FormatSignature({
        name: "logfs",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("logfs"),
        parser: SignatureManager.getParserOf("logfs"),
        description: SignatureManager.getDescription("logfs"),
        extractor: null,
    }),
    // encrpted_img
    new FormatSignature({
        name: "encrpted_img",
        short: true,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("encrpted_img"),
        parser: SignatureManager.getParserOf("encrpted_img"),
        description: SignatureManager.getDescription("encrpted_img"),
        extractor: SignatureManager.getExtractor("encfw"),
    }),
    // Android boot image
    new FormatSignature({
        name: "android_bootimg",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("android_bootimg"),
        parser: SignatureManager.getParserOf("android_bootimg"),
        description: SignatureManager.getDescription("android_bootimg"),
        extractor: null,
    }),
    // uboot
    new FormatSignature({
        name: "uboot",
        short: false,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("uboot"),
        parser: SignatureManager.getParserOf("uboot"),
        description: SignatureManager.getDescription("uboot"),
        extractor: null,
    }),
    // dms firmware
    new FormatSignature({
        name: "dms",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("dms"),
        parser: SignatureManager.getParserOf("dms"),
        description: SignatureManager.getDescription("dms"),
        extractor:  SignatureManager.getExtractor("dms") // swapped16,
    }),
    // dkbs firmware
    new FormatSignature({
        name: "dkbs",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("dkbs"),
        parser: SignatureManager.getParserOf("dkbs"),
        description: SignatureManager.getDescription("dkbs"),
        extractor: SignatureManager.getExtractor("encfw"),
    }),
    // known encrypted firmware
    new FormatSignature({
        name: "encfw",
        short: true,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("encfw"),
        parser: SignatureManager.getParserOf("encfw"),
        description: SignatureManager.getDescription("encfw"),
        extractor: SignatureManager.getExtractor("encfw"),
    }),
    // matter ota firmware
    new FormatSignature({
        name: "matter_ota",
        short: true,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("matter_ota"),
        parser: SignatureManager.getParserOf("matter_ota"),
        description: SignatureManager.getDescription("matter_ota"),
        extractor: SignatureManager.getExtractor("matter_ota"),
    }),
    // DPAPI blob data
    new FormatSignature({
        name: "dpapi",
        short: true,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("dpapi"),
        parser: SignatureManager.getParserOf("dpapi"),
        description: SignatureManager.getDescription("dpapi"),
        extractor: null,
    }),
    // QEMU QCOW image
    new FormatSignature({
        name: "qcow",
        short: true,
        offset: 0,
        always_display: true,
        magic: SignatureManager.getMagicOf("qcow"),
        parser: SignatureManager.getParserOf("qcow"),
        description: SignatureManager.getDescription("qcow"),
        extractor: null,
    }),
    // ARJ archive
    new FormatSignature({
        name: "arj",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("arj"),
        parser: SignatureManager.getParserOf("arj"),
        description: SignatureManager.getDescription("arj"),
        extractor: SignatureManager.getExtractor("sevenzip"),
    }),
    // MD5 hashes
    new FormatSignature({
        name: "md5",
        short: false,
        offset: 0,
        always_display: false,
        magic: SignatureManager.getMagicOf("hashes"),
        parser: SignatureManager.getParserOf("hashes"),
        description: SignatureManager.getDescription("MD5"),
        extractor: null,
    })
])

