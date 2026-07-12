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

// android version > android API version
module.exports = [
    {  name:"Pie", version:"9",  api:"28" }, //
    {  name:"Oreo", version:"8.1.0",  api:"27" }, //
    {  name:"Oreo", version:"8.0.0",  api:"26" }, //
    {  name:"Nougat", version:"7.1",  api:"25" }, //
    {  name:"Nougat", version:"7.0",  api:"24" }, //
    {  name:"Marshmallow", version:"6.0",  api:"23" }, //
    {  name:"Lollipop", version:"5.1",  api:"22" }, //
    {  name:"Lollipop", version:"5.0",  api:"21" }, //
    {  name:"KitKat", version:"4.4 - 4.4.4",  api:"19" }, //
    {  name:"Jelly Bean", version:"4.3.x",  api:"18" }, //
    {  name:"Jelly Bean", version:"4.2.x",  api:"17" }, //
    {  name:"Jelly Bean", version:"4.1.x",  api:"16" }, //
    {  name:"Ice Cream Sandwich", version:"4.0.3 - 4.0.4",  api:"15" }, //, NDK 8
    {  name:"Ice Cream Sandwich", version:"4.0.1 - 4.0.2",  api:"14" }, //, NDK 7
    {  name:"Honeycomb", version:"3.2.x",  api:"13" }, //
    {  name:"Honeycomb", version:"3.1",  api:"12" }, //, NDK 6
    {  name:"Honeycomb", version:"3.0",  api:"11" }, //
    {  name:"Gingerbread", version:"2.3.3 - 2.3.7",  api:"10" }, //
    {  name:"Gingerbread", version:"2.3 - 2.3.2",  api:"9" }, //, NDK 5
    {  name:"Froyo", version:"2.2.x",  api:"8" }, //, NDK 4
    {  name:"Eclair", version:"2.1",  api:"7" }, //, NDK 3
    {  name:"Eclair", version:"2.0.1",  api:"6" }, //
    {  name:"Eclair", version:"2.0",  api:"5" }, //
    {  name:"Donut", version:"1.6",  api:"4" }, //, NDK 2
    {  name:"Cupcake", version:"1.5",  api:"3" }, //, NDK 1
];