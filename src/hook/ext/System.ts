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

/*!

*****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
*****************************************************************************

*/

import { Buffer } from "buffer";
import * as _crypto from "crypto";
import * as _fs from "fs";
import * as _os from "os";
import * as _path from "path";
//import * as ts from "typescript";
import ts  from "@dexcalibur/dxc-frida-compile/ext/typescript.js";

enum FileWatcherEventKind {
    Created,
    Changed,
    Deleted
}

const enum FileSystemEntryKind {
    File,
    Directory,
}

// NodeJS detects "\uFEFF" at the start of the string and *replaces* it with the actual
// byte order mark from the specified encoding. Using any other byte order mark does
// not actually work.
const byteOrderMarkIndicator = "\uFEFF";

const tsPriv = ts as any;
const {
    combinePaths,
    containsPath,
    createGetCanonicalFileName,
    createSystemWatchFunctions,
    emptyFileSystemEntries,
    generateDjb2Hash,
    getRelativePathToDirectoryOrUrl,
    getRootLength,
    matchFiles,
    memoize,
    normalizeSlashes,
    some,
} = tsPriv;

export function getNodeSystem(pBasePath?:string): ts.System {
    let nodeSystem: ts.System;

    const selfPath = (pBasePath!=undefined ? pBasePath : import.meta.url.substring((process.platform === "win32") ? 8 : 7));
    const systemDir = _path.dirname(selfPath);
    const distDir = _path.dirname(systemDir);
    const pkgDir = _path.dirname(distDir);
    const typescriptJsPath = _path.join(pkgDir, "ext", "typescript.js");

    const nativePattern = /^native |^\([^)]+\)$|^(internal[\\/]|[a-zA-Z0-9_\s]+(\.js)?$)/;

    const isLinuxOrMacOs = process.platform === "linux" || process.platform === "darwin";

    const platform: string = _os.platform();
    const useCaseSensitiveFileNames = isFileSystemCaseSensitive();
    const fsRealpath = !!_fs.realpathSync.native ? process.platform === "win32" ? fsRealPathHandlingLongPath : _fs.realpathSync.native : _fs.realpathSync;

    const fsSupportsRecursiveFsWatch = process.platform === "win32" || process.platform === "darwin";
    const getCurrentDirectory = memoize(() => process.cwd());
    const { watchFile, watchDirectory } = createSystemWatchFunctions({
        pollingWatchFileWorker: fsWatchFileWorker,
        getModifiedTime,
        setTimeout,
        clearTimeout,
        fsWatchWorker,
        useCaseSensitiveFileNames,
        getCurrentDirectory,
        fileSystemEntryExists,
        // Node 4.0 `fs.watch` function supports the "recursive" option on both OSX and Windows
        // (ref: https://github.com/nodejs/node/pull/2649 and https://github.com/Microsoft/TypeScript/issues/4643)
        fsSupportsRecursiveFsWatch,
        getAccessibleSortedChildDirectories: (path: string) => getAccessibleFileSystemEntries(path).directories,
        realpath,
        tscWatchFile: process.env.TSC_WATCHFILE,
        useNonPollingWatchers: process.env.TSC_NONPOLLING_WATCHER,
        tscWatchDirectory: process.env.TSC_WATCHDIRECTORY,
        defaultWatchFileKind: () => (nodeSystem as any).defaultWatchFileKind?.(),
        inodeWatching: isLinuxOrMacOs,
        sysLog: tsPriv.sysLog,
    });

    nodeSystem = {
        args: process.argv.slice(2),
        newLine: _os.EOL,
        useCaseSensitiveFileNames,
        write(s: string): void {
            process.stdout.write(s);
        },
        getWidthOfTerminal() {
            return process.stdout.columns;
        },
        writeOutputIsTTY() {
            return process.stdout.isTTY;
        },
        readFile,
        writeFile,
        watchFile,
        watchDirectory,
        resolvePath: path => _path.resolve(path),
        fileExists,
        directoryExists,
        createDirectory(directoryName: string) {
            if (!nodeSystem.directoryExists(directoryName)) {
                // Wrapped in a try-catch to prevent crashing if we are in a race
                // with another copy of ourselves to create the same directory
                try {
                    _fs.mkdirSync(directoryName);
                }
                catch (e) {
                    if ((e as any).code !== "EEXIST") {
                        // Failed for some other reason (access denied?); still throw
                        throw e;
                    }
                }
            }
        },
        getExecutingFilePath() {
            return typescriptJsPath;
        },
        getCurrentDirectory,
        getDirectories,
        readDirectory,
        getModifiedTime,
        setModifiedTime,
        deleteFile,
        createHash: _crypto ? createSHA256Hash : generateDjb2Hash,
        createSHA256Hash: _crypto ? createSHA256Hash : undefined,
        getMemoryUsage() {
            if (global.gc) {
                global.gc();
            }
            return process.memoryUsage().heapUsed;
        },
        getFileSize(path) {
            try {
                const stat = statSync(path);
                if (stat?.isFile()) {
                    return stat.size;
                }
            }
            catch { /*ignore*/ }
            return 0;
        },
        exit(exitCode?: number): void {
            process.exit(exitCode);
        },
        realpath,
        setTimeout,
        clearTimeout,
        clearScreen: () => {
            process.stdout.write("\x1Bc");
        },
        base64decode: input => bufferFrom(input, "base64").toString("utf8"),
        base64encode: input => bufferFrom(input).toString("base64"),
    };

    Object.assign(nodeSystem, {
        getEnvironmentVariable(name: string) {
            return process.env[name] || "";
        },
        debugMode: !!process.env.NODE_INSPECTOR_IPC || !!process.env.VSCODE_INSPECTOR_OPTIONS || some(process.execArgv as string[], (arg: string) => /^--(inspect|debug)(-brk)?(=\d+)?$/i.test(arg)),
        setBlocking: () => {
            (process.stdout as any)?._handle?.setBlocking?.(true);
        },
        bufferFrom,
    });

    return nodeSystem;

    /**
     * `throwIfNoEntry` was added so recently that it's not in the node types.
     * This helper encapsulates the mitigating usage of `any`.
     * See https://github.com/nodejs/node/pull/33716
     */
    function statSync(path: string): import("fs").Stats | undefined {
        // throwIfNoEntry will be ignored by older versions of node
        return (_fs as any).statSync(path, { throwIfNoEntry: false });
    }

    /**
     * Strips non-TS paths from the profile, so users with private projects shouldn't
     * need to worry about leaking paths by submitting a cpu profile to us
     */
    function cleanupPaths(profile: import("inspector").Profiler.Profile) {
        let externalFileCounter = 0;
        const remappedPaths = new Map<string, string>();
        const normalizedDir = normalizeSlashes(__dirname);
        // Windows rooted dir names need an extra `/` prepended to be valid file:/// urls
        const fileUrlRoot = `file://${getRootLength(normalizedDir) === 1 ? "" : "/"}${normalizedDir}`;
        for (const node of profile.nodes) {
            if (node.callFrame.url) {
                const url = normalizeSlashes(node.callFrame.url);
                if (containsPath(fileUrlRoot, url, useCaseSensitiveFileNames)) {
                    node.callFrame.url = getRelativePathToDirectoryOrUrl(fileUrlRoot, url, fileUrlRoot, createGetCanonicalFileName(useCaseSensitiveFileNames), /*isAbsolutePathAnUrl*/ true);
                }
                else if (!nativePattern.test(url)) {
                    node.callFrame.url = (remappedPaths.has(url) ? remappedPaths : remappedPaths.set(url, `external${externalFileCounter}.js`)).get(url)!;
                    externalFileCounter++;
                }
            }
        }
        return profile;
    }

    function bufferFrom(input: string, encoding?: BufferEncoding): Buffer {
        // See https://github.com/Microsoft/TypeScript/issues/25652
        return Buffer.from && (Buffer.from as Function) !== Int8Array.from
            ? Buffer.from(input, encoding)
            : new Buffer(input, encoding);
    }

    function isFileSystemCaseSensitive(): boolean {
        // win32\win64 are case insensitive platforms
        if (platform === "win32" || platform === "win64") {
            return false;
        }
        // If this file exists under a different case, we must be case-insensitve.
        return !fileExists(swapCase(typescriptJsPath));
    }

    /** Convert all lowercase chars to uppercase, and vice-versa */
    function swapCase(s: string): string {
        return s.replace(/\w/g, (ch) => {
            const up = ch.toUpperCase();
            return ch === up ? ch.toLowerCase() : up;
        });
    }

    function fsWatchFileWorker(fileName: string, callback: FileWatcherCallback, pollingInterval: number): FileWatcher {
        _fs.watchFile(fileName, { persistent: true, interval: pollingInterval }, fileChanged);
        let eventKind: FileWatcherEventKind;
        return {
            close: () => _fs.unwatchFile(fileName, fileChanged)
        };

        function fileChanged(curr: import("fs").Stats, prev: import("fs").Stats) {
            // previous event kind check is to ensure we recongnize the file as previously also missing when it is restored or renamed twice (that is it disappears and reappears)
            // In such case, prevTime returned is same as prev time of event when file was deleted as per node documentation
            const isPreviouslyDeleted = +prev.mtime === 0 || eventKind === FileWatcherEventKind.Deleted;
            if (+curr.mtime === 0) {
                if (isPreviouslyDeleted) {
                    // Already deleted file, no need to callback again
                    return;
                }
                eventKind = FileWatcherEventKind.Deleted;
            }
            else if (isPreviouslyDeleted) {
                eventKind = FileWatcherEventKind.Created;
            }
            // If there is no change in modified time, ignore the event
            else if (+curr.mtime === +prev.mtime) {
                return;
            }
            else {
                // File changed
                eventKind = FileWatcherEventKind.Changed;
            }
            callback(fileName, eventKind, curr.mtime);
        }
    }

    function fsWatchWorker(
        fileOrDirectory: string,
        recursive: boolean,
        callback: FsWatchCallback,
    ) {
        // Node 4.0 `fs.watch` function supports the "recursive" option on both OSX and Windows
        // (ref: https://github.com/nodejs/node/pull/2649 and https://github.com/Microsoft/TypeScript/issues/4643)
        const extraOptions = fsSupportsRecursiveFsWatch ? { recursive: !!recursive } : {};
        return _fs.watch(
            fileOrDirectory,
            {
                persistent: true,
                encoding: "buffer",
                ...extraOptions
            },
            (eventName, relativeFileName) => {
                callback(eventName, relativeFileName?.toString("utf8"));
            }
        );
    }

    function readFileWorker(fileName: string, _encoding?: string): string | undefined {
        let buffer: Buffer;
        try {
            buffer = _fs.readFileSync(fileName);
        }
        catch (e) {
            return undefined;
        }
        let len = buffer.length;
        if (len >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
            // Big endian UTF-16 byte order mark detected. Since big endian is not supported by node.js,
            // flip all byte pairs and treat as little endian.
            len &= ~1; // Round down to a multiple of 2
            for (let i = 0; i < len; i += 2) {
                const temp = buffer[i];
                buffer[i] = buffer[i + 1];
                buffer[i + 1] = temp;
            }
            return buffer.toString("utf16le", 2);
        }
        if (len >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
            // Little endian UTF-16 byte order mark detected
            return buffer.toString("utf16le", 2);
        }
        if (len >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
            // UTF-8 byte order mark detected
            return buffer.toString("utf8", 3);
        }
        // Default is UTF-8 with no byte order mark
        return buffer.toString("utf8");
    }

    function readFile(fileName: string, _encoding?: string): string | undefined {
        return readFileWorker(fileName, _encoding);
    }

    function writeFile(fileName: string, data: string, writeByteOrderMark?: boolean): void {
        // If a BOM is required, emit one
        if (writeByteOrderMark) {
            data = byteOrderMarkIndicator + data;
        }

        let fd: number | undefined;

        try {
            fd = _fs.openSync(fileName, "w");
            _fs.writeSync(fd, data, /*position*/ undefined, "utf8");
        }
        finally {
            if (fd !== undefined) {
                _fs.closeSync(fd);
            }
        }
    }

    function getAccessibleFileSystemEntries(path: string): FileSystemEntries {
        try {
            const entries = _fs.readdirSync(path || ".", { withFileTypes: true });
            const files: string[] = [];
            const directories: string[] = [];
            for (const dirent of entries) {
                // withFileTypes is not supported before Node 10.10.
                const entry = typeof dirent === "string" ? dirent : dirent.name;

                // This is necessary because on some file system node fails to exclude
                // "." and "..". See https://github.com/nodejs/node/issues/4002
                if (entry === "." || entry === "..") {
                    continue;
                }

                let stat: any;
                if (typeof dirent === "string" || dirent.isSymbolicLink()) {
                    const name = combinePaths(path, entry);

                    try {
                        stat = statSync(name);
                        if (!stat) {
                            continue;
                        }
                    }
                    catch (e) {
                        continue;
                    }
                }
                else {
                    stat = dirent;
                }

                if (stat.isFile()) {
                    files.push(entry);
                }
                else if (stat.isDirectory()) {
                    directories.push(entry);
                }
            }
            files.sort();
            directories.sort();
            return { files, directories };
        }
        catch (e) {
            return emptyFileSystemEntries;
        }
    }

    function readDirectory(path: string, extensions?: readonly string[], excludes?: readonly string[], includes?: readonly string[], depth?: number): string[] {
        return matchFiles(path, extensions, excludes, includes, useCaseSensitiveFileNames, process.cwd(), depth, getAccessibleFileSystemEntries, realpath);
    }

    function fileSystemEntryExists(path: string, entryKind: FileSystemEntryKind): boolean {
        // Since the error thrown by fs.statSync isn't used, we can avoid collecting a stack trace to improve
        // the CPU time performance.
        const originalStackTraceLimit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;

        try {
            const stat = statSync(path);
            if (!stat) {
                return false;
            }
            switch (entryKind) {
                case FileSystemEntryKind.File: return stat.isFile();
                case FileSystemEntryKind.Directory: return stat.isDirectory();
                default: return false;
            }
        }
        catch (e) {
            return false;
        }
        finally {
            Error.stackTraceLimit = originalStackTraceLimit;
        }
    }

    function fileExists(path: string): boolean {
        return fileSystemEntryExists(path, FileSystemEntryKind.File);
    }

    function directoryExists(path: string): boolean {
        return fileSystemEntryExists(path, FileSystemEntryKind.Directory);
    }

    function getDirectories(path: string): string[] {
        return getAccessibleFileSystemEntries(path).directories.slice();
    }

    function fsRealPathHandlingLongPath(path: string): string {
        return path.length < 260 ? _fs.realpathSync.native(path) : _fs.realpathSync(path);
    }

    function realpath(path: string): string {
        try {
            return fsRealpath(path);
        }
        catch {
            return path;
        }
    }

    function getModifiedTime(path: string) {
        // Since the error thrown by fs.statSync isn't used, we can avoid collecting a stack trace to improve
        // the CPU time performance.
        const originalStackTraceLimit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        try {
            return statSync(path)?.mtime;
        }
        catch (e) {
            return undefined;
        }
        finally {
            Error.stackTraceLimit = originalStackTraceLimit;
        }
    }

    function setModifiedTime(path: string, time: Date) {
        try {
            _fs.utimesSync(path, time, time);
        }
        catch (e) {
            return;
        }
    }

    function deleteFile(path: string) {
        try {
            return _fs.unlinkSync(path);
        }
        catch (e) {
            return;
        }
    }

    function createSHA256Hash(data: string): string {
        const hash = _crypto!.createHash("sha256");
        hash.update(data);
        return hash.digest("hex");
    }
}

interface FileWatcher {
    close(): void;
}

type FileWatcherCallback = (fileName: string, eventKind: FileWatcherEventKind, modifiedTime?: Date) => void;

type FsWatchCallback = (eventName: "rename" | "change", relativeFileName: string | undefined) => void;

enum PollingInterval {
    High = 2000,
    Medium = 500,
    Low = 250
}

interface FileSystemEntries {
    readonly files: readonly string[];
    readonly directories: readonly string[];
}
