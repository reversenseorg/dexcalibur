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
 * Represents a token into search pattern
 *
 * @class
 */
export class SearchToken {

  /**
   * If the tokan is associated to an iterable field
   */
  iter: boolean;
  name:string;

  constructor(pValue:string,pIterable = false) {
    this.name = pValue;
    this.iter = pIterable;
  }


  /**
   * To
   * @param pToken
   */
  static parseTokens(pToken:string):SearchToken[] {
    const toks:SearchToken[] = [];

    pToken.split('.').map( (v:string, i:number) => {
      const p = v.indexOf('[]');
      toks.push(new SearchToken(
        (p>-1? v.substr(0,p) : v ),
        (p==v.length-2)
      ));
    });

    return toks;
  }

  /**
   * To check if the current token is an iterable node
   *
   * @return {boolean} Return TRUE if the associated property should be itered
   * @method
   * @since 1.0.0
   */
  isIterable():boolean {
    return this.iter;
  }

  /**
   * To serialize to a raw object, ready to be serialized to text
   *
   * @return {any} Basic object
   * @method
   * @since 1.0.0
   */
  serialize():any {
    return {
      iter: this.iter,
      name: this.name
    };
  }

}
