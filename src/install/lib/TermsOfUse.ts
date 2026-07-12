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

import * as _path_ from "path";
import * as _fs_ from "fs";
import {TermsException} from "./error/TermsException.js";



/**
 * Represent the license text for a specific language
 */
export class TermsOfUse {

  lang:string;
  text:string = null;
  pdf:string = null;

  base:string;
  /**
   *
   * @param pLang
   */
  constructor(pBasePath:string, pLang:string){
    this.lang = pLang;
    this.base = _path_.join(pBasePath,pLang);
    this.pdf =  _path_.join(this.base,'license.pdf');

  }

  /**
   * To load text
   *
   * @param {string} pPath Path of the file containing raw license text
   */
  loadText():string {

    if(!_fs_.existsSync(this.base)){
      throw TermsException.INVALID_FOLDER(this.lang,this.base)
    }

    const txt = _path_.join(this.base,'license.txt');
    try{
      this.text = _fs_.readFileSync(txt).toString('utf8');
    }catch(err){
      throw TermsException.CANNOT_READ_LICENSE_TEXT(txt,err.message);
    }
    return this.text;
  }

  /**
   * To load text
   *
   * @param {string} pPath Path of the PDF file of the License
   */
  setPdfPath(pPath:string):void {
    try{
      //if(_fs_.existsSync(pPath)){
        this.pdf = pPath;
      //}
    }catch(err){
      new Error(`[LICENSE][ERROR] Invalid PDF License path for lang [${this.lang}] : ${err.message}`);
    }
  }

  /**
   *
   */
  getPdfPath():string {
    if(!_fs_.existsSync(this.pdf)){
      throw TermsException.CANNOT_READ_LICENSE_PDF(this.pdf);
    }
    return this.pdf;
  }
}
