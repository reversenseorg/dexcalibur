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
