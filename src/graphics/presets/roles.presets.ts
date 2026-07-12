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

import ModelUiRole from "../models/ModelUiRole.js";

const Submit = new ModelUiRole({  _uid:'submit', name:"Submit", tagNames:["ui.type.purpose.form"] });
const Reset = new ModelUiRole({   _uid:'reset', name:"Reset", tagNames:["ui.type.purpose.form"] });
const Copy = new ModelUiRole({   _uid:'copy', name:"Copy", tagNames:["ui.type.purpose.edit"] });
const Cut = new ModelUiRole({   _uid:'cut', name:"Cut", tagNames:["ui.type.purpose.edit"] });
const Paste = new ModelUiRole({   _uid:'paste', name:"Paste", tagNames:["ui.type.purpose.edit"] });
const Accept = new ModelUiRole({   _uid:'accept', name:"Accept", tagNames:["ui.type.purpose.accept"] });
const Yes = new ModelUiRole({   _uid:'yes', name:"Yes", tagNames:["ui.type.purpose.accept"] });
const Retry = new ModelUiRole({   _uid:'retry', name:"Retry", tagNames:["ui.type.purpose.accept"] });
const Ignore = new ModelUiRole({   _uid:'ignore', name:"Ignore", tagNames:["ui.type.purpose.accept"] });
const Cancel = new ModelUiRole({   _uid:'cancel', name:"Cancel", tagNames:["ui.type.purpose.reject"] });
const No = new ModelUiRole({   _uid:'no', name:"No", tagNames:["ui.type.purpose.reject"] });
const Close = new ModelUiRole({   _uid:'close', name:"Close", tagNames:["ui.type.purpose.destruct"] });
const Apply = new ModelUiRole({   _uid:'apply', name:"Apply", tagNames:["ui.type.purpose.exec"] });
const Help = new ModelUiRole({   _uid:'help', name:"Help", tagNames:["ui.type.purpose.help"] });


export const ROLES_PRESET:Record<string, ModelUiRole> = {
    [Submit.getUID()]: Submit,
    [Reset.getUID()]: Reset,
    [Copy.getUID()]: Copy,
    [Cut.getUID()]: Cut,
    [Accept.getUID()]: Accept,
    [Yes.getUID()]: Yes,
    [Cancel.getUID()]: Cancel,
    [No.getUID()]: No,
    [Close.getUID()]: Close,
    [Apply.getUID()]: Apply,
    [Paste.getUID()]: Paste,
    [Help.getUID()]: Help,
    [Ignore.getUID()]: Ignore,
    [Retry.getUID()]: Retry,
};