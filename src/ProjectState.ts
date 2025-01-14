/**
 * @enum
 */

export enum ProjectState {
    NONE='none',

    // first state in lifecycle
    ORDERED='ordered',
    IDLE='idle',

    OPEN='open',
    OPEN_START='open:start',
    CLOSED='closed',
    INIT='init',
    BEFORE_WORKSPACE='ws:before',
    WORKSPACE_READY='ws:ready',
    DB_READY='db:ready',
    INIT_START='start:init',
    INIT_SAST='sast:init',
    INIT_FILE_ANALYZER='fanal:init',
    INIT_APP_ANALYZER='aanal:init',
    INIT_HOOK_MANAGER='hookm:init',
    SYNC_PLATFORM='platform:sync',
    FULLSCAN_START='fullscan:start',
    FULLSCAN_END='fullscan:end',
    READY='ready',
}