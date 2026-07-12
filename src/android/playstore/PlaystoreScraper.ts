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

import requestLib from 'got';

export const BASE_URL = 'https://play.google.com';

export const constants = {
    clusters: {
        new: 'new',
        top: 'top'
    },
    category: {
        APPLICATION: 'APPLICATION',
        ANDROID_WEAR: 'ANDROID_WEAR',
        ART_AND_DESIGN: 'ART_AND_DESIGN',
        AUTO_AND_VEHICLES: 'AUTO_AND_VEHICLES',
        BEAUTY: 'BEAUTY',
        BOOKS_AND_REFERENCE: 'BOOKS_AND_REFERENCE',
        BUSINESS: 'BUSINESS',
        COMICS: 'COMICS',
        COMMUNICATION: 'COMMUNICATION',
        DATING: 'DATING',
        EDUCATION: 'EDUCATION',
        ENTERTAINMENT: 'ENTERTAINMENT',
        EVENTS: 'EVENTS',
        FINANCE: 'FINANCE',
        FOOD_AND_DRINK: 'FOOD_AND_DRINK',
        HEALTH_AND_FITNESS: 'HEALTH_AND_FITNESS',
        HOUSE_AND_HOME: 'HOUSE_AND_HOME',
        LIBRARIES_AND_DEMO: 'LIBRARIES_AND_DEMO',
        LIFESTYLE: 'LIFESTYLE',
        MAPS_AND_NAVIGATION: 'MAPS_AND_NAVIGATION',
        MEDICAL: 'MEDICAL',
        MUSIC_AND_AUDIO: 'MUSIC_AND_AUDIO',
        NEWS_AND_MAGAZINES: 'NEWS_AND_MAGAZINES',
        PARENTING: 'PARENTING',
        PERSONALIZATION: 'PERSONALIZATION',
        PHOTOGRAPHY: 'PHOTOGRAPHY',
        PRODUCTIVITY: 'PRODUCTIVITY',
        SHOPPING: 'SHOPPING',
        SOCIAL: 'SOCIAL',
        SPORTS: 'SPORTS',
        TOOLS: 'TOOLS',
        TRAVEL_AND_LOCAL: 'TRAVEL_AND_LOCAL',
        VIDEO_PLAYERS: 'VIDEO_PLAYERS',
        WATCH_FACE: 'WATCH_FACE',
        WEATHER: 'WEATHER',
        GAME: 'GAME',
        GAME_ACTION: 'GAME_ACTION',
        GAME_ADVENTURE: 'GAME_ADVENTURE',
        GAME_ARCADE: 'GAME_ARCADE',
        GAME_BOARD: 'GAME_BOARD',
        GAME_CARD: 'GAME_CARD',
        GAME_CASINO: 'GAME_CASINO',
        GAME_CASUAL: 'GAME_CASUAL',
        GAME_EDUCATIONAL: 'GAME_EDUCATIONAL',
        GAME_MUSIC: 'GAME_MUSIC',
        GAME_PUZZLE: 'GAME_PUZZLE',
        GAME_RACING: 'GAME_RACING',
        GAME_ROLE_PLAYING: 'GAME_ROLE_PLAYING',
        GAME_SIMULATION: 'GAME_SIMULATION',
        GAME_SPORTS: 'GAME_SPORTS',
        GAME_STRATEGY: 'GAME_STRATEGY',
        GAME_TRIVIA: 'GAME_TRIVIA',
        GAME_WORD: 'GAME_WORD',
        FAMILY: 'FAMILY'
    },
    collection: {
        TOP_FREE: 'TOP_FREE',
        TOP_PAID: 'TOP_PAID',
        GROSSING: 'GROSSING'
    },
    sort: {
        NEWEST: 2,
        RATING: 3,
        HELPFULNESS: 1
    },
    age: {
        FIVE_UNDER: 'AGE_RANGE1',
        SIX_EIGHT: 'AGE_RANGE2',
        NINE_UP: 'AGE_RANGE3'
    },
    permission: {
        COMMON: 0,
        OTHER: 1
    }
};

/**
 * TODO
 */
export class PlaystoreScraper {


    static async _request(pOptions:any, pTimeout = 1000):Promise<any> {

    }

    search(pPackageID:string):any {
        return null;
    }
}