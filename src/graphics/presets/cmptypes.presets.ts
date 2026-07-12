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

import ModelUiComponentType from "../models/ModelUiComponentType.js";
import {ROLES_PRESET} from "./roles.presets.js";

const ScrollView = new ModelUiComponentType({
    _uid: 'scroll_view',
    painted: true
});

// Layout
const Layout = new ModelUiComponentType({
    _uid: 'layout',
    painted: false
});


const LinearLayout = new ModelUiComponentType({
    _uid: 'linear_layout',
    painted: false,
    specialize: Layout
});

const VerticalLayout = new ModelUiComponentType({
    _uid: 'vertical_layout',
    painted: false,
    specialize: Layout
    // direction: vertical
});


const GridLayout = new ModelUiComponentType({
    _uid: 'grid_layout',
    painted: false,
    specialize: Layout
    // direction: vertical
});


const PanelLayout = new ModelUiComponentType({
    _uid: 'vertical_layout',
    painted: false,
    specialize: Layout
    // direction: vertical
});


// inputs

// Buttons

const Button = new ModelUiComponentType({
    _uid: 'button',
    painted: true
});

const CheckboxBtn = new ModelUiComponentType({
    _uid: 'checkbox_button',
    painted: true,
    specialize: Button,
    statesCount: 2
});

const SwitchBtn = new ModelUiComponentType({
    _uid: 'switch_button',
    painted: true,
    specialize: Button,
    statesCount: 2
});

const ToggleBtn = new ModelUiComponentType({
    _uid: 'toggle_button',
    painted: true,
    specialize: Button,
    statesCount: 2
});


const RadioBtn = new ModelUiComponentType({
    _uid: 'radio_button',
    painted: true,
    specialize: Button,
    statesCount: 2
});


const FormResetButton = new ModelUiComponentType({
    _uid: 'radio_button',
    painted: true,
    specialize: Button,
    statesCount: 2,
    role: ROLES_PRESET["reset"]
});


export const CMP_TYPES:ModelUiComponentType[] = [

    Button,
    RadioBtn,
    ToggleBtn,
    CheckboxBtn,
    SwitchBtn
];

