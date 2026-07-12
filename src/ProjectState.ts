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