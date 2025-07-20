

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