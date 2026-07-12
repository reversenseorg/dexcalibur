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

import ModelBasicBlock from "../ModelBasicBlock.js";
import DDVM_SymbolTable from "./DDVM_SymbolTable.js";

/**
 * @class
 */
export class XNode
{
    block:ModelBasicBlock = null;
    next:XNode[] = [];
    prev:XNode[] = [];

    /**
     * @constructor
     * @param pBasicBlock
     * @param pPrevious
     */
    constructor( pBasicBlock:ModelBasicBlock, pPrevious:XNode ){
        this.block = pBasicBlock;
        this.next = [];
        this.prev = [pPrevious];
    }
}

/**
 * @class
 */
export class DDVM_State
{
    entry:any = null;
    current:XNode = null;

    constructor( pEntrypoint:any=null){
        this.entry = pEntrypoint;
        this.current = null;
    }
/*
    newBranch( pTarget){
        let s = this.clone();
        return s.append(pTarget);
    }
*/
    append( pBasicBlock){
        let n:XNode = new XNode(pBasicBlock, this.current);
        this.current.next.push(n);
        this.current = n;

        return this;
    }
/*
    clone(){
        let s  = new DDVM_State();
        s.entry = this.entry;
        // for(let )
    }*/
}

/**
 * @class
 */
export class DDVM_SavedState
{
    state:any;
    localSymTab:DDVM_SymbolTable = null;
    globalSymTab:DDVM_SymbolTable = null;
    currentState:DDVM_State = null;

    constructor( pTree:any, pLocalSymTab:DDVM_SymbolTable, pGlobalSymTab:DDVM_SymbolTable, pCurrentState:any){
        this.state = pTree;
        this.localSymTab = pLocalSymTab;
        this.globalSymTab = pGlobalSymTab;
        this.currentState = pCurrentState;
    }
}
