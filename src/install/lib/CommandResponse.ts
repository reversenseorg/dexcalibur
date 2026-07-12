

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

export enum CommandCode {
    CHECK_REQS='check-requirement',
    CHECK_BUNDLES='check-bundle',
    TOOL_INSTALL='tool-install',
    BUNDLE_INSTALL='bundle-install',
    TOOL_FORCE='tool-force',
    TOOL_SELECT='tool-select',
    SETTINGS_GLOBALS='global-settings',
    SETTINGS_GET='get-settings',
    SELECT_DIR='select-directory',
    LICENSE='license',
    FINISH='finish-btn',
    QUIT='quit-btn',
    ABORT='abort'
}


export enum CommandResponseCode {
    ERROR='error',
    TOOL_CHECKED='tool-checked',
    BUNDLE_CHECKED='bundle-checked',
    SETTINGS_SAVED='settings-saved',
    SETTINGS_DATA='settings-data',

    ALL_SETTINGS_SAVED='all-settings-saved',
    TOOL_FORCED='tool-forced',
    TOOL_INSTALLED='tool-installed',

    TOOL_SELECTED='tool-selected',

    FOLDER_SELECTED='selected-directory',
    BUNDLE_INSTALLED='bundle-installed',
    BUNDLE_INSTALL_DONE='bundle-install-done',

    LICENSE='license'
}

/**
 * Represent a response to a command sent to Installer
 *
 * @class
 */
export class CommandResponse {


    cmd:CommandResponseCode = CommandResponseCode.ERROR;

    code = 0;

    success = true;
    /**
     * Response message
     * @field
     */
    msg = "";

    arg:any = {};

    constructor(pConf:any) {
        for(let i in pConf) this[i] = pConf[i];
    }


    static failure(pMessage:string, pCode = CommandResponseCode.ERROR):CommandResponse {
        return new CommandResponse({ code:1, msg:pMessage, cmd:pCode })
    }
}