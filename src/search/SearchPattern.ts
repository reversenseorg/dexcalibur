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

import {SearchToken} from "./SearchToken.js";
import {IStringIndex, Nullable} from "../core/IStringIndex.js";
import {Tag} from "@dexcalibur/dexcalibur-orm";

export class SearchPattern
{
  fn:any = null;
  pattern:string|null = null;
  field: SearchToken[] = []; //string|string[] = null;
  isModifier:boolean = false;
  isStructField:boolean = false;
  isDeepSearch:boolean = false;
  exclude = false;
  hasTag:boolean = false;
  tag:Nullable<Tag> = null;

  constructor(pConfig:any=null){
    if(pConfig!==undefined)
      for(let i in pConfig)
        (this as IStringIndex<any>)[i] = pConfig[i];


    //console.log("SEARCH PATTERN : ",this);
  }

  serialize():any{
    let o:any = new Object();
    o.isModifier = this.isModifier;
    o.isStructField = this.isStructField;
    o.isDeepSearch = this.isDeepSearch;
    o.field = this.field;
    o.pattern = this.pattern;
    o.tag = this.tag!=null ? this.tag.toJsonObject() : null;

    return o;
  }

}
